import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CollaborativeEditor from './components/CollaborativeEditor';
import * as Y from 'yjs';
import OnlineUsers from './components/OnlineUsers';
import VersionHistory from './components/VersionHistory';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [onlineUsers, setOnlineUsers] = useState<{ userId: string; name: string }[]>([]);
  const ydocRef = useRef<Y.Doc | null>(null);
  const [versionHistory, setVersionHistory] = useState<{ timestamp: Date; content: Uint8Array }[]>([]);

  const handleSaveVersion = () => {
    if (ydocRef.current) {
      const snapshot = Y.snapshot(ydocRef.current);
      setVersionHistory(prevHistory => [
        ...prevHistory,
        { timestamp: new Date(), content: Y.encodeSnapshot(snapshot) }
      ]);
    }
  };

  const handleRestoreVersion = (snapshot: Uint8Array) => {
    if (ydocRef.current) {
      const tempDoc = new Y.Doc();
      Y.applyUpdate(tempDoc, Y.encodeStateAsUpdateFromSnapshot(Y.decodeSnapshot(snapshot)));
      const oldContent = tempDoc.getText('codemirror').toString();
      const ytext = ydocRef.current.getText('codemirror');
      ydocRef.current.transact(() => {
        ytext.delete(0, ytext.length);
        ytext.insert(0, oldContent);
      });
    }
  };

  const [{ userId, userName }] = useState(() => {
    let userId = sessionStorage.getItem('userId');
    if (!userId) {
      userId = uuidv4();
      sessionStorage.setItem('userId', userId);
    }

    const storedUserName = sessionStorage.getItem('userName');
    if (storedUserName) {
      return { userId, userName: storedUserName };
    }
    const newUserName = `User-${Math.floor(Math.random() * 1000)}`;
    sessionStorage.setItem('userName', newUserName);
    return { userId, userName: newUserName };
  });

  return (
    <div className="bg-white min-h-screen text-gray-800 flex flex-col items-center">
      <header className="w-full py-6 px-4 bg-gray-100 shadow-md flex justify-between items-center">
        <h1 className="text-3xl font-bold">Collaborative Editor</h1>
        <button
          onClick={handleSaveVersion}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Version
        </button>
      </header>

      <main className="flex-grow w-full max-w-4xl p-4 flex flex-row">
        <CollaborativeEditor
          roomName="my-room"
          userId={userId}
          userName={userName}
          setOnlineUsers={setOnlineUsers}
          ydocRef={ydocRef}
        />
        <div className="w-64 pl-4">
          <OnlineUsers users={onlineUsers} />
          <div className="mt-4">
            <VersionHistory versionHistory={versionHistory} onRestore={handleRestoreVersion} />
          </div>
        </div>
      </main>
      <ToastContainer aria-label="Notifications" />
    </div>
  );
}

export default App;
