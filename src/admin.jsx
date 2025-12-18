/**
 * Sudoku Logic Lab - Admin Console
 * 
 * Secure admin panel for managing users, chat, and game assets.
 * Access via browser console: sudokuAdmin.login()
 * 
 * @version 1.0.0
 */

const { useState, useEffect, useCallback, useRef } = React;

// ============================================================================
// ADMIN CONSOLE COMPONENT
// ============================================================================

const AdminConsole = ({ onClose, sessionToken }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Chat Management
  const [chatHistory, setChatHistory] = useState([]);
  const [chatFilter, setChatFilter] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  
  // User Management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFilter, setUserFilter] = useState('');
  const [bannedUsers, setBannedUsers] = useState(new Set());
  const [mutedUsers, setMutedUsers] = useState(new Set());
  
  // Stats Management
  const [statUser, setStatUser] = useState('');
  const [statValues, setStatValues] = useState({
    totalGames: 0,
    totalWins: 0,
    easyWins: 0,
    mediumWins: 0,
    hardWins: 0,
    perfectWins: 0,
    fastWins: 0
  });
  
  // Theme Management
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // System Stats
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalGames: 0,
    totalChatMessages: 0,
    activeUsers24h: 0
  });

  // Load data on mount
  useEffect(() => {
    loadSystemStats();
    loadChatHistory();
    loadUsers();
    loadThemes();
  }, []);

  const loadSystemStats = async () => {
    try {
      const response = await fetch(`${CONFIG.GAS_URL}?action=getAdminStats&token=${sessionToken}`);
      const data = await response.json();
      if (data.success) {
        setSystemStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load system stats:', err);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${CONFIG.GAS_URL}?action=getAdminChatHistory&token=${sessionToken}`);
      const data = await response.json();
      if (data.success) {
        setChatHistory(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${CONFIG.GAS_URL}?action=getAdminUsers&token=${sessionToken}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
        setBannedUsers(new Set(data.bannedUsers || []));
        setMutedUsers(new Set(data.mutedUsers || []));
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadThemes = async () => {
    // Load available themes from THEMES constant
    setThemes(Object.entries(THEMES).map(([id, theme]) => ({ id, ...theme })));
  };

  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    if (!confirm(`Delete ${selectedMessages.length} message(s)?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.GAS_URL}?action=deleteMessages&token=${sessionToken}&messageIds=${selectedMessages.join(',')}`);
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Messages deleted successfully' });
        setSelectedMessages([]);
        loadChatHistory();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete messages' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error deleting messages' });
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (username) => {
    if (!confirm(`Ban user ${username}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.GAS_URL}?action=banUser&token=${sessionToken}&username=${username}`);
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `User ${username} banned` });
        loadUsers();
        loadChatHistory();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to ban user' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error banning user' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async (username) => {
    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.GAS_URL}?action=unbanUser&token=${sessionToken}&username=${username}`);
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `User ${username} unbanned` });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to unban user' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error unbanning user' });
    } finally {
      setLoading(false);
    }
  };

  const handleMuteUser = async (username, duration = 3600000) => {
    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.GAS_URL}?action=muteUser&token=${sessionToken}&username=${username}&duration=${duration}`);
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `User ${username} muted for ${duration / 60000} minutes` });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to mute user' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error muting user' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStats = async () => {
    if (!statUser) {
      setMessage({ type: 'error', text: 'Please enter a username' });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'updateUserStats',
        token: sessionToken,
        username: statUser,
        ...statValues
      });
      const response = await fetch(`${CONFIG.GAS_URL}?${params}`);
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Stats updated for ${statUser}` });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update stats' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error updating stats' });
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = chatHistory.filter(msg => 
    !chatFilter || msg.sender.toLowerCase().includes(chatFilter.toLowerCase()) ||
    msg.text.toLowerCase().includes(chatFilter.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    !userFilter || user.username.toLowerCase().includes(userFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-gray-900 text-gray-100 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto border border-red-500/50">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-900 to-orange-900 p-4 border-b border-red-700 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🔐</span>
                <span>Admin Console</span>
              </h1>
              <p className="text-xs text-red-200 mt-1">Secure Administrative Panel</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-3 m-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 border border-green-700 text-green-200' : 'bg-red-900/50 border border-red-700 text-red-200'}`}>
            <div className="flex justify-between items-center">
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="text-xl">×</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-700 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'chat', label: '💬 Chat Management', icon: '💬' },
            { id: 'users', label: '👥 User Management', icon: '👥' },
            { id: 'stats', label: '📈 Stats Editor', icon: '📈' },
            { id: 'themes', label: '🎨 Theme Manager', icon: '🎨' },
            { id: 'system', label: '⚙️ System', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold mb-4">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="text-3xl font-bold text-blue-400">{systemStats.totalUsers}</div>
                  <div className="text-sm text-gray-400 mt-1">Total Users</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="text-3xl font-bold text-green-400">{systemStats.totalGames}</div>
                  <div className="text-sm text-gray-400 mt-1">Total Games</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="text-3xl font-bold text-purple-400">{systemStats.totalChatMessages}</div>
                  <div className="text-sm text-gray-400 mt-1">Chat Messages</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="text-3xl font-bold text-orange-400">{systemStats.activeUsers24h}</div>
                  <div className="text-sm text-gray-400 mt-1">Active (24h)</div>
                </div>
              </div>

              <div className="mt-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-bold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left"
                  >
                    <div className="font-bold">Moderate Chat</div>
                    <div className="text-xs text-blue-200">Review and manage messages</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-left"
                  >
                    <div className="font-bold">Manage Users</div>
                    <div className="text-xs text-green-200">Ban, mute, or edit users</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left"
                  >
                    <div className="font-bold">Edit Stats</div>
                    <div className="text-xs text-purple-200">Modify player statistics</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('themes')}
                    className="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-left"
                  >
                    <div className="font-bold">Manage Themes</div>
                    <div className="text-xs text-orange-200">Upload and configure assets</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
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
                                setSelectedMessages(filteredMessages.map(m => m.id));
                              } else {
                                setSelectedMessages([]);
                              }
                            }}
                            checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
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
                        <tr key={msg.id} className={`border-t border-gray-700 ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedMessages.includes(msg.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMessages([...selectedMessages, msg.id]);
                                } else {
                                  setSelectedMessages(selectedMessages.filter(id => id !== msg.id));
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
                              <span className="ml-2 px-2 py-0.5 bg-red-900/50 text-red-300 text-xs rounded">BANNED</span>
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
          )}

          {activeTab === 'users' && (
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
                        const winRate = user.totalGames > 0 ? Math.round((user.totalWins / user.totalGames) * 100) : 0;
                        const isBanned = bannedUsers.has(user.username);
                        const isMuted = mutedUsers.has(user.username);
                        
                        return (
                          <tr key={user.username} className={`border-t border-gray-700 ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`}>
                            <td className="p-3 font-medium">{user.username}</td>
                            <td className="p-3 text-sm">{user.totalGames || 0}</td>
                            <td className="p-3 text-sm">{user.totalWins || 0}</td>
                            <td className="p-3 text-sm">{winRate}%</td>
                            <td className="p-3">
                              {isBanned && <span className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded mr-1">BANNED</span>}
                              {isMuted && <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 text-xs rounded">MUTED</span>}
                              {!isBanned && !isMuted && <span className="text-green-400 text-sm">✓ Active</span>}
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
                                      fastWins: user.fastWins || 0
                                    });
                                    setActiveTab('stats');
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
          )}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Stats Editor</h2>
              
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-2xl">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={statUser}
                    onChange={(e) => setStatUser(e.target.value)}
                    placeholder="Enter username..."
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(statValues).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setStatValues({ ...statValues, [key]: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUpdateUserStats}
                  disabled={loading || !statUser}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium"
                >
                  {loading ? 'Updating...' : 'Update Stats'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'themes' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Theme Manager</h2>
              
              <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg mb-6">
                <p className="text-yellow-200 text-sm">
                  <strong>Note:</strong> Theme assets are currently defined in constants.js. 
                  To add custom assets, upload files to your hosting and update the theme configuration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map(theme => (
                  <div key={theme.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="text-lg font-bold mb-2">{theme.name}</div>
                    <div className="text-sm text-gray-400 mb-3">{theme.description || 'No description'}</div>
                    <div className="text-xs text-gray-500">
                      Locked: {theme.unlockCondition?.description || 'Default'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div>
              <h2 className="text-xl font-bold mb-4">System Tools</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-bold mb-3">Database Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        if (confirm('Clear all chat messages? This cannot be undone!')) {
                          fetch(`${CONFIG.GAS_URL}?action=clearAllChat&token=${sessionToken}`)
                            .then(r => r.json())
                            .then(data => {
                              if (data.success) {
                                setMessage({ type: 'success', text: 'Chat cleared' });
                                loadChatHistory();
                              }
                            });
                        }
                      }}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-left"
                    >
                      <div className="font-bold">Clear All Chat</div>
                      <div className="text-xs text-red-200">⚠️ Permanent action</div>
                    </button>
                    <button
                      onClick={() => {
                        loadSystemStats();
                        loadChatHistory();
                        loadUsers();
                        setMessage({ type: 'success', text: 'Data refreshed' });
                      }}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-left"
                    >
                      <div className="font-bold">Refresh All Data</div>
                      <div className="text-xs text-blue-200">Reload from server</div>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-bold mb-3">Session Info</h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>Token: {sessionToken.substring(0, 20)}...</div>
                    <div>Access Time: {new Date().toLocaleString()}</div>
                    <div className="text-yellow-300 mt-2">⚠️ Session expires in 30 minutes</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export to window for browser console access
window.AdminConsole = AdminConsole;
