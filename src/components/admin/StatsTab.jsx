const StatsTab = ({
  statUser,
  setStatUser,
  statValues,
  setStatValues,
  handleUpdateUserStats,
  loading,
}) => {
  return (
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
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  setStatValues({
                    ...statValues,
                    [key]: parseInt(e.target.value) || 0,
                  })
                }
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
          {loading ? "Updating..." : "Update Stats"}
        </button>
      </div>
    </div>
  );
};

window.StatsTab = StatsTab;
