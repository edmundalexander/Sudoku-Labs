import React from "react";

export const UsersTab = ({
  users,
  loadUsers,
  userFilter,
  setUserFilter,
  bannedUsers,
  mutedUsers,
  handleBanUser,
  handleUnbanUser,
  handleMuteUser,
  setStatUser,
  setStatValues,
  setActiveTab,
}) => {
  const filteredUsers = users.filter(
    (user) =>
      !userFilter ||
      user.username.toLowerCase().includes(userFilter.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <button
          onClick={loadUsers}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
        />
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-900 sticky top-0">
              <tr>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Games</th>
                <th className="p-3 text-left">Wins</th>
                <th className="p-3 text-left">Win Rate</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                const winRate =
                  user.totalGames > 0
                    ? Math.round((user.totalWins / user.totalGames) * 100)
                    : 0;
                const isBanned = bannedUsers.has(user.username);
                const isMuted = mutedUsers.has(user.username);

                return (
                  <tr
                    key={user.username || `user-${idx}`}
                    className={`border-t border-gray-700 ${
                      idx % 2 === 0 ? "bg-gray-800" : "bg-gray-850"
                    }`}
                  >
                    <td className="p-3 font-medium">{user.username}</td>
                    <td className="p-3 text-sm">{user.totalGames || 0}</td>
                    <td className="p-3 text-sm">{user.totalWins || 0}</td>
                    <td className="p-3 text-sm">{winRate}%</td>
                    <td className="p-3">
                      {isBanned && (
                        <span className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded mr-1">
                          BANNED
                        </span>
                      )}
                      {isMuted && (
                        <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 text-xs rounded">
                          MUTED
                        </span>
                      )}
                      {!isBanned && !isMuted && (
                        <span className="text-green-400 text-sm">✓ Active</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {!isBanned ? (
                          <button
                            onClick={() => handleBanUser(user.username)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                          >
                            Ban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnbanUser(user.username)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                          >
                            Unban
                          </button>
                        )}
                        <button
                          onClick={() => handleMuteUser(user.username, 3600000)}
                          disabled={isMuted}
                          className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded text-xs"
                        >
                          Mute 1h
                        </button>
                        <button
                          onClick={() => {
                            setStatUser(user.username);
                            setStatValues({
                              totalGames: user.totalGames || 0,
                              totalWins: user.totalWins || 0,
                              easyWins: user.easyWins || 0,
                              mediumWins: user.mediumWins || 0,
                              hardWins: user.hardWins || 0,
                              perfectWins: user.perfectWins || 0,
                              fastWins: user.fastWins || 0,
                            });
                            setActiveTab("stats");
                          }}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                        >
                          Edit Stats
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
