import React from 'react';
import { User } from '../utils/user';
import { AvatarCircles } from './ui/avatar-circles';

interface RemoteUsersProps {
  users: User[];
}

const RemoteUsers: React.FC<RemoteUsersProps> = ({ users }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">Users Online ({users.length})</h2>      
      <AvatarCircles users={users} />
    </div>
  );
};

export default RemoteUsers;
