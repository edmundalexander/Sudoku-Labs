import React, { useState, useEffect } from "react";
import { SoundManager } from "../sound.js";
import { StorageService } from "../services.js";
import { Icons } from "./Icons.jsx";

const OpeningScreen = ({
  onStart,
  onResume,
  hasSavedGame,
  darkMode,
  toggleDarkMode,
  loading,
  soundEnabled,
  toggleSound,
  onShowUserPanel,
  onShowAwards,
  userSession,
}) => {
  const localStats = StorageService.getGameStats();
  const [practiceMode, setPracticeMode] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 text-gray-900 dark:text-gray-100 animate-fade-in relative z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2 z-20">
        <button
          aria-label="User"
          onClick={onShowUserPanel}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
        >
          <Icons.User />
          {userSession && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
          )}
        </button>
        <button
          aria-label="Rewards"
          title="Rewards"
          onClick={onShowAwards}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
        >
          <Icons.Awards />
          <span className="hidden sm:inline text-[11px] font-semibold">
            Rewards
          </span>
        </button>
        <button
          aria-label="Sound"
          onClick={toggleSound}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
        >
          {soundEnabled ? <Icons.VolumeUp /> : <Icons.VolumeOff />}
        </button>
        <button
          aria-label="Theme"
          onClick={toggleDarkMode}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
        >
          {darkMode ? <Icons.Sun /> : <Icons.Moon />}
        </button>
      </div>

      <div className="relative text-center mb-6 sm:mb-8">
        <div className="text-5xl sm:text-6xl mb-3 animate-bounce-slow">🧩</div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-1">
          Sudoku{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Logic
          </span>{" "}
          Lab
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Challenge your mind, unlock rewards
        </p>
      </div>

      <div className="relative w-full max-w-md space-y-4 px-2">
        {/* Resume Game - prominent if available */}
        {hasSavedGame && (
          <button
            onClick={() => {
              if (soundEnabled) SoundManager.play("startGame");
              onResume();
            }}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl shadow-xl font-bold text-lg transition-all transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-green-400/30"
          >
            <Icons.Play /> Continue Your Game
          </button>
        )}

        {/* Main action buttons */}
        <div className="grid grid-cols-1 gap-3">
          {/* Quick Play section */}
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 text-center flex items-center justify-center gap-1">
              {loading && <span className="animate-spin">⏳</span>} Quick Play
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  name: "Easy",
                  color: "from-green-500 to-green-600",
                  hoverColor: "hover:from-green-400 hover:to-green-500",
                },
                {
                  name: "Medium",
                  color: "from-yellow-500 to-orange-500",
                  hoverColor: "hover:from-yellow-400 hover:to-orange-400",
                },
                {
                  name: "Hard",
                  color: "from-red-500 to-rose-600",
                  hoverColor: "hover:from-red-400 hover:to-rose-500",
                },
                {
                  name: "Daily",
                  color: "from-blue-500 to-cyan-500",
                  hoverColor: "hover:from-blue-400 hover:to-cyan-400",
                },
              ].map((d) => (
                <button
                  key={d.name}
                  onClick={() => {
                    if (soundEnabled) SoundManager.play("startGame");
                    onStart(d.name, practiceMode);
                  }}
                  disabled={loading}
                  className={`py-2.5 px-2 rounded-xl bg-gradient-to-br ${d.color} ${d.hoverColor} text-white transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-wait shadow-md hover:shadow-lg transform hover:scale-105`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {/* Practice Mode Toggle */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-3 sm:p-4 rounded-2xl shadow-xl border border-purple-200 dark:border-purple-700">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <div>
                  <span className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-bold block">
                    Practice Mode
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    No mistakes limit, learn freely
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={practiceMode}
                  onChange={(e) => setPracticeMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </div>
            </label>
          </div>
        </div>

        {/* Stats preview */}
        {localStats.totalWins > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-around text-center">
            <div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {localStats.totalWins}
              </div>
              <div className="text-[10px] text-gray-500 uppercase">Wins</div>
            </div>
            <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
            <div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {localStats.perfectWins}
              </div>
              <div className="text-[10px] text-gray-500 uppercase">Perfect</div>
            </div>
            <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
            <div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {localStats.fastWins}
              </div>
              <div className="text-[10px] text-gray-500 uppercase">Speed</div>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-8 sm:mt-10 text-[10px] sm:text-xs text-gray-400">
        v2.3 • Logic Lab Series
      </footer>
    </div>
  );
};

export { OpeningScreen };
