/**
 * WebIntegration - Real-time Re:Zero lore verification and content enhancement
 * Design principle: Enhance immersion without distracting from the experience
 */

const https = require('https');
const { URL } = require('url');

class WebIntegration {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.cache = new Map();
    this.lastSearchTime = 0;
    this.searchCooldown = 2000; // 2 seconds between searches to be respectful
  }

  /**
   * Search for Re:Zero lore information
   */
  async searchReZeroLore(query, options = {}) {
    try {
      // Check cache first
      const cacheKey = `lore_${query.toLowerCase()}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Respect rate limiting
      const now = Date.now();
      if (now - this.lastSearchTime < this.searchCooldown) {
        await this.sleep(this.searchCooldown - (now - this.lastSearchTime));
      }

      const searchResults = await this.performSearch(query, 'rezero wiki');
      this.lastSearchTime = Date.now();

      // Process and cache results
      const processedResults = this.processLoreResults(searchResults, query);
      this.cache.set(cacheKey, processedResults);

      return processedResults;
    } catch (error) {
      console.error('Lore search failed:', error);
      return { found: false, error: error.message };
    }
  }

  /**
   * Verify character information against canon
   */
  async verifyCharacterInfo(characterId, infoToVerify) {
    try {
      const character = this.stateManager.getCharacter(characterId);
      if (!character) {
        return { verified: false, reason: 'Character not found' };
      }

      const searchQuery = `${character.name} Re:Zero ${infoToVerify}`;
      const loreResults = await this.searchReZeroLore(searchQuery);

      return {
        verified: loreResults.found,
        confidence: loreResults.confidence || 'medium',
        sources: loreResults.sources || [],
        summary: loreResults.summary || 'No verification data found'
      };
    } catch (error) {
      console.error('Character verification failed:', error);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Get character background information from web sources
   */
  async getCharacterBackground(characterName) {
    try {
      const query = `${characterName} Re:Zero character background personality`;
      const results = await this.searchReZeroLore(query);
      
      if (results.found) {
        return {
          background: results.summary,
          traits: this.extractPersonalityTraits(results.content),
          relationships: this.extractRelationships(results.content),
          abilities: this.extractAbilities(results.content)
        };
      }

      return { found: false };
    } catch (error) {
      console.error('Background search failed:', error);
      return { found: false, error: error.message };
    }
  }

  /**
   * Search for fan theories and community insights
   */
  async getFanTheories(topic, characterId = null) {
    try {
      let query = `Re:Zero ${topic} theory discussion`;
      if (characterId) {
        const character = this.stateManager.getCharacter(characterId);
        query += ` ${character.name}`;
      }

      const results = await this.performSearch(query, 'reddit theory');
      
      return {
        theories: this.extractTheories(results),
        discussions: this.extractDiscussions(results),
        relevance: this.calculateRelevance(results, topic)
      };
    } catch (error) {
      console.error('Fan theory search failed:', error);
      return { theories: [], discussions: [] };
    }
  }

  /**
   * Generate scene description prompts
   */
  generateScenePrompts(context) {
    const worldState = this.stateManager.getState().worldState;
    const activeCharacters = context.participants || [];
    
    const prompts = {
      visual: this.generateVisualPrompt(worldState, activeCharacters),
      audio: this.generateAudioPrompt(worldState, context.mood),
      atmosphere: this.generateAtmospherePrompt(worldState, context)
    };

    return prompts;
  }

  /**
   * Perform web search (simplified implementation)
   */
  async performSearch(query, siteHint = '') {
    // For development, return mock data
    // In production, this would use a real search API
    return this.getMockSearchResults(query, siteHint);
  }

  /**
   * Mock search results for development
   */
  getMockSearchResults(query, siteHint) {
    const lowerQuery = query.toLowerCase();
    
    // Emilia mock data
    if (lowerQuery.includes('emilia')) {
      return {
        found: true,
        confidence: 'high',
        summary: 'Emilia is a half-elf and one of the candidates for the Royal Selection of Lugunica. She has silver hair and purple eyes, and uses ice magic through her contract with the spirit Puck.',
        content: 'Emilia personality traits: kind, determined, self-doubting, protective. Relationships: close with Puck (contracted spirit), developing relationship with Subaru, cautious around others due to prejudice.',
        sources: ['Re:Zero Wiki', 'Light Novel Volume 1']
      };
    }

    // Rem mock data
    if (lowerQuery.includes('rem')) {
      return {
        found: true,
        confidence: 'high',
        summary: 'Rem is one of the twin maids working for Roswaal L Mathers. She is deeply devoted and has blue hair and eyes. She wields a spiked flail and uses water magic.',
        content: 'Rem personality: devoted, hardworking, can be violent when angry, self-sacrificing. Abilities: water magic, healing, enhanced physical strength, weapon mastery.',
        sources: ['Re:Zero Wiki', 'Light Novel Volume 2-3']
      };
    }

    // Ram mock data
    if (lowerQuery.includes('ram')) {
      return {
        found: true,
        confidence: 'high',
        summary: 'Ram is the elder of the twin maids and has pink hair. She is sharp-tongued but deeply cares for her sister Rem. She has limited magical abilities due to her broken horn.',
        content: 'Ram personality: sharp-tongued, lazy, intelligent, protective of Rem. Abilities: wind magic, clairvoyance (limited), lost most power when horn was broken.',
        sources: ['Re:Zero Wiki', 'Light Novel Volume 2']
      };
    }

    // Royal Selection mock data
    if (lowerQuery.includes('royal selection')) {
      return {
        found: true,
        confidence: 'high',
        summary: 'The Royal Selection is the process to choose the next ruler of the Kingdom of Lugunica after the royal family died from a mysterious disease.',
        content: 'Five candidates compete: Emilia, Crusch Karsten, Priscilla Barielle, Anastasia Hoshin, and Felt. Each must prove their worth to rule.',
        sources: ['Re:Zero Wiki', 'Light Novel Volume 4']
      };
    }

    // Default response for unknown queries
    return {
      found: false,
      confidence: 'low',
      summary: 'No specific information found for this query.',
      content: '',
      sources: []
    };
  }

  /**
   * Process lore search results
   */
  processLoreResults(results, originalQuery) {
    if (!results.found) {
      return results;
    }

    return {
      found: true,
      query: originalQuery,
      summary: results.summary,
      confidence: results.confidence,
      relevantFacts: this.extractRelevantFacts(results.content, originalQuery),
      sources: results.sources,
      timestamp: new Date()
    };
  }

  /**
   * Extract personality traits from content
   */
  extractPersonalityTraits(content) {
    const traits = [];
    const traitKeywords = {
      'kind': ['kind', 'caring', 'gentle', 'compassionate'],
      'determined': ['determined', 'persistent', 'strong-willed'],
      'loyal': ['loyal', 'devoted', 'faithful'],
      'protective': ['protective', 'defensive'],
      'intelligent': ['smart', 'intelligent', 'clever'],
      'shy': ['shy', 'timid', 'reserved'],
      'confident': ['confident', 'assertive', 'bold']
    };

    const lowerContent = content.toLowerCase();
    for (const [trait, keywords] of Object.entries(traitKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        traits.push(trait);
      }
    }

    return traits;
  }

  /**
   * Extract relationships from content
   */
  extractRelationships(content) {
    const relationships = {};
    const relationshipPatterns = [
      /(\w+)\s+(?:and|with)\s+(\w+)\s+(?:are|have|share)/gi,
      /(\w+)\s+(?:loves|cares for|protects)\s+(\w+)/gi,
      /(\w+)\s+(?:sister|brother|friend|ally)\s+(?:of|to)\s+(\w+)/gi
    ];

    for (const pattern of relationshipPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[2]) {
          relationships[match[1].toLowerCase()] = match[2].toLowerCase();
        }
      }
    }

    return relationships;
  }

  /**
   * Extract abilities from content
   */
  extractAbilities(content) {
    const abilities = [];
    const abilityKeywords = [
      'magic', 'spell', 'healing', 'combat', 'strength', 'speed',
      'clairvoyance', 'spirit', 'contract', 'weapon', 'flail'
    ];

    const lowerContent = content.toLowerCase();
    for (const ability of abilityKeywords) {
      if (lowerContent.includes(ability)) {
        abilities.push(ability);
      }
    }

    return abilities;
  }

  /**
   * Extract theories from search results
   */
  extractTheories(results) {
    // Mock theory extraction
    return [
      {
        title: 'Character Development Theory',
        summary: 'Theory about character growth and relationships',
        relevance: 'high'
      }
    ];
  }

  /**
   * Extract discussions from search results
   */
  extractDiscussions(results) {
    // Mock discussion extraction
    return [
      {
        topic: 'Character Analysis',
        points: ['Key personality insights', 'Relationship dynamics'],
        source: 'Community Discussion'
      }
    ];
  }

  /**
   * Calculate relevance of results to topic
   */
  calculateRelevance(results, topic) {
    // Simple relevance calculation
    if (!results.content) return 'low';
    
    const topicWords = topic.toLowerCase().split(' ');
    const contentWords = results.content.toLowerCase().split(' ');
    
    const matches = topicWords.filter(word => 
      contentWords.some(contentWord => contentWord.includes(word))
    );
    
    const relevanceRatio = matches.length / topicWords.length;
    
    if (relevanceRatio >= 0.7) return 'high';
    if (relevanceRatio >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Extract relevant facts from content
   */
  extractRelevantFacts(content, query) {
    const queryWords = query.toLowerCase().split(' ');
    const sentences = content.split(/[.!?]+/);
    
    const relevantSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return queryWords.some(word => lowerSentence.includes(word));
    });

    return relevantSentences.slice(0, 3); // Return top 3 most relevant facts
  }

  /**
   * Generate visual scene prompt
   */
  generateVisualPrompt(worldState, characters) {
    const location = worldState.location;
    const timeOfDay = worldState.timeOfDay;
    const weather = worldState.weather;
    
    const characterDescriptions = characters.map(id => {
      const char = this.stateManager.getCharacter(id);
      return char ? char.name : 'unknown character';
    }).join(', ');

    return `Scene: ${location} during ${timeOfDay}, ${weather} weather. Characters present: ${characterDescriptions}. Anime art style, detailed background, atmospheric lighting.`;
  }

  /**
   * Generate audio/music prompt
   */
  generateAudioPrompt(worldState, mood) {
    const suggestions = {
      peaceful: 'Gentle orchestral music, birds chirping, soft wind',
      tense: 'Suspenseful strings, dramatic percussion, building tension',
      sad: 'Melancholic piano, soft rain, distant thunder',
      happy: 'Uplifting melody, cheerful instruments, light atmosphere'
    };

    return suggestions[mood] || 'Ambient Re:Zero soundtrack, atmospheric background music';
  }

  /**
   * Generate atmosphere prompt
   */
  generateAtmospherePrompt(worldState, context) {
    const elements = [
      `Time: ${worldState.timeOfDay}`,
      `Weather: ${worldState.weather}`,
      `Location: ${worldState.location}`,
      `Mood: ${context.mood || 'neutral'}`,
      `Tension: ${context.tension || 0}/10`
    ];

    return elements.join(', ') + '. Re:Zero fantasy world atmosphere.';
  }

  /**
   * Utility function for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = WebIntegration;