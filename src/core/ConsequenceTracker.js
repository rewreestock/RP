/**
 * ConsequenceTracker - Advanced consequence system for meaningful action results
 * Design principle: Every action has realistic, cascading consequences
 */

class ConsequenceTracker {
  constructor(stateManager, characterEngine) {
    this.stateManager = stateManager;
    this.characterEngine = characterEngine;
    this.consequenceTypes = new Map();
    this.activeConsequences = new Map();
    this.delayedEvents = [];
    
    // Initialize consequence type handlers
    this.initializeConsequenceTypes();
  }

  /**
   * Initialize different types of consequences and their handlers
   */
  initializeConsequenceTypes() {
    // Relationship consequences
    this.consequenceTypes.set('relationship_change', {
      handler: this.handleRelationshipChange.bind(this),
      description: 'Changes in character relationships based on actions',
      priority: 'high'
    });

    // Trust consequences
    this.consequenceTypes.set('trust_shift', {
      handler: this.handleTrustShift.bind(this),
      description: 'Trust levels change based on promises kept/broken',
      priority: 'high'
    });

    // Emotional consequences
    this.consequenceTypes.set('emotional_impact', {
      handler: this.handleEmotionalImpact.bind(this),
      description: 'Long-term emotional effects on characters',
      priority: 'medium'
    });

    // Story consequences
    this.consequenceTypes.set('story_branch', {
      handler: this.handleStoryBranch.bind(this),
      description: 'Actions that open or close story paths',
      priority: 'critical'
    });

    // Memory consequences
    this.consequenceTypes.set('memory_formation', {
      handler: this.handleMemoryFormation.bind(this),
      description: 'Important events that become core memories',
      priority: 'medium'
    });

    // Reputation consequences
    this.consequenceTypes.set('reputation_change', {
      handler: this.handleReputationChange.bind(this),
      description: 'How other characters view the user changes',
      priority: 'medium'
    });

    // World state consequences
    this.consequenceTypes.set('world_change', {
      handler: this.handleWorldChange.bind(this),
      description: 'Actions that affect the world state',
      priority: 'low'
    });
  }

  /**
   * Process a new consequence and determine its effects
   */
  processConsequence(consequenceData) {
    const consequence = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      processed: false,
      effects: [],
      ...consequenceData
    };

    // Determine consequence type based on action
    const detectedTypes = this.analyzeConsequenceType(consequence);
    
    for (const type of detectedTypes) {
      if (this.consequenceTypes.has(type)) {
        const typeHandler = this.consequenceTypes.get(type);
        
        try {
          const effects = typeHandler.handler(consequence);
          consequence.effects.push(...effects);
        } catch (error) {
          console.error(`Failed to process consequence type ${type}:`, error);
        }
      }
    }

    // Add to state manager queue
    this.stateManager.addConsequence(consequence);
    
    // Store active consequence for tracking
    this.activeConsequences.set(consequence.id, consequence);
    
    // Schedule delayed effects if any
    this.scheduleDelayedEffects(consequence);
    
