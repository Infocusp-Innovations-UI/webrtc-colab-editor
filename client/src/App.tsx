import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CollaborativeEditor from './components/CollaborativeEditor';
import RemoteUsers from './components/RemoteUsers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ROOM_NAME } from './constants/constants';
import { User } from './utils/user';
import { getColorFromUserId } from './utils/color';

function App() {
  const [remoteUsers, setRemoteUsers] = useState<User[]>([]);

  const [user] = useState<User>(() => {
    const id = sessionStorage.getItem('userId') ?? uuidv4();
    const name = sessionStorage.getItem('userName') ?? `User-${Math.floor(Math.random() * 1000)}`;
    const color = sessionStorage.getItem('userColor') ?? getColorFromUserId(id);
    sessionStorage.setItem('userId', id);
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userColor', color);

    return { id, name, color };
  });

  return (
    <div className="bg-white min-h-screen text-gray-800 flex flex-col items-center">
      <header className="w-full py-6 px-4 bg-gray-100 shadow-md flex justify-between items-center">
        <h1 className="text-3xl font-bold">Collaborative Editor</h1>
      </header>

      <main className="flex-grow w-full max-w-4xl p-4 flex flex-row">
        <CollaborativeEditor
          roomName={ROOM_NAME}
          localUser={user}
          setRemoteUsers={setRemoteUsers}
        />
        <div className="w-64 pl-4">
          <RemoteUsers users={remoteUsers} />
        </div>
      </main>
      <ToastContainer aria-label="Notifications" />
    </div>
  );
}

export default App;
