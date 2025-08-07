/**
 * ConversationManager - Manages dialogue flow and conversation history
 * Design principle: Maximize context efficiency - preserve all important dialogue
 */

class ConversationManager {
  constructor(stateManager, characterEngine) {
    this.stateManager = stateManager;
    this.characterEngine = characterEngine;
    this.currentConversation = null;
    this.activeParticipants = new Set();
  }

  /**
   * Start a new conversation with specified characters
   */
  startConversation(participantIds, location = null) {
    const conversationId = `conv_${Date.now()}`;
    
    this.currentConversation = {
      id: conversationId,
      participants: participantIds,
      location: location || this.stateManager.getState().worldState.location,
      startTime: new Date(),
      messages: [],
      context: {
        mood: 'neutral',
        topics: [],
        tension: 0
      }
    };

    // Set active participants
    this.activeParticipants = new Set(participantIds);

    // Add conversation start to history
    this.stateManager.addConversation({
      type: 'conversation_start',
      conversationId: conversationId,
      participants: participantIds,
      location: this.currentConversation.location
    });

    return conversationId;
  }

  /**
   * Process user message and generate character responses
   */
  async processUserMessage(message, options = {}) {
    if (!this.currentConversation) {
      throw new Error('No active conversation. Please start a conversation first.');
    }

    const messageEntry = {
      id: Date.now(),
      timestamp: new Date(),
      speaker: 'user',
      content: message,
      type: 'message'
    };

    // Add user message to current conversation
    this.currentConversation.messages.push(messageEntry);

    // Add to persistent history
    this.stateManager.addConversation({
      type: 'user_message',
      conversationId: this.currentConversation.id,
      message: message,
      participants: Array.from(this.activeParticipants)
    });

    // Determine which characters should respond
    const respondingCharacters = this.determineResponders(message, options);

    // Generate responses from each character
    const responses = [];
    for (const characterId of respondingCharacters) {
      try {
        const context = this.buildCharacterContext(characterId);
        const response = this.characterEngine.generateResponse(characterId, message, context);
        
        const responseEntry = {
          id: Date.now() + responses.length,
          timestamp: new Date(),
          speaker: characterId,
          content: response.text,
          type: 'character_response',
          emotionalState: response.emotionalState,
          actions: response.actions || []
        };

        this.currentConversation.messages.push(responseEntry);
        responses.push(responseEntry);

        // Add to persistent history
        this.stateManager.addConversation({
          type: 'character_response',
          conversationId: this.currentConversation.id,
          characterId: characterId,
          message: response.text,
          emotionalState: response.emotionalState
        });

      } catch (error) {
        console.error(`Failed to generate response for ${characterId}:`, error);
      }
    }

    // Update conversation context based on the exchange
    this.updateConversationContext(message, responses);

    // Check for consequences that should be triggered
    this.processConversationConsequences(message, responses);

    return {
      userMessage: messageEntry,
      characterResponses: responses,
      conversationContext: this.currentConversation.context
    };
  }

  /**
   * Determine which characters should respond to the user's message
   */
  determineResponders(message, options = {}) {
    if (options.specificCharacter) {
      return [options.specificCharacter];
    }

    const responders = [];
    const lowerMessage = message.toLowerCase();

    // Check if message is directed at specific character
    for (const characterId of this.activeParticipants) {
      const character = this.stateManager.getCharacter(characterId);
      if (character && lowerMessage.includes(character.name.toLowerCase())) {
        responders.push(characterId);
      }
    }

    // If no specific character mentioned, determine by personality and context
    if (responders.length === 0) {
      for (const characterId of this.activeParticipants) {
        const character = this.stateManager.getCharacter(characterId);
        if (this.shouldCharacterRespond(character, message)) {
          responders.push(characterId);
        }
      }
    }

    // Ensure at least one character responds
    if (responders.length === 0 && this.activeParticipants.size > 0) {
      const randomCharacter = Array.from(this.activeParticipants)[0];
      responders.push(randomCharacter);
    }

    // Limit to prevent conversation spam (max 2 characters per user message)
    return responders.slice(0, 2);
  }

