import React from 'react';
import UserAvatar from './UserAvatar';

interface OnlineUsersProps {
  users: string[];
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ users }) => {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-4">
        {users.map((userId) => (
          <UserAvatar key={userId} userId={userId} />
        ))}
      </div>
      <span className="ml-4 text-white">{users.length} user{users.length !== 1 ? 's' : ''} online</span>
    </div>
  );
};

export default OnlineUsers;
