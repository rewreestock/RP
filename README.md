# Re:Zero Advanced Roleplay System

A sophisticated character interaction system for immersive Re:Zero roleplay experiences.

## 🌟 Features

### Advanced Character AI System
- **Persistent Personalities**: Characters with consistent but evolving personalities
- **Memory System**: Characters remember conversations and develop relationships
- **Emotional Depth**: Realistic psychological responses and emotional state tracking
- **Character Growth**: Personalities that change based on interactions

### Rich World State Management
- **Dynamic Environment**: Time progression with meaningful consequences
- **Location-based Interactions**: Different responses based on setting
- **Consequence Engine**: Every action has realistic, cascading effects
- **Multiple Storylines**: Intersecting narratives that influence each other

### Real-time Lore Integration
- **Web Search**: Re:Zero lore verification and expansion
- **Character Information**: Lookup for consistency with canon
- **Community Insights**: Fan theories and discussions integration
- **Scene Enhancement**: Visual and atmospheric prompts

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run the system
npm start

# Run tests
npm test
```

## 💬 Basic Usage

```javascript
const ReZeroRPSystem = require('./src/main');

// Create and start system
const system = new ReZeroRPSystem();
await system.startSession('YourName');

// Start conversation with characters
await system.startConversation(['emilia', 'rem']);

// Send messages
await system.sendMessage("Hello Emilia! How are you today?");

// Search for lore
await system.searchLore("royal selection");
```

## 🏗️ Architecture

### Core Components
- **StateManager**: Handles all persistent data and game state
- **CharacterEngine**: Manages individual character AI and responses  
- **ConversationManager**: Maintains dialogue flow and context
- **WebIntegration**: Real-time lore verification and enhancement

### Design Principles
- **Additive Development**: Never modify working code, only add features
- **Modular Architecture**: Separate concerns for maintainability
- **Context Optimization**: Maximize Gemini Flash 2.5's 1M token context
- **Character Consistency**: Characters feel like real people, not chatbots

## 📚 Available Characters

- **Emilia**: Half-elf candidate with kind but self-doubting personality
- **Rem**: Devoted maid with deep loyalty and hidden depths
- **Ram**: Sharp-tongued elder twin with protective instincts

## 🧪 Testing

The system includes comprehensive tests to ensure stability:

```bash
npm test
```

All core functionality is tested including:
- System initialization
- Session management  
- Character interactions
- Conversation flow
- State persistence
- Web integration

## 🎯 Success Criteria

**Minimum Viable Success:**
- Characters feel distinct and memorable
- User actions have clear consequences
- Story progresses naturally
- Web integration enhances experience
- Multi-session continuity works

**Exceptional Success:**
- Users become emotionally invested
- Story surprises while staying consistent
- Characters grow believably
- Web integration creates "aha!" moments
- Multiple storylines interweave satisfyingly

## 📖 System Status

Use `system.getSystemStatus()` to see:
- Active session information
- Current characters and relationships
- Conversation state
- Memory usage statistics
- World state details

## 🔧 Development

The system follows strict development principles:
1. **Foundation First**: Core components must be stable before enhancement
2. **Test-Driven**: All changes verified with tests
3. **Additive Only**: Never break working functionality
4. **Character Focus**: Every feature serves the story experience

## 📄 License

MIT License - See LICENSE file for details