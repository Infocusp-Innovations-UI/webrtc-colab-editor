import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CollaborativeEditor from './components/CollaborativeEditor';
import { Toaster } from './components/ui/sonner';
import { ROOM_NAME } from './constants/constants';
import { User } from './utils/user';
import { getColorFromUserId } from './utils/color';
import { AvatarCircles } from './components/ui/avatar-circles';
import { Separator } from '@radix-ui/react-separator';

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
        <div className="flex items-center space-x-4">
          <AvatarCircles users={remoteUsers} />
          {
            remoteUsers.length > 0 &&
            <Separator orientation="vertical" className="h-14 w-px bg-gray-400" />
          }
          <AvatarCircles users={[user]} />
        </div>
      </header>

      <main className="flex-grow w-full p-4 flex flex-row">
        <CollaborativeEditor
          roomName={ROOM_NAME}
          localUser={user}
          setRemoteUsers={setRemoteUsers}
        />
      </main>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

export default App;
