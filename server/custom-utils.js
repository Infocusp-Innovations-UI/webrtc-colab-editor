import { setupWSConnection, docs } from 'y-websocket/bin/utils';
import { URL } from 'url';

export const customSetupWSConnection = (conn, req, { wss }) => {
  conn.binaryType = 'arraybuffer';
  const url = new URL(req.url, `ws://${req.headers.host}`);
  const docName = url.pathname.slice(1);
  const doc = docs.get(docName);

  if (doc) {
    const awareness = doc.awareness;
    const userId = url.searchParams.get('userId');

    if (userId) {
      // Find and close the old connection
      for (const client of wss.clients) {
        if (client !== conn && client.docName === docName) {
          const awarenessStates = client.awarenessStates || [];
          const hasMatchingUser = awarenessStates.some(state => state.user?.userId === userId);
          if (hasMatchingUser) {
            client.close();
            break;
          }
        }
      }
    }
  }

  setupWSConnection(conn, req);

  // Store awareness states on the client object
  conn.awarenessStates = [];
  const awareness = docs.get(docName)?.awareness;
  if (awareness) {
    awareness.on('change', ({ added, updated, removed }) => {
      conn.awarenessStates = Array.from(awareness.getStates().values());
    });
  }
  conn.docName = docName;
};