  /**
   * Determine if a character should respond based on personality and message
   */
  shouldCharacterRespond(character, message) {
    if (!character) return false;

    const personality = character.basePersonality;
    const lowerMessage = message.toLowerCase();

    // Character-specific response triggers
    switch (character.id) {
      case 'rem':
        // Rem tends to respond to most things involving Subaru
        return Math.random() < 0.8;
      
      case 'ram':
        // Ram responds less frequently, more selective
        return Math.random() < 0.4;
      
      case 'emilia':
        // Emilia responds to questions and emotional content
        return lowerMessage.includes('?') || 
               lowerMessage.includes('help') || 
               Math.random() < 0.6;
      
      default:
        return Math.random() < 0.5;
    }
  }

  /**
   * Build conversation context for character response generation
   */
  buildCharacterContext(characterId) {
    const recentMessages = this.getRecentMessages(10);
    const character = this.stateManager.getCharacter(characterId);
    const relationship = this.stateManager.getRelationship(characterId);
    const worldState = this.stateManager.getState().worldState;

    return {
      recentMessages,
      character,
      relationship,
      worldState,
      conversationMood: this.currentConversation.context.mood,
      conversationTopics: this.currentConversation.context.topics,
      otherParticipants: Array.from(this.activeParticipants).filter(id => id !== characterId)
    };
  }

  /**
   * Get recent messages from current conversation
   */
  getRecentMessages(count = 10) {
    if (!this.currentConversation) return [];
    
    return this.currentConversation.messages
      .slice(-count)
      .map(msg => ({
        speaker: msg.speaker,
        content: msg.content,
        timestamp: msg.timestamp,
        type: msg.type
      }));
  }

  /**
   * Update conversation context based on recent exchange
   */
  updateConversationContext(userMessage, characterResponses) {
    const context = this.currentConversation.context;
    
    // Analyze message for topics
    const detectedTopics = this.extractTopics(userMessage);
    context.topics = [...new Set([...context.topics, ...detectedTopics])];

    // Update mood based on sentiment
    const sentiment = this.analyzeOverallSentiment([userMessage, ...characterResponses.map(r => r.content)]);
    if (sentiment === 'positive') {
      context.mood = 'positive';
      context.tension = Math.max(0, context.tension - 1);
    } else if (sentiment === 'negative') {
      context.mood = 'tense';
      context.tension = Math.min(10, context.tension + 1);
    }

    // Limit topics to prevent context bloat
    if (context.topics.length > 5) {
      context.topics = context.topics.slice(-5);
    }
  }

