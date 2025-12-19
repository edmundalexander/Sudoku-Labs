import React, { useEffect } from "react";
import { BADGES, SOUND_PACKS, THEMES } from "../constants.js";
import { triggerConfetti } from "../utils.js";
import { SoundManager } from "../sound.js";
import { Icons } from "./Icons.jsx";

const ClosingScreen = ({
  status,
  time,
  difficulty,
  mistakes,
  onRestart,
  onMenu,
  loading,
  soundEnabled,
  newlyUnlockedThemes,
  newlyUnlockedSoundPacks,
  newlyAwardedBadges,
}) => {
  const isWin = status === "won";

  useEffect(() => {
    console.log("ClosingScreen mount:", {
      status,
      isWin,
      time,
      difficulty,
      mistakes,
    });
    if (isWin) {
      if (soundEnabled) SoundManager.play("success");
      if (typeof triggerConfetti === "function") triggerConfetti();
    }
  }, [isWin, soundEnabled]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 text-gray-900 dark:text-gray-100 animate-fade-in relative">
      <div className="text-center max-w-md w-full bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden z-10">
        <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 animate-bounce-slow">
          {isWin ? "🏆" : "💔"}
        </div>
        <h1
          className={`text-2xl sm:text-3xl font-bold mb-2 ${
            isWin ? "text-blue-600" : "text-red-500"
          }`}
        >
          {isWin ? "Puzzle Solved!" : "Game Over"}
        </h1>

        {newlyUnlockedThemes && newlyUnlockedThemes.length > 0 && (
          <div className="my-3 sm:my-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/40 dark:via-pink-900/30 dark:to-purple-900/40 rounded-xl border-2 border-purple-400 dark:border-purple-600 animate-pulse-glow relative overflow-hidden">
            {/* Sparkle overlay */}

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              <div
                className="absolute top-4 right-6 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping"
                style={{ animationDelay: "0.3s" }}
              ></div>
              <div
                className="absolute bottom-3 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping"
                style={{ animationDelay: "0.6s" }}
              ></div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl animate-bounce">🎉</span>
                <p className="text-base sm:text-lg font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Icons.Palette /> New Theme
                  {newlyUnlockedThemes.length > 1 ? "s" : ""} Unlocked!
                </p>
                <span
                  className="text-2xl animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                >
                  ✨
                </span>
              </div>
              <p className="text-xs text-center text-purple-600 dark:text-purple-200 mb-3">
                Visit Awards to equip your new look!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {newlyUnlockedThemes.map((themeId, idx) => (
                  <div
                    key={themeId}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border-2 border-purple-300 dark:border-purple-700 shadow-lg transform hover:scale-105 transition-all animate-bounce-in"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <span className="text-2xl drop-shadow-lg">
                      {THEMES[themeId].icon}
                    </span>
                    <div className="text-left">
                      <span className="text-sm font-bold text-gray-800 dark:text-white block">
                        {THEMES[themeId].name}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {THEMES[themeId].description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {newlyUnlockedSoundPacks && newlyUnlockedSoundPacks.length > 0 && (
          <div className="my-3 sm:my-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-900/40 dark:via-cyan-900/30 dark:to-blue-900/40 rounded-xl border-2 border-blue-400 dark:border-blue-600 animate-pulse-glow relative overflow-hidden">
            {/* Sparkle overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
              <div
                className="absolute top-4 left-6 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"
                style={{ animationDelay: "0.3s" }}
              ></div>
              <div
                className="absolute bottom-3 right-1/4 w-1 h-1 bg-indigo-400 rounded-full animate-ping"
                style={{ animationDelay: "0.6s" }}
              ></div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl animate-bounce">🎵</span>
                <p className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Icons.Music /> New Sound Pack
                  {newlyUnlockedSoundPacks.length > 1 ? "s" : ""} Unlocked!
                </p>
                <span
                  className="text-2xl animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                >
                  🔊
                </span>
              </div>
              <p className="text-xs text-center text-blue-600 dark:text-blue-200 mb-3">
                Visit Awards to try out your new sounds!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {newlyUnlockedSoundPacks.map((packId, idx) => (
                  <div
                    key={packId}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-lg transform hover:scale-105 transition-all animate-bounce-in"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <span className="text-2xl drop-shadow-lg">
                      {SOUND_PACKS[packId]?.icon}
                    </span>
                    <div className="text-left">
                      <span className="text-sm font-bold text-gray-800 dark:text-white block">
                        {SOUND_PACKS[packId]?.name}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {SOUND_PACKS[packId]?.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {newlyAwardedBadges && newlyAwardedBadges.length > 0 && (
          <div className="my-3 sm:my-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 dark:from-yellow-900/40 dark:via-amber-900/30 dark:to-yellow-900/40 rounded-xl border-2 border-yellow-400 dark:border-yellow-600 animate-pulse-glow relative overflow-hidden">
            {/* Sparkle overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-4 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
              <div
                className="absolute top-4 right-6 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"
                style={{ animationDelay: "0.3s" }}
              ></div>
              <div
                className="absolute bottom-3 left-1/4 w-1 h-1 bg-amber-400 rounded-full animate-ping"
                style={{ animationDelay: "0.6s" }}
              ></div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl animate-bounce">🏅</span>
                <p className="text-base sm:text-lg font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Icons.Awards /> New Badge
                  {newlyAwardedBadges.length > 1 ? "s" : ""} Earned!
                </p>
                <span
                  className="text-2xl animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                >
                  ✨
                </span>
              </div>
              <p className="text-xs text-center text-amber-600 dark:text-amber-200 mb-3">
                Check your profile to see all achievements!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {newlyAwardedBadges.map((badgeId, idx) => {
                  const badge = BADGES[badgeId];
                  if (!badge) return null;
                  return (
                    <div
                      key={badgeId}
                      className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border-2 border-amber-300 dark:border-amber-700 shadow-lg transform hover:scale-105 transition-all animate-bounce-in"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <span className="text-2xl drop-shadow-lg">
                        {badge.icon}
                      </span>
                      <div className="text-left">
                        <span className="text-sm font-bold text-gray-800 dark:text-white block">
                          {badge.name}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {badge.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8 text-center bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-xl">
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">
              Diff
            </div>
            <div className="font-bold text-sm sm:text-base">{difficulty}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">
              Time
            </div>
            <div className="font-mono text-sm sm:text-base">
              {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}
            </div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">
              Errors
            </div>
            <div
              className={`font-bold text-sm sm:text-base ${
                mistakes >= 3 ? "text-red-500" : ""
              }`}
            >
              {mistakes}/3
            </div>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={() => {
              if (soundEnabled) SoundManager.play("startGame");
              onRestart();
            }}
            disabled={loading}
            className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm sm:text-base transition-colors disabled:opacity-50"
          >
            {loading ? "Generating..." : isWin ? "Play Another" : "Try Again"}
          </button>
          <button
            onClick={() => {
              if (soundEnabled) SoundManager.play("uiTap");
              onMenu();
            }}
            className="w-full py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-bold text-sm sm:text-base transition-colors"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export { ClosingScreen };
