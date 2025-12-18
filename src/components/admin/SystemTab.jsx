const SystemTab = ({
  sessionToken,
  loadSystemStats,
  loadChatHistory,
  loadUsers,
  setMessage,
  loading,
  setLoading,
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">System Tools</h2>

      <div className="space-y-4">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold mb-3">Database Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={async () => {
                if (!CONFIG.GAS_URL) {
                  setMessage({
                    type: "error",
                    text: "Backend URL not configured",
                  });
                  return;
                }
                if (
                  confirm("Clear all chat messages? This cannot be undone!")
                ) {
                  setLoading(true);
                  try {
                    const response = await fetch(
                      `${CONFIG.GAS_URL}?action=clearAllChat&token=${sessionToken}`
                    );
                    const data = await response.json();
                    if (data.success) {
                      setMessage({
                        type: "success",
                        text: "Chat cleared successfully",
                      });
                      loadChatHistory();
                    } else {
                      setMessage({
                        type: "error",
                        text: data.error || "Failed to clear chat",
                      });
                    }
                  } catch (err) {
                    setMessage({
                      type: "error",
                      text: `Error: ${err.message}`,
                    });
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              disabled={loading}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-left"
            >
              <div className="font-bold">Clear All Chat</div>
              <div className="text-xs text-red-200">⚠️ Permanent action</div>
            </button>
            <button
              onClick={() => {
                loadSystemStats();
                loadChatHistory();
                loadUsers();
                setMessage({ type: "success", text: "Data refreshed" });
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
            <div className="text-yellow-300 mt-2">
              ⚠️ Session expires in 30 minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.SystemTab = SystemTab;
