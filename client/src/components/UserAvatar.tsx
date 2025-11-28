import React from 'react';

interface UserAvatarProps {
  userId: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ userId }) => {
  // Generate a color from the userId
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const intToRGB = (i: number) => {
    const c = (i & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();
    return "00000".substring(0, 6 - c.length) + c;
  };

  const userColor = `#${intToRGB(hashCode(userId))}`;
  const initial = userId.charAt(5).toUpperCase();

  return (
    <div
      className="group relative inline-block"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
        style={{ backgroundColor: userColor }}
      >
        {initial}
      </div>
      <div className="absolute top-full mt-2 w-max px-2 py-1 bg-white text-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
        {userId}
      </div>
    </div>
  );
};

export default UserAvatar;
