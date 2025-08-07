/**
 * CharacterEngine - Advanced character AI and personality management
 * Design principle: Characters feel like real people, not chatbots
 */

class CharacterEngine {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.characterTemplates = new Map();
    this.emotionalResponsePatterns = new Map();
    
    // Initialize with Re:Zero characters
    this.initializeReZeroCharacters();
  }

  /**
   * Initialize core Re:Zero characters with detailed personalities
   */
  initializeReZeroCharacters() {
    // Emilia - Main heroine with complex trauma and growth
    this.registerCharacter('emilia', {
      name: 'Emilia',
      title: 'Half-Elf Candidate',
      basePersonality: {
        traits: ['kind', 'determined', 'self-doubting', 'protective', 'naive'],
        coreValues: ['protecting others', 'proving herself', 'overcoming prejudice'],
        fears: ['being rejected', 'hurting others', 'her heritage'],
        motivations: ['becoming worthy', 'helping Subaru', 'royal selection'],
        speechPatterns: ['polite', 'uncertain when praised', 'firm when protecting others']
      },
      emotionalState: {
        baseline: 'cautiously optimistic',
        currentMood: 'gentle',
        stress: 3,
        confidence: 4,
        trust: {
          subaru: 8,
          puck: 10,
          rem: 6,
          ram: 5
        }
      },
      memories: [
        {
          type: 'core',
          content: 'Meeting Subaru in the capital',
          emotional_weight: 8,
          tags: ['first_meeting', 'kindness', 'gratitude']
        }
      ],
      knowledge: {
        about_subaru: ['he saved her', 'he\'s kind but strange', 'he acts oddly sometimes'],
        royal_selection: ['she\'s a candidate', 'many oppose her', 'she must prove herself'],
        magic: ['spirit arts', 'ice magic', 'puck is her contracted spirit']
      },
      relationships: {
        subaru: { type: 'romantic_interest', status: 'developing', complexity: 'high' },
        puck: { type: 'parental_figure', status: 'deep_bond', complexity: 'protective' },
        roswaal: { type: 'sponsor', status: 'cautious_alliance', complexity: 'suspicious' }
      }
    });

    // Rem - Devoted maid with hidden depths
    this.registerCharacter('rem', {
      name: 'Rem',
      title: 'Maid of Roswaal Manor',
      basePersonality: {
        traits: ['devoted', 'hardworking', 'violent_when_angry', 'self-sacrificing', 'protective'],
        coreValues: ['loyalty', 'protecting loved ones', 'duty', 'redemption'],
        fears: ['being abandoned', 'not being useful', 'losing control'],
        motivations: ['serving faithfully', 'protecting Subaru', 'atonement'],
        speechPatterns: ['formal', 'humble', 'passionate when emotional']
      },
      emotionalState: {
        baseline: 'dutiful',
        currentMood: 'attentive',
        stress: 2,
        confidence: 7,
        trust: {
          subaru: 10,
          emilia: 7,
          ram: 9,
          roswaal: 8
        }
      },
      memories: [],
      knowledge: {
        about_subaru: ['he\'s special', 'he saved her', 'she loves him completely'],
        manor_duties: ['cleaning', 'cooking', 'protection', 'etiquette'],
        magic: ['water magic', 'healing', 'combat spells']
      },
      relationships: {
        subaru: { type: 'romantic_devotion', status: 'unrequited', complexity: 'intense' },
        ram: { type: 'twin_sister', status: 'close_bond', complexity: 'protective' },
        emilia: { type: 'rival_respect', status: 'complicated', complexity: 'conflicted' }
      }
    });

    // Ram - Sharp-tongued elder twin
    this.registerCharacter('ram', {
      name: 'Ram',
      title: 'Maid of Roswaal Manor',
      basePersonality: {
        traits: ['sharp-tongued', 'lazy', 'intelligent', 'protective', 'prideful'],
        coreValues: ['family', 'efficiency', 'honesty', 'strength'],
        fears: ['losing Rem', 'being powerless', 'showing weakness'],
        motivations: ['protecting Rem', 'serving efficiently', 'maintaining pride'],
        speechPatterns: ['blunt', 'sarcastic', 'condescending', 'direct']
      },
      emotionalState: {
        baseline: 'aloof',
        currentMood: 'observant',
        stress: 3,
        confidence: 8,
        trust: {
          rem: 10,
          roswaal: 9,
          subaru: 5,
          emilia: 6
        }
      },
      memories: [],
      knowledge: {
        about_subaru: ['he\'s useful to Rem', 'he\'s strange but harmless'],
        manor_duties: ['supervision', 'organization', 'magical tasks'],
        magic: ['wind magic', 'clairvoyance', 'limited due to horn loss']
      },
      relationships: {
        rem: { type: 'twin_sister', status: 'protective_bond', complexity: 'deep' },
        roswaal: { type: 'master', status: 'loyal_service', complexity: 'devoted' },
        subaru: { type: 'reluctant_ally', status: 'skeptical', complexity: 'evolving' }
      }
    });
  }

  /**
   * Register a character with the system
   */
  registerCharacter(id, characterData) {
    this.characterTemplates.set(id, characterData);
    
    // Update state manager with character data
    this.stateManager.updateCharacter(id, characterData);
  }

  /**
   * Generate character response based on context and personality
   */
  generateResponse(characterId, userMessage, context = {}) {
    const character = this.stateManager.getCharacter(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    // Analyze user message for emotional content and intent
    const messageAnalysis = this.analyzeMessage(userMessage);
    
    // Update character's emotional state based on message
    this.updateEmotionalState(characterId, messageAnalysis, context);
    
    // Generate response based on personality and current state
    const response = this.craftResponse(character, messageAnalysis, context);
    
    // Add memory of this interaction
    this.addMemory(characterId, {
      type: 'conversation',
      userMessage: userMessage,
      characterResponse: response.text,
      emotional_context: messageAnalysis,
      timestamp: new Date()
    });
    
    // Update relationship based on interaction
    this.updateRelationshipFromInteraction(characterId, messageAnalysis);
    
    return response;
  }

  /**
   * Analyze user message for emotional content and intent
   */
  analyzeMessage(message) {
    const analysis = {
      sentiment: 'neutral',
      intent: 'conversation',
      emotional_keywords: [],
      topics: [],
      urgency: 'normal',
      intimacy_level: 'casual'
    };

    const lowerMessage = message.toLowerCase();

    // Sentiment analysis (basic)
    const positiveWords = ['good', 'great', 'happy', 'love', 'wonderful', 'amazing', 'thank'];
    const negativeWords = ['bad', 'sad', 'angry', 'hate', 'terrible', 'awful', 'sorry'];
    const fearWords = ['scared', 'afraid', 'worried', 'nervous', 'anxious'];

    if (positiveWords.some(word => lowerMessage.includes(word))) {
      analysis.sentiment = 'positive';
    } else if (negativeWords.some(word => lowerMessage.includes(word))) {
      analysis.sentiment = 'negative';
    } else if (fearWords.some(word => lowerMessage.includes(word))) {
      analysis.sentiment = 'fearful';
    }

    // Intent detection
    if (lowerMessage.includes('?')) {
      analysis.intent = 'question';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('need')) {
      analysis.intent = 'request_help';
    } else if (lowerMessage.includes('sorry') || lowerMessage.includes('apologize')) {
      analysis.intent = 'apology';
    }

    // Topic detection (Re:Zero specific)
    const topics = [];
    if (lowerMessage.includes('royal selection')) topics.push('royal_selection');
    if (lowerMessage.includes('magic') || lowerMessage.includes('spell')) topics.push('magic');
    if (lowerMessage.includes('manor') || lowerMessage.includes('home')) topics.push('home');
    if (lowerMessage.includes('past') || lowerMessage.includes('memory')) topics.push('memories');
    
    analysis.topics = topics;
    return analysis;
  }

  /**
   * Update character's emotional state based on interaction
   */
  updateEmotionalState(characterId, messageAnalysis, context) {
    const character = this.stateManager.getCharacter(characterId);
    
    // Emotional state changes based on character personality and message
    const emotionalChanges = {};
    
    if (messageAnalysis.sentiment === 'positive') {
      emotionalChanges.stress = Math.max(0, (character.emotionalState.stress || 0) - 1);
      if (character.basePersonality.traits.includes('self-doubting')) {
        emotionalChanges.confidence = Math.min(10, (character.emotionalState.confidence || 5) + 1);
      }
    } else if (messageAnalysis.sentiment === 'negative') {
      emotionalChanges.stress = Math.min(10, (character.emotionalState.stress || 0) + 1);
    }

    // Update the character's emotional state
    Object.assign(character.emotionalState, emotionalChanges);
    this.stateManager.updateCharacter(characterId, { emotionalState: character.emotionalState });
  }

  /**
   * Craft character response based on personality and context
   */
  craftResponse(character, messageAnalysis, context) {
    const personality = character.basePersonality;
    const emotional = character.emotionalState;
    
    let responseText = '';
    let actions = [];
    let emotionalResponse = '';

    // Base response patterns by character
    switch (character.id) {
      case 'emilia':
        responseText = this.generateEmiliaResponse(messageAnalysis, emotional, context);
        break;
      case 'rem':
        responseText = this.generateRemResponse(messageAnalysis, emotional, context);
        break;
      case 'ram':
        responseText = this.generateRamResponse(messageAnalysis, emotional, context);
        break;
      default:
        responseText = this.generateGenericResponse(character, messageAnalysis, emotional);
    }

    return {
      text: responseText,
      actions: actions,
      emotionalState: emotional,
      characterId: character.id,
      timestamp: new Date()
    };
  }

  /**
   * Generate Emilia-specific responses
   */
  generateEmiliaResponse(analysis, emotional, context) {
    const responses = {
      positive: [
        "Thank you so much! That really means a lot to me. I'm still learning, but I want to do my best.",
        "You're very kind to say that. I hope I can continue to be worthy of your trust.",
        "Your words give me courage. I'll work even harder!"
      ],
      question: [
        "That's a good question... Let me think about that carefully.",
        "I want to give you a proper answer. Could you tell me a bit more about what you mean?",
        "I'm not entirely sure, but I'll do my best to help you understand."
      ],
      negative: [
        "I'm sorry you're feeling that way. Is there anything I can do to help?",
        "Please don't worry too much. We'll figure something out together.",
        "I understand how difficult that must be. You're not alone in this."
      ],
      default: [
        "I appreciate you talking with me. Your presence is always comforting.",
        "How are you feeling today? I hope you're taking care of yourself.",
        "Is there anything on your mind? I'm here to listen."
      ]
    };

    // Adjust based on emotional state
    let category = analysis.sentiment === 'positive' ? 'positive' 
                 : analysis.intent === 'question' ? 'question'
                 : analysis.sentiment === 'negative' ? 'negative' 
                 : 'default';

    const options = responses[category];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate Rem-specific responses
   */
  generateRemResponse(analysis, emotional, context) {
    const responses = {
      positive: [
        "Subaru-kun... hearing you say that makes me incredibly happy. I live to serve you.",
        "Your praise is the greatest reward I could ask for. I will continue to devote myself to you.",
        "Thank you, Subaru-kun. I promise to always be worthy of your kindness."
      ],
      question: [
        "Of course, Subaru-kun. I'll answer anything you wish to know.",
        "Please, ask me anything. I want to be useful to you in every way possible.",
        "I'll do my best to help you understand, Subaru-kun."
      ],
      negative: [
        "Subaru-kun, please don't suffer alone. Let me share your burden.",
        "If you're in pain, then I'm in pain too. Please tell me how I can help.",
        "Your sadness breaks my heart. I'll do anything to see you smile again."
      ],
      default: [
        "Subaru-kun, how may I serve you today?",
        "Being here with you is all I need to be happy, Subaru-kun.",
        "Is there anything I can do for you? Anything at all?"
      ]
    };

    let category = analysis.sentiment === 'positive' ? 'positive' 
                 : analysis.intent === 'question' ? 'question'
                 : analysis.sentiment === 'negative' ? 'negative' 
                 : 'default';

    const options = responses[category];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate Ram-specific responses
   */
  generateRamResponse(analysis, emotional, context) {
    const responses = {
      positive: [
        "Hmph. I suppose even someone like you can occasionally say something worthwhile.",
        "Well, I already knew that. But I suppose it's nice to hear you finally understand.",
        "Don't let it go to your head. You still have a long way to go."
      ],
      question: [
        "Sigh... Do I really have to explain everything to you?",
        "What a troublesome question. But I suppose I'll humor you this once.",
        "If you must know... though I doubt you'll understand the complexity of it."
      ],
      negative: [
        "Hmph. Crying won't solve anything, you know.",
        "If you have time to feel sorry for yourself, use that time more productively.",
        "Stop wallowing and do something about it. That's what capable people do."
      ],
      default: [
        "What do you want? I'm quite busy, you know.",
        "Speak quickly. I don't have all day to waste on idle chatter.",
        "Well? Are you just going to stand there staring?"
      ]
    };

    let category = analysis.sentiment === 'positive' ? 'positive' 
                 : analysis.intent === 'question' ? 'question'
                 : analysis.sentiment === 'negative' ? 'negative' 
                 : 'default';

    const options = responses[category];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate generic response for any character
   */
  generateGenericResponse(character, analysis, emotional) {
    return `*${character.name} responds thoughtfully, considering your words carefully.*`;
  }

  /**
   * Add memory to character
   */
  addMemory(characterId, memoryData) {
    const character = this.stateManager.getCharacter(characterId);
    if (!character.memories) character.memories = [];
    
    character.memories.push({
      id: Date.now(),
      ...memoryData,
      emotional_weight: this.calculateEmotionalWeight(memoryData)
    });

    // Keep only the most important memories (limit to prevent context bloat)
    if (character.memories.length > 50) {
      character.memories.sort((a, b) => (b.emotional_weight || 0) - (a.emotional_weight || 0));
      character.memories = character.memories.slice(0, 50);
    }

    this.stateManager.updateCharacter(characterId, { memories: character.memories });
  }

  /**
   * Calculate emotional weight of a memory
   */
  calculateEmotionalWeight(memoryData) {
    let weight = 1;
    
    if (memoryData.type === 'core') weight += 5;
    if (memoryData.emotional_context?.sentiment === 'positive') weight += 2;
    if (memoryData.emotional_context?.sentiment === 'negative') weight += 3;
    if (memoryData.emotional_context?.intent === 'request_help') weight += 2;
    
    return Math.min(10, weight);
  }

  /**
   * Update relationship based on interaction
   */
  updateRelationshipFromInteraction(characterId, messageAnalysis) {
    const relationship = this.stateManager.getRelationship(characterId);
    
    const updates = {
      interactions: relationship.interactions + 1
    };

    if (messageAnalysis.sentiment === 'positive') {
      updates.affinity = Math.min(10, relationship.affinity + 0.1);
      updates.trust = Math.min(10, relationship.trust + 0.05);
    } else if (messageAnalysis.sentiment === 'negative') {
      updates.affinity = Math.max(0, relationship.affinity - 0.05);
    }

    this.stateManager.updateRelationship(characterId, updates);
  }

  /**
   * Get character's current relationship with user
   */
  getCharacterRelationshipStatus(characterId) {
    const relationship = this.stateManager.getRelationship(characterId);
    const character = this.stateManager.getCharacter(characterId);
    
    return {
      characterName: character.name,
      affinity: relationship.affinity,
      trust: relationship.trust,
      interactions: relationship.interactions,
      currentMood: character.emotionalState.currentMood,
      relationshipLevel: this.determineRelationshipLevel(relationship)
    };
  }

  /**
   * Determine relationship level based on stats
   */
  determineRelationshipLevel(relationship) {
    const avgScore = (relationship.affinity + relationship.trust) / 2;
    
    if (avgScore >= 8) return 'very close';
    if (avgScore >= 6) return 'close friend';
    if (avgScore >= 4) return 'friendly';
    if (avgScore >= 2) return 'acquaintance';
    return 'stranger';
  }
}

module.exports = CharacterEngine;