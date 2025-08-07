/**
 * Basic tests for Re:Zero RP System core functionality
 * Design principle: Test before modification - verify current functionality works
 */

const ReZeroRPSystem = require('../src/main');

class RPSystemTester {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllTests() {
    console.log('🧪 Running Re:Zero RP System Tests\n');

    await this.testSystemInitialization();
    await this.testSessionManagement();
    await this.testCharacterSystem();
    await this.testConversationFlow();
    await this.testStateManagement();
    await this.testWebIntegration();
    await this.testConsequenceTracking();
    await this.testNarrativeController();

    this.printResults();
  }

  async testSystemInitialization() {
    console.log('📦 Testing System Initialization...');

    try {
      const system = new ReZeroRPSystem();
      this.assert(system !== null, 'System should initialize');
      this.assert(system.stateManager !== null, 'StateManager should be initialized');
      this.assert(system.characterEngine !== null, 'CharacterEngine should be initialized');
      this.assert(system.conversationManager !== null, 'ConversationManager should be initialized');
      this.assert(system.webIntegration !== null, 'WebIntegration should be initialized');
      this.assert(system.consequenceTracker !== null, 'ConsequenceTracker should be initialized');
      this.assert(system.narrativeController !== null, 'NarrativeController should be initialized');

      console.log('✅ System initialization tests passed\n');
    } catch (error) {
      this.fail('System initialization failed', error);
    }
  }

  async testSessionManagement() {
    console.log('🎭 Testing Session Management...');

    try {
      const system = new ReZeroRPSystem();
      
      // Test session start
      const sessionResult = await system.startSession('TestUser');
      this.assert(sessionResult.success === true, 'Session should start successfully');
      this.assert(sessionResult.sessionId !== null, 'Session should have an ID');
      this.assert(system.isRunning === true, 'System should be running');

      // Test session status
      const status = system.getSystemStatus();
      this.assert(status.isRunning === true, 'Status should show system running');
      this.assert(status.session.userName === 'TestUser', 'Username should be stored');

      // Test session end
      system.endSession();
      this.assert(system.isRunning === false, 'System should stop after ending session');

      console.log('✅ Session management tests passed\n');
    } catch (error) {
      this.fail('Session management failed', error);
    }
  }

  async testCharacterSystem() {
    console.log('👥 Testing Character System...');

    try {
      const system = new ReZeroRPSystem();
      
      // Test character retrieval
      const emilia = system.stateManager.getCharacter('emilia');
      this.assert(emilia !== null, 'Emilia should exist');
      this.assert(emilia.name === 'Emilia', 'Emilia should have correct name');
      this.assert(emilia.basePersonality !== null, 'Emilia should have personality');

      const rem = system.stateManager.getCharacter('rem');
      this.assert(rem !== null, 'Rem should exist');
      this.assert(rem.name === 'Rem', 'Rem should have correct name');

      const ram = system.stateManager.getCharacter('ram');
      this.assert(ram !== null, 'Ram should exist');
      this.assert(ram.name === 'Ram', 'Ram should have correct name');

      // Test character info
      const charInfo = system.getCharacterInfo('emilia');
      this.assert(charInfo.found === true, 'Character info should be found');
      this.assert(charInfo.character.name === 'Emilia', 'Character info should be correct');

      console.log('✅ Character system tests passed\n');
    } catch (error) {
      this.fail('Character system failed', error);
    }
  }

  async testConversationFlow() {
    console.log('💬 Testing Conversation Flow...');

    try {
      const system = new ReZeroRPSystem();
      await system.startSession('TestUser');

      // Test conversation start
      const convResult = await system.startConversation(['emilia']);
      this.assert(convResult.success === true, 'Conversation should start');
      this.assert(convResult.participants.includes('emilia'), 'Emilia should be in conversation');

      // Test message sending
      const messageResult = await system.sendMessage('Hello Emilia!');
      this.assert(messageResult.success === true, 'Message should be processed');
      this.assert(messageResult.characterResponses.length > 0, 'Should get character response');
      this.assert(messageResult.characterResponses[0].speaker === 'emilia', 'Emilia should respond');

      // Test conversation state
      const convState = system.conversationManager.getCurrentConversationState();
      this.assert(convState !== null, 'Conversation state should exist');
      this.assert(convState.participants.includes('emilia'), 'Emilia should be active participant');

      console.log('✅ Conversation flow tests passed\n');
    } catch (error) {
      this.fail('Conversation flow failed', error);
    }
  }

