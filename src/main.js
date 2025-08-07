/**
 * Re:Zero Advanced Roleplay System - Main Application
 * Design principle: Build a functional story engine, not a pretty chatbot
 */

const StateManager = require('./core/StateManager');
const CharacterEngine = require('./core/CharacterEngine');
const ConversationManager = require('./core/ConversationManager');
const WebIntegration = require('./core/WebIntegration');

class ReZeroRPSystem {
  constructor() {
    // Initialize core components in order of dependency
    this.stateManager = new StateManager();
    this.characterEngine = new CharacterEngine(this.stateManager);
    this.conversationManager = new ConversationManager(this.stateManager, this.characterEngine);
    this.webIntegration = new WebIntegration(this.stateManager);
    
    this.isRunning = false;
    this.currentSession = null;
    
    console.log('🌟 Re:Zero RP System initialized');
    console.log('📖 Ready to begin your story...\n');
  }

  /**
   * Start a new RP session
   */
  async startSession(userName = 'Subaru') {
    try {
      // Update user profile
      this.stateManager.updateUserProfile({ name: userName });
      
      // Create session info
      this.currentSession = {
        id: `session_${Date.now()}`,
        userName: userName,
        startTime: new Date(),
        activeLocation: 'Roswaal Manor'
      };

      // Set initial world state
      this.stateManager.updateWorldState({
        location: 'Roswaal Manor',
        timeOfDay: 'morning',
        weather: 'clear'
      });

      this.isRunning = true;
      
      console.log(`🎭 Session started for ${userName}`);
      console.log(`📍 Location: ${this.currentSession.activeLocation}`);
      console.log('💫 The world of Re:Zero awaits...\n');
      
      return {
        success: true,
        sessionId: this.currentSession.id,
        welcomeMessage: this.generateWelcomeMessage()
      };
      
    } catch (error) {
      console.error('Failed to start session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate welcome message based on current state
   */
  generateWelcomeMessage() {
    const worldState = this.stateManager.getState().worldState;
    
    return `Welcome to Roswaal Manor. The ${worldState.timeOfDay} sun filters through the windows as you find yourself in the familiar halls. The manor is peaceful, and you can sense the presence of others nearby. What would you like to do?`;
  }

  /**
   * Start a conversation with specified characters
   */
  async startConversation(characterIds, location = null) {
    if (!this.isRunning) {
      throw new Error('No active session. Please start a session first.');
    }

    try {
      // Validate characters exist
      for (const characterId of characterIds) {
        const character = this.stateManager.getCharacter(characterId);
        if (!character) {
          throw new Error(`Character ${characterId} not found`);
        }
      }

      const conversationId = this.conversationManager.startConversation(characterIds, location);
      
      // Generate initial scene description
      const scenePrompt = this.webIntegration.generateScenePrompts({
        participants: characterIds,
        mood: 'neutral'
      });

      console.log(`💬 Conversation started with: ${characterIds.join(', ')}`);
      console.log(`🎨 Scene: ${scenePrompt.visual}\n`);
      
      return {
        success: true,
        conversationId: conversationId,
        participants: characterIds,
        sceneDescription: scenePrompt.visual,
        atmosphere: scenePrompt.atmosphere
      };
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a message to the active conversation
   */
  async sendMessage(message) {
    if (!this.isRunning) {
      throw new Error('No active session');
    }

    try {
      console.log(`👤 You: ${message}`);
      
      // Process the message through conversation manager
      const result = await this.conversationManager.processUserMessage(message);
      
      // Display character responses
      for (const response of result.characterResponses) {
        const character = this.stateManager.getCharacter(response.speaker);
        const relationship = this.characterEngine.getCharacterRelationshipStatus(response.speaker);
        
        console.log(`💭 ${character.name} (${relationship.relationshipLevel}): ${response.content}`);
        
        // Show emotional state if significant
        if (response.emotionalState.stress > 6) {
          console.log(`   😰 [${character.name} seems stressed]`);
        } else if (response.emotionalState.confidence > 8) {
          console.log(`   😊 [${character.name} appears confident]`);
        }
      }

      // Check for consequences
      const pendingConsequences = this.stateManager.getPendingConsequences();
      if (pendingConsequences.length > 0) {
        console.log('\n📜 Your actions may have consequences...');
      }

      console.log(''); // Add spacing

      return {
        success: true,
        userMessage: result.userMessage,
        characterResponses: result.characterResponses,
        conversationContext: result.conversationContext
      };
      
    } catch (error) {
      console.error('Failed to process message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get character information and relationship status
   */
  getCharacterInfo(characterId) {
    try {
      const character = this.stateManager.getCharacter(characterId);
      if (!character) {
        return { found: false, error: 'Character not found' };
      }

      const relationship = this.characterEngine.getCharacterRelationshipStatus(characterId);
      
      return {
        found: true,
        character: {
          name: character.name,
          title: character.title || '',
          personality: character.basePersonality.traits,
          currentMood: character.emotionalState.currentMood
        },
        relationship: relationship,
        recentMemories: character.memories.slice(-3)
      };
      
    } catch (error) {
      return { found: false, error: error.message };
    }
  }

  /**
   * Search for lore information
   */
  async searchLore(query) {
    try {
      console.log(`🔍 Searching for: ${query}`);
      const results = await this.webIntegration.searchReZeroLore(query);
      
      if (results.found) {
        console.log(`📚 Found: ${results.summary}`);
        console.log(`🎯 Confidence: ${results.confidence}`);
        console.log(`📖 Sources: ${results.sources.join(', ')}\n`);
      } else {
        console.log('📚 No specific lore information found\n');
      }
      
      return results;
      
    } catch (error) {
      console.error('Lore search failed:', error);
      return { found: false, error: error.message };
    }
  }

  /**
   * Get current system status
   */
  getSystemStatus() {
    const state = this.stateManager.getState();
    const conversationState = this.conversationManager.getCurrentConversationState();
    
    return {
      isRunning: this.isRunning,
      session: this.currentSession,
      worldState: state.worldState,
      activeCharacters: Object.keys(state.characters),
      conversationActive: conversationState !== null,
      conversationParticipants: conversationState ? conversationState.participants : [],
      totalInteractions: state.sessionInfo.totalInteractions,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage() {
    const state = this.stateManager.getState();
    
    return {
      characters: Object.keys(state.characters).length,
      conversationHistory: state.conversationHistory.length,
      pendingConsequences: state.consequenceQueue.filter(c => !c.processed).length,
      cacheSize: this.webIntegration.getCacheStats().size
    };
  }

  /**
   * Export current state for saving
   */
  exportState() {
    return this.stateManager.exportState();
  }

  /**
   * Import saved state
   */
  importState(stateJson) {
    return this.stateManager.importState(stateJson);
  }

  /**
   * End current session
   */
  endSession() {
    if (this.conversationManager.getCurrentConversationState()) {
      this.conversationManager.endConversation();
    }
    
    this.isRunning = false;
    const sessionDuration = new Date() - this.currentSession.startTime;
    
    console.log(`🎭 Session ended after ${Math.round(sessionDuration / 1000 / 60)} minutes`);
    console.log('💫 Thank you for visiting the world of Re:Zero\n');
    
    this.currentSession = null;
  }

  /**
   * Quick start method for demo
   */
  async quickStart() {
    console.log('🚀 Quick Start Demo\n');
    
    // Start session
    await this.startSession('Subaru');
    
    // Start conversation with Emilia
    await this.startConversation(['emilia']);
    
    console.log('💡 Try sending a message! Example: "Hello Emilia, how are you today?"');
    console.log('💡 Other available characters: rem, ram');
    console.log('💡 You can add characters with: system.conversationManager.addParticipant("rem")');
    console.log('💡 Search for lore with: system.searchLore("royal selection")\n');
    
    return this;
  }
}

// Export for use as module
module.exports = ReZeroRPSystem;

// If run directly, start interactive demo
if (require.main === module) {
  async function runDemo() {
    const system = new ReZeroRPSystem();
    await system.quickStart();
    
    // Example interactions
    console.log('📖 Running example interactions...\n');
    
    await system.sendMessage("Hello Emilia, how are you today?");
    await system.sendMessage("I'm glad to see you're doing well. Can you tell me about the royal selection?");
    
    // Add Rem to the conversation
    system.conversationManager.addParticipant('rem');
    await system.sendMessage("Oh, Rem is here too! How are both of you getting along?");
    
    // Search for lore
    await system.searchLore("Emilia half elf");
    
    // Show system status
    console.log('📊 System Status:');
    console.log(JSON.stringify(system.getSystemStatus(), null, 2));
    
    console.log('\n✨ Demo complete! The system is ready for interactive use.');
  }
  
  runDemo().catch(console.error);
}