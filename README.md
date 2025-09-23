# Collaborative Editor Starter Template

A modern starter template for building real-time collaborative editors using React.js and Yjs.

## Features

- **React 18** with TypeScript
- **Yjs** for conflict-free collaborative editing
- **WebSocket** server for real-time synchronization
- **Modern tooling** with latest dependencies
## 📦 Project Structure

```
webrtc-colab-editor/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── App.css        # Styling
│   │   └── index.tsx      # Entry point
│   └── package.json
├── server/                 # Yjs WebSocket server
│   ├── server.js          # WebSocket server
│   └── package.json
└── package.json           # Root package.json with workspaces
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd webrtc-colab-editor
```

2. Install all dependencies:
```bash
npm run install:all
```

### Development

Start both the server and client in development mode:

```bash
npm run dev
```

This will start:
- **Client**: http://localhost:3000 (React development server)
- **Server**: ws://localhost:1234 (Yjs WebSocket server)

### Individual Commands

Start only the server:
```bash
npm run server:dev
```

Start only the client:
```bash
npm run client:dev
```

## 🔧 Tech Stack

### Frontend
- **React 18.3.1** - Modern React with hooks
- **TypeScript 5.6.3** - Type safety
- **React Scripts 5.0.1** - Build tooling

### Backend
- **Yjs 13.6.19** - Conflict-free replicated data types
- **y-websocket 2.0.4** - WebSocket provider for Yjs
- **ws 8.18.0** - WebSocket server

### Development Tools
- **Concurrently** - Run multiple commands
- **Nodemon** - Auto-restart server on changes

## What to Build Next

This starter template provides the foundation. Here are some features you might want to implement:

### Essential Features
- [ ] **Rich Text Editor** (Monaco, Quill, or custom)
- [ ] **Document Management** (create, save, load documents)
- [ ] **User Authentication** (identify collaborators)
- [ ] **Real-time Cursors** (show other users' positions)
- [ ] **User Presence** (online/offline status)

### Advanced Features
- [ ] **Permissions System** (read/write access)
- [ ] **Version History** (document snapshots)
- [ ] **Comments System** (collaborative annotations)
- [ ] **Voice/Video Chat** (WebRTC integration)
- [ ] **Offline Support** (local storage sync)

### UI/UX Enhancements
- [ ] **Room Management** (create/join rooms)
- [ ] **User Avatars** (profile pictures)
- [ ] **Dark/Light Theme** (theme switching)
- [ ] **Mobile Responsive** (touch-friendly)
- [ ] **Keyboard Shortcuts** (power user features)

## 📚 Yjs Integration Guide

### Basic Document Setup

```typescript
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

// Create a new Yjs document
const ydoc = new Y.Doc()

// Connect to the WebSocket server
const provider = new WebsocketProvider('ws://localhost:1234', 'room-name', ydoc)

// Create a shared text type
const ytext = ydoc.getText('content')

// Listen for changes
ytext.observe((event) => {
  console.log('Text changed:', event)
})

// Make changes
ytext.insert(0, 'Hello, collaborative world!')
```

## 🚀 Deployment

### Environment Variables

```bash
PORT=1234  # WebSocket server port
```
