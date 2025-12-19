import React, { useState, useEffect, useCallback, useRef } from "react";
import { SOUND_PACKS, THEMES } from "../../constants.js";
import { OverviewTab } from "./OverviewTab.jsx";
import { ChatTab } from "./ChatTab.jsx";
import { UsersTab } from "./UsersTab.jsx";
import { StatsTab } from "./StatsTab.jsx";
import { ThemesTab } from "./ThemesTab.jsx";
import { SystemTab } from "./SystemTab.jsx";

const AdminConsole = ({ onClose, sessionToken }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Chat Management
  const [chatHistory, setChatHistory] = useState([]);
  const [chatFilter, setChatFilter] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);

  // User Management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFilter, setUserFilter] = useState("");
  const [bannedUsers, setBannedUsers] = useState(new Set());
  const [mutedUsers, setMutedUsers] = useState(new Set());

  // Stats Management
  const [statUser, setStatUser] = useState("");
  const [statValues, setStatValues] = useState({
    totalGames: 0,
    totalWins: 0,
    easyWins: 0,
    mediumWins: 0,
    hardWins: 0,
    perfectWins: 0,
    fastWins: 0,
  });

  // Theme Management
  const [themes, setThemes] = useState([]);
  const [soundPacks, setSoundPacks] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedSoundPack, setSelectedSoundPack] = useState(null);
  const [editingTheme, setEditingTheme] = useState(null);
  const [editingSoundPack, setEditingSoundPack] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // System Stats
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalGames: 0,
    totalChatMessages: 0,
    activeUsers24h: 0,
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
      if (!window.CONFIG?.GAS_URL) {
        console.error("❌ GAS_URL not configured");
        setMessage({
          type: "error",
          text: "Backend URL not configured in config.local.js",
        });
        return;
      }
      const response = await fetch(
        `${window.CONFIG?.GAS_URL}?action=getAdminStats&token=${sessionToken}`
      );
      const data = await response.json();
      if (data.success) {
        setSystemStats(data.stats);
      } else {
        console.error("Failed to load stats:", data.error);
        setMessage({
          type: "error",
          text: data.error || "Failed to load stats",
        });
      }
    } catch (err) {
      console.error("Failed to load system stats:", err);
      setMessage({ type: "error", text: `Connection error: ${err.message}` });
    }
  };

  const loadChatHistory = async () => {
    try {
      if (!window.CONFIG?.GAS_URL) {
        return; // Already shown error in loadSystemStats
      }
      const response = await fetch(
        `${window.CONFIG?.GAS_URL}?action=getAdminChatHistory&token=${sessionToken}`
      );
      const data = await response.json();
      if (data.success) {
        setChatHistory(data.messages || []);
      } else {
        console.error("Failed to load chat:", data.error);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  const loadUsers = async () => {
    try {
      if (!window.CONFIG?.GAS_URL) {
        return; // Already shown error in loadSystemStats
      }
      const response = await fetch(
        `${window.CONFIG?.GAS_URL}?action=getAdminUsers&token=${sessionToken}`
      );
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
        setBannedUsers(new Set(data.bannedUsers || []));
        setMutedUsers(new Set(data.mutedUsers || []));
      } else {
        console.error("Failed to load users:", data.error);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const loadThemes = async () => {
    // Load available themes from THEMES constant
    setThemes(Object.entries(THEMES).map(([id, theme]) => ({ id, ...theme })));
    setSoundPacks(
      Object.entries(SOUND_PACKS).map(([id, pack]) => ({ id, ...pack }))
    );
  };

  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    if (!confirm(`Delete ${selectedMessages.length} message(s)?`)) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${
          window.CONFIG?.GAS_URL
        }?action=deleteMessages&token=${sessionToken}&messageIds=${selectedMessages.join(
          ","
        )}`
      );
      const data = await response.json();
      if (data.success) {
        setMessage({ type: "success", text: "Messages deleted successfully" });
        setSelectedMessages([]);
        loadChatHistory();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to delete messages",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error deleting messages" });
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (username) => {
    if (
      !confirm(`Ban user ${username}? They will be immediately disconnected.`)
    )
      return;

    setLoading(true);
    try {
      const response = await fetch(
        `${window.CONFIG?.GAS_URL}?action=banUser&token=${sessionToken}&username=${username}`
      );
      const data = await response.json();
      if (data.success) {
        // Show notification UI
        const notif = document.createElement("div");
        notif.className =
          "fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-pulse";
        notif.textContent = `🚫 User "${username}" has been banned and will be unable to send messages.`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 4000);

        setMessage({
          type: "success",
          text: `✅ User "${username}" banned successfully`,
        });
        loadUsers();
        loadChatHistory();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to ban user" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error banning user" });
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async (username) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${window.CONFIG?.GAS_URL}?action=unbanUser&token=${sessionToken}&username=${username}`
      );
      const data = await response.json();
      if (data.success) {
        // Show notification UI
        const notif = document.createElement("div");
        notif.className =
          "fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-pulse";
        notif.textContent = `✅ User "${username}" has been unbanned and can now send messages.`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 4000);

        setMessage({
          type: "success",
          text: `✅ User "${username}" unbanned successfully`,
        });
        loadUsers();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to unban user",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error unbanning user" });
    } finally {
      setLoading(false);
    }
  };

  const handleMuteUser = async (username, duration = 3600000) => {
    const durationMinutes = Math.round(duration / 60000);
    setLoading(true);
    try {
      const response = await fetch(
        `${window.CONFIG?.GAS_URL}?action=muteUser&token=${sessionToken}&username=${username}&duration=${duration}`
      );
      const data = await response.json();
      if (data.success) {
        // Show notification UI
        const notif = document.createElement("div");
        notif.className =
          "fixed bottom-4 right-4 bg-yellow-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-pulse";
        notif.textContent = `🔇 User "${username}" muted for ${durationMinutes} minute(s).`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 4000);

        setMessage({
          type: "success",
          text: `✅ User "${username}" muted for ${durationMinutes} minute(s)`,
        });
        loadUsers();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to mute user",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error muting user" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStats = async () => {
    if (!statUser) {
      setMessage({ type: "error", text: "Please enter a username" });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: "updateUserStats",
        token: sessionToken,
        username: statUser,
        ...statValues,
      });
      const response = await fetch(`${window.CONFIG?.GAS_URL}?${params}`);
      const data = await response.json();
      if (data.success) {
        setMessage({ type: "success", text: `Stats updated for ${statUser}` });
        loadUsers();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update stats",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error updating stats" });
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-xs text-red-200 mt-1">
                Secure Administrative Panel
              </p>
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
          <div
            className={`p-3 m-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-900/50 border border-green-700 text-green-200"
                : "bg-red-900/50 border border-red-700 text-red-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="text-xl">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-700 overflow-x-auto">
          {[
            { id: "overview", label: "📊 Overview", icon: "📊" },
            { id: "chat", label: "💬 Chat Management", icon: "💬" },
            { id: "users", label: "👥 User Management", icon: "👥" },
            { id: "stats", label: "📈 Stats Editor", icon: "📈" },
            { id: "themes", label: "🎨 Theme Manager", icon: "🎨" },
            { id: "system", label: "⚙️ System", icon: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTab
              systemStats={systemStats}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "chat" && (
            <ChatTab
              chatHistory={chatHistory}
              loadChatHistory={loadChatHistory}
              chatFilter={chatFilter}
              setChatFilter={setChatFilter}
              selectedMessages={selectedMessages}
              setSelectedMessages={setSelectedMessages}
              handleDeleteMessages={handleDeleteMessages}
              handleBanUser={handleBanUser}
              bannedUsers={bannedUsers}
              loading={loading}
            />
          )}

          {activeTab === "users" && (
            <UsersTab
              users={users}
              loadUsers={loadUsers}
              userFilter={userFilter}
              setUserFilter={setUserFilter}
              bannedUsers={bannedUsers}
              mutedUsers={mutedUsers}
              handleBanUser={handleBanUser}
              handleUnbanUser={handleUnbanUser}
              handleMuteUser={handleMuteUser}
              setStatUser={setStatUser}
              setStatValues={setStatValues}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "stats" && (
            <StatsTab
              statUser={statUser}
              setStatUser={setStatUser}
              statValues={statValues}
              setStatValues={setStatValues}
              handleUpdateUserStats={handleUpdateUserStats}
              loading={loading}
            />
          )}

          {activeTab === "themes" && (
            <ThemesTab
              themes={themes}
              setThemes={setThemes}
              soundPacks={soundPacks}
              setSoundPacks={setSoundPacks}
              editingTheme={editingTheme}
              setEditingTheme={setEditingTheme}
              editingSoundPack={editingSoundPack}
              setEditingSoundPack={setEditingSoundPack}
              setMessage={setMessage}
            />
          )}

          {activeTab === "system" && (
            <SystemTab
              sessionToken={sessionToken}
              loadSystemStats={loadSystemStats}
              loadChatHistory={loadChatHistory}
              loadUsers={loadUsers}
              setMessage={setMessage}
              loading={loading}
              setLoading={setLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export { AdminConsole };
