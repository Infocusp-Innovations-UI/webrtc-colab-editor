import React from 'react';
import UserAvatar from './UserAvatar';

interface OnlineUsersProps {
  users: { userId: string; name: string }[];
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ users }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">Users Online ({users.length})</h2>
      <div className="flex flex-col space-y-2">
        {users.map((user) => (
          <div key={user.userId} className="flex items-center space-x-2">
            <UserAvatar userId={user.userId} />
            <span>{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;