    return consequence;
  }

  /**
   * Analyze what type of consequence an action should have
   */
  analyzeConsequenceType(consequence) {
    const types = [];
    const description = consequence.description.toLowerCase();
    
    // Relationship-related actions
    if (description.includes('promise') || description.includes('commitment') || 
        description.includes('trust') || description.includes('betray')) {
      types.push('trust_shift');
    }
    
    if (description.includes('relationship') || description.includes('bond') ||
        description.includes('friendship') || description.includes('romance')) {
      types.push('relationship_change');
    }
    
    // Emotional actions
    if (description.includes('emotional') || description.includes('trauma') ||
        description.includes('happiness') || description.includes('sadness')) {
      types.push('emotional_impact');
    }
    
    // Memory-forming events
    if (description.includes('important') || description.includes('significant') ||
        description.includes('memorable') || description.includes('first time')) {
      types.push('memory_formation');
    }
    
    // Story-changing actions
    if (description.includes('choice') || description.includes('decision') ||
        description.includes('path') || description.includes('storyline')) {
      types.push('story_branch');
    }
    
    // Reputation effects
    if (description.includes('reputation') || description.includes('standing') ||
        description.includes('opinion') || description.includes('public')) {
      types.push('reputation_change');
    }
    
    // World effects
    if (description.includes('world') || description.includes('environment') ||
        description.includes('politics') || description.includes('economy')) {
      types.push('world_change');
    }
    
    // Default to emotional impact if no specific type detected
    if (types.length === 0) {
      types.push('emotional_impact');
    }
    
    return types;
  }

  /**
   * Handle relationship change consequences
   */
  handleRelationshipChange(consequence) {
    const effects = [];
    
    if (consequence.characterId) {
      const character = this.stateManager.getCharacter(consequence.characterId);
      const relationship = this.stateManager.getRelationship(consequence.characterId);
      
      // Determine relationship change based on action
      let affinityChange = 0;
      let trustChange = 0;
      
      const description = consequence.description.toLowerCase();
      
      if (description.includes('positive') || description.includes('helpful') ||
          description.includes('kind') || description.includes('support')) {
        affinityChange = 0.2;
        trustChange = 0.1;
      } else if (description.includes('negative') || description.includes('hurtful') ||
                 description.includes('mean') || description.includes('betray')) {
        affinityChange = -0.3;
        trustChange = -0.2;
      }
      
      // Apply character-specific modifiers
      if (character.id === 'rem' && description.includes('subaru')) {
        affinityChange *= 1.5; // Rem is more sensitive to Subaru-related actions
      } else if (character.id === 'emilia' && description.includes('trust')) {
        trustChange *= 1.3; // Emilia values trust highly
      } else if (character.id === 'ram' && affinityChange > 0) {
        affinityChange *= 0.7; // Ram is harder to impress
      }
      
      // Update relationship
      const newAffinity = Math.max(0, Math.min(10, relationship.affinity + affinityChange));
      const newTrust = Math.max(0, Math.min(10, relationship.trust + trustChange));
      
      this.stateManager.updateRelationship(consequence.characterId, {
        affinity: newAffinity,
        trust: newTrust
      });
      
      effects.push({
        type: 'relationship_update',
        characterId: consequence.characterId,
        affinityChange: affinityChange,
        trustChange: trustChange,
        newAffinity: newAffinity,
        newTrust: newTrust
      });
    }
    
    return effects;
  }

  /**
   * Handle trust shift consequences
   */
  handleTrustShift(consequence) {
    const effects = [];
    
    if (consequence.characterId) {
      const character = this.stateManager.getCharacter(consequence.characterId);
      const relationship = this.stateManager.getRelationship(consequence.characterId);
      
      const description = consequence.description.toLowerCase();
      let trustChange = 0;
      let severity = 'minor';
      
      if (description.includes('promise') && description.includes('kept')) {
        trustChange = 0.5;
        severity = 'major';
      } else if (description.includes('promise') && description.includes('broken')) {
        trustChange = -0.8;
        severity = 'major';
      } else if (description.includes('secret') && description.includes('kept')) {
        trustChange = 0.3;
        severity = 'moderate';
      } else if (description.includes('secret') && description.includes('revealed')) {
        trustChange = -0.6;
        severity = 'major';
      }
      
      // Character-specific trust modifiers
      const trustModifiers = {
        'emilia': 1.2, // Emilia values trust highly
        'rem': 1.0,    // Rem has normal trust sensitivity
        'ram': 0.8     // Ram is more cynical about trust
      };
      
      trustChange *= (trustModifiers[character.id] || 1.0);
      
      const newTrust = Math.max(0, Math.min(10, relationship.trust + trustChange));
      
      this.stateManager.updateRelationship(consequence.characterId, {
        trust: newTrust
      });
      
      // Add trust event to relationship history
      const trustEvent = {
        type: 'trust_event',
        action: description,
        change: trustChange,
        severity: severity,
        timestamp: new Date()
      };
      
      const updatedHistory = relationship.keyEvents || [];
      updatedHistory.push(trustEvent);
      
      this.stateManager.updateRelationship(consequence.characterId, {
        keyEvents: updatedHistory
      });
      
      effects.push({
        type: 'trust_shift',
        characterId: consequence.characterId,
        trustChange: trustChange,
        newTrust: newTrust,
        severity: severity
      });
    }
    
    return effects;
  }

  /**
   * Handle emotional impact consequences
   */
  handleEmotionalImpact(consequence) {
    const effects = [];
    
    if (consequence.characterId) {
      const character = this.stateManager.getCharacter(consequence.characterId);
      const description = consequence.description.toLowerCase();
      
      let stressChange = 0;
      let confidenceChange = 0;
      let moodChange = null;
      
      // Determine emotional changes
      if (description.includes('stress') || description.includes('pressure')) {
        stressChange = 2;
        moodChange = 'stressed';
      } else if (description.includes('comfort') || description.includes('reassurance')) {
        stressChange = -1;
        confidenceChange = 1;
        moodChange = 'comforted';
      } else if (description.includes('confidence') || description.includes('praise')) {
        confidenceChange = 1;
        moodChange = 'confident';
      } else if (description.includes('embarrass') || description.includes('shame')) {
        confidenceChange = -1;
        stressChange = 1;
        moodChange = 'embarrassed';
      }
      
      // Apply changes to emotional state
      const currentState = character.emotionalState;
      const newStress = Math.max(0, Math.min(10, currentState.stress + stressChange));
      const newConfidence = Math.max(0, Math.min(10, currentState.confidence + confidenceChange));
      
      const emotionalUpdates = {
        stress: newStress,
        confidence: newConfidence
      };
      
      if (moodChange) {
        emotionalUpdates.currentMood = moodChange;
      }
      
      this.stateManager.updateCharacter(consequence.characterId, {
        emotionalState: { ...currentState, ...emotionalUpdates }
      });
      
      effects.push({
        type: 'emotional_change',
        characterId: consequence.characterId,
        stressChange: stressChange,
        confidenceChange: confidenceChange,
        newMood: moodChange
      });
    }
    
    return effects;
  }

  /**
   * Handle story branch consequences
   */
  handleStoryBranch(consequence) {
    const effects = [];
    
    const description = consequence.description.toLowerCase();
    
    // Determine what story paths are affected
    if (description.includes('royal selection')) {
      // Choices affecting the royal selection storyline
      this.updateStoryline('royal_selection', consequence);
      effects.push({
        type: 'storyline_update',
        storyline: 'royal_selection',
        action: description
      });
    }
    
    if (description.includes('relationship') && description.includes('romantic')) {
      // Romantic choices that affect character routes
      this.updateStoryline('romance', consequence);
      effects.push({
        type: 'storyline_update',
        storyline: 'romance',
        action: description
      });
    }
    
    return effects;
  }

  /**
   * Handle memory formation consequences
   */
  handleMemoryFormation(consequence) {
    const effects = [];
    
    if (consequence.characterId) {
      const character = this.stateManager.getCharacter(consequence.characterId);
      
      // Create important memory
      const memory = {
        type: 'significant_event',
        content: consequence.description,
        emotional_weight: this.calculateMemoryWeight(consequence),
        tags: this.extractMemoryTags(consequence),
        timestamp: new Date(),
        consequence_id: consequence.id
      };
      
      this.characterEngine.addMemory(consequence.characterId, memory);
      
      effects.push({
        type: 'memory_created',
        characterId: consequence.characterId,
        memoryType: memory.type,
        emotionalWeight: memory.emotional_weight
      });
    }
    
    return effects;
  }

  /**
   * Handle reputation change consequences
   */
  handleReputationChange(consequence) {
    const effects = [];
    
    // This would affect how all characters view the user
    // For now, we'll implement a simple version
    const description = consequence.description.toLowerCase();
    let reputationChange = 0;
    
    if (description.includes('hero') || description.includes('save')) {
      reputationChange = 1;
    } else if (description.includes('villain') || description.includes('betray')) {
      reputationChange = -1;
    }
    
    if (reputationChange !== 0) {
      const userProfile = this.stateManager.getState().userProfile;
      const currentReputation = userProfile.reputation || 0;
      
      this.stateManager.updateUserProfile({
        reputation: currentReputation + reputationChange
      });
      
      effects.push({
        type: 'reputation_change',
        change: reputationChange,
        newReputation: currentReputation + reputationChange
      });
    }
    
    return effects;
  }

  /**
   * Handle world change consequences
   */
  handleWorldChange(consequence) {
    const effects = [];
    
    const description = consequence.description.toLowerCase();
    const worldUpdates = {};
    
    if (description.includes('time')) {
      // Time progression effects
      worldUpdates.timeProgression = true;
    }
    
    if (description.includes('location')) {
      // Location changes
      worldUpdates.locationChanged = true;
    }
    
    if (Object.keys(worldUpdates).length > 0) {
      this.stateManager.updateWorldState(worldUpdates);
      
      effects.push({
        type: 'world_state_change',
        changes: worldUpdates
      });
    }
    
    return effects;
  }

  /**
   * Update storyline based on consequence
   */
  updateStoryline(storylineId, consequence) {
    const state = this.stateManager.getState();
    const storyline = state.activeStorylines.find(s => s.id === storylineId);
    
    if (storyline) {
      storyline.keyEvents = storyline.keyEvents || [];
      storyline.keyEvents.push({
        description: consequence.description,
        timestamp: new Date(),
        consequence_id: consequence.id
      });
      
      // Update storyline in state
      this.stateManager.addStoryline(storyline);
    }
  }

  /**
   * Calculate the emotional weight of a memory
   */
  calculateMemoryWeight(consequence) {
    let weight = 3; // Base weight
    
    const description = consequence.description.toLowerCase();
    
    if (description.includes('first time') || description.includes('never')) weight += 2;
    if (description.includes('important') || description.includes('significant')) weight += 1;
    if (description.includes('emotional') || description.includes('touching')) weight += 2;
    if (description.includes('traumatic') || description.includes('shocking')) weight += 3;
    
    return Math.min(10, weight);
  }

  /**
   * Extract tags from consequence for memory categorization
   */
  extractMemoryTags(consequence) {
    const tags = [];
    const description = consequence.description.toLowerCase();
    
    if (description.includes('conversation')) tags.push('dialogue');
    if (description.includes('promise')) tags.push('commitment');
    if (description.includes('trust')) tags.push('trust');
    if (description.includes('emotion')) tags.push('emotional');
    if (description.includes('relationship')) tags.push('relationship');
    
    return tags;
  }

  /**
   * Schedule delayed effects for future processing
   */
  scheduleDelayedEffects(consequence) {
    // Some consequences should have delayed effects
    const description = consequence.description.toLowerCase();
    
    if (description.includes('promise')) {
      // Promises should be remembered and checked later
      this.delayedEvents.push({
        type: 'promise_check',
        consequenceId: consequence.id,
        checkAfter: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        description: 'Check if promise was kept'
      });
    }
    
    if (description.includes('relationship')) {
      // Relationship changes may have follow-up effects
      this.delayedEvents.push({
        type: 'relationship_followup',
        consequenceId: consequence.id,
        checkAfter: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        description: 'Process relationship change effects'
      });
    }
  }

  /**
   * Process any due delayed events
   */
  processDelayedEvents() {
    const now = new Date();
    const dueEvents = this.delayedEvents.filter(event => event.checkAfter <= now);
    
    for (const event of dueEvents) {
      try {
        this.processDelayedEvent(event);
        
        // Remove processed event
        const index = this.delayedEvents.indexOf(event);
        if (index > -1) {
          this.delayedEvents.splice(index, 1);
        }
      } catch (error) {
        console.error('Failed to process delayed event:', error);
      }
    }
  }

  /**
   * Process a specific delayed event
   */
  processDelayedEvent(event) {
    switch (event.type) {
      case 'promise_check':
        this.checkPromiseStatus(event);
        break;
      case 'relationship_followup':
        this.processRelationshipFollowup(event);
        break;
    }
  }

  /**
   * Check if a promise was kept (placeholder for future implementation)
   */
  checkPromiseStatus(event) {
    // This would check if the user followed through on promises
    // For now, just log that the check happened
    console.log(`🔍 Checking promise status for consequence ${event.consequenceId}`);
  }

  /**
   * Process relationship followup effects
   */
  processRelationshipFollowup(event) {
    // This would handle secondary effects of relationship changes
    console.log(`💕 Processing relationship followup for consequence ${event.consequenceId}`);
  }

  /**
   * Get all active consequences
   */
  getActiveConsequences() {
    return Array.from(this.activeConsequences.values());
  }

  /**
   * Get consequences for a specific character
   */
  getCharacterConsequences(characterId) {
    return this.getActiveConsequences().filter(c => c.characterId === characterId);
  }

  /**
   * Get pending delayed events
   */
  getPendingDelayedEvents() {
    return this.delayedEvents.filter(event => event.checkAfter > new Date());
  }

  /**
   * Mark consequence as resolved
   */
  resolveConsequence(consequenceId) {
    if (this.activeConsequences.has(consequenceId)) {
      const consequence = this.activeConsequences.get(consequenceId);
      consequence.resolved = true;
      consequence.resolvedAt = new Date();
      
      this.stateManager.markConsequenceProcessed(consequenceId);
    }
  }

  /**
   * Get consequence statistics
   */
  getConsequenceStats() {
    const active = this.getActiveConsequences();
    const typeStats = {};
    
    for (const consequence of active) {
      for (const effect of consequence.effects) {
        typeStats[effect.type] = (typeStats[effect.type] || 0) + 1;
      }
    }
    
    return {
      totalActive: active.length,
      pendingDelayed: this.delayedEvents.length,
      effectTypeBreakdown: typeStats
    };
  }
}

module.exports = ConsequenceTracker;