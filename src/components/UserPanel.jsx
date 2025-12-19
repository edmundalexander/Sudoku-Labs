/**
 * Sudoku Logic Lab - UserPanel Component
 *
 * Handles user authentication (login/register) and profile display.
 */

import React, { useState, useEffect, useRef, Component } from "react";
import { BADGES } from "../constants.js";
import { SoundManager } from "../sound.js";
import {
  StorageService,
  isGasEnvironment,
  runGasFn,
  BadgeService,
} from "../services.js";
import { Icons } from "./Icons.jsx";

export const UserPanel = ({ soundEnabled, onClose, appUserSession }) => {
  const [mode, setMode] = useState("menu"); // menu, login, register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [localUserSession, setLocalUserSession] = useState(
    appUserSession || StorageService.getUserSession()
  );
  const profileFetchedRef = useRef(false);

  // Update localUserSession whenever appUserSession changes (from parent)
  useEffect(() => {
    if (appUserSession) {
      setLocalUserSession(appUserSession);
      profileFetchedRef.current = false; // reset fetch flag when session changes
    }
  }, [appUserSession]);

  // When showing the user's own panel, refresh the authoritative profile from backend
  useEffect(() => {
    const refreshLocalProfile = async () => {
      if (!localUserSession || profileFetchedRef.current) return;
      if (!isGasEnvironment()) return;
      try {
        const res = await runGasFn("getUserProfile", {
          userId: localUserSession.userId || localUserSession.username,
        });
        if (res && res.success && res.user) {
          // Normalize numeric fields to numbers
          const normalized = {
            ...res.user,
            totalGames: Number(res.user.totalGames) || 0,
            totalWins: Number(res.user.totalWins) || 0,
            easyWins: Number(res.user.easyWins) || 0,
            mediumWins: Number(res.user.mediumWins) || 0,
            hardWins: Number(res.user.hardWins) || 0,
            perfectWins: Number(res.user.perfectWins) || 0,
            fastWins: Number(res.user.fastWins) || 0,
          };
          StorageService.setUserSession(normalized);
          setLocalUserSession(normalized);
        }
      } catch (err) {
        console.error("Failed to refresh local profile:", err);
      } finally {
        profileFetchedRef.current = true;
      }
    };

    refreshLocalProfile();
  }, [localUserSession]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    if (!isGasEnvironment()) {
      setError("Authentication requires backend connection");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await runGasFn("loginUser", { username, password });
      if (result && result.success) {
        setLocalUserSession(result.user);
        StorageService.setUserSession(result.user);
        if (soundEnabled) SoundManager.play("success");
        onClose(result.user);
      } else {
        setError(result.error || "Login failed");
        if (soundEnabled) SoundManager.play("error");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Connection error. Please try again.");
      if (soundEnabled) SoundManager.play("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (trimmedUsername.length > 20) {
      setError("Username must be 20 characters or less");
      return;
    }

    // Only allow alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password.length > 100) {
      setError("Password must be 100 characters or less");
      return;
    }

    if (!isGasEnvironment()) {
      setError("Authentication requires backend connection");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await runGasFn("registerUser", { username, password });
      if (result && result.success) {
        setLocalUserSession(result.user);
        StorageService.setUserSession(result.user);
        if (soundEnabled) SoundManager.play("success");
        onClose(result.user);
      } else {
        setError(result.error || "Registration failed");
        if (soundEnabled) SoundManager.play("error");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Connection error. Please try again.");
      if (soundEnabled) SoundManager.play("error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (typeof StorageService !== "undefined") {
        StorageService.clearUserSession();
      }
      setLocalUserSession(null);
      if (soundEnabled) SoundManager.play("uiTap");
      onClose(null);
    } catch (e) {
      console.error("Logout failed:", e);
      setError("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    if (soundEnabled) SoundManager.play("uiTap");
    onClose(null);
  };

  // If user is already logged in, show profile
  if (localUserSession) {
    const localStats = StorageService.getGameStats();
    // Merge local stats with session stats (prefer higher values)
    // Note: localStats only tracks wins, session tracks both games and wins
    const mergedStats = {
      totalGames: Number(localUserSession.totalGames) || 0, // Coerce to number
      totalWins: Math.max(
        Number(localUserSession.totalWins) || 0,
        localStats.totalWins || 0
      ),
      easyWins: Math.max(
        Number(localUserSession.easyWins) || 0,
        localStats.easyWins || 0
      ),
      mediumWins: Math.max(
        Number(localUserSession.mediumWins) || 0,
        localStats.mediumWins || 0
      ),
      hardWins: Math.max(
        Number(localUserSession.hardWins) || 0,
        localStats.hardWins || 0
      ),
      perfectWins: Math.max(
        Number(localUserSession.perfectWins) || 0,
        localStats.perfectWins || 0
      ),
      fastWins: Math.max(
        Number(localUserSession.fastWins) || 0,
        localStats.fastWins || 0
      ),
    };
    const winRate =
      mergedStats.totalGames > 0
        ? Math.round((mergedStats.totalWins / mergedStats.totalGames) * 100)
        : 0;

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="userpanel-title"
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in overflow-y-auto"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-pop relative my-auto">
          {/* Decorative header gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20 rounded-t-xl"></div>

          <button
            onClick={() => onClose(localUserSession)}
            aria-label="Close profile"
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
          >
            <Icons.X />
          </button>

          <div className="relative text-center mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl sm:text-3xl text-white">
                {(localUserSession.displayName ||
                  localUserSession.username ||
                  "?")[0].toUpperCase()}
              </span>
            </div>
            <h2
              id="userpanel-title"
              className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white"
            >
              {localUserSession.displayName || localUserSession.username}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              @{localUserSession.username}
            </p>
          </div>

          {/* Main Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-xl text-center border border-blue-200 dark:border-blue-700">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {mergedStats.totalGames}
              </div>
              <div className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 font-medium uppercase">
                Games
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-xl text-center border border-green-200 dark:border-green-700">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                {mergedStats.totalWins}
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
                  {mergedStats.easyWins}
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400">
                  Easy
                </div>
              </div>
              <div className="text-center p-2 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {mergedStats.mediumWins}
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400">
                  Medium
                </div>
              </div>
              <div className="text-center p-2 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {mergedStats.hardWins}
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
                  {mergedStats.perfectWins}
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
                  {mergedStats.fastWins}
                </span>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-xl mb-4 border border-amber-200 dark:border-amber-800">
            <h3 className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
              <span className="text-lg">🏅</span> Badge Collection
            </h3>
            {(() => {
              const userBadges = BadgeService.getUserBadges();
              if (userBadges.length === 0) {
                return (
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 py-2">
                    No badges yet. Keep playing to earn achievements!
                  </p>
                );
              }
              return (
                <div className="grid grid-cols-4 gap-2">
                  {userBadges.slice(0, 8).map((badge) => {
                    const badgeDef = BADGES[badge.id];
                    if (!badgeDef) return null;
                    return (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-amber-300 dark:border-amber-700 hover:scale-105 transition-transform"
                        title={`${badgeDef.name}: ${badgeDef.description}`}
                      >
                        <span className="text-2xl">{badgeDef.icon}</span>
                        <span className="text-[8px] text-gray-600 dark:text-gray-400 text-center mt-1 truncate w-full">
                          {badgeDef.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            {BadgeService.getUserBadges().length > 8 && (
              <p className="text-[10px] text-center text-amber-600 dark:text-amber-400 mt-2">
                +{BadgeService.getUserBadges().length - 8} more badges
              </p>
            )}
          </div>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Logging out...
              </>
            ) : (
              <>
                <Icons.Logout /> Logout
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Auth mode selection menu
  if (mode === "menu") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-pop relative">
          <button
            onClick={handleContinueAsGuest}
            aria-label="Close welcome dialog"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Icons.X />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Icons.User />
            </div>
            <h2
              id="welcome-title"
              className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
            >
              Welcome!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sign in to track your progress across devices
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (soundEnabled) SoundManager.play("uiTap");
                setMode("login");
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Icons.Login /> Sign In
            </button>

            <button
              onClick={() => {
                if (soundEnabled) SoundManager.play("uiTap");
                setMode("register");
              }}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Icons.User /> Create Account
            </button>

            <button
              onClick={handleContinueAsGuest}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-bold transition-colors"
            >
              Continue as Guest
            </button>
          </div>

          {!isGasEnvironment() && (
            <div className="mt-4 text-xs text-center text-yellow-600 dark:text-yellow-400">
              ⚠️ Backend not configured. Authentication unavailable.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Login form
  if (mode === "login") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-title"
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-pop relative">
          <button
            onClick={() => setMode("menu")}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Icons.Undo />
          </button>
          <button
            onClick={handleContinueAsGuest}
            aria-label="Close sign in"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Icons.X />
          </button>

          <div className="text-center mb-6 mt-4">
            <h2
              id="signin-title"
              className="text-2xl font-bold text-gray-800 dark:text-white"
            >
              Sign In
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back!
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter username"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Create one
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Register form
  if (mode === "register") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="createaccount-title"
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-pop relative">
          <button
            onClick={() => setMode("menu")}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Icons.Undo />
          </button>
          <button
            onClick={handleContinueAsGuest}
            aria-label="Close create account"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Icons.X />
          </button>

          <div className="text-center mb-6 mt-4">
            <h2
              id="createaccount-title"
              className="text-2xl font-bold text-gray-800 dark:text-white"
            >
              Create Account
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Join the Sudoku community!
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Choose a username (3+ chars)"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Choose a password (6+ chars)"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Sign in
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-800 dark:text-yellow-300">
            <strong>Note:</strong> This is a demo authentication system. Don't
            use sensitive passwords.
          </div>
        </div>
      </div>
    );
  }

  return null;
};
