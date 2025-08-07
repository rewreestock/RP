/**
 * StateManager - Core data persistence and state management
 * Design principle: Build once, use forever - never modify this working code
 */

class StateManager {
  constructor() {
    // Core game state structure - designed to be permanent and extensible
    this.gameState = {
      // Individual character data, memories, relationships
      characters: {},
      
      // Time, location, ongoing events
      worldState: {
        currentTime: new Date(),
        location: 'Roswaal Manor',
        timeOfDay: 'morning',
        weather: 'clear',
        politicalSituation: 'tense',
        economicConditions: 'stable',
        ongoingEvents: []
      },
      
      // User preferences, history, character relationships
      userProfile: {
        name: '',
        preferences: {},
        relationshipHistory: {},
        characterAffinity: {},
        storyChoiceHistory: []
      },
      
      // Current plot threads
      activeStorylines: [],
      
      // Complete interaction record - maximizing context usage
      conversationHistory: [],
      
      // Pending results of past actions
      consequenceQueue: [],
      
      // Session metadata
      sessionInfo: {
        startTime: new Date(),
        sessionCount: 1,
        totalInteractions: 0
      }
    };
    
    // Initialize with default state
    this.initializeDefaultState();
  }

  /**
   * Initialize default state - only called once
   */
  initializeDefaultState() {
    // Set up basic world state
    this.gameState.worldState.ongoingEvents = [
      {
        id: 'royal_selection',
        name: 'Royal Selection',
        status: 'ongoing',
        importance: 'critical',
        description: 'The selection process for the next ruler of Lugunica'
      }
    ];

    // Initialize empty active storylines
    this.gameState.activeStorylines = [
      {
        id: 'main_story',
        title: 'Return by Death',
        status: 'active',
        priority: 'high',
        currentArc: 'introduction',
        keyEvents: []
      }
    ];
  }

  /**
   * Get current game state - read-only access
   */
  getState() {
    return JSON.parse(JSON.stringify(this.gameState)); // Deep clone for safety
  }

  /**
   * Get specific character data
   */
  getCharacter(characterId) {
    return this.gameState.characters[characterId] || null;
  }

  /**
   * Add or update character data (additive only)
   */
  updateCharacter(characterId, characterData) {
    if (!this.gameState.characters[characterId]) {
      this.gameState.characters[characterId] = {
        id: characterId,
        name: '',
        personality: {},
        memories: [],
        relationships: {},
        emotionalState: {},
        knowledge: {},
        development: {
          growthPoints: [],
          personalityChanges: []
        },
        createdAt: new Date(),
        lastInteraction: null
      };
    }

    // Merge new data with existing (never overwrite, only add)
    Object.assign(this.gameState.characters[characterId], characterData);
    this.gameState.characters[characterId].lastInteraction = new Date();
  }

  /**
   * Add conversation entry to history
   */
  addConversation(entry) {
    this.gameState.conversationHistory.push({
      timestamp: new Date(),
      id: this.gameState.conversationHistory.length + 1,
      ...entry
    });
    
    // Update session info
    this.gameState.sessionInfo.totalInteractions++;
  }

  /**
   * Add consequence to queue
   */
  addConsequence(consequence) {
    this.gameState.consequenceQueue.push({
      id: Date.now(),
      timestamp: new Date(),
      processed: false,
      ...consequence
    });
  }

  /**
   * Get pending consequences
   */
  getPendingConsequences() {
    return this.gameState.consequenceQueue.filter(c => !c.processed);
  }

  /**
   * Mark consequence as processed
   */
  markConsequenceProcessed(consequenceId) {
    const consequence = this.gameState.consequenceQueue.find(c => c.id === consequenceId);
    if (consequence) {
      consequence.processed = true;
      consequence.processedAt = new Date();
    }
  }

  /**
   * Update world state
   */
  updateWorldState(updates) {
    Object.assign(this.gameState.worldState, updates);
  }

  /**
   * Add storyline
   */
  addStoryline(storyline) {
    this.gameState.activeStorylines.push({
      id: storyline.id || Date.now(),
      createdAt: new Date(),
      ...storyline
    });
  }

  /**
   * Update user profile
   */
  updateUserProfile(updates) {
    Object.assign(this.gameState.userProfile, updates);
  }

  /**
   * Get conversation history (with optional filtering)
   */
  getConversationHistory(characterId = null, limit = null) {
    let history = this.gameState.conversationHistory;
    
    if (characterId) {
      history = history.filter(entry => 
        entry.characterId === characterId || 
        (entry.participants && entry.participants.includes(characterId))
      );
    }
    
    if (limit) {
      history = history.slice(-limit);
    }
    
    return history;
  }

  /**
   * Get relationship data between user and character
   */
  getRelationship(characterId) {
    return this.gameState.userProfile.relationshipHistory[characterId] || {
      affinity: 0,
      trust: 0,
      interactions: 0,
      keyEvents: [],
      emotionalHistory: []
    };
  }

  /**
   * Update relationship data
   */
  updateRelationship(characterId, updates) {
    if (!this.gameState.userProfile.relationshipHistory[characterId]) {
      this.gameState.userProfile.relationshipHistory[characterId] = {
        affinity: 0,
        trust: 0,
        interactions: 0,
        keyEvents: [],
        emotionalHistory: []
      };
    }
    
    Object.assign(this.gameState.userProfile.relationshipHistory[characterId], updates);
  }

  /**
   * Export state for persistence (future feature)
   */
  exportState() {
    return JSON.stringify(this.gameState, null, 2);
  }

  /**
   * Import state from persistence (future feature)
   */
  importState(stateJson) {
    try {
      const importedState = JSON.parse(stateJson);
      // Validate and merge safely
      Object.assign(this.gameState, importedState);
      return true;
    } catch (error) {
      console.error('Failed to import state:', error);
      return false;
    }
  }
}

module.exports = StateManager;