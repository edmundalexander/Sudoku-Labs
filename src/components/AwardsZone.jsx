import React, { useState, useEffect, useMemo } from "react";
import { SOUND_PACKS, THEMES, getThemeAssetSet } from "../lib/constants.js";
import { SoundManager } from "../lib/sound.js";
import { StorageService } from "../lib/services.js";
import { Icons } from "./Icons.jsx";

const AwardsZone = ({
  soundEnabled,
  onClose,
  activeThemeId,
  unlockedThemes,
  onSelectTheme,
  activePackId,
  unlockedPacks,
  onSelectPack,
}) => {
  const [stats, setStats] = useState(StorageService.getGameStats());

  // Compute current asset set for the preview
  const currentAssetSet = useMemo(() => {
    if (typeof getThemeAssetSet === "function") {
      return getThemeAssetSet(activeThemeId, activePackId);
    }
    const theme = THEMES[activeThemeId] || THEMES.default;
    return {
      name: theme.name,
      description: theme.description,
      background: theme.background,
      texture: { pattern: "none", opacity: 0, name: "None" },
      decor: [],
    };
  }, [activeThemeId, activePackId]);

  // Refresh stats from StorageService when component mounts
  useEffect(() => {
    const currentStats = StorageService.getGameStats();
    setStats(currentStats);
  }, []);

  const isThemeUnlocked = (themeId) => unlockedThemes.includes(themeId);
  const isPackUnlocked = (packId) =>
    unlockedPacks.includes(packId) || SOUND_PACKS[packId]?.unlocked;

  const getThemeProgress = (themeId) => {
    if (
      !THEMES[themeId] ||
      THEMES[themeId].unlocked ||
      isThemeUnlocked(themeId)
    )
      return null;
    switch (themeId) {
      case "ocean":
        return `${Math.min(stats.totalWins, 5)}/5 wins`;
      case "forest":
        return `${Math.min(stats.totalWins, 10)}/10 wins`;
      case "sunset":
        return stats.hardWins >= 1
          ? "Unlocked!"
          : `${stats.hardWins}/1 Hard win`;
      case "midnight":
        return stats.perfectWins >= 1
          ? "Unlocked!"
          : `${stats.perfectWins}/1 perfect win`;
      case "sakura":
        return `${Math.min(stats.easyWins, 3)}/3 Easy wins`;
      case "volcano":
        return `${Math.min(stats.mediumWins, 3)}/3 Medium wins`;
      case "arctic":
        return stats.fastWins >= 1
          ? "Unlocked!"
          : `${stats.fastWins}/1 fast win`;
      default:
        return null;
    }
  };

  const getPackProgress = (packId) => {
    switch (packId) {
      case "funfair":
        return `${Math.min(stats.totalWins, 3)}/3 wins`;
      case "retro":
        return `${Math.min(stats.easyWins, 3)}/3 Easy wins`;
      case "space":
        return stats.hardWins >= 1
          ? "Unlocked!"
          : `${stats.hardWins}/1 Hard win`;
      case "nature":
        return `${Math.min(stats.mediumWins, 3)}/3 Medium wins`;
      case "crystal":
        return stats.perfectWins >= 1
          ? "Unlocked!"
          : `${stats.perfectWins}/1 perfect win`;
      case "minimal":
        return stats.fastWins >= 1
          ? "Unlocked!"
          : `${stats.fastWins}/1 win ≤3min`;
      default:
        return null;
    }
  };

  const handleThemeSelect = (themeId) => {
    if (!isThemeUnlocked(themeId)) return;
    if (soundEnabled) SoundManager.play("uiTap");
    onSelectTheme(themeId);
    StorageService.saveActiveTheme(themeId);
  };

  const handlePackSelect = (packId) => {
    if (!isPackUnlocked(packId)) return;
    if (soundEnabled) {
      SoundManager.setPack(packId);
      SoundManager.play("uiTap");
    }
    onSelectPack(packId);
    StorageService.saveActiveSoundPack(packId);
  };

  // Render the Mix & Match tab showing current combination
  const renderMixMatch = () => {
    const activeVisualTheme = THEMES[activeThemeId] || THEMES.default;
    const activeAudioTheme = SOUND_PACKS[activePackId] || SOUND_PACKS.classic;

    return (
      <div className="space-y-4">
        {/* Current Combination Preview */}
        <div
          className={`p-4 rounded-xl ${activeVisualTheme.background} border-2 border-gray-300 dark:border-gray-600 relative overflow-hidden`}
        >
          {/* SVG Background Pattern */}
          {currentAssetSet.svgBackground && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: currentAssetSet.svgBackground,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.5,
              }}
            />
          )}

          {/* Texture overlay visualization */}
          {currentAssetSet.texture.pattern !== "none" && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity: currentAssetSet.texture.opacity,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23666'/%3E%3C/svg%3E")`,
              }}
            />
          )}

          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-4xl">{activeVisualTheme.icon}</span>
              <span className="text-2xl text-gray-400">+</span>
              <span className="text-4xl">{activeAudioTheme.icon}</span>
            </div>

            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
              {currentAssetSet.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {currentAssetSet.description}
            </p>

            {/* Texture badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-black/30 rounded-full text-xs font-medium">
              <span className="text-gray-600 dark:text-gray-300">
                Board Texture:
              </span>
              <span className="text-gray-800 dark:text-white font-semibold">
                {currentAssetSet.texture.name}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Selection Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Visual Theme Quick Select */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              <Icons.Palette /> Visual Theme
            </h4>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.values(THEMES).map((theme) => {
                const unlocked = isThemeUnlocked(theme.id);
                const isActive = theme.id === activeThemeId;
                const progress = getThemeProgress(theme.id);
                return (
                  <div key={theme.id} className="relative">
                    <button
                      onClick={() => handleThemeSelect(theme.id)}
                      disabled={!unlocked}
                      className={`w-full p-2 rounded-lg text-xl transition-all ${
                        isActive
                          ? "bg-blue-500 ring-2 ring-blue-300"
                          : unlocked
                          ? "bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500"
                          : "opacity-40 cursor-not-allowed bg-gray-200 dark:bg-gray-800"
                      }`}
                      title={
                        unlocked ? theme.name : `🔒 ${theme.unlockCriteria}`
                      }
                    >
                      {theme.icon}
                    </button>
                    {!unlocked && progress && (
                      <div className="absolute -bottom-1 left-0 right-0 text-[8px] text-center bg-red-500 text-white rounded-b px-0.5 py-0.5 font-bold">
                        {progress}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio Theme Quick Select */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              <Icons.Music /> Audio Theme
            </h4>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.values(SOUND_PACKS).map((pack) => {
                const unlocked = isPackUnlocked(pack.id);
                const isActive = pack.id === activePackId;
                const progress = getPackProgress(pack.id);
                return (
                  <div key={pack.id} className="relative">
                    <button
                      onClick={() => handlePackSelect(pack.id)}
                      disabled={!unlocked}
                      className={`w-full p-2 rounded-lg text-xl transition-all ${
                        isActive
                          ? "bg-blue-500 ring-2 ring-blue-300"
                          : unlocked
                          ? "bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500"
                          : "opacity-40 cursor-not-allowed bg-gray-200 dark:bg-gray-800"
                      }`}
                      title={unlocked ? pack.name : `🔒 ${pack.unlockCriteria}`}
                    >
                      {pack.icon}
                    </button>
                    {!unlocked && progress && (
                      <div className="absolute -bottom-1 left-0 right-0 text-[8px] text-center bg-red-500 text-white rounded-b px-0.5 py-0.5 font-bold">
                        {progress}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Combination hint */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Mix any visual theme with any audio theme to create 64 unique
          combinations!
        </p>
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customizer-title"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-pop relative">
        <button
          onClick={() => {
            if (soundEnabled) SoundManager.play("uiTap");
            onClose();
          }}
          aria-label="Close customizer"
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Icons.X />
        </button>

        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <h2
            id="customizer-title"
            className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"
          >
            <Icons.Awards /> Customizer
          </h2>
          <span className="text-[10px] sm:text-xs text-gray-500">
            Style Your Game
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
          Mix any visual theme with any sound pack to create your perfect
          experience.
        </p>

        {renderMixMatch()}
      </div>
    </div>
  );
};

export { AwardsZone };
