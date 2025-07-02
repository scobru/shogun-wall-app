# Shogun-Wall

<img width="200" src="https://user-images.githubusercontent.com/87884985/172069592-8a4de3db-7f2f-4dfd-b523-29aae3a7e950.png" />

This project is based on https://github.com/wayjake/Wallie.io/

### ✨ Key Features

- **🌐 Distributed Architecture**: Built on Gun.js for real-time, decentralized data synchronization
- **🔐 Multi-Authentication System**: Supports Shogun-core, password, Web3, WebAuthn, Nostr, and OAuth
- **📱 Multi-Platform Content Aggregation**: Integrates Reddit, Hacker News, and DEV.to feeds
- **🗳️ Advanced Voting System**: Reddit-style upvote/downvote with intelligent sorting algorithms
- **🔑 Cryptographic Key Management**: Export/import Gun pairs with encryption support
- **📝 Rich Content Creation**: Blog posts and nodes with HTML/Markdown support
- **🎯 Smart Content Filtering**: Advanced search and categorization system
- **📊 Real-time Analytics**: Live view counts and engagement metrics

## 🏗️ Architecture

### Core Components

#### 1. **Authentication System** (`shogun-button-react`)

- **Shogun-core Integration**: Decentralized identity management
- **Multi-method Authentication**: Password, Web3, WebAuthn, Nostr, OAuth
- **Pair Export/Import**: Secure key backup and recovery system
- **Guest Mode**: Local username support for anonymous users

#### 2. **Content Management** (`Shogun-Wall`)

- **Dual Content Model**: Blog posts (structured) and Nodes (flexible)
- **Real-time Synchronization**: Gun.js-powered live updates
- **Multi-platform Aggregation**: Automated content from external sources
- **Rich Text Editor**: TipTap-based WYSIWYG editor

#### 3. **Social Features**

- **Voting System**: Upvote/downvote with intelligent ranking
- **Comment Threads**: Nested discussions on posts and nodes
- **User Profiles**: Comprehensive user pages with content history
- **Real-time Notifications**: Live updates and interactions

#### 4. **Data Layer**

- **Gun.js Database**: Decentralized, real-time database
- **Conflict Resolution**: Automatic data synchronization
- **Offline Support**: Works without internet connection
- **P2P Networking**: Direct peer-to-peer communication

## 🛠️ Technology Stack

### Frontend

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Styled Components**: CSS-in-JS styling
- **React Router**: Client-side routing
- **TipTap**: Rich text editing
- **DOMPurify**: XSS protection

### Backend/Database

- **Gun.js**: Decentralized database and networking
- **Gun SEA**: Cryptographic security layer
- **P2P Networking**: Distributed data synchronization

### Authentication

- **Shogun-core**: Decentralized identity system
- **Web3**: Blockchain wallet integration
- **WebAuthn**: Biometric authentication
- **Nostr**: Decentralized social protocol
- **OAuth**: Traditional social login

### External Integrations

- **Reddit API**: Content aggregation
- **Hacker News API**: Tech news integration
- **DEV.to API**: Developer content

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/shogun-wall-app.git
cd shogun-wall-app

# Install dependencies for auth component
npm install

# Build auth component
npm run build

# Return to main app and start development server
npm start
```

### Environment Setup

Create a `.env` file in `Shogun-Wall/`:

```env
REACT_APP_GUN_PEERS=["https://gun-manhattan.herokuapp.com/gun"]
REACT_APP_SHOGUN_API_URL=https://api.shogun.org
REACT_APP_REDDIT_CLIENT_ID=your_reddit_client_id
```

## 📖 User Guide

### Getting Started

1. **Visit the Application**: Navigate to the Shogun-Wall interface
2. **Choose Authentication**:
   - **Guest Mode**: Set a local username
   - **Shogun Login**: Use decentralized identity
   - **Web3**: Connect crypto wallet
   - **Social**: OAuth with Google/GitHub
3. **Explore Content**: Browse the feed with different sorting options
4. **Create Content**: Write blog posts or create nodes
5. **Engage**: Vote, comment, and interact with the community

### Content Types

#### Blog Posts

- **Structured Articles**: Title, content, tags, categories
- **Rich Formatting**: HTML/Markdown support
- **SEO Optimized**: Meta descriptions and social sharing
- **Edit History**: Version tracking and collaboration

#### Nodes

- **Flexible Format**: Any type of content or data
- **Directional Linking**: Connect related nodes
- **Real-time Editing**: Live collaborative editing
- **Categorization**: Tags and hashtags support

### Voting System

#### Sorting Algorithms

- **🔥 Hot**: Trending content based on engagement and recency
- **⭐ Top**: Highest voted content of all time
- **🆕 New**: Most recently posted content

#### Voting Mechanics

- **Upvote (⇧)**: Positive engagement, increases visibility
- **Downvote (⇩)**: Negative feedback, decreases ranking
- **Score Calculation**: `upvotes - downvotes`
- **Time Decay**: Older content gradually loses ranking

### Key Management

#### Export Gun Pair

1. Go to **Profile** → **Gestione Pair Gun**
2. Enter encryption password (recommended)
3. Click **Export Pair**
4. Save the generated JSON securely

#### Import Gun Pair

1. Click **Import Gun Pair** in login options
2. Paste your pair JSON data
3. Enter decryption password if encrypted
4. Click **Import and Login**

## 🔧 Development

### Project Structure

```
hal-9000/
├── Shogun-Wall/                 # Main application
│   ├── src/
│   │   ├── api/              # Gun.js integration
│   │   ├── Blog/             # Blog functionality
│   │   ├── components/       # Reusable components
│   │   ├── Interface/        # UI components
│   │   ├── List/             # Content listing
│   │   ├── Nodes/            # Node management
│   │   └── utils/            # Utilities
├── shogun-button-react/       # Authentication component
│   ├── src/
│   │   ├── components/       # Auth UI components
│   │   ├── types/            # TypeScript definitions
│   │   └── styles/           # CSS styles
└── docs/                     # Documentation
```

### Key APIs

#### Authentication

```typescript
import { useShogun } from 'shogun-button-react'

