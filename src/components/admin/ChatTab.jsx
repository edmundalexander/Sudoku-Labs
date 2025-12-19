import React from "react";

export const ChatTab = ({
  chatHistory,
  loadChatHistory,
  chatFilter,
  setChatFilter,
  selectedMessages,
  setSelectedMessages,
  handleDeleteMessages,
  handleBanUser,
  bannedUsers,
  loading,
}) => {
  const filteredMessages = chatHistory.filter(
    (msg) =>
      !chatFilter ||
      msg.sender.toLowerCase().includes(chatFilter.toLowerCase()) ||
      msg.text.toLowerCase().includes(chatFilter.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chat Management</h2>
        <button
          onClick={loadChatHistory}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by username or message..."
          value={chatFilter}
          onChange={(e) => setChatFilter(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
        />
      </div>

      {selectedMessages.length > 0 && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleDeleteMessages}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg"
          >
            🗑️ Delete Selected ({selectedMessages.length})
          </button>
          <button
            onClick={() => setSelectedMessages([])}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-900 sticky top-0">
              <tr>
                <th className="p-3 text-left w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMessages(filteredMessages.map((m) => m.id));
                      } else {
                        setSelectedMessages([]);
                      }
                    }}
                    checked={
                      selectedMessages.length === filteredMessages.length &&
                      filteredMessages.length > 0
                    }
                  />
                </th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((msg, idx) => (
                <tr
                  key={msg.id || `msg-${idx}`}
                  className={`border-t border-gray-700 ${
                    idx % 2 === 0 ? "bg-gray-800" : "bg-gray-850"
                  }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(msg.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMessages([...selectedMessages, msg.id]);
                        } else {
                          setSelectedMessages(
                            selectedMessages.filter((id) => id !== msg.id)
                          );
                        }
                      }}
                    />
                  </td>
                  <td className="p-3 text-sm text-gray-400">
                    {new Date(msg.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className="font-medium">{msg.sender}</span>
                    {bannedUsers.has(msg.sender) && (
                      <span className="ml-2 px-2 py-0.5 bg-red-900/50 text-red-300 text-xs rounded">
                        BANNED
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-sm">{msg.text}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleBanUser(msg.sender)}
                      disabled={bannedUsers.has(msg.sender)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-xs"
                    >
                      Ban User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
