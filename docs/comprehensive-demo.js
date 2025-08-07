/**
 * Comprehensive Usage Example - Demonstrating the Full Re:Zero RP System
 * This example shows how to use all the advanced features we've built
 */

const ReZeroRPSystem = require('../src/main');

async function comprehensiveDemo() {
  console.log('🌟 Re:Zero RP System - Comprehensive Feature Demo\n');
  
  // Initialize system
  const system = new ReZeroRPSystem();
  
  // Start session
  console.log('=== 1. SESSION MANAGEMENT ===');
  await system.startSession('Subaru');
  console.log('✅ Session started with enhanced tracking\n');
  
  // Start conversation with multiple characters
  console.log('=== 2. CHARACTER INTERACTIONS ===');
  await system.startConversation(['emilia']);
  
  // Demonstrate different types of interactions and their consequences
  console.log('--- Positive Interaction ---');
  await system.sendMessage("Emilia, I want to help you with the royal selection. You're amazing and deserve to be queen!");
  
  console.log('\n--- Adding Another Character ---');
  system.conversationManager.addParticipant('rem');
  await system.sendMessage("Rem, you work so hard. I really appreciate everything you do for everyone here.");
  
  console.log('\n--- Complex Emotional Situation ---');
  await system.sendMessage("I have to tell you both something important. I've been having strange dreams about dying and coming back...");
  
  // Show enhanced analytics
  console.log('\n=== 3. NARRATIVE ANALYSIS ===');
  const narrativeAnalysis = system.getNarrativeAnalysis();
  console.log('📊 Story Progression Analysis:');
  console.log(`🎭 Current Tension: ${narrativeAnalysis.storyProgression.currentTension}/10`);
  console.log(`😊 Emotional Climate: ${narrativeAnalysis.storyProgression.emotionalClimate.dominantEmotion}`);
  console.log(`⏱️ Pacing: ${narrativeAnalysis.storyProgression.pacingRecommendation.recommendation}`);
  
  if (narrativeAnalysis.storyProgression.suggestedEvents.length > 0) {
    console.log('\n💡 Story Suggestions:');
    narrativeAnalysis.storyProgression.suggestedEvents.slice(0, 3).forEach(event => {
      console.log(`  • ${event.title} (${event.priority} priority)`);
    });
  }
  
  // Show character growth opportunities
  if (narrativeAnalysis.characterGrowthOpportunities.length > 0) {
    console.log('\n🌱 Character Growth Opportunities:');
    narrativeAnalysis.characterGrowthOpportunities.forEach(opp => {
      console.log(`  • ${opp.characterId}: ${opp.description}`);
      console.log(`    Methods: ${opp.methods.join(', ')}`);
    });
  }
  
  // Demonstrate relationship analysis
  console.log('\n=== 4. RELATIONSHIP ANALYSIS ===');
  const relationships = system.getRelationshipAnalysis();
  for (const charId of Object.keys(relationships)) {
    const rel = relationships[charId];
    console.log(`💕 ${rel.characterName}:`);
    console.log(`   Relationship: ${rel.relationshipLevel}`);
    console.log(`   Affinity: ${rel.affinity.toFixed(2)}/10, Trust: ${rel.trust.toFixed(2)}/10`);
    console.log(`   Interactions: ${rel.interactions}, Mood: ${rel.emotionalState.currentMood}`);
    if (rel.recentConsequences.length > 0) {
      console.log(`   Recent Consequences: ${rel.recentConsequences.length}`);
    }
  }
  
  // Demonstrate story arc tracking
  console.log('\n=== 5. STORY ARC MANAGEMENT ===');
  const storyArcs = system.narrativeController.getAllStoryArcs();
  console.log('📚 Active Story Arcs:');
  storyArcs.filter(arc => arc.status === 'active' || arc.status === 'dormant').forEach(arc => {
    const completedChapters = arc.chapters.filter(ch => ch.completed).length;
    console.log(`  📖 ${arc.title} (${arc.status})`);
    console.log(`     Progress: ${completedChapters}/${arc.chapters.length} chapters`);
    console.log(`     Priority: ${arc.priority}`);
  });
  
  // Demonstrate consequence tracking
  console.log('\n=== 6. CONSEQUENCE TRACKING ===');
  const consequenceStats = system.consequenceTracker.getConsequenceStats();
  console.log('⚡ Consequence System Status:');
  console.log(`   Active Consequences: ${consequenceStats.totalActive}`);
  console.log(`   Pending Delayed Events: ${consequenceStats.pendingDelayed}`);
  if (Object.keys(consequenceStats.effectTypeBreakdown).length > 0) {
    console.log('   Effect Types:');
    for (const [type, count] of Object.entries(consequenceStats.effectTypeBreakdown)) {
      console.log(`     ${type}: ${count}`);
    }
  }
  
  // Demonstrate manual story event triggering
  console.log('\n=== 7. MANUAL STORY EVENTS ===');
  const storyEvent = system.triggerStoryEvent({
    title: 'Royal Selection Meeting',
    description: 'Subaru attends his first royal selection meeting',
    type: 'story_progression',
    arcId: 'royal_selection'
  });
  
  if (storyEvent.success) {
    console.log(`🎭 Triggered: ${storyEvent.event.title}`);
    console.log(`📈 New Tension Level: ${storyEvent.narrativeImpact.currentTension}/10`);
  }
  
  // Demonstrate lore integration
  console.log('\n=== 8. LORE INTEGRATION ===');
  const loreResult = await system.searchLore("Return by Death power");
  if (loreResult.found) {
    console.log('📚 Lore Search Result:');
    console.log(`   Summary: ${loreResult.summary}`);
    console.log(`   Confidence: ${loreResult.confidence}`);
  }
  
  // Show comprehensive system status
  console.log('\n=== 9. COMPREHENSIVE SYSTEM STATUS ===');
  const systemStatus = system.getSystemStatus();
  console.log('🖥️ Full System Overview:');
  console.log(`   Session: ${systemStatus.session.userName} (${systemStatus.totalInteractions} interactions)`);
  console.log(`   Location: ${systemStatus.worldState.location} (${systemStatus.worldState.timeOfDay})`);
  console.log(`   Story Tension: ${systemStatus.storyTension}/10`);
  console.log(`   Active Characters: ${systemStatus.activeCharacters.length}`);
  console.log(`   Conversation Active: ${systemStatus.conversationActive}`);
  console.log(`   Pending Consequences: ${systemStatus.pendingConsequences}`);
  if (systemStatus.narrativeRecommendations.length > 0) {
    console.log(`   Story Recommendations: ${systemStatus.narrativeRecommendations.map(r => r.title).join(', ')}`);
  }
  
  // Demonstrate character-specific information
  console.log('\n=== 10. CHARACTER DEEP DIVE ===');
  const emiliaInfo = system.getCharacterInfo('emilia');
  if (emiliaInfo.found) {
    console.log('👸 Emilia Profile:');
    console.log(`   Current Mood: ${emiliaInfo.character.currentMood}`);
    console.log(`   Personality: ${emiliaInfo.character.personality.join(', ')}`);
    console.log(`   Relationship Level: ${emiliaInfo.relationship.relationshipLevel}`);
    console.log(`   Recent Memories: ${emiliaInfo.recentMemories.length} stored`);
  }
  
  // Show state export capability
  console.log('\n=== 11. STATE PERSISTENCE ===');
  const exportedState = system.exportState();
  console.log(`💾 State Export: ${exportedState.length} characters of JSON data`);
  console.log('✅ Full session state can be saved and restored');
  
  // End session
  console.log('\n=== 12. SESSION CONCLUSION ===');
  system.endSession();
  
  console.log('\n🎉 COMPREHENSIVE DEMO COMPLETE');
  console.log('🌟 The Re:Zero RP System successfully demonstrates:');
  console.log('   ✅ Advanced character AI with persistent memory');
  console.log('   ✅ Sophisticated consequence tracking');
  console.log('   ✅ Dynamic story progression and pacing');
  console.log('   ✅ Real-time narrative analysis');
  console.log('   ✅ Complex relationship management');
  console.log('   ✅ Multi-arc story tracking');
  console.log('   ✅ Immersive world state management');
  console.log('   ✅ Lore integration and scene generation');
  console.log('\n💫 Ready for immersive Re:Zero roleplay experiences!');
}

// Export for use
module.exports = { comprehensiveDemo };

// Run if called directly
if (require.main === module) {
  comprehensiveDemo().catch(console.error);
}