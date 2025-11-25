import React from 'react';

interface VersionHistoryProps {
  versionHistory: { timestamp: Date; content: Uint8Array }[];
  onRestore: (snapshot: Uint8Array) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ versionHistory, onRestore }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">Version History ({versionHistory.length})</h2>
      <div className="flex flex-col space-y-2">
        {versionHistory.map((version, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span>{version.timestamp.toLocaleString()}</span>
            <button
              onClick={() => onRestore(version.content)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs"
            >
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionHistory;