  async testStateManagement() {
    console.log('💾 Testing State Management...');

    try {
      const system = new ReZeroRPSystem();
      
      // Test state retrieval
      const state = system.stateManager.getState();
      this.assert(state !== null, 'State should exist');
      this.assert(state.characters !== null, 'Characters state should exist');
      this.assert(state.worldState !== null, 'World state should exist');

      // Test state export/import
      const exportedState = system.exportState();
      this.assert(exportedState !== null, 'State should export');
      this.assert(typeof exportedState === 'string', 'Exported state should be string');

      const importResult = system.importState(exportedState);
      this.assert(importResult === true, 'State should import successfully');

      console.log('✅ State management tests passed\n');
    } catch (error) {
      this.fail('State management failed', error);
    }
  }

  async testWebIntegration() {
    console.log('🌐 Testing Web Integration...');

    try {
      const system = new ReZeroRPSystem();
      
      // Test lore search
      const loreResult = await system.searchLore('Emilia');
      this.assert(loreResult !== null, 'Lore search should return result');
      
      // Test scene prompt generation
      const prompts = system.webIntegration.generateScenePrompts({
        participants: ['emilia'],
        mood: 'peaceful'
      });
      this.assert(prompts.visual !== null, 'Visual prompt should be generated');
      this.assert(prompts.atmosphere !== null, 'Atmosphere prompt should be generated');

      console.log('✅ Web integration tests passed\n');
    } catch (error) {
      this.fail('Web integration failed', error);
    }
  }

  async testConsequenceTracking() {
    console.log('⚡ Testing Consequence Tracking...');

    try {
      const system = new ReZeroRPSystem();
      await system.startSession('TestUser');

      // Test consequence processing
      const consequence = system.consequenceTracker.processConsequence({
        type: 'test_consequence',
        description: 'User made a promise to help Emilia',
        characterId: 'emilia'
      });

      this.assert(consequence !== null, 'Consequence should be processed');
      this.assert(consequence.effects !== null, 'Consequence should have effects');

      // Test consequence retrieval
      const activeConsequences = system.consequenceTracker.getActiveConsequences();
      this.assert(activeConsequences.length > 0, 'Should have active consequences');

      // Test character-specific consequences
      const charConsequences = system.consequenceTracker.getCharacterConsequences('emilia');
      this.assert(charConsequences.length > 0, 'Should have consequences for character');

      console.log('✅ Consequence tracking tests passed\n');
    } catch (error) {
      this.fail('Consequence tracking failed', error);
    }
  }

  async testNarrativeController() {
    console.log('📖 Testing Narrative Controller...');

    try {
      const system = new ReZeroRPSystem();
      await system.startSession('TestUser');

      // Test story progression analysis
      const analysis = system.narrativeController.analyzeStoryProgression();
      this.assert(analysis !== null, 'Story analysis should be generated');
      this.assert(analysis.currentTension !== undefined, 'Should calculate tension level');
      this.assert(analysis.suggestedEvents !== undefined, 'Should suggest story events');

      // Test narrative status
      const narrativeStatus = system.narrativeController.getNarrativeStatus();
      this.assert(narrativeStatus !== null, 'Narrative status should be available');
      this.assert(narrativeStatus.pacingMetrics !== null, 'Should have pacing metrics');

      // Test story arc management
      const arcs = system.narrativeController.getAllStoryArcs();
      this.assert(arcs.length > 0, 'Should have initialized story arcs');
      this.assert(arcs.some(arc => arc.id === 'royal_selection'), 'Should have royal selection arc');

      // Test enhanced system status
      const enhancedStatus = system.getSystemStatus();
      this.assert(enhancedStatus.storyTension !== undefined, 'Enhanced status should include story tension');
      this.assert(enhancedStatus.activeStoryArcs !== undefined, 'Enhanced status should include active arcs');

      console.log('✅ Narrative controller tests passed\n');
    } catch (error) {
      this.fail('Narrative controller failed', error);
    }
  }

  assert(condition, message) {
    if (condition) {
      this.passed++;
    } else {
      this.failed++;
      console.log(`❌ FAIL: ${message}`);
    }
  }

  fail(testName, error) {
    this.failed++;
    console.log(`❌ FAIL: ${testName} - ${error.message}\n`);
  }

  printResults() {
    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%\n`);

    if (this.failed === 0) {
      console.log('🎉 All tests passed! Foundation is stable and ready for development.');
    } else {
      console.log('⚠️  Some tests failed. Foundation needs fixes before proceeding.');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new RPSystemTester();
  tester.runAllTests().catch(console.error);
}

module.exports = RPSystemTester;