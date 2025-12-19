import React from "react";
import { SOUND_PACKS, THEMES } from "../../constants.js";

const ThemesTab = ({
  themes,
  setThemes,
  soundPacks,
  setSoundPacks,
  editingTheme,
  setEditingTheme,
  editingSoundPack,
  setEditingSoundPack,
  setMessage,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Theme & Sound Pack Manager</h2>

      {/* Themes Section */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          🎨 Visual Themes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={`theme-${theme.id}`}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-lg font-bold">
                  {theme.icon} {theme.name}
                </div>
                <button
                  onClick={() =>
                    setEditingTheme(
                      editingTheme?.id === theme.id ? null : theme
                    )
                  }
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                >
                  {editingTheme?.id === theme.id ? "✕" : "✎"}
                </button>
              </div>
              <div className="text-sm text-gray-400 mb-2">
                {theme.description}
              </div>
              <div className="text-xs text-gray-500 mb-3">
                Status:{" "}
                {theme.unlocked ? "✅ Unlocked" : `🔒 ${theme.unlockCriteria}`}
              </div>

              {editingTheme?.id === theme.id && (
                <div className="bg-gray-700/50 p-3 rounded mt-3 space-y-2">
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editingTheme.name || ""}
                      onChange={(e) =>
                        setEditingTheme({
                          ...editingTheme,
                          name: e.target.value,
                        })
                      }
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingTheme.description || ""}
                      onChange={(e) =>
                        setEditingTheme({
                          ...editingTheme,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm h-16"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Unlock Criteria
                    </label>
                    <input
                      type="text"
                      value={editingTheme.unlockCriteria || ""}
                      onChange={(e) =>
                        setEditingTheme({
                          ...editingTheme,
                          unlockCriteria: e.target.value,
                        })
                      }
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={editingTheme.unlocked || false}
                        onChange={(e) =>
                          setEditingTheme({
                            ...editingTheme,
                            unlocked: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <span>Unlocked by Default</span>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        const updatedThemes = themes.map((t) =>
                          t.id === theme.id ? editingTheme : t
                        );
                        setThemes(updatedThemes);
                        setMessage({
                          type: "success",
                          text: `Theme "${editingTheme.name}" updated`,
                        });
                        setEditingTheme(null);
                      }}
                      className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-bold"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingTheme(null)}
                      className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sound Packs Section */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          🎵 Sound Packs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {soundPacks.map((pack) => (
            <div
              key={`pack-${pack.id}`}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-green-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-lg font-bold">
                  {pack.icon} {pack.name}
                </div>
                <button
                  onClick={() =>
                    setEditingSoundPack(
                      editingSoundPack?.id === pack.id ? null : pack
                    )
                  }
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                >
                  {editingSoundPack?.id === pack.id ? "✕" : "✎"}
                </button>
              </div>
              <div className="text-sm text-gray-400 mb-2">
                {pack.description}
              </div>
              <div className="text-xs text-gray-500 mb-3">
                Status:{" "}
                {pack.unlocked ? "✅ Unlocked" : `🔒 ${pack.unlockCriteria}`}
              </div>

              {editingSoundPack?.id === pack.id && (
                <div className="bg-gray-700/50 p-3 rounded mt-3 space-y-2">
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editingSoundPack.name || ""}
                      onChange={(e) =>
                        setEditingSoundPack({
                          ...editingSoundPack,
                          name: e.target.value,
                        })
                      }
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingSoundPack.description || ""}
                      onChange={(e) =>
                        setEditingSoundPack({
                          ...editingSoundPack,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm h-16"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Unlock Criteria
                    </label>
                    <input
                      type="text"
                      value={editingSoundPack.unlockCriteria || ""}
                      onChange={(e) =>
                        setEditingSoundPack({
                          ...editingSoundPack,
                          unlockCriteria: e.target.value,
                        })
                      }
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={editingSoundPack.unlocked || false}
                        onChange={(e) =>
                          setEditingSoundPack({
                            ...editingSoundPack,
                            unlocked: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <span>Unlocked by Default</span>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        const updatedPacks = soundPacks.map((p) =>
                          p.id === pack.id ? editingSoundPack : p
                        );
                        setSoundPacks(updatedPacks);
                        setMessage({
                          type: "success",
                          text: `Sound Pack "${editingSoundPack.name}" updated`,
                        });
                        setEditingSoundPack(null);
                      }}
                      className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-bold"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingSoundPack(null)}
                      className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-900/30 border border-blue-700 p-4 rounded-lg">
        <p className="text-blue-200 text-sm">
          <strong>ℹ️ Note:</strong> Changes made here only affect the admin
          panel display. To permanently update defaults, export these changes
          and update src/constants.js THEMES and SOUND_PACKS objects.
        </p>
      </div>
    </div>
  );
};

export { ThemesTab };
