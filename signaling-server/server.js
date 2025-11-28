#!/usr/bin/env node

import { WebSocketServer } from 'ws'
import http from 'http'
import * as map from 'lib0/map'

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2
const wsReadyStateClosed = 3

const pingTimeout = 30000

// Read PORT from environment; defaults to 3000 for Render
const port = process.env.PORT || 3000

const wss = new WebSocketServer({ noServer: true })

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Signaling server is running')
})

/**
 * Map from topic-name to set of subscribed clients.
 * @type {Map<string, Set<any>>}
 */
const topics = new Map()

/**
 * @param {any} conn
 * @param {object} message
 */
const send = (conn, message) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    conn.close()
  }
  try {
    conn.send(JSON.stringify(message))
  } catch (e) {
    conn.close()
  }
}

/**
 * Setup a new client
 * @param {any} conn
 */
const onconnection = conn => {
  const subscribedTopics = new Set()
  let closed = false
  let pongReceived = true
  
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      conn.close()
      clearInterval(pingInterval)
    } else {
      pongReceived = false
      try {
        conn.ping()
      } catch (e) {
        conn.close()
      }
    }
  }, pingTimeout)
  
  conn.on('pong', () => {
    pongReceived = true
  })
  
  conn.on('close', () => {
    subscribedTopics.forEach(topicName => {
      const subs = topics.get(topicName) || new Set()
      subs.delete(conn)
      if (subs.size === 0) {
        topics.delete(topicName)
      }
    })
    subscribedTopics.clear()
    closed = true
    clearInterval(pingInterval)
  })
  
  conn.on('message', message => {
    try {
      if (typeof message === 'string' || message instanceof Buffer) {
        message = JSON.parse(message)
      }
      if (message && message.type && !closed) {
        switch (message.type) {
          case 'subscribe':
            (message.topics || []).forEach(topicName => {
              if (typeof topicName === 'string') {
                const topic = map.setIfUndefined(topics, topicName, () => new Set())
                topic.add(conn)
                subscribedTopics.add(topicName)
              }
            })
            break
          case 'unsubscribe':
            (message.topics || []).forEach(topicName => {
              const subs = topics.get(topicName)
              if (subs) {
                subs.delete(conn)
              }
            })
            break
          case 'publish':
            if (message.topic) {
              const receivers = topics.get(message.topic)
              if (receivers) {
                message.clients = receivers.size
                receivers.forEach(receiver => send(receiver, message))
              }
            }
            break
          case 'ping':
            send(conn, { type: 'pong' })
            break
        }
      }
    } catch (e) {
      console.error('Message parsing error:', e)
      conn.close()
    }
  })
  
  conn.on('error', (err) => {
    console.error('WebSocket error:', err)
  })
}

wss.on('connection', onconnection)

server.on('upgrade', (request, socket, head) => {
  const handleAuth = ws => {
    wss.emit('connection', ws, request)
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

server.listen(port, '0.0.0.0')

console.log(`Signaling server running on port ${port}`)