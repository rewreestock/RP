/**
 * NarrativeController - Story pacing and plot development management
 * Design principle: Story should progress naturally through character actions
 */

class NarrativeController {
  constructor(stateManager, characterEngine, consequenceTracker) {
    this.stateManager = stateManager;
    this.characterEngine = characterEngine;
    this.consequenceTracker = consequenceTracker;
    
    this.storyArcs = new Map();
    this.plotThreads = new Map();
    this.pacingMetrics = {
      tensionLevel: 0,
      emotionalIntensity: 0,
      storyMomentum: 0,
      characterDevelopment: 0
    };
    
    // Initialize Re:Zero story arcs
    this.initializeReZeroArcs();
  }

  /**
   * Initialize Re:Zero story arcs and plot threads
   */
  initializeReZeroArcs() {
    // Main story arc - Return by Death
    this.storyArcs.set('return_by_death', {
      id: 'return_by_death',
      title: 'Return by Death',
      description: 'Subaru\'s mysterious power and its consequences',
      status: 'dormant', // Can be: dormant, active, climactic, resolved
      priority: 'critical',
      chapters: [
        {
          id: 'discovery',
          title: 'Power Discovery',
          triggers: ['death_experience', 'time_reset'],
          completed: false
        },
        {
          id: 'understanding',
          title: 'Understanding the Curse',
          triggers: ['multiple_deaths', 'pattern_recognition'],
          completed: false
        },
        {
          id: 'consequences',
          title: 'The Price of Power',
          triggers: ['mental_strain', 'relationship_damage'],
          completed: false
        }
      ],
      keyCharacters: ['subaru', 'satella', 'puck'],
      emotionalThemes: ['isolation', 'desperation', 'determination']
    });

    // Royal Selection arc
    this.storyArcs.set('royal_selection', {
      id: 'royal_selection',
      title: 'Royal Selection',
      description: 'The political struggle for Lugunica\'s throne',
      status: 'active',
      priority: 'high',
      chapters: [
        {
          id: 'introduction',
          title: 'Meeting the Candidates',
          triggers: ['candidate_introduction', 'political_exposition'],
          completed: false
        },
        {
          id: 'trials',
          title: 'The Selection Trials',
          triggers: ['trial_participation', 'candidate_competition'],
          completed: false
        },
        {
          id: 'alliance',
          title: 'Political Alliances',
          triggers: ['alliance_formation', 'betrayal_risk'],
          completed: false
        }
      ],
      keyCharacters: ['emilia', 'roswaal', 'puck'],
      emotionalThemes: ['ambition', 'worthiness', 'political_pressure']
    });

    // Character relationship arcs
    this.storyArcs.set('emilia_romance', {
      id: 'emilia_romance',
      title: 'Emilia Romance Path',
      description: 'Developing relationship with Emilia',
      status: 'dormant',
      priority: 'medium',
      chapters: [
        {
          id: 'trust_building',
          title: 'Building Trust',
          triggers: ['positive_interactions', 'support_shown'],
          completed: false
        },
        {
          id: 'emotional_connection',
          title: 'Emotional Connection',
          triggers: ['vulnerability_shared', 'comfort_provided'],
          completed: false
        },
        {
          id: 'romantic_development',
          title: 'Romantic Development',
          triggers: ['romantic_moment', 'feelings_acknowledged'],
          completed: false
        }
      ],
      keyCharacters: ['emilia', 'puck'],
      emotionalThemes: ['love', 'acceptance', 'vulnerability']
    });

    // Initialize plot threads
    this.plotThreads.set('manor_mystery', {
      id: 'manor_mystery',
      title: 'Roswaal Manor Secrets',
      description: 'Uncovering the mysteries surrounding the manor',
      relatedArcs: ['return_by_death', 'royal_selection'],
      clues: [],
      revelationLevel: 0
    });

    this.plotThreads.set('witch_cult', {
      id: 'witch_cult',
      title: 'Witch Cult Threat',
      description: 'The ongoing threat of the Witch Cult',
      relatedArcs: ['return_by_death'],
      clues: [],
      revelationLevel: 0
    });
  }

  /**
   * Analyze current story state and suggest narrative progression
   */
  analyzeStoryProgression() {
    const analysis = {
      currentTension: this.calculateTensionLevel(),
      emotionalClimate: this.analyzeEmotionalClimate(),
      pacingRecommendation: this.analyzePacing(),
      suggestedEvents: this.suggestStoryEvents(),
      characterDevelopmentOpportunities: this.identifyCharacterGrowthOpportunities()
    };

    return analysis;
  }

