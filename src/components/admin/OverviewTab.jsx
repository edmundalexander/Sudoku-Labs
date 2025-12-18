const OverviewTab = ({ systemStats, setActiveTab }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="text-3xl font-bold text-blue-400">
            {systemStats.totalUsers}
          </div>
          <div className="text-sm text-gray-400 mt-1">Total Users</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="text-3xl font-bold text-green-400">
            {systemStats.totalGames}
          </div>
          <div className="text-sm text-gray-400 mt-1">Total Games</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="text-3xl font-bold text-purple-400">
            {systemStats.totalChatMessages}
          </div>
          <div className="text-sm text-gray-400 mt-1">Chat Messages</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="text-3xl font-bold text-orange-400">
            {systemStats.activeUsers24h}
          </div>
          <div className="text-sm text-gray-400 mt-1">Active (24h)</div>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-bold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveTab("chat")}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left"
          >
            <div className="font-bold">Moderate Chat</div>
            <div className="text-xs text-blue-200">
              Review and manage messages
            </div>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-left"
          >
            <div className="font-bold">Manage Users</div>
            <div className="text-xs text-green-200">
              Ban, mute, or edit users
            </div>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left"
          >
            <div className="font-bold">Edit Stats</div>
            <div className="text-xs text-purple-200">
              Modify player statistics
            </div>
          </button>
          <button
            onClick={() => setActiveTab("themes")}
            className="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-left"
          >
            <div className="font-bold">Manage Themes</div>
            <div className="text-xs text-orange-200">
              Upload and configure assets
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

window.OverviewTab = OverviewTab;
