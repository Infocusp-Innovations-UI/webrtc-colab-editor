import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'

const PORT = process.env.PORT || 1234

console.log(`Starting Yjs WebSocket server on port ${PORT}...`)

const wss = new WebSocketServer({ 
  port: PORT,
  perMessageDeflate: {
    threshold: 1024,
    concurrencyLimit: 10,
  }
})

wss.on('connection', (ws, request) => {
  console.log('New client connected')
  setupWSConnection(ws, request)
})

wss.on('error', (error) => {
  console.error('WebSocket server error:', error)
})

console.log(`Yjs WebSocket server running on ws://localhost:${PORT}`)