  /**
   * Calculate current tension level based on story state
   */
  calculateTensionLevel() {
    let tension = 0;

    // Check active consequences
    const activeConsequences = this.consequenceTracker.getActiveConsequences();
    tension += Math.min(3, activeConsequences.length * 0.5);

    // Check character stress levels
    const state = this.stateManager.getState();
    for (const characterId of Object.keys(state.characters)) {
      const character = state.characters[characterId];
      if (character.emotionalState.stress > 6) {
        tension += 1;
      }
    }

    // Check relationship conflicts
    const relationships = state.userProfile.relationshipHistory;
    for (const characterId of Object.keys(relationships)) {
      const rel = relationships[characterId];
      if (rel.trust < 3 || rel.affinity < 3) {
        tension += 0.5;
      }
    }

    // Check active story arcs
    for (const arc of this.storyArcs.values()) {
      if (arc.status === 'climactic') {
        tension += 2;
      } else if (arc.status === 'active') {
        tension += 1;
      }
    }

    this.pacingMetrics.tensionLevel = Math.min(10, tension);
    return this.pacingMetrics.tensionLevel;
  }

  /**
   * Analyze emotional climate of the story
   */
  analyzeEmotionalClimate() {
    const state = this.stateManager.getState();
    const emotions = {
      positive: 0,
      negative: 0,
      neutral: 0,
      intensity: 0
    };

    // Analyze character emotional states
    for (const characterId of Object.keys(state.characters)) {
      const character = state.characters[characterId];
      const emotional = character.emotionalState;

      if (emotional.currentMood) {
        const mood = emotional.currentMood.toLowerCase();
        if (['happy', 'confident', 'comforted'].includes(mood)) {
          emotions.positive++;
        } else if (['stressed', 'sad', 'angry', 'embarrassed'].includes(mood)) {
          emotions.negative++;
        } else {
          emotions.neutral++;
        }
      }

      emotions.intensity += emotional.stress || 0;
      emotions.intensity += (10 - (emotional.confidence || 5));
    }

    // Analyze recent conversation sentiment
    const recentHistory = this.stateManager.getConversationHistory(null, 10);
    for (const entry of recentHistory) {
      if (entry.message) {
        const sentiment = this.analyzeSentiment(entry.message);
        if (sentiment === 'positive') emotions.positive++;
        else if (sentiment === 'negative') emotions.negative++;
        else emotions.neutral++;
      }
    }

    const totalEmotions = emotions.positive + emotions.negative + emotions.neutral;
    const dominantEmotion = totalEmotions === 0 ? 'neutral' :
                           emotions.positive > emotions.negative ? 'positive' :
                           emotions.negative > emotions.positive ? 'negative' : 'balanced';

    return {
      dominantEmotion,
      intensity: Math.min(10, emotions.intensity / Math.max(1, Object.keys(state.characters).length)),
      distribution: {
        positive: totalEmotions === 0 ? 0 : emotions.positive / totalEmotions,
        negative: totalEmotions === 0 ? 0 : emotions.negative / totalEmotions,
        neutral: totalEmotions === 0 ? 1 : emotions.neutral / totalEmotions
      }
    };
  }

  /**
   * Analyze story pacing and suggest adjustments
   */
  analyzePacing() {
    const tension = this.pacingMetrics.tensionLevel;
    const recentInteractions = this.stateManager.getConversationHistory(null, 5).length;
    
    let recommendation = 'maintain';
    let reasoning = 'Current pacing is appropriate';

    if (tension > 7 && recentInteractions > 8) {
      recommendation = 'slow_down';
      reasoning = 'High tension with rapid interactions - allow for emotional processing';
    } else if (tension < 3 && recentInteractions < 3) {
      recommendation = 'accelerate';
      reasoning = 'Low tension with few interactions - introduce new elements';
    } else if (tension > 8) {
      recommendation = 'climax_opportunity';
      reasoning = 'Very high tension - perfect for a dramatic moment';
    } else if (tension < 2) {
      recommendation = 'buildup_needed';
      reasoning = 'Very low tension - build towards something meaningful';
    }

    return {
      recommendation,
      reasoning,
      currentTension: tension,
      recentActivity: recentInteractions,
      suggestedActions: this.getSuggestedPacingActions(recommendation)
    };
  }

