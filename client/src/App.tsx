import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CollaborativeEditor from './components/CollaborativeEditor';
import OnlineUsers from './components/OnlineUsers';

function App() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
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
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center">
      <header className="w-full py-6 px-4 bg-gray-800 shadow-md flex justify-between items-center">
        <h1 className="text-3xl font-bold">Collaborative Editor</h1>
        <OnlineUsers users={onlineUsers} />
      </header>

      <main className="flex-grow w-full max-w-4xl p-4 flex flex-col">
        <CollaborativeEditor
          roomName="my-room"
          userId={userId}
          userName={userName}
          setOnlineUsers={setOnlineUsers}
        />
      </main>
    </div>
  );
}

export default App;