  /**
   * Extract topics from message content
   */
  extractTopics(message) {
    const topics = [];
    const lowerMessage = message.toLowerCase();

    // Re:Zero specific topics
    const topicKeywords = {
      'royal_selection': ['royal selection', 'candidate', 'throne', 'ruler'],
      'magic': ['magic', 'spell', 'mana', 'spirit'],
      'manor_life': ['manor', 'maid', 'cleaning', 'duties'],
      'past_trauma': ['past', 'memory', 'remember', 'forgot'],
      'return_by_death': ['death', 'reset', 'again', 'loop'],
      'relationships': ['love', 'friend', 'trust', 'together']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  /**
   * Analyze overall sentiment of multiple messages
   */
  analyzeOverallSentiment(messages) {
    let positiveCount = 0;
    let negativeCount = 0;

    const positiveWords = ['good', 'great', 'happy', 'love', 'wonderful', 'amazing', 'thank', 'smile'];
    const negativeWords = ['bad', 'sad', 'angry', 'hate', 'terrible', 'awful', 'sorry', 'pain', 'hurt'];

    for (const message of messages) {
      const lowerMessage = message.toLowerCase();
      
      if (positiveWords.some(word => lowerMessage.includes(word))) {
        positiveCount++;
      }
      if (negativeWords.some(word => lowerMessage.includes(word))) {
        negativeCount++;
      }
    }

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Process consequences that might arise from the conversation
   */
  processConversationConsequences(userMessage, characterResponses) {
    const lowerMessage = userMessage.toLowerCase();

    // Check for actions that should have consequences
    if (lowerMessage.includes('promise') || lowerMessage.includes('swear')) {
      this.stateManager.addConsequence({
        type: 'promise_made',
        description: 'User made a promise that should be remembered',
        trigger: 'future_conversation',
        participants: Array.from(this.activeParticipants)
      });
    }

    if (lowerMessage.includes('secret') || lowerMessage.includes('don\'t tell')) {
      this.stateManager.addConsequence({
        type: 'secret_shared',
        description: 'A secret was shared that affects character relationships',
        trigger: 'character_interaction',
        participants: Array.from(this.activeParticipants)
      });
    }

    // Check character responses for relationship changes
    for (const response of characterResponses) {
      if (response.emotionalState && response.emotionalState.stress > 7) {
        this.stateManager.addConsequence({
          type: 'emotional_stress',
          characterId: response.speaker,
          description: `${response.speaker} is experiencing high emotional stress`,
          trigger: 'next_interaction'
        });
      }
    }
  }

  /**
   * Add a character to the active conversation
   */
  addParticipant(characterId) {
    if (!this.currentConversation) {
      throw new Error('No active conversation');
    }

    this.activeParticipants.add(characterId);
    
    // Add arrival notification
    const character = this.stateManager.getCharacter(characterId);
    const arrivalMessage = {
      id: Date.now(),
      timestamp: new Date(),
      speaker: 'system',
      content: `*${character.name} joins the conversation*`,
      type: 'system_notification'
    };

    this.currentConversation.messages.push(arrivalMessage);

    this.stateManager.addConversation({
      type: 'participant_joined',
      conversationId: this.currentConversation.id,
      characterId: characterId
    });
  }

  /**
   * Remove a character from the active conversation
   */
  removeParticipant(characterId) {
    if (!this.currentConversation) {
      throw new Error('No active conversation');
    }

    this.activeParticipants.delete(characterId);
    
    // Add departure notification
    const character = this.stateManager.getCharacter(characterId);
    const departureMessage = {
      id: Date.now(),
      timestamp: new Date(),
      speaker: 'system',
      content: `*${character.name} leaves the conversation*`,
      type: 'system_notification'
    };

    this.currentConversation.messages.push(departureMessage);

    this.stateManager.addConversation({
      type: 'participant_left',
      conversationId: this.currentConversation.id,
      characterId: characterId
    });
  }

  /**
   * End the current conversation
   */
  endConversation() {
    if (!this.currentConversation) {
      return null;
    }

    const summary = {
      id: this.currentConversation.id,
      duration: new Date() - this.currentConversation.startTime,
      messageCount: this.currentConversation.messages.length,
      participants: Array.from(this.activeParticipants),
      topics: this.currentConversation.context.topics,
      finalMood: this.currentConversation.context.mood
    };

    this.stateManager.addConversation({
      type: 'conversation_end',
      conversationId: this.currentConversation.id,
      summary: summary
    });

    this.currentConversation = null;
    this.activeParticipants.clear();

    return summary;
  }

  /**
   * Get full conversation history
   */
  getConversationHistory(limit = null) {
    return this.stateManager.getConversationHistory(null, limit);
  }

  /**
   * Get current conversation state
   */
  getCurrentConversationState() {
    if (!this.currentConversation) {
      return null;
    }

    return {
      id: this.currentConversation.id,
      participants: Array.from(this.activeParticipants),
      location: this.currentConversation.location,
      messageCount: this.currentConversation.messages.length,
      context: this.currentConversation.context,
      recentMessages: this.getRecentMessages(5)
    };
  }

  /**
   * Search conversation history by content or participant
   */
  searchConversationHistory(query, filters = {}) {
    const history = this.stateManager.getConversationHistory();
    const lowerQuery = query.toLowerCase();

    return history.filter(entry => {
      // Text search
      const textMatch = entry.message && entry.message.toLowerCase().includes(lowerQuery);
      
      // Participant filter
      const participantMatch = !filters.characterId || 
                              entry.characterId === filters.characterId ||
                              (entry.participants && entry.participants.includes(filters.characterId));
      
      // Type filter
      const typeMatch = !filters.type || entry.type === filters.type;
      
      return textMatch && participantMatch && typeMatch;
    });
  }
}

module.exports = ConversationManager;