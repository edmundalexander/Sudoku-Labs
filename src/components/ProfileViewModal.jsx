/**
 * Sudoku Logic Lab - ProfileViewModal Component
 *
 * Displays a read-only profile view for other users.
 */

import React, { Component } from "react";
import { Icons } from "./Icons.jsx";

export const ProfileViewModal = ({
  profile,
  onClose,
  soundEnabled,
  loading,
}) => {
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const winRate =
    profile.totalGames > 0
      ? Math.round((profile.totalWins / profile.totalGames) * 100)
      : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-pop relative my-auto">
        {/* Decorative header gradient */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 opacity-20 rounded-t-xl"></div>

        <button
          onClick={onClose}
          aria-label="Close profile"
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
        >
          <Icons.X />
        </button>

        <div className="relative text-center mb-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl sm:text-3xl text-white">
              {(profile.displayName ||
                profile.username ||
                "?")[0].toUpperCase()}
            </span>
          </div>
          <h2
            id="profile-title"
            className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white"
          >
            {profile.displayName || profile.username}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            @{profile.username}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              👤 Player Profile
            </span>
          </div>
        </div>

        {/* Main Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-xl text-center border border-blue-200 dark:border-blue-700">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {profile.totalGames}
            </div>
            <div className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 font-medium uppercase">
              Games
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-xl text-center border border-green-200 dark:border-green-700">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              {profile.totalWins}
            </div>
            <div className="text-[10px] sm:text-xs text-green-700 dark:text-green-300 font-medium uppercase">
              Wins
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-3 rounded-xl text-center border border-purple-200 dark:border-purple-700">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {winRate}%
            </div>
            <div className="text-[10px] sm:text-xs text-purple-700 dark:text-purple-300 font-medium uppercase">
              Win Rate
            </div>
          </div>
        </div>

        {/* Detailed Stats Section */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-4">
          <h3 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Icons.Awards /> Performance Breakdown
          </h3>

          {/* Difficulty breakdown */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-green-100/50 dark:bg-green-900/20 rounded-lg">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {profile.easyWins}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400">
                Easy
              </div>
            </div>
            <div className="text-center p-2 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {profile.mediumWins}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400">
                Medium
              </div>
            </div>
            <div className="text-center p-2 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {profile.hardWins}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400">
                Hard
              </div>
            </div>
          </div>

          {/* Achievement stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Perfect
                </span>
              </div>
              <span className="font-bold text-sm text-gray-800 dark:text-white">
                {profile.perfectWins}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Speed (≤3m)
                </span>
              </div>
              <span className="font-bold text-sm text-gray-800 dark:text-white">
                {profile.fastWins}
              </span>
            </div>
          </div>
        </div>

        {/* Badges Section - Note: For other users, shows a coming soon message as we don't fetch their badges */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-xl mb-4 border border-amber-200 dark:border-amber-800">
          <h3 className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
            <span className="text-lg">🏅</span> Badges
          </h3>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 py-2">
            Badge display for other users coming soon!
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
};