  /**
   * Get suggested actions based on pacing recommendation
   */
  getSuggestedPacingActions(recommendation) {
    const actions = {
      'slow_down': [
        'Focus on character introspection',
        'Allow quiet moments between characters',
        'Explore emotional reactions to recent events',
        'Provide comfort or resolution opportunities'
      ],
      'accelerate': [
        'Introduce new plot elements',
        'Create character conflicts',
        'Reveal hidden information',
        'Trigger story arc progression'
      ],
      'climax_opportunity': [
        'Create dramatic confrontation',
        'Force difficult choice',
        'Reveal major secret',
        'Trigger emotional breakthrough'
      ],
      'buildup_needed': [
        'Plant story seeds',
        'Develop character relationships',
        'Introduce future plot elements',
        'Build emotional investment'
      ],
      'maintain': [
        'Continue current story direction',
        'Develop ongoing relationships',
        'Explore character depth',
        'Advance plot naturally'
      ]
    };

    return actions[recommendation] || actions['maintain'];
  }

  /**
   * Suggest story events based on current state
   */
  suggestStoryEvents() {
    const suggestions = [];
    const state = this.stateManager.getState();
    const tension = this.pacingMetrics.tensionLevel;

    // Check for arc progression opportunities
    for (const arc of this.storyArcs.values()) {
      if (arc.status === 'active' || arc.status === 'dormant') {
        const nextChapter = arc.chapters.find(ch => !ch.completed);
        if (nextChapter) {
          suggestions.push({
            type: 'arc_progression',
            arcId: arc.id,
            chapterId: nextChapter.id,
            title: nextChapter.title,
            priority: arc.priority,
            triggers: nextChapter.triggers
          });
        }
      }
    }

    // Relationship-based events
    const relationships = state.userProfile.relationshipHistory;
    for (const characterId of Object.keys(relationships)) {
      const rel = relationships[characterId];
      const character = state.characters[characterId];

      if (rel.affinity > 7 && rel.trust > 6) {
        suggestions.push({
          type: 'relationship_deepening',
          characterId: characterId,
          title: `Deeper connection with ${character.name}`,
          priority: 'medium'
        });
      } else if (rel.trust < 4) {
        suggestions.push({
          type: 'trust_repair',
          characterId: characterId,
          title: `Repair trust with ${character.name}`,
          priority: 'high'
        });
      }
    }

    // Tension-based events
    if (tension > 6) {
      suggestions.push({
        type: 'tension_resolution',
        title: 'Emotional resolution scene',
        priority: 'high'
      });
    } else if (tension < 3) {
      suggestions.push({
        type: 'tension_building',
        title: 'Introduce conflict or mystery',
        priority: 'medium'
      });
    }

    // Sort by priority
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Identify character growth opportunities
   */
  identifyCharacterGrowthOpportunities() {
    const opportunities = [];
    const state = this.stateManager.getState();

    for (const characterId of Object.keys(state.characters)) {
      const character = state.characters[characterId];
      const relationship = this.stateManager.getRelationship(characterId);

      // Check for personality development opportunities
      const growthPoints = character.development?.growthPoints || [];
      const recentMemories = character.memories?.slice(-5) || [];

      // Character-specific growth opportunities
      switch (characterId) {
        case 'emilia':
          if (character.emotionalState.confidence < 5) {
            opportunities.push({
              characterId: 'emilia',
              type: 'confidence_building',
              description: 'Help Emilia build self-confidence',
              methods: ['praise her strengths', 'support her decisions', 'show faith in her abilities']
            });
          }
          if (relationship.trust > 7 && !growthPoints.includes('vulnerability_shared')) {
            opportunities.push({
              characterId: 'emilia',
              type: 'vulnerability_moment',
              description: 'Emilia opens up about her fears',
              methods: ['create safe space', 'share your own vulnerabilities', 'show understanding']
            });
          }
          break;

        case 'rem':
          if (character.emotionalState.stress > 6) {
            opportunities.push({
              characterId: 'rem',
              type: 'stress_relief',
              description: 'Help Rem manage her devotion stress',
              methods: ['reassure her worth', 'encourage self-care', 'show appreciation']
            });
          }
          if (relationship.affinity > 8 && !growthPoints.includes('self_worth_improved')) {
            opportunities.push({
              characterId: 'rem',
              type: 'self_worth_development',
              description: 'Help Rem value herself beyond service',
              methods: ['praise her as a person', 'encourage her interests', 'support her independence']
            });
          }
          break;

        case 'ram':
          if (relationship.trust < 5) {
            opportunities.push({
              characterId: 'ram',
              type: 'trust_building',
              description: 'Earn Ram\'s trust and respect',
              methods: ['prove your competence', 'show care for Rem', 'demonstrate loyalty']
            });
          }
          if (relationship.affinity > 6 && !growthPoints.includes('emotional_openness')) {
            opportunities.push({
              characterId: 'ram',
              type: 'emotional_breakthrough',
              description: 'Ram shows her softer side',
              methods: ['consistent kindness', 'respect her boundaries', 'prove your worth']
            });
          }
          break;
      }
    }

    return opportunities;
  }

  /**
   * Process story event and update narrative state
   */
  processStoryEvent(eventData) {
    const event = {
      id: Date.now(),
      timestamp: new Date(),
      ...eventData
    };

    // Update relevant story arcs
    if (event.arcId) {
      this.progressStoryArc(event.arcId, event);
    }

    // Update pacing metrics
    this.updatePacingMetrics(event);

    // Create narrative consequences
    const narrativeConsequence = {
      type: 'story_event',
      description: `Story event: ${event.title}`,
      event: event,
      trigger: 'narrative_progression'
    };

    this.consequenceTracker.processConsequence(narrativeConsequence);

    return event;
  }

  /**
   * Progress a story arc based on an event
   */
  progressStoryArc(arcId, event) {
    const arc = this.storyArcs.get(arcId);
    if (!arc) return;

    // Find and potentially complete chapters based on event
    for (const chapter of arc.chapters) {
      if (!chapter.completed && chapter.triggers.some(trigger => 
          event.description?.toLowerCase().includes(trigger) ||
          event.title?.toLowerCase().includes(trigger))) {
        
        chapter.completed = true;
        chapter.completedAt = new Date();
        
        console.log(`📖 Chapter completed: ${arc.title} - ${chapter.title}`);
      }
    }

    // Check if arc should change status
    const completedChapters = arc.chapters.filter(ch => ch.completed).length;
    const totalChapters = arc.chapters.length;

    if (completedChapters === 0 && arc.status === 'dormant') {
      arc.status = 'active';
    } else if (completedChapters === totalChapters - 1 && arc.status === 'active') {
      arc.status = 'climactic';
    } else if (completedChapters === totalChapters) {
      arc.status = 'resolved';
    }
  }

  /**
   * Update pacing metrics based on event
   */
  updatePacingMetrics(event) {
    if (event.type === 'conflict' || event.type === 'tension_building') {
      this.pacingMetrics.tensionLevel += 1;
    } else if (event.type === 'resolution' || event.type === 'comfort') {
      this.pacingMetrics.tensionLevel -= 1;
    }

    if (event.type === 'character_growth' || event.type === 'relationship_deepening') {
      this.pacingMetrics.characterDevelopment += 1;
    }

    // Clamp values
    this.pacingMetrics.tensionLevel = Math.max(0, Math.min(10, this.pacingMetrics.tensionLevel));
    this.pacingMetrics.characterDevelopment = Math.max(0, this.pacingMetrics.characterDevelopment);
  }

  /**
   * Analyze sentiment of text (simple implementation)
   */
  analyzeSentiment(text) {
    const lowerText = text.toLowerCase();
    const positiveWords = ['good', 'great', 'happy', 'love', 'wonderful', 'amazing', 'thank', 'smile', 'joy'];
    const negativeWords = ['bad', 'sad', 'angry', 'hate', 'terrible', 'awful', 'sorry', 'pain', 'hurt', 'fear'];

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Get current narrative status
   */
  getNarrativeStatus() {
    const analysis = this.analyzeStoryProgression();
    
    return {
      pacingMetrics: this.pacingMetrics,
      activeArcs: Array.from(this.storyArcs.values()).filter(arc => 
        arc.status === 'active' || arc.status === 'climactic'),
      storyProgression: analysis,
      recommendedEvents: analysis.suggestedEvents.slice(0, 3),
      characterGrowthOpportunities: analysis.characterDevelopmentOpportunities
    };
  }

  /**
   * Get story arc information
   */
  getStoryArc(arcId) {
    return this.storyArcs.get(arcId);
  }

  /**
   * Get all story arcs
   */
  getAllStoryArcs() {
    return Array.from(this.storyArcs.values());
  }

  /**
   * Get plot thread information
   */
  getPlotThread(threadId) {
    return this.plotThreads.get(threadId);
  }

  /**
   * Add clue to plot thread
   */
  addPlotClue(threadId, clue) {
    const thread = this.plotThreads.get(threadId);
    if (thread) {
      thread.clues.push({
        content: clue,
        timestamp: new Date(),
        revelationLevel: thread.revelationLevel
      });
    }
  }
}

module.exports = NarrativeController;