const { login, logout, isLoggedIn, exportGunPair, importGunPair } = useShogun()

// Login with pair
await login('pair', pairData)

// Export encrypted pair
const encryptedPair = await exportGunPair('password')
```

#### Content Management

```typescript
import gun from './api/gun'

// Create a node
gun.get('namespace/node').get(nodeId).put(nodeData)

// Listen to changes
gun.get('namespace/node')
   .map()
   .on((data, key) => {
      console.log('New node:', data)
   })
```

#### Voting System

```typescript
const upVote = (node) => {
   const upVotes = (node?.upVotes || 0) + 1
   gun.get('namespace/node').get(node.key).put({ upVotes })
}
```

### Adding New Features

1. **Create Component**: Add to appropriate directory
2. **Define Types**: Update TypeScript interfaces
3. **Add Routing**: Update React Router configuration
4. **Integrate Gun.js**: Add real-time data sync
5. **Add Tests**: Write unit and integration tests

### Content Aggregation

The system automatically fetches content from external platforms:

```typescript
// Reddit Integration
const fetchRedditPosts = async () => {
   const channels = ['CrazyIdeas', 'AskReddit', 'todayilearned']
   const response = await fetch(`https://www.reddit.com/r/${channel}/new.json`)
   // Process and store content
}

// Hacker News Integration
const fetchHackerNews = async () => {
   const topStories = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json'
   )
   // Fetch story details and store
}
```

## 🔒 Security

### Data Protection

- **Encryption**: Gun SEA for cryptographic security
- **XSS Prevention**: DOMPurify sanitization
- **Input Validation**: Server and client-side validation
- **Key Management**: Secure pair export/import

### Privacy

- **Decentralized**: No central data collection
- **Guest Mode**: Anonymous participation
- **Local Storage**: Sensitive data kept locally
- **P2P**: Direct peer communication

## 🤝 Contributing

### Development Workflow

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📊 Performance

### Optimization Features

- **Code Splitting**: Lazy loading of components
- **Bundle Analysis**: Webpack bundle optimization
- **Caching**: Intelligent data caching
- **Real-time Updates**: Efficient data synchronization

### Monitoring

- **View Tracking**: Content engagement metrics
- **Performance Metrics**: Load times and responsiveness
- **Error Tracking**: Comprehensive error logging

## 🔮 Roadmap

### Planned Features

- **Mobile App**: React Native implementation
- **Plugin System**: Extensible architecture
- **Advanced Analytics**: Detailed engagement metrics
- **AI Integration**: Content recommendation system
- **Blockchain Integration**: Token-based incentives

### Current Priorities

1. **Mobile Optimization**: Responsive design improvements
2. **Performance**: Bundle size optimization
3. **Documentation**: Comprehensive API documentation
4. **Testing**: Increased test coverage

### Community

- **GitHub Discussions**: [Project Discussions](https://github.com/your-org/hal-9000/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stanley Kubrick** - Original Shogun-Wall inspiration
- **Gun.js Team** - Decentralized database technology
- **React Community** - Frontend framework and ecosystem
- **Open Source Contributors** - Community contributions and feedback

---

**"I'm sorry, Dave. I'm afraid I can't do that."** - Shogun-Wall

_Built with ❤️ for the decentralized future_
