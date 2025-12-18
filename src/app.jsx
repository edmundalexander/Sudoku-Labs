/**
 * Sudoku Logic Lab - Main Application (React Components Only)
 *
 * This file contains only React components and UI logic.
 * All constants, utilities, services, and sound are now in separate modules.
 *
 * Dependencies (loaded via index.html):
 * - constants.js (THEMES, SOUND_PACKS, CAMPAIGN_LEVELS, etc.)
 * - utils.js (validation, formatting, sudoku helpers)
 * - sound.js (SoundManager)
 * - services.js (API, storage, leaderboard, chat)
 *
 * @version 2.3.0
 */

const { useState, useEffect, useCallback, useRef, memo, useMemo, Component } =
  React;

// Debug helper - enable by setting window.DEBUG = true in config.local.js or when running locally
const DEBUG = Boolean(
  (typeof window !== "undefined" && window.DEBUG) ||
    (typeof window !== "undefined" && window.APP_VERSION === "local-dev") ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"))
);
const dlog = (...args) => {
  if (DEBUG) console.log(...args);
};

// Silence console.log in production to avoid noisy logs in hot paths
if (
  !DEBUG &&
  typeof console !== "undefined" &&
  typeof console.log === "function"
) {
  try {
    console._originalLog = console.log;
    console.log = function () {};
  } catch (e) {}
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

// ErrorBoundary component moved to src/components/ErrorBoundary.jsx
// It is now loaded via index.html and available as window.ErrorBoundary
// const ErrorBoundary = window.ErrorBoundary; // Already global

// ============================================================================
// PROCEDURAL THEME-AWARE VISUAL ELEMENT GENERATOR
// ============================================================================

/**
 * Generate procedural theme-specific visual elements (gradients, shapes, animations)
 * Creates abstract art-like floating elements that reflect the theme's "feel"
 */
const getThemeVisualElement = (visualThemeId, audioThemeId, index) => {
  // Visual theme color palettes and animation styles
  const themeConfig = {
    default: {
      colors: ["#3b82f6", "#60a5fa", "#93c5fd"],
      bgGradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
      animation: "float-slow",
      blur: "blur(8px)",
    },
    ocean: {
      colors: ["#0891b2", "#06b6d4", "#67e8f9"],
      bgGradient: "linear-gradient(135deg, #06b6d4, #67e8f9)",
      animation: "float-slow-wave",
      blur: "blur(12px)",
    },
    forest: {
      colors: ["#059669", "#10b981", "#34d399"],
      bgGradient: "linear-gradient(135deg, #10b981, #6ee7b7)",
      animation: "float-slow",
      blur: "blur(10px)",
    },
    sunset: {
      colors: ["#ea580c", "#f97316", "#fb923c"],
      bgGradient: "linear-gradient(135deg, #f97316, #fbbf24)",
      animation: "float-glow",
      blur: "blur(14px)",
    },
    midnight: {
      colors: ["#6366f1", "#818cf8", "#a5b4fc"],
      bgGradient: "linear-gradient(135deg, #6366f1, #a5b4fc)",
      animation: "float-pulse",
      blur: "blur(16px)",
    },
    sakura: {
      colors: ["#db2777", "#ec4899", "#f472b6"],
      bgGradient: "linear-gradient(135deg, #ec4899, #f472b6)",
      animation: "float-soft",
      blur: "blur(11px)",
    },
    volcano: {
      colors: ["#dc2626", "#f87171", "#fca5a5"],
      bgGradient: "linear-gradient(135deg, #dc2626, #f97316)",
      animation: "float-intense",
      blur: "blur(9px)",
    },
    arctic: {
      colors: ["#0284c7", "#0ea5e9", "#38bdf8"],
      bgGradient: "linear-gradient(135deg, #0ea5e9, #7dd3fc)",
      animation: "float-crystalline",
      blur: "blur(13px)",
    },
  };

  // Audio theme shape and opacity modifiers
  const audioModifiers = {
    classic: { shape: "rounded-full", opacity: 0.6, filter: "none" },
    zen: { shape: "rounded-3xl", opacity: 0.5, filter: "opacity-50" },
    funfair: {
      shape: "rounded-2xl",
      opacity: 0.7,
      filter: "brightness-110 saturate-150",
    },
    retro: { shape: "rounded-lg", opacity: 0.65, filter: "hue-rotate-12" },
    space: {
      shape: "rounded-full",
      opacity: 0.55,
      filter: "hue-rotate-180 brightness-90",
    },
    nature: { shape: "rounded-3xl", opacity: 0.6, filter: "saturate-150" },
    crystal: { shape: "rounded-2xl", opacity: 0.75, filter: "brightness-125" },
    minimal: { shape: "rounded-sm", opacity: 0.5, filter: "grayscale-50" },
  };

  const visual = themeConfig[visualThemeId] || themeConfig.default;
  const audio = audioModifiers[audioThemeId] || audioModifiers.classic;
  const primaryColor = visual.colors[index % visual.colors.length];

  return {
    background: visual.bgGradient,
    color: primaryColor,
    opacity: audio.opacity,
    shape: audio.shape,
    filter: audio.filter,
    blur: visual.blur,
    animation: visual.animation,
    size: 40 + (index % 3) * 15, // Vary sizes: 40px, 55px, 70px
  };
};

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

/**
 * Debug mode to test API endpoints and database synchronization
 * Call with: window.runDebugTests() in browser console
 */
window.runDebugTests = async function () {
  console.log(
    "%c🔍 Starting Debug Tests...",
    "color: blue; font-size: 16px; font-weight: bold"
  );
  console.log("");

  const results = {
    passed: [],
    failed: [],
    warnings: [],
  };

  try {
    // Test 1: Check GAS configuration
    dlog("%cTest 1: GAS Configuration...", "font-weight: bold");
    if (isGasEnvironment()) {
      console.log("✅ GAS_URL is configured and valid");
      results.passed.push("GAS Configuration");
    } else {
      console.log("⚠️  GAS_URL not configured - using local fallback");
      results.warnings.push("GAS not configured");
    }

    // Test 2: Ping backend (if configured)
    if (isGasEnvironment()) {
      console.log("\n%cTest 2: Backend Ping...", "font-weight: bold");
      try {
        const pingResult = await runGasFn("ping");
        if (pingResult && pingResult.ok) {
          console.log("✅ Backend is responding");
          console.log("   Timestamp:", pingResult.timestamp);
          results.passed.push("Backend Ping");
        } else {
          console.log("❌ Backend ping failed");
          results.failed.push("Backend Ping");
        }
      } catch (e) {
        console.log("❌ Backend unreachable:", e.message);
        results.failed.push("Backend Ping");
      }
    }

    // Test 3: Check user authentication
    console.log(
      "\n%cTest 3: User Authentication Status...",
      "font-weight: bold"
    );
    const session = StorageService.getUserSession();
    if (session && session.userId) {
      console.log("✅ User authenticated:", session.username);
      console.log("   User ID:", session.userId);
      results.passed.push("User Session");

      // Test 4: Get user profile (if GAS configured)
      if (isGasEnvironment()) {
        console.log(
          "\n%cTest 4: Fetching User Profile...",
          "font-weight: bold"
        );
        try {
          const profile = await runGasFn("getUserProfile", {
            userId: session.userId,
          });
          if (profile && profile.success) {
            console.log("✅ User Profile Retrieved:");
            console.table({
              "Total Games": profile.user.totalGames,
              "Total Wins": profile.user.totalWins,
              "Easy Wins": profile.user.easyWins || 0,
              "Medium Wins": profile.user.mediumWins || 0,
              "Hard Wins": profile.user.hardWins || 0,
              "Perfect Wins": profile.user.perfectWins || 0,
              "Fast Wins": profile.user.fastWins || 0,
              "Win Rate":
                (profile.user.totalGames > 0
                  ? (
                      (profile.user.totalWins / profile.user.totalGames) *
                      100
                    ).toFixed(2)
                  : 0) + "%",
            });
            results.passed.push("User Profile Fetch");
          } else {
            console.log("❌ Failed to fetch user profile:", profile?.error);
            results.failed.push("User Profile Fetch");
          }
        } catch (e) {
          console.log("❌ User profile fetch error:", e.message);
          results.failed.push("User Profile Fetch");
        }

        // Test 5: Get user state
        console.log(
          "\n%cTest 5: Fetching User State (Unlocks)...",
          "font-weight: bold"
        );
        try {
          const state = await runGasFn("getUserState", {
            userId: session.userId,
          });
          if (state && state.success && state.state) {
            console.log("✅ User State Retrieved:");
            console.log(
              "   Unlocked Themes:",
              state.state.unlockedThemes || []
            );
            console.log(
              "   Unlocked Sound Packs:",
              state.state.unlockedSoundPacks || []
            );
            console.log("   Game Stats:", state.state.gameStats || {});
            results.passed.push("User State Fetch");
          } else {
            console.log("❌ Failed to fetch user state:", state?.error);
            results.failed.push("User State Fetch");
          }
        } catch (e) {
          console.log("❌ User state fetch error:", e.message);
          results.failed.push("User State Fetch");
        }
      }
    } else {
      console.log(
        "⚠️  No authenticated user. Login first to test user endpoints."
      );
      results.warnings.push("No User Session");
    }

    // Test 6: Local storage check
    console.log("\n%cTest 6: Checking Local Storage...", "font-weight: bold");
    const localStorage_stats = StorageService.getGameStats();
    const localStorage_themes = StorageService.getUnlockedThemes();
    const localStorage_packs = StorageService.getUnlockedSoundPacks();
    console.log("✅ Local Storage Accessible:");
    console.log("   Game Stats:", localStorage_stats);
    console.log("   Unlocked Themes:", localStorage_themes);
    console.log("   Unlocked Sound Packs:", localStorage_packs);
    results.passed.push("Local Storage Check");

    // Test 7: Sound Manager
    console.log("\n%cTest 7: Sound Manager...", "font-weight: bold");
    if (typeof SoundManager !== "undefined") {
      console.log("✅ SoundManager available");
      console.log("   Current Pack:", SoundManager.currentPack);
      console.log(
        "   Available Packs:",
        Object.keys(SoundManager.packHandlers)
      );
      results.passed.push("Sound Manager");
    } else {
      console.log("❌ SoundManager not loaded");
      results.failed.push("Sound Manager");
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log(
      "%c📊 DEBUG TEST SUMMARY",
      "color: blue; font-size: 14px; font-weight: bold"
    );
    console.log("=".repeat(50));
    console.log(`%c✅ Passed: ${results.passed.length} tests`, "color: green");
    if (results.warnings.length > 0) {
      console.log(
        `%c⚠️  Warnings: ${results.warnings.length}`,
        "color: orange"
      );
      console.log("   ", results.warnings.join(", "));
    }
    if (results.failed.length > 0) {
      console.log(`%c❌ Failed: ${results.failed.length} tests`, "color: red");
      console.log("   ", results.failed.join(", "));
    }
    console.log(
      "\n💡 " +
        (results.failed.length === 0
          ? "All systems operational!"
          : "Some issues detected - check failed tests above.")
    );

    return results;
  } catch (err) {
    console.error("❌ Debug test error:", err);
    return { error: err.message };
  }
};

/**
 * Clear all local data (for testing)
 * Call with: window.clearAllData()
 */
window.clearAllData = function () {
  if (
    !confirm(
      "This will clear all local game data including progress, unlocks, and settings. Continue?"
    )
  ) {
    return;
  }
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  console.log("✅ All local data cleared. Refresh the page to start fresh.");
};

/**
 * Grant test unlocks (for testing)
 * Call with: window.grantTestUnlocks()
 */
window.grantTestUnlocks = function () {
  const allThemes = Object.keys(THEMES);
  const allPacks = Object.keys(SOUND_PACKS);
  StorageService.saveUnlockedThemes(allThemes);
  StorageService.saveUnlockedSoundPacks(allPacks);
  console.log(
    "✅ All themes and sound packs unlocked for testing. Refresh to see changes."
  );
};

// Make debug mode available globally
console.log(
  "%c🧩 Sudoku Logic Lab v2.3",
  "color: blue; font-size: 16px; font-weight: bold"
);
console.log("%c🔧 Debug Commands:", "color: gray; font-size: 12px");
console.log(
  "%c   window.runDebugTests() - Run diagnostic tests",
  "color: gray; font-size: 11px"
);
console.log(
  "%c   window.clearAllData() - Clear all local data",
  "color: gray; font-size: 11px"
);
console.log(
  "%c   window.grantTestUnlocks() - Unlock all themes/sounds",
  "color: gray; font-size: 11px"
);

// SudokuBoard component moved to src/components/SudokuBoard.jsx
// It is now loaded via index.html and available as window.SudokuBoard
// const SudokuBoard = window.SudokuBoard; // Already global

// Icons component moved to src/components/Icons.jsx
// It is now loaded via index.html and available as window.Icons
const Icons = window.Icons;

const CHAT_POLL_INTERVAL = 5000;

const FullScreenLoader = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-3 animate-fade-in">
    <div
      className="w-12 h-12 border-4 border-white/50 border-t-white rounded-full animate-spin"
      aria-label="Loading"
    />
    <div className="text-sm font-semibold tracking-wide">{message}</div>
    <div className="text-[11px] text-white/80">
      Please wait while we finish updating.
    </div>
  </div>
);

// --- AWARDS ZONE (Themes + Sound Packs) ---
// AwardsZone component moved to src/components/AwardsZone.jsx
// It is now loaded via index.html and available as window.AwardsZone
// const AwardsZone = window.AwardsZone; // Already global

// --- USER PANEL COMPONENT ---
// UserPanel component moved to src/components/UserPanel.jsx
// It is now loaded via index.html and available as window.UserPanel
const UserPanel = window.UserPanel;

// Profile View Modal - for viewing other users' profiles
// ProfileViewModal component moved to src/components/ProfileViewModal.jsx
// It is now loaded via index.html and available as window.ProfileViewModal
const ProfileViewModal = window.ProfileViewModal;

// OpeningScreen component moved to src/components/OpeningScreen.jsx
// It is now loaded via index.html and available as window.OpeningScreen
// const OpeningScreen = window.OpeningScreen; // Already global

// ClosingScreen component moved to src/components/ClosingScreen.jsx
// It is now loaded via index.html and available as window.ClosingScreen
// const ClosingScreen = window.ClosingScreen; // Already global

const App = () => {
  const [view, setView] = useState("menu");
  const [board, setBoard] = useState([]);
  const [difficulty, setDifficulty] = useState("Easy");
  const [status, setStatus] = useState("idle");
  const [timer, setTimer] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [mode, setMode] = useState("pen");
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showModal, setShowModal] = useState("none");
  const [initialFilledCount, setInitialFilledCount] = useState(0);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isChatInputFocused, setIsChatInputFocused] = useState(false);
  const [userStatus, setUserStatus] = useState(StorageService.getUserStatus());
  const [chatMessages, setChatMessages] = useState([]);
  const [chatNotification, setChatNotification] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState(EMOJI_CATEGORIES[0].id);

  // User Authentication State
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [appUserSession, setAppUserSession] = useState(
    StorageService.getUserSession()
  );
  const [isHydrating, setIsHydrating] = useState(true);
  const [viewingProfile, setViewingProfile] = useState(null); // For viewing other users' profiles
  const [profileLoading, setProfileLoading] = useState(false);
  const [hoverProfile, setHoverProfile] = useState(null); // For hover preview in chat
  const [hoverProfilePos, setHoverProfilePos] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef(null);
  const profileCacheRef = useRef(new Map()); // Cache for profile data

  // Helpers to ensure we only use valid IDs
  const sanitizeThemeId = (id) =>
    typeof id === "string" && id.trim() && THEMES[id.trim()]
      ? id.trim()
      : "default";
  const sanitizeSoundPackId = (id) =>
    typeof id === "string" && id.trim() && SOUND_PACKS[id.trim()]
      ? id.trim()
      : "classic";

  // Theme State
  const [activeThemeId, setActiveThemeId] = useState(() =>
    sanitizeThemeId(StorageService.getActiveTheme())
  );
  const [unlockedThemes, setUnlockedThemes] = useState(
    StorageService.getUnlockedThemes()
  );
  const [newlyUnlockedThemes, setNewlyUnlockedThemes] = useState([]);

  // Sound Pack State
  const [activeSoundPackId, setActiveSoundPackId] = useState(() =>
    sanitizeSoundPackId(StorageService.getActiveSoundPack())
  );
  const [unlockedSoundPacks, setUnlockedSoundPacks] = useState(
    StorageService.getUnlockedSoundPacks()
  );
  const [newlyUnlockedSoundPacks, setNewlyUnlockedSoundPacks] = useState([]);
  const [showAwardsZone, setShowAwardsZone] = useState(false);
  const [pendingActiveThemeId, setPendingActiveThemeId] = useState(null);
  const [pendingActiveSoundPackId, setPendingActiveSoundPackId] =
    useState(null);
  const [awardsDirty, setAwardsDirty] = useState(false);
  const [bgAssetUrl, setBgAssetUrl] = useState(null);

  // QoL improvements state
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showConflicts, setShowConflicts] = useState(true);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [newlyAwardedBadges, setNewlyAwardedBadges] = useState([]);

  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  const isSendingRef = useRef(false);
  const persistTimerRef = useRef(null);
  const pendingPersistRef = useRef(null);
  const themeTouchedRef = useRef(false);
  const soundPackTouchedRef = useRef(false);
  const chatTouchStartRef = useRef(null);
  const chatTouchLastRef = useRef(null);

  const closeChat = useCallback(
    (playSound = true) => {
      if (playSound && soundEnabled) SoundManager.play("uiTap");
      setChatNotification(null);
      setShowEmojiPicker(false);
      setIsChatOpen(false);
    },
    [soundEnabled]
  );

  const openChat = useCallback(() => {
    if (soundEnabled) SoundManager.play("uiTap");
    setChatNotification(null);
    setShowEmojiPicker(false);
    setIsChatOpen(true);
  }, [soundEnabled]);

  // Persist merged unlock/theme/sound state to backend for authenticated users
  const persistUserStateToBackend = useCallback(
    async (partial = {}) => {
      const session = StorageService.getUserSession();
      if (!isGasEnvironment() || !session?.userId) return;

      const payload = {
        userId: session.userId,
        unlockedThemes:
          partial.unlockedThemes || StorageService.getUnlockedThemes(),
        unlockedSoundPacks:
          partial.unlockedSoundPacks || StorageService.getUnlockedSoundPacks(),
        activeTheme: partial.activeTheme ?? activeThemeId,
        activeSoundPack: partial.activeSoundPack ?? activeSoundPackId,
        gameStats: partial.gameStats || StorageService.getGameStats(),
      };

      try {
        await runGasFn("saveUserState", payload);
      } catch (err) {
        console.error("Failed to persist user state:", err);
      }
    },
    [activeThemeId, activeSoundPackId]
  );

  // Debounced persist to avoid UI lag when toggling themes/sound packs rapidly
  const flushPendingPersist = useCallback(async () => {
    const payload = pendingPersistRef.current;
    pendingPersistRef.current = null;
    persistTimerRef.current = null;
    if (payload) {
      await persistUserStateToBackend(payload);
    }
  }, [persistUserStateToBackend, activeThemeId, activeSoundPackId]);

  const schedulePersist = useCallback(
    (partial) => {
      if (!isUserAuthenticated() || !isGasEnvironment()) return;
      pendingPersistRef.current = {
        ...(pendingPersistRef.current || {}),
        ...partial,
      };
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
      persistTimerRef.current = setTimeout(flushPendingPersist, 350);
    },
    [flushPendingPersist]
  );

  const openAwards = async () => {
    setPendingActiveThemeId(activeThemeId);
    setPendingActiveSoundPackId(activeSoundPackId);
    setAwardsDirty(false);
    setShowAwardsZone(true);

    // Sync latest gameStats from backend to ensure database edits are reflected
    // This merges local and cloud data, taking the higher values
    if (isUserAuthenticated() && isGasEnvironment() && appUserSession?.userId) {
      try {
        const remote = await runGasFn("getUserState", {
          userId: appUserSession.userId,
        });
        if (remote?.success && remote.state) {
          const localStats = StorageService.getGameStats();
          const remoteStats = remote.state.gameStats || {};

          // Merge stats - take max of each field to preserve progress from both sources
          const mergedStats = { ...localStats };
          Object.keys({ ...localStats, ...remoteStats }).forEach((k) => {
            mergedStats[k] = Math.max(
              Number(localStats[k] || 0),
              Number(remoteStats[k] || 0)
            );
          });
          StorageService.saveGameStats(mergedStats);

          // Merge unlocks from local and remote
          const localThemes = StorageService.getUnlockedThemes();
          const localPacks = StorageService.getUnlockedSoundPacks();
          const mergedThemes = Array.from(
            new Set([...localThemes, ...(remote.state.unlockedThemes || [])])
          );
          const mergedPacks = Array.from(
            new Set([...localPacks, ...(remote.state.unlockedSoundPacks || [])])
          );

          // Re-run unlock checks with merged stats
          const newThemes = UnlockService.checkThemeUnlocks(mergedStats);
          const newPacks = UnlockService.checkSoundPackUnlocks(mergedStats);

          // Update state with merged unlocks
          const finalThemes = Array.from(
            new Set([...mergedThemes, ...newThemes])
          );
          const finalPacks = Array.from(new Set([...mergedPacks, ...newPacks]));

          StorageService.saveUnlockedThemes(finalThemes);
          StorageService.saveUnlockedSoundPacks(finalPacks);
          setUnlockedThemes(finalThemes);
          setUnlockedSoundPacks(finalPacks);

          // Persist merged state back to cloud
          await persistUserStateToBackend({
            unlockedThemes: finalThemes,
            unlockedSoundPacks: finalPacks,
            gameStats: mergedStats,
          });
        }
      } catch (err) {
        console.error("Failed to sync game stats:", err);
        // Surface backend hint to the user if it's a network/CORS error
        if (
          err &&
          err.message &&
          /CORS|Failed to reach GAS backend|Failed to fetch/i.test(err.message)
        ) {
          setBackendError(err.message);
        }
      }
    }
  };

  // Hydrate local unlocks and selections from backend, merging with local progress
  const [backendError, setBackendError] = useState(null);

  const hydrateUserState = useCallback(
    async (user) => {
      if (!user?.userId || !isGasEnvironment()) return;
      try {
        setBackendError(null);
        const remote = await runGasFn("getUserState", { userId: user.userId });
        if (!remote || !remote.success || !remote.state) return;

        const localStats = StorageService.getGameStats();
        const remoteStats = remote.state.gameStats || {};
        const mergedStats = { ...localStats };
        Object.keys({ ...localStats, ...remoteStats }).forEach((k) => {
          mergedStats[k] = Math.max(
            Number(localStats[k] || 0),
            Number(remoteStats[k] || 0)
          );
        });

        const mergedThemes = Array.from(
          new Set([
            ...StorageService.getUnlockedThemes(),
            ...(remote.state.unlockedThemes || []),
          ])
        );
        const mergedPacks = Array.from(
          new Set([
            ...StorageService.getUnlockedSoundPacks(),
            ...(remote.state.unlockedSoundPacks || []),
          ])
        );

        // Re-evaluate unlocks based on merged stats so admin-edited stats unlock content immediately
        const newlyUnlockedThemes =
          UnlockService.checkThemeUnlocks(mergedStats);
        const newlyUnlockedPacks =
          UnlockService.checkSoundPackUnlocks(mergedStats);
        const finalThemes = Array.from(
          new Set([...mergedThemes, ...newlyUnlockedThemes])
        );
        const finalPacks = Array.from(
          new Set([...mergedPacks, ...newlyUnlockedPacks])
        );

        const currentActiveTheme = themeTouchedRef.current
          ? activeThemeId
          : StorageService.getActiveTheme();
        const currentActivePack = soundPackTouchedRef.current
          ? activeSoundPackId
          : StorageService.getActiveSoundPack();

        // Ensure remote values are strings, not arrays or other invalid types
        const remoteActiveTheme =
          typeof remote.state.activeTheme === "string" &&
          remote.state.activeTheme.trim()
            ? sanitizeThemeId(remote.state.activeTheme.trim())
            : null;
        const remoteActivePack =
          typeof remote.state.activeSoundPack === "string" &&
          remote.state.activeSoundPack.trim()
            ? sanitizeSoundPackId(remote.state.activeSoundPack.trim())
            : null;

        const activeTheme = themeTouchedRef.current
          ? currentActiveTheme
          : remoteActiveTheme || currentActiveTheme;
        const activePack = soundPackTouchedRef.current
          ? currentActivePack
          : remoteActivePack || currentActivePack;

        StorageService.saveUnlockedThemes(finalThemes);
        setUnlockedThemes(finalThemes);
        StorageService.saveUnlockedSoundPacks(finalPacks);
        setUnlockedSoundPacks(finalPacks);
        if (!themeTouchedRef.current) {
          const finalTheme = sanitizeThemeId(activeTheme);
          StorageService.saveActiveTheme(finalTheme);
          setActiveThemeId(finalTheme);
        }
        if (!soundPackTouchedRef.current) {
          const finalPack = sanitizeSoundPackId(activePack);
          StorageService.saveActiveSoundPack(finalPack);
          setActiveSoundPackId(finalPack);
        }
        StorageService.saveGameStats(mergedStats);

        await persistUserStateToBackend({
          unlockedThemes: finalThemes,
          unlockedSoundPacks: finalPacks,
          activeTheme,
          activeSoundPack: activePack,
          gameStats: mergedStats,
        });
      } catch (err) {
        console.error("Failed to hydrate user state:", err);
      }
    },
    [persistUserStateToBackend]
  );

  useEffect(() => {
    const handleError = (event) => logError(event.message, event.error);
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  useEffect(() => {
    StorageService.saveUserStatus(userStatus);
  }, [userStatus]);

  useEffect(() => {
    if (!showEmojiPicker) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape") setShowEmojiPicker(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showEmojiPicker]);

  useEffect(() => {
    const handleGlobalChatClose = (e) => {
      if (e.key === "Escape" && isChatOpen) {
        closeChat();
      }
    };
    window.addEventListener("keydown", handleGlobalChatClose);
    return () => window.removeEventListener("keydown", handleGlobalChatClose);
  }, [isChatOpen, closeChat]);

  useEffect(
    () => () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    },
    []
  );

  useEffect(() => {
    SoundManager.setPack(activeSoundPackId);
  }, [activeSoundPackId]);

  useEffect(() => {
    if (!unlockedSoundPacks.includes(activeSoundPackId)) {
      const fallback = unlockedSoundPacks.includes("classic")
        ? "classic"
        : unlockedSoundPacks[0] || "classic";
      setActiveSoundPackId(fallback);
      SoundManager.setPack(fallback);
    }
  }, [unlockedSoundPacks, activeSoundPackId]);

  useEffect(() => {
    if (appUserSession) {
      hydrateUserState(appUserSession);
    }
  }, [appUserSession, hydrateUserState]);

  // Periodically refresh user state so admin edits propagate without a reload
  useEffect(() => {
    if (!appUserSession || !isGasEnvironment()) return undefined;

    const refresh = () => hydrateUserState(appUserSession);
    const interval = setInterval(refresh, 30000); // 30s balance freshness vs. load

    // Also refresh when tab gains focus to catch up immediately
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [appUserSession, hydrateUserState]);

  useEffect(() => {
    // Initialize dark mode BEFORE first render to prevent flash
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const savedSound = localStorage.getItem(KEYS.SOUND_ENABLED);

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      // If the active theme is 'midnight' we still force dark mode here
      const initialTheme = StorageService.getActiveTheme();
      if (initialTheme === "midnight") {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setDarkMode(false);
        document.documentElement.classList.remove("dark");
      }
    }
    if (savedSound === "false") setSoundEnabled(false);

    // Load saved game
    try {
      const saved = StorageService.loadGame();
      if (saved && saved.status === "playing") {
        setBoard(saved.board);
        setTimer(saved.timer);
        setMistakes(saved.mistakes);
        setDifficulty(saved.difficulty);
        setStatus("paused");
        setHistory(saved.history || [saved.board]);
        setMode(saved.mode || "pen");
        // Restore initialFilledCount or recalculate from fixed cells
        setInitialFilledCount(
          saved.initialFilledCount ||
            saved.board.filter((c) => c.isFixed).length
        );
        setView("game");
      }
    } catch (err) {
      console.error("Failed to load saved game:", err);
      // Clear corrupted save
      StorageService.clearSavedGame();
    }

    setIsHydrating(false);
  }, []);

  // Ensure dark mode is enabled when Midnight theme is active
  useEffect(() => {
    if (activeThemeId === "midnight") {
      if (!darkMode) {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
        try {
          localStorage.setItem("theme", "dark");
        } catch (e) {}
      }
    }
  }, [activeThemeId]);

  useEffect(() => {
    // Pause timer when status is not 'playing' OR when modals are open
    const shouldPause =
      status !== "playing" ||
      showModal !== "none" ||
      showKeyboardHelp ||
      showUserPanel ||
      showAwardsZone;

    if (status === "playing" && !shouldPause) {
      timerRef.current = window.setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, showModal, showKeyboardHelp, showUserPanel, showAwardsZone]);

  useEffect(() => {
    if (status === "playing" || status === "paused") {
      StorageService.saveGame({
        board,
        difficulty,
        status,
        timer,
        mistakes,
        history,
        historyIndex: history.length - 1,
        selectedCell,
        mode,
        initialFilledCount,
      });
    }
  }, [
    board,
    timer,
    status,
    difficulty,
    mistakes,
    history,
    selectedCell,
    mode,
    initialFilledCount,
  ]);

  useEffect(() => {
    // Only poll chat when backend is configured
    if (!isGasEnvironment()) return;

    let interval;
    const fetchChat = async () => {
      if (isSendingRef.current) return;
      const msgs = await getChatMessages();
      if (!isSendingRef.current && Array.isArray(msgs) && msgs.length > 0) {
        setChatMessages((prev) => {
          if (prev.length > 0 && msgs.length > prev.length) {
            const lastMsg = msgs[msgs.length - 1];
            if (
              !isChatOpen &&
              lastMsg.sender !== StorageService.getCurrentUserId()
            ) {
              setChatNotification(lastMsg);
              if (soundEnabled) SoundManager.play("chat");
              setTimeout(() => setChatNotification(null), 4000);
            }
          }
          return msgs;
        });

        // Pre-cache profiles for recent chat users (background task)
        const recentUsers = [
          ...new Set(msgs.slice(-20).map((m) => m.sender)),
        ].filter((u) => u !== userId);
        recentUsers.forEach(async (username) => {
          const cached = profileCacheRef.current.get(username);
          if (!cached || Date.now() - cached.timestamp > 5 * 60 * 1000) {
            try {
              const result = await runGasFn("getUserProfile", {
                userId: username,
              });
              if (result && result.success) {
                profileCacheRef.current.set(username, {
                  data: result.user,
                  timestamp: Date.now(),
                });
              }
            } catch (err) {
              // Silently fail pre-caching
            }
          }
        });
      }
    };
    fetchChat();
    interval = setInterval(fetchChat, GAME_SETTINGS.CHAT_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isChatOpen, soundEnabled, userId]);

  useEffect(() => {
    if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  const toggleDarkMode = () => {
    if (soundEnabled) SoundManager.play("toggle");
    setDarkMode((prev) => {
      const newVal = !prev;
      if (newVal) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newVal;
    });
  };

  const toggleSound = () => {
    if (!soundEnabled) SoundManager.play("toggle");
    setSoundEnabled((prev) => {
      const newVal = !prev;
      localStorage.setItem(KEYS.SOUND_ENABLED, String(newVal));
      return newVal;
    });
  };

  const togglePause = () => {
    if (soundEnabled) SoundManager.play("uiTap");
    setStatus((prev) => (prev === "playing" ? "paused" : "playing"));
  };

  const handleHint = () => {
    if (selectedCell === null || status !== "playing" || !board.length) return;
    const currentCell = board[selectedCell];
    if (!currentCell || currentCell.isFixed || currentCell.value !== null)
      return;

    // Don't give hint if cell already has correct value
    if (currentCell.value === currentCell.solution) return;

    if (soundEnabled) SoundManager.play("write");
    const newBoard = JSON.parse(JSON.stringify(board));
    const target = newBoard[selectedCell];
    target.value = target.solution;
    target.isHinted = true;
    target.notes = [];

    setHistory((prev) => [...prev.slice(-10), newBoard]);
    setBoard(newBoard);

    if (newBoard.every((c) => c.value === c.solution)) {
      if (soundEnabled) SoundManager.play("success");
      console.log("Detected win: all cells correct", {
        selectedCell,
        mistakes,
        timer,
      });
      setStatus("won");
      StorageService.clearSavedGame();
      handleWin(newBoard, mistakes, timer);
    }
  };

  const handleQuickRestart = () => {
    if (soundEnabled) SoundManager.play("uiTap");
    setShowRestartConfirm(true);
  };

  const confirmRestart = () => {
    if (soundEnabled) SoundManager.play("startGame");
    const initialBoard = history[0];
    if (initialBoard) {
      setBoard(JSON.parse(JSON.stringify(initialBoard)));
      setTimer(0);
      setMistakes(0);
      setHistory([initialBoard]);
      setSelectedCell(null);
      setMode("pen"); // Reset to pen mode on restart
      setStatus("playing");
    }
    setShowRestartConfirm(false);
  };

  const startNewGame = async (diff, practiceMode = false) => {
    if (soundEnabled) SoundManager.init();
    setLoading(true);
    try {
      let newBoard = null;
      let retries = 0;
      const maxRetries = 3;

      // Try GAS backend with retries
      while (!newBoard && retries < maxRetries) {
        try {
          newBoard = await runGasFn("generateSudoku", diff);

          // Validate the board structure
          if (newBoard && Array.isArray(newBoard) && newBoard.length === 81) {
            // Check if board has the required properties
            const isValid = newBoard.every(
              (cell) =>
                cell &&
                typeof cell.id === "number" &&
                typeof cell.row === "number" &&
                typeof cell.col === "number"
            );

            if (!isValid) {
              console.warn("Invalid board structure received from GAS");
              newBoard = null;
            }
          } else {
            newBoard = null;
          }
        } catch (err) {
          console.warn(`GAS generation attempt ${retries + 1} failed:`, err);
          newBoard = null;
        }

        if (!newBoard) {
          retries++;
          if (retries < maxRetries) {
            // Wait a bit before retrying
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }

      if (!newBoard) {
        console.warn(
          "GAS generation failed after retries, falling back to local generator"
        );
        // Fallback to local generator
        newBoard = generateLocalBoard(diff);
      }

      // Final validation
      if (!newBoard || !Array.isArray(newBoard) || newBoard.length !== 81) {
        throw new Error("Failed to generate a valid board");
      }

      // Count initially filled cells (pre-filled by the puzzle)
      const filledCount = newBoard.filter((c) => c.value !== null).length;
      setInitialFilledCount(filledCount);

      setBoard(newBoard);
      setDifficulty(diff);
      setStatus("playing");
      setTimer(0);
      setMistakes(0);
      setHistory([newBoard]);
      setSelectedCell(null);
      setShowModal("none");
      setView("game");
      // Set practice mode only after successful board generation
      setIsPracticeMode(practiceMode);
    } catch (e) {
      console.error("Failed to start game:", e);
      alert("Failed to start game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNumberInput = useCallback(
    (num) => {
      // Validate input is a number between 1-9
      if (typeof num !== "number" || num < 1 || num > 9) return;

      if (selectedCell === null || status !== "playing" || !board.length)
        return;
      const currentCell = board[selectedCell];
      if (!currentCell || currentCell.isFixed) return;

      const newBoard = JSON.parse(JSON.stringify(board));
      const target = newBoard[selectedCell];

      if (mode === "pen") {
        if (target.value === num) return;
        target.value = num;
        if (num !== target.solution) {
          // Play error sound and mark cell as error
          if (soundEnabled) SoundManager.play("error");
          target.isError = true;

          // Handle mistake counting (only in normal mode)
          if (!isPracticeMode) {
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            if (newMistakes >= 3) {
              // Edge case: if the board happens to be complete (all correct) at the same time,
              // treat it as a win rather than a loss. This prevents rare race/logic issues where
              // a final move could trigger both an increment and a completion check in different
              // contexts.
              if (newBoard.every((c) => c.value === c.solution)) {
                console.warn(
                  "Edge-case: mistakes reached 3 but board is complete; preferring win",
                  {
                    newMistakes,
                    selectedCell,
                  }
                );
                setBoard(newBoard);
                setStatus("won");
                StorageService.clearSavedGame();
                handleWin(newBoard, newMistakes, timer);
                return;
              }

              console.warn("Game lost: reached maximum mistakes", {
                newMistakes,
                selectedCell,
              });

              setBoard(newBoard);
              setStatus("lost");
              StorageService.clearSavedGame();

              // Increment games played in backend if authenticated (on loss)
              if (isUserAuthenticated() && isGasEnvironment()) {
                const session = StorageService.getUserSession();
                if (session && session.userId) {
                  try {
                    const updateData = {
                      userId: session.userId,
                      incrementGames: true,
                      // Do NOT incrementWins on loss
                      difficulty: difficulty,
                    };
                    // Use robust wrapper to handle transient errors
                    if (typeof window.robustRunGasFn === "function") {
                      window
                        .robustRunGasFn("updateUserProfile", updateData, {
                          retries: 2,
                          backoff: 250,
                        })
                        .catch((err) =>
                          console.error(
                            "Failed to update user stats (loss):",
                            err
                          )
                        );
                    } else {
                      runGasFn && runGasFn("updateUserProfile", updateData);
                    }
                  } catch (err) {
                    console.error("Failed to update user stats (loss):", err);
                  }
                }
              }

              return;
            }
          }

          // Clear error feedback after delay
          const errorCellIndex = selectedCell;
          setTimeout(() => {
            setBoard((prev) => {
              const b = [...prev];
              if (b[errorCellIndex]) {
                b[errorCellIndex] = {
                  ...b[errorCellIndex],
                  isError: false,
                  // In normal mode, also clear the value; in practice mode, keep it
                  value: isPracticeMode ? b[errorCellIndex].value : null,
                };
              }
              return b;
            });
          }, 500);
        } else {
          if (soundEnabled) SoundManager.play("write");
          target.isError = false;
          target.notes = [];
        }
      } else {
        if (soundEnabled) SoundManager.play("pencil");
        if (target.notes.includes(num))
          target.notes = target.notes.filter((n) => n !== num);
        else {
          target.notes.push(num);
          target.notes.sort();
        }
      }

      setHistory((prev) => [...prev.slice(-10), newBoard]);
      setBoard(newBoard);

      if (mode === "pen" && newBoard.every((c) => c.value === c.solution)) {
        if (soundEnabled) SoundManager.play("success");
        setStatus("won");
        StorageService.clearSavedGame();
        handleWin(newBoard, mistakes, timer);
      }
    },
    [
      board,
      selectedCell,
      status,
      mode,
      mistakes,
      soundEnabled,
      timer,
      isPracticeMode,
    ]
  );

  const handleWin = async (finalBoard, finalMistakes, finalTime) => {
    try {
      console.log("handleWin:", {
        difficulty,
        finalMistakes,
        finalTime,
        userId:
          StorageService.getCurrentUserId && StorageService.getCurrentUserId(),
        gas: isGasEnvironment && isGasEnvironment(),
      });

      // Save to leaderboard (best-effort)
      try {
        await saveScore({
          name: StorageService.getCurrentUserId(),
          time: finalTime,
          difficulty,
          date: new Date().toLocaleDateString(),
        });
      } catch (e) {
        console.error("Failed to save leaderboard score:", e);
      }

      // Update game stats for theme unlocking
      const stats = StorageService.getGameStats();
      stats.totalWins = Number(stats.totalWins || 0) + 1;
      if (difficulty === "Easy")
        stats.easyWins = Number(stats.easyWins || 0) + 1;
      if (difficulty === "Medium")
        stats.mediumWins = Number(stats.mediumWins || 0) + 1;
      if (difficulty === "Hard")
        stats.hardWins = Number(stats.hardWins || 0) + 1;
      if (finalMistakes === 0)
        stats.perfectWins = Number(stats.perfectWins || 0) + 1;
      if (finalTime <= 180) stats.fastWins = Number(stats.fastWins || 0) + 1; // 3 minutes or less = fast win
      StorageService.saveGameStats(stats);

      // Check for theme unlocks
      try {
        const newThemes = UnlockService.checkThemeUnlocks(stats);
        if (newThemes.length > 0) {
          setNewlyUnlockedThemes(newThemes);
          setUnlockedThemes(StorageService.getUnlockedThemes()); // Update state with newly unlocked themes
          setShowUnlockNotification(true); // Show notification
          if (soundEnabled) setTimeout(() => SoundManager.play("unlock"), 250);
        }

        // Check for sound pack unlocks
        const newPacks = UnlockService.checkSoundPackUnlocks(stats);
        if (newPacks.length > 0) {
          setNewlyUnlockedSoundPacks(newPacks);
          setUnlockedSoundPacks(StorageService.getUnlockedSoundPacks());
          setShowUnlockNotification(true); // Show notification
          if (soundEnabled) setTimeout(() => SoundManager.play("unlock"), 250);
        }
      } catch (e) {
        console.error("Unlock check failed:", e);
      }

      // Check for badge awards
      try {
        const newBadges = BadgeService.checkAndAwardBadges(stats, {
          currentTime: new Date(),
          chatMessageCount: chatMessages.length,
        });
        if (newBadges.length > 0) {
          setNewlyAwardedBadges(newBadges);
          if (soundEnabled)
            setTimeout(() => SoundManager.play("chestOpen"), 300);
        }
      } catch (e) {
        console.error("Badge check failed:", e);
      }

      // Update user stats if authenticated
      if (isUserAuthenticated() && isGasEnvironment()) {
        const session = StorageService.getUserSession();
        if (session && session.userId) {
          try {
            // Prepare win metadata for backend tracking
            const updateData = {
              userId: session.userId, // Backend requires userId for lookups
              incrementGames: true,
              incrementWins: true,
              difficulty: difficulty, // Track which difficulty was won
              perfectWin: finalMistakes === 0, // Perfect win if no mistakes
              fastWin: finalTime <= 180, // Fast win if 3 minutes or less
            };

            // Use robustRunGasFn to reduce impact of transient failures
            if (typeof window.robustRunGasFn === "function") {
              await window.robustRunGasFn("updateUserProfile", updateData, {
                retries: 2,
                backoff: 300,
              });
              // Refresh user profile to get updated stats
              const updatedProfile = await window.robustRunGasFn(
                "getUserProfile",
                { userId: session.userId },
                { retries: 2, backoff: 300 }
              );
              if (updatedProfile && updatedProfile.success) {
                // Update both global storage and component state for consistency
                StorageService.setUserSession(updatedProfile.user);
                setAppUserSession(updatedProfile.user);
              }

              try {
                await window.robustRunGasFn(
                  "saveUserState",
                  {
                    userId: session.userId,
                    unlockedThemes: StorageService.getUnlockedThemes(),
                    unlockedSoundPacks: StorageService.getUnlockedSoundPacks(),
                    activeTheme: activeThemeId,
                    activeSoundPack: activeSoundPackId,
                    gameStats: stats,
                  },
                  { retries: 2, backoff: 300 }
                );
              } catch (e) {
                console.error("Failed to persist user state to backend:", e);
              }
            } else {
              await runGasFn("updateUserProfile", updateData);
              const updatedProfile = await runGasFn("getUserProfile", {
                userId: session.userId,
              });
              if (updatedProfile && updatedProfile.success) {
                StorageService.setUserSession(updatedProfile.user);
                setAppUserSession(updatedProfile.user);
              }

              await persistUserStateToBackend({
                unlockedThemes: StorageService.getUnlockedThemes(),
                unlockedSoundPacks: StorageService.getUnlockedSoundPacks(),
                activeTheme: activeThemeId,
                activeSoundPack: activeSoundPackId,
                gameStats: stats,
              });
            }

            // Sync badges with backend
            await BadgeService.syncBadgesWithBackend();
          } catch (err) {
            console.error("Failed to update user stats:", err);
          }
        }
      }
    } catch (err) {
      console.error("handleWin error:", err);

      // Show user-friendly notification
      try {
        if (soundEnabled) SoundManager.play("error");
        const notif = document.createElement("div");
        notif.className =
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-900 text-white px-6 py-4 rounded-lg shadow-2xl z-50 border-2 border-red-500 animate-bounce max-w-md";
        notif.innerHTML = `<div class="text-center"><div class="text-xl font-bold mb-2">⚠️ Win processing failed</div><div class="text-sm">Something went wrong while saving your win. Your progress is preserved locally. See console for details.</div></div>`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 5000);
      } catch (e) {
        console.error("Failed to show notification:", e);
      }
    }
  };

  const handleUndo = () => {
    if (history.length > 1) {
      if (soundEnabled) SoundManager.play("undo");
      const newHistory = [...history];
      newHistory.pop();
      setBoard(newHistory[newHistory.length - 1]);
      setHistory(newHistory);
    }
  };

  const handleEmojiInsert = (emoji) => {
    if (soundEnabled) SoundManager.play("uiTap");
    setChatInput((prev) => `${prev}${emoji}`);
  };

  const handleChatSend = async (text) => {
    const txt = (text || "").trim();
    if (!txt || txt.length === 0) return; // Don't send empty messages

    if (soundEnabled) SoundManager.play("uiTap");
    setChatInput("");
    const currentUserId = StorageService.getCurrentUserId();
    const msg = {
      id: Date.now().toString(),
      sender: currentUserId,
      text: txt,
      timestamp: Date.now(),
      status: (userStatus || "").slice(0, 50),
    };
    setChatMessages((prev) => [...prev, msg]);
    isSendingRef.current = true;

    try {
      const updated = await postChatMessage(msg);
      if (updated && Array.isArray(updated)) setChatMessages(updated);
    } catch (error) {
      // Handle ban/mute errors with friendly notifications
      if (error.message.startsWith("BANNED:")) {
        // Show animated notification
        const notif = document.createElement("div");
        notif.className =
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-900 text-white px-6 py-4 rounded-lg shadow-2xl z-50 border-2 border-red-500 animate-bounce max-w-md";
        notif.innerHTML =
          '<div class="text-center"><div class="text-xl font-bold mb-2">🚫 Chat Blocked</div><div class="text-sm">You have been banned from chat and cannot send messages. Contact an administrator if you believe this is in error.</div></div>';
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 5000);

        // Remove the pending message
        setChatMessages((prev) => prev.filter((m) => m.id !== msg.id));
        if (soundEnabled) SoundManager.play("error");
      } else if (error.message.startsWith("MUTED:")) {
        const match = error.message.match(/(\d+) more minute/);
        const minutes = match ? match[1] : "several";

        // Show animated notification
        const notif = document.createElement("div");
        notif.className =
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-900 text-white px-6 py-4 rounded-lg shadow-2xl z-50 border-2 border-yellow-600 animate-pulse max-w-md";
        notif.innerHTML = `<div class="text-center"><div class="text-xl font-bold mb-2">🔇 Temporarily Muted</div><div class="text-sm">You are muted for ${minutes} more minute(s). You can still play and see messages.</div></div>`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 5000);

        // Remove the pending message
        setChatMessages((prev) => prev.filter((m) => m.id !== msg.id));
        if (soundEnabled) SoundManager.play("error");
      } else {
        console.error("Failed to send chat message:", error);
      }
    }

    isSendingRef.current = false;
  };

  const handleUserPanelClose = (updatedUser) => {
    if (updatedUser) {
      // Update both global storage and component state for consistency
      if (typeof StorageService !== "undefined") {
        StorageService.setUserSession(updatedUser);
      }
      setAppUserSession(updatedUser);
    } else {
      // Explicit logout path
      if (typeof StorageService !== "undefined") {
        StorageService.clearUserSession();
        setUnlockedThemes(StorageService.getUnlockedThemes());
        setUnlockedSoundPacks(StorageService.getUnlockedSoundPacks());
        setActiveThemeId(sanitizeThemeId(StorageService.getActiveTheme()));
        setActiveSoundPackId(
          sanitizeSoundPackId(StorageService.getActiveSoundPack())
        );
      } else {
        setUnlockedThemes(["default"]);
        setUnlockedSoundPacks(["classic"]);
        setActiveThemeId("default");
        setActiveSoundPackId("classic");
      }
      setAppUserSession(null);
      setNewlyUnlockedThemes([]);
      setNewlyUnlockedSoundPacks([]);
      setNewlyAwardedBadges([]);
      profileCacheRef.current.clear();
      setBackendError(null);
      setViewingProfile(null);
      setUserStatus(StorageService.getUserStatus());
    }
    setShowUserPanel(false);
  };

  // Handle viewing another user's profile from chat
  const handleViewProfile = async (username) => {
    if (!username || !isGasEnvironment()) return;

    setProfileLoading(true);
    if (soundEnabled) SoundManager.play("uiTap");

    try {
      // Check cache first
      const now = Date.now();
      const cached = profileCacheRef.current.get(username);
      if (cached && now - cached.timestamp < 5 * 60 * 1000) {
        setViewingProfile(cached.data);
        setProfileLoading(false);
        return;
      }

      // Get user profile from backend using username as userId (they're the same in the system)
      const result = await runGasFn("getUserProfile", { userId: username });
      if (result && result.success) {
        // Cache the result
        profileCacheRef.current.set(username, {
          data: result.user,
          timestamp: now,
        });
        setViewingProfile(result.user);
      } else {
        console.error("Failed to load profile:", result?.error);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle hover profile preview
  const handleProfileHoverStart = async (username, event) => {
    if (!username || username === userId || !isGasEnvironment()) return;

    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set position based on mouse/touch
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverProfilePos({ x: rect.left, y: rect.bottom + 5 });

    // Check cache first (cache expires after 5 minutes)
    const now = Date.now();
    const cached = profileCacheRef.current.get(username);
    if (cached && now - cached.timestamp < 5 * 60 * 1000) {
      // Show cached profile immediately
      setHoverProfile(cached.data);
      return;
    }

    // Wait 300ms before fetching (reduced from 500ms)
    hoverTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await runGasFn("getUserProfile", { userId: username });
        if (result && result.success) {
          // Cache the result
          profileCacheRef.current.set(username, {
            data: result.user,
            timestamp: now,
          });
          setHoverProfile(result.user);
        }
      } catch (err) {
        console.error("Error loading hover profile:", err);
      }
    }, 300);
  };

  const handleProfileHoverEnd = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoverProfile(null);
  };

  const handleCloseViewProfile = () => {
    setViewingProfile(null);
    if (soundEnabled) SoundManager.play("uiTap");
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === "playing") {
        setStatus("paused");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === "Escape" && showKeyboardHelp) {
        setShowKeyboardHelp(false);
        return;
      }
      if (
        (e.key === "?" || e.key === "/") &&
        !showKeyboardHelp &&
        view === "game"
      ) {
        e.preventDefault();
        setShowKeyboardHelp(true);
        return;
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [showKeyboardHelp, view]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't process game shortcuts when chat input is focused
      if (isChatInputFocused) return;
      if (status !== "playing" || showKeyboardHelp) return;
      if (e.key >= "1" && e.key <= "9") handleNumberInput(parseInt(e.key));
      else if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedCell !== null && !board[selectedCell].isFixed) {
          if (soundEnabled) SoundManager.play("erase");
          const newBoard = [...board];
          newBoard[selectedCell] = {
            ...newBoard[selectedCell],
            value: null,
            notes: [],
          };
          setHistory((prev) => [...prev.slice(-10), newBoard]);
          setBoard(newBoard);
        }
      } else if (e.key === "n" || e.key === "N") {
        if (soundEnabled) SoundManager.play("pencil");
        setMode((prev) => (prev === "pen" ? "pencil" : "pen"));
      } else if (e.key === "z" || e.key === "Z") {
        handleUndo();
      } else if (e.key === "h" || e.key === "H" || e.key === "?") {
        handleHint();
      } else if (e.key === "p" || e.key === "P" || e.key === " ") {
        e.preventDefault();
        togglePause();
      } else if (e.key === "r" || e.key === "R") {
        handleQuickRestart();
      } else if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        if (selectedCell === null) {
          if (soundEnabled) SoundManager.play("select");
          setSelectedCell(0);
          return;
        }
        if (soundEnabled) SoundManager.play("select");
        const row = Math.floor(selectedCell / 9);
        const col = selectedCell % 9;
        let nextRow = row,
          nextCol = col;

        if (e.key === "ArrowRight") nextCol = Math.min(8, col + 1);
        if (e.key === "ArrowLeft") nextCol = Math.max(0, col - 1);
        if (e.key === "ArrowDown") nextRow = Math.min(8, row + 1);
        if (e.key === "ArrowUp") nextRow = Math.max(0, row - 1);

        setSelectedCell(nextRow * 9 + nextCol);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedCell,
    status,
    board,
    mode,
    handleNumberInput,
    soundEnabled,
    isChatInputFocused,
  ]);

  const getRemainingNumbers = () => {
    const counts = Array(10).fill(9);
    board.forEach((c) => {
      if (c.value) counts[c.value]--;
    });
    return counts;
  };

  const getConflictingCells = useCallback(
    (cellId) => {
      if (!showConflicts || cellId === null) return new Set();
      const cell = board[cellId];
      if (!cell || !cell.value) return new Set();

      // Don't show conflicts for fixed cells (they're always correct)
      if (cell.isFixed) return new Set();

      const conflicts = new Set();
      const row = cell.row;
      const col = cell.col;
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;

      board.forEach((c, idx) => {
        if (idx === cellId || !c.value || c.value !== cell.value) return;
        // Only show conflicts with user-entered values, not fixed cells
        if (c.isFixed) return;
        if (
          c.row === row ||
          c.col === col ||
          (c.row >= boxRow &&
            c.row < boxRow + 3 &&
            c.col >= boxCol &&
            c.col < boxCol + 3)
        ) {
          conflicts.add(idx);
        }
      });

      return conflicts;
    },
    [board, showConflicts]
  );

  const getProgressPercentage = () => {
    const currentFilled = board.filter((c) => c.value !== null).length;
    const userFilled = currentFilled - initialFilledCount;
    const totalToFill = 81 - initialFilledCount;
    // Defensive programming: handle edge case of invalid board state or fully pre-filled puzzle
    if (totalToFill <= 0) return 100;
    return Math.round((userFilled / totalToFill) * 100);
  };

  const completedBoxes = useMemo(() => {
    const completed = [];
    const boxCells = Array.from({ length: 9 }, () => []);

    // Single pass: group cells by box
    board.forEach((c) => {
      const boxIndex = Math.floor(c.row / 3) * 3 + Math.floor(c.col / 3);
      boxCells[boxIndex].push(c);
    });

    // Check each box for completion
    boxCells.forEach((cells, boxIndex) => {
      if (cells.length !== 9) return;
      const values = cells.map((c) => c.value).filter((v) => v !== null);
      if (values.length === 9 && new Set(values).size === 9) {
        completed.push(boxIndex);
      }
    });

    return completed;
  }, [board]);

  const handleOpenLeaderboard = async () => {
    if (soundEnabled) SoundManager.play("uiTap");
    setLeaderboard(await getLeaderboard());
    setShowModal("leaderboard");
  };

  const handleThemeChange = (themeId, { persist = true } = {}) => {
    // Validate themeId is a string
    if (typeof themeId !== "string" || !themeId.trim()) return;
    const validThemeId = themeId.trim();
    if (validThemeId === activeThemeId) return;
    themeTouchedRef.current = true;
    setActiveThemeId(validThemeId);

    // If selecting the Midnight visual theme, ensure dark mode is enabled
    if (validThemeId === "midnight") {
      // Save prior theme to restore it later if needed
      try {
        const prev = localStorage.getItem("theme") || "";
        localStorage.setItem("theme_prev_before_midnight", prev);
        localStorage.setItem("theme_forced_by_midnight", "1");
        localStorage.setItem("theme", "dark");
      } catch (e) {
        /* ignore localStorage errors */
      }
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      // If switching away from midnight and we previously forced dark, restore previous theme
      try {
        const forced = localStorage.getItem("theme_forced_by_midnight");
        if (forced === "1") {
          const prev = localStorage.getItem("theme_prev_before_midnight");
          if (prev && prev !== "") {
            // restore the previous explicit theme value
            if (prev === "dark") {
              setDarkMode(true);
              document.documentElement.classList.add("dark");
              localStorage.setItem("theme", "dark");
            } else {
              setDarkMode(false);
              document.documentElement.classList.remove("dark");
              try {
                localStorage.removeItem("theme");
              } catch (e) {}
            }
          } else {
            // No previous theme recorded: turn dark mode off
            setDarkMode(false);
            document.documentElement.classList.remove("dark");
            try {
              localStorage.removeItem("theme");
            } catch (e) {}
          }
          // clear forced flags
          try {
            localStorage.removeItem("theme_forced_by_midnight");
            localStorage.removeItem("theme_prev_before_midnight");
          } catch (e) {}
        }
      } catch (e) {
        /* ignore localStorage errors */
      }
    }

    if (!persist) {
      setPendingActiveThemeId(validThemeId);
      setAwardsDirty(true);
      return;
    }
    StorageService.saveActiveTheme(validThemeId);
    schedulePersist({ activeTheme: validThemeId });
  };

  const handleSoundPackChange = (packId, { persist = true } = {}) => {
    // Validate packId is a string
    if (typeof packId !== "string" || !packId.trim()) return;
    const validPackId = packId.trim();
    if (validPackId === activeSoundPackId) return;
    soundPackTouchedRef.current = true;
    setActiveSoundPackId(validPackId);
    SoundManager.setPack(validPackId);
    if (!persist) {
      setPendingActiveSoundPackId(validPackId);
      setAwardsDirty(true);
      return;
    }
    StorageService.saveActiveSoundPack(validPackId);
    schedulePersist({ activeSoundPack: validPackId });
  };

  const handleAwardsClose = () => {
    setShowAwardsZone(false);
    if (!awardsDirty) return;

    const finalTheme = pendingActiveThemeId || activeThemeId;
    const finalPack = pendingActiveSoundPackId || activeSoundPackId;

    StorageService.saveActiveTheme(finalTheme);
    StorageService.saveActiveSoundPack(finalPack);
    schedulePersist({ activeTheme: finalTheme, activeSoundPack: finalPack });
    setAwardsDirty(false);
  };

  const handleChatTouchStart = (e) => {
    const touch = e.touches[0];
    chatTouchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    chatTouchLastRef.current = chatTouchStartRef.current;
  };

  const handleChatTouchMove = (e) => {
    const touch = e.touches[0];
    chatTouchLastRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleChatTouchEnd = () => {
    const start = chatTouchStartRef.current;
    const last = chatTouchLastRef.current;
    chatTouchStartRef.current = null;
    chatTouchLastRef.current = null;
    if (!start || !last) return;
    const deltaY = last.y - start.y;
    const deltaX = last.x - start.x;
    const elapsed = last.time - start.time;
    if (deltaY > 70 && Math.abs(deltaX) < 80 && elapsed < 800) {
      closeChat();
    }
  };

  const toggleChat = () => {
    if (isChatOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  const renderModal = () => {
    if (showModal === "none") return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md animate-pop relative">
          <button
            onClick={() => setShowModal("none")}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
          {showModal === "leaderboard" && (
            <div>
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
                  <span>🏆</span> Global Leaderboard
                </h2>
              </div>
              <div className="max-h-[60vh] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin">
                <table className="w-full text-xs sm:text-sm text-left text-gray-600 dark:text-gray-300">
                  <thead className="text-[10px] sm:text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-2 sm:px-3 py-2 sm:py-3">Rank</th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3">User</th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3">Time</th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3">Diff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {leaderboard.map((entry, i) => {
                      let rankIcon = (
                        <span className="text-gray-400 font-mono text-[10px] sm:text-xs">
                          #{i + 1}
                        </span>
                      );
                      let rowClass = "";
                      if (i === 0) {
                        rankIcon = "🥇";
                        rowClass =
                          "bg-yellow-50 dark:bg-yellow-900/10 font-bold text-yellow-700 dark:text-yellow-400";
                      } else if (i === 1) {
                        rankIcon = "🥈";
                        rowClass =
                          "bg-gray-50 dark:bg-gray-800/50 font-semibold";
                      } else if (i === 2) {
                        rankIcon = "🥉";
                        rowClass =
                          "bg-orange-50 dark:bg-orange-900/10 font-semibold";
                      }
                      return (
                        <tr
                          key={i}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${rowClass}`}
                        >
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-center">
                            {rankIcon}
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 truncate max-w-[80px] sm:max-w-[120px]">
                            {entry.name}
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 font-mono text-[10px] sm:text-xs">
                            {Math.floor(entry.time / 60)}:
                            {(entry.time % 60).toString().padStart(2, "0")}
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3">
                            <span
                              className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border ${
                                entry.difficulty === "Hard"
                                  ? "border-red-200 text-red-600 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-900/30"
                                  : entry.difficulty === "Medium"
                                  ? "border-yellow-200 text-yellow-600 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-900/30"
                                  : "border-green-200 text-green-600 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-900/30"
                              }`}
                            >
                              {entry.difficulty}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-6 sm:p-8 text-center text-gray-400 text-xs sm:text-sm"
                        >
                          No records yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const remaining = getRemainingNumbers();
  const userId = StorageService.getCurrentUserId();

  // Compute active theme asset set (must be before any conditional returns)
  const activeAssetSet = useMemo(() => {
    // Safety check: ensure getThemeAssetSet is loaded before calling
    if (typeof getThemeAssetSet === "function") {
      return getThemeAssetSet(activeThemeId, activeSoundPackId);
    }
    // Fallback: return basic theme directly from THEMES
    const theme = THEMES[activeThemeId] || THEMES.default;
    return {
      background: theme.background,
      boardBg: theme.boardBg,
      cellBg: theme.cellBg,
      fixedCellBg: theme.fixedCellBg,
      selectedCellBg: theme.selectedCellBg,
      texture: { pattern: "none", opacity: 0 },
      decor: [],
    };
  }, [activeThemeId, activeSoundPackId]);

  // Get theme-adaptive chat button colors
  const getChatButtonColors = useMemo(() => {
    const themeColorMap = {
      default: {
        bg: "bg-blue-600",
        hover: "hover:bg-blue-700",
        text: "text-white",
      },
      ocean: {
        bg: "bg-cyan-600",
        hover: "hover:bg-cyan-700",
        text: "text-white",
      },
      forest: {
        bg: "bg-green-600",
        hover: "hover:bg-green-700",
        text: "text-white",
      },
      sunset: {
        bg: "bg-orange-600",
        hover: "hover:bg-orange-700",
        text: "text-white",
      },
      midnight: {
        bg: "bg-indigo-600",
        hover: "hover:bg-indigo-700",
        text: "text-white",
      },
      sakura: {
        bg: "bg-pink-600",
        hover: "hover:bg-pink-700",
        text: "text-white",
      },
      volcano: {
        bg: "bg-red-600",
        hover: "hover:bg-red-700",
        text: "text-white",
      },
      arctic: {
        bg: "bg-blue-500",
        hover: "hover:bg-blue-600",
        text: "text-white",
      },
    };
    return themeColorMap[activeThemeId] || themeColorMap.default;
  }, [activeThemeId]);

  // Probe filesystem backgrounds in order (png -> svg -> jpg) and pick the first that loads
  useEffect(() => {
    const paths = activeAssetSet?.assetPaths;
    if (!paths) {
      setBgAssetUrl(null);
      return;
    }

    // Filter out obviously-bad paths (arrays encoded as strings, null/undefined)
    const rawOrder = [paths.bgPng, paths.bgSvg, paths.bgJpg].filter(Boolean);
    const order = rawOrder.filter((p) => {
      if (!p || typeof p !== "string") return false;
      const lp = p.toLowerCase();
      // Skip encoded/empty array markers or placeholders
      if (lp.includes("[]") || lp.includes("%5b") || lp.includes("%5d"))
        return false;
      if (lp.includes("undefined") || lp.includes("null")) return false;
      return true;
    });
    if (order.length === 0) {
      setBgAssetUrl(null);
      return;
    }

    let cancelled = false;
    const tryLoad = (idx) => {
      if (idx >= order.length) {
        if (!cancelled) setBgAssetUrl(null);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setBgAssetUrl(order[idx]);
      };
      img.onerror = () => tryLoad(idx + 1);
      img.src = order[idx];
    };

    tryLoad(0);
    return () => {
      cancelled = true;
    };
  }, [
    activeAssetSet?.assetPaths?.bgPng,
    activeAssetSet?.assetPaths?.bgSvg,
    activeAssetSet?.assetPaths?.bgJpg,
    activeAssetSet?.comboKey,
  ]);

  // --- RENDER LOGIC ---

  // 1. MAIN MENU (Opening Screen)
  if (view === "menu") {
    return (
      <>
        <OpeningScreen
          onStart={startNewGame}
          onResume={() => {
            setView("game");
            setStatus("playing");
          }}
          hasSavedGame={status === "paused"}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          loading={loading}
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
          onShowUserPanel={() => setShowUserPanel(true)}
          onShowAwards={() => {
            if (soundEnabled) SoundManager.play("uiTap");
            openAwards();
          }}
          userSession={appUserSession}
        />
        {showUserPanel && (
          <UserPanel
            soundEnabled={soundEnabled}
            onClose={handleUserPanelClose}
            appUserSession={appUserSession}
          />
        )}
        {showAwardsZone && (
          <AwardsZone
            soundEnabled={soundEnabled}
            onClose={handleAwardsClose}
            activeThemeId={activeThemeId}
            unlockedThemes={unlockedThemes}
            onSelectTheme={(id) => handleThemeChange(id, { persist: false })}
            activePackId={activeSoundPackId}
            unlockedPacks={unlockedSoundPacks}
            onSelectPack={(id) => handleSoundPackChange(id, { persist: false })}
          />
        )}
      </>
    );
  }

  // 3. CLOSING SCREEN
  if (status === "won" || status === "lost") {
    return (
      <>
        <ClosingScreen
          status={status}
          time={timer}
          difficulty={difficulty}
          mistakes={mistakes}
          onRestart={() => startNewGame(difficulty)}
          onMenu={() => {
            setStatus("idle");
            setView("menu");
            setNewlyUnlockedThemes([]);
            setNewlyUnlockedSoundPacks([]);
            setNewlyAwardedBadges([]);
          }}
          loading={loading}
          soundEnabled={soundEnabled}
          newlyUnlockedThemes={newlyUnlockedThemes}
          newlyUnlockedSoundPacks={newlyUnlockedSoundPacks}
          newlyAwardedBadges={newlyAwardedBadges}
        />
        {showAwardsZone && (
          <AwardsZone
            soundEnabled={soundEnabled}
            onClose={handleAwardsClose}
            activeThemeId={activeThemeId}
            unlockedThemes={unlockedThemes}
            onSelectTheme={(id) => handleThemeChange(id, { persist: false })}
            activePackId={activeSoundPackId}
            unlockedPacks={unlockedSoundPacks}
            onSelectPack={(id) => handleSoundPackChange(id, { persist: false })}
          />
        )}
      </>
    );
  }

  // 4. GAME SCREEN
  return (
    <div
      className={`min-h-screen flex flex-col items-center p-2 sm:p-4 transition-colors duration-300 text-gray-900 dark:text-gray-100 ${activeAssetSet.background} relative overflow-x-hidden`}
    >
      {/* Backend connectivity/CORS banner */}
      {backendError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md flex items-start gap-3 max-w-3xl">
            <div className="flex-1 text-sm">
              <div className="font-semibold">Backend connectivity issue</div>
              <div className="mt-1 text-xs opacity-90">
                {backendError.split("\n")[0]}
              </div>
              <div className="mt-1 text-xs opacity-70">
                Check deployment (Anyone access) and CORS headers — run{" "}
                <code>curl -I "$GAS_URL?action=ping"</code>
              </div>
            </div>
            <div>
              <button
                onClick={() => setBackendError(null)}
                className="text-sm font-semibold underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      {/* SVG Background Pattern Layer (theme-specific) */}
      {activeAssetSet.svgBackground && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: activeAssetSet.svgBackground,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.6,
          }}
        />
      )}

      {/* Texture overlay layer */}
      {activeAssetSet.texture.pattern !== "none" && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            opacity: activeAssetSet.texture.opacity,
            backgroundImage:
              (window.TEXTURE_PATTERNS &&
                window.TEXTURE_PATTERNS[activeAssetSet.texture.pattern]) ||
              "none",
          }}
        />
      )}

      {/* Filesystem-provided background asset (if present) */}
      {activeAssetSet.assetPaths && (
        <>
          {/* Prefer SVG, then PNG, then JPG. We attempt load by layering; browser will fetch actual URLs if they exist. */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: bgAssetUrl
                ? `url(${bgAssetUrl})`
                : `url(${activeAssetSet.assetPaths.bgSvg}), url(${activeAssetSet.assetPaths.bgPng}), url(${activeAssetSet.assetPaths.bgJpg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: bgAssetUrl ? 0.85 : 0.7,
            }}
          />
        </>
      )}

      {/* Decorative elements layer - Procedural theme-aware shapes */}
      {activeAssetSet.icons && activeAssetSet.icons.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {activeAssetSet.icons.map((_, i) => {
            const element = getThemeVisualElement(
              activeThemeId,
              activeSoundPackId,
              i
            );
            return (
              <div
                key={i}
                className={`absolute ${element.shape} ${element.animation}`}
                style={{
                  left: `${15 + (i % 3) * 30}%`,
                  top: `${10 + Math.floor(i / 3) * 40}%`,
                  width: `${element.size}px`,
                  height: `${element.size}px`,
                  background: element.background,
                  opacity: element.opacity,
                  animationDelay: `${i * 1.5}s`,
                  animationDuration: `${8 + i * 2}s`,
                  filter: `${element.blur}${
                    element.filter ? " " + element.filter : ""
                  }`,
                  boxShadow: `0 8px 24px ${element.color}40, inset 0 0 12px ${element.color}20`,
                  transition: "all 0.3s ease",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Fallback emoji decorations (if no Material Icons available) */}
      {(!activeAssetSet.icons || activeAssetSet.icons.length === 0) &&
        activeAssetSet.decor.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {activeAssetSet.decor.map((emoji, i) => (
              <span
                key={i}
                className="absolute text-2xl sm:text-3xl opacity-20 animate-float-slow"
                style={{
                  left: `${15 + i * 30}%`,
                  top: `${10 + (i % 2) * 70}%`,
                  animationDelay: `${i * 1.5}s`,
                  animationDuration: `${8 + i * 2}s`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}

      <div className="w-full max-w-7xl flex flex-col gap-3 sm:gap-6 flex-grow relative z-10">
        {!isGasEnvironment() && (
          <div className="w-full mx-auto mb-2 p-2 rounded text-xs sm:text-sm text-yellow-800 bg-yellow-100 border border-yellow-200 text-center">
            GAS not configured — using local generator for puzzles. Create{" "}
            <span className="font-mono">config/config.local.js</span> with your{" "}
            <span className="font-mono">GAS_URL</span> to enable cloud
            persistence.
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center px-2 sm:px-4 lg:px-0">
          <div className="flex flex-col">
            <h1
              className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight cursor-pointer text-gray-900 dark:text-white"
              onClick={() => {
                if (soundEnabled) SoundManager.play("uiTap");
                setStatus("paused");
                setView("menu");
              }}
            >
              Sudoku{" "}
              <span className="text-blue-600 dark:text-white">Logic</span> Lab
            </h1>
          </div>
          <div className="flex gap-1 sm:gap-2 items-center">
            {loading && (
              <span className="text-xs text-blue-500 animate-pulse hidden sm:inline">
                Generating...
              </span>
            )}
            {status === "playing" && (
              <button
                onClick={togglePause}
                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Pause (P or Space)"
              >
                <Icons.Pause />
              </button>
            )}
            {status === "paused" && (
              <button
                onClick={togglePause}
                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors animate-pulse"
                title="Resume (P or Space)"
              >
                <Icons.Play />
              </button>
            )}
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Keyboard Shortcuts (?)"
            >
              <Icons.HelpCircle />
            </button>
            <button
              onClick={() => setShowUserPanel(true)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
            >
              <Icons.User />
              {appUserSession && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
              )}
            </button>
            <button
              aria-label="Awards"
              onClick={() => {
                if (soundEnabled) SoundManager.play("uiTap");
                openAwards();
              }}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Awards"
            >
              <Icons.Awards />
            </button>
            <button
              onClick={toggleSound}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {soundEnabled ? <Icons.VolumeUp /> : <Icons.VolumeOff />}
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-2 sm:gap-3 md:gap-4 xl:gap-5 justify-center items-start xl:items-stretch">
          {/* Left Column: New Game, Settings, Leaderboard - visible on xl+ screens */}
          <div className="hidden xl:flex flex-col gap-2 sm:gap-2.5 w-72 flex-shrink-0">
            {/* New Game */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Play />
                      <span>New Game</span>
                    </>
                  )}
                </h3>
                <button
                  onClick={handleQuickRestart}
                  disabled={status !== "playing" && status !== "paused"}
                  className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300 hover:text-orange-700 dark:hover:text-orange-300 shadow-sm hover:shadow-md"
                  title="Restart puzzle (R)"
                >
                  <Icons.Refresh />
                  <span className="hidden sm:inline">Restart</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    name: "Easy",
                    color: "from-green-500 to-emerald-600",
                    hoverColor: "hover:from-green-400 hover:to-emerald-500",
                    activeRing: "ring-green-300",
                  },
                  {
                    name: "Medium",
                    color: "from-yellow-500 to-orange-500",
                    hoverColor: "hover:from-yellow-400 hover:to-orange-400",
                    activeRing: "ring-yellow-300",
                  },
                  {
                    name: "Hard",
                    color: "from-red-500 to-rose-600",
                    hoverColor: "hover:from-red-400 hover:to-rose-500",
                    activeRing: "ring-red-300",
                  },
                  {
                    name: "Daily",
                    color: "from-blue-500 to-indigo-600",
                    hoverColor: "hover:from-blue-400 hover:to-indigo-500",
                    activeRing: "ring-blue-300",
                  },
                ].map((d) => (
                  <button
                    key={d.name}
                    onClick={() => {
                      if (soundEnabled) SoundManager.play("startGame");
                      startNewGame(d.name);
                    }}
                    disabled={loading}
                    className={`py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100 ${
                      difficulty === d.name
                        ? `bg-gradient-to-br ${d.color} text-white shadow-lg ring-2 ${d.activeRing}`
                        : `bg-gradient-to-br ${d.color} ${d.hoverColor} text-white shadow-md opacity-80 hover:opacity-100`
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </h3>
              <label className="flex items-center justify-between cursor-pointer bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Highlight Conflicts
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showConflicts}
                    onChange={(e) => setShowConflicts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>

            {/* Leaderboard Button */}
            <button
              onClick={handleOpenLeaderboard}
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-400 hover:via-amber-400 hover:to-orange-400 text-white rounded-xl shadow-lg text-sm font-bold transition-all transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="text-lg relative z-10">🏆</span>
              <span className="relative z-10">Leaderboard</span>
            </button>
          </div>

          {/* Center Column: Board */}
          <div className="flex-shrink-0 mx-auto relative">
            <SudokuBoard
              board={board}
              selectedId={selectedCell}
              onCellClick={(id) => {
                if (soundEnabled) SoundManager.play("select");
                setSelectedCell(id);
              }}
              completedBoxes={completedBoxes}
              boardTexture={activeAssetSet.texture}
              conflictingCells={getConflictingCells(selectedCell)}
            />

            {/* Pause Overlay */}
            {status === "paused" && (
              <div
                className="absolute inset-0 bg-gray-900/80 dark:bg-black/85 backdrop-blur-sm rounded-sm flex flex-col items-center justify-center cursor-pointer animate-fade-in z-20"
                onClick={togglePause}
              >
                <div className="text-white text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <Icons.Play />
                  </div>
                  <p className="text-lg sm:text-xl font-bold mb-1">
                    Game Paused
                  </p>
                  <p className="text-xs sm:text-sm text-gray-300 mb-4">
                    Click anywhere or press Space to resume
                  </p>
                  <div className="flex gap-4 justify-center text-sm">
                    <div className="bg-white/10 px-3 py-1.5 rounded-lg">
                      <span className="text-gray-400 text-xs">Time</span>
                      <p className="font-mono font-bold">
                        {Math.floor(timer / 60)}:
                        {(timer % 60).toString().padStart(2, "0")}
                      </p>
                    </div>
                    <div className="bg-white/10 px-3 py-1.5 rounded-lg">
                      <span className="text-gray-400 text-xs">Progress</span>
                      <p className="font-bold">{getProgressPercentage()}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Number Pad, Progress, Tools */}
          <div className="flex flex-col gap-2 sm:gap-2.5 w-full max-w-xs xl:w-72 mx-auto xl:mx-0">
            {/* Number Pad (top of sidebar) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-2 sm:p-2.5 rounded-xl shadow-inner">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const isDisabled = status !== "playing" || remaining[num] === 0;
                const isComplete = remaining[num] === 0;
                return (
                  <button
                    key={num}
                    onClick={() => {
                      if (soundEnabled) SoundManager.play("select");
                      handleNumberInput(num);
                    }}
                    disabled={isDisabled}
                    className={`relative h-12 sm:h-14 rounded-xl text-lg sm:text-xl font-bold transition-all duration-200 transform active:scale-95 overflow-hidden group ${
                      isComplete
                        ? "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-600 dark:text-green-400 border-2 border-green-300 dark:border-green-700 cursor-default"
                        : isDisabled
                        ? "opacity-30 cursor-not-allowed bg-gray-200 dark:bg-gray-800"
                        : "bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/40 dark:hover:to-blue-800/40 text-blue-600 dark:text-blue-400 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {/* Shine effect on hover */}
                    {!isDisabled && !isComplete && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    )}
                    <span className="relative z-10">{num}</span>
                    <span
                      className={`block text-[9px] sm:text-[10px] font-medium -mt-0.5 relative z-10 ${
                        isComplete ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {isComplete ? "✓" : `${remaining[num]} left`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stats */}
            <div className="w-full bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-800 py-3 sm:py-4 px-3 sm:px-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              {/* Practice Mode Badge */}
              {isPracticeMode && (
                <div className="mb-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-700">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                    <span>🎓</span>
                    <span>Practice Mode</span>
                    <span className="text-[10px] font-normal">
                      (No mistake limit)
                    </span>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Progress
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                    {getProgressPercentage()}%
                  </span>
                </div>
                <div className="h-2 sm:h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${getProgressPercentage()}%` }}
                  >
                    {getProgressPercentage() > 20 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex justify-between items-center text-center">
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold tracking-wide">
                    Difficulty
                  </span>
                  <span
                    className={`font-bold text-sm sm:text-base ${
                      difficulty === "Hard"
                        ? "text-red-500"
                        : difficulty === "Medium"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : difficulty === "Daily"
                        ? "text-blue-500"
                        : "text-green-500"
                    }`}
                  >
                    {difficulty}
                  </span>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold tracking-wide">
                    {isPracticeMode ? "Practice" : "Mistakes"}
                  </span>
                  {isPracticeMode ? (
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      ∞
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                            i < mistakes
                              ? "bg-red-500 shadow-md shadow-red-500/50"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold tracking-wide">
                    Time
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold tabular-nums">
                    {Math.floor(timer / 60)}:
                    {(timer % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            {/* Tools */}
            <div className="flex w-full justify-between gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  handleUndo();
                }}
                disabled={history.length <= 1}
                className="flex-1 flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 hover:from-amber-100 hover:to-orange-200 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 transition-all border border-amber-200 dark:border-amber-700/50 shadow-sm hover:shadow-md group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              >
                <div className="transform group-hover:-rotate-12 transition-transform">
                  <Icons.Undo />
                </div>
                <span className="text-[8px] sm:text-[9px] mt-1 font-medium text-amber-700 dark:text-amber-300">
                  Undo
                </span>
              </button>
              <button
                onClick={handleHint}
                disabled={
                  status !== "playing" ||
                  selectedCell === null ||
                  board[selectedCell]?.isFixed ||
                  board[selectedCell]?.value !== null
                }
                className="flex-1 flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 hover:from-yellow-100 hover:to-amber-200 dark:hover:from-yellow-900/50 dark:hover:to-amber-900/50 transition-all border border-yellow-200 dark:border-yellow-700/50 shadow-sm hover:shadow-md group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                title="Reveal solution (H or ?)"
              >
                <div className="transform group-hover:scale-110 transition-transform">
                  <Icons.Lightbulb />
                </div>
                <span className="text-[8px] sm:text-[9px] mt-1 font-medium text-yellow-700 dark:text-yellow-300">
                  Hint
                </span>
              </button>
              <button
                onClick={() => {
                  if (soundEnabled) SoundManager.play("erase");
                  if (selectedCell !== null && !board[selectedCell].isFixed) {
                    const newBoard = [...board];
                    newBoard[selectedCell].value = null;
                    newBoard[selectedCell].notes = [];
                    setBoard(newBoard);
                  }
                }}
                disabled={
                  status !== "playing" ||
                  selectedCell === null ||
                  board[selectedCell]?.isFixed
                }
                className="flex-1 flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 hover:from-red-100 hover:to-rose-200 dark:hover:from-red-900/50 dark:hover:to-rose-900/50 transition-all border border-red-200 dark:border-red-700/50 shadow-sm hover:shadow-md group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              >
                <div className="transform group-hover:rotate-12 transition-transform">
                  <Icons.Eraser />
                </div>
                <span className="text-[8px] sm:text-[9px] mt-1 font-medium text-red-700 dark:text-red-300">
                  Erase
                </span>
              </button>
              <button
                onClick={() => {
                  if (soundEnabled) SoundManager.play("pencil");
                  setMode(mode === "pen" ? "pencil" : "pen");
                }}
                className={`flex-1 flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md group ${
                  mode === "pencil"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-blue-300 dark:border-blue-500 shadow-lg shadow-blue-500/30"
                    : "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-200 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 border border-blue-200 dark:border-blue-700/50"
                }`}
              >
                <div className="relative transform group-hover:scale-110 transition-transform">
                  <Icons.Pencil />
                  {mode === "pencil" && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  )}
                </div>
                <span
                  className={`text-[8px] sm:text-[9px] mt-1 font-medium ${
                    mode === "pencil"
                      ? "text-white"
                      : "text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {mode === "pencil" ? "Notes ON" : "Notes"}
                </span>
              </button>
            </div>

            {/* New Game (Mobile/Tablet Only) */}
            <div className="xl:hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Play />
                      <span>New Game</span>
                    </>
                  )}
                </h3>
                <button
                  onClick={handleQuickRestart}
                  disabled={status !== "playing" && status !== "paused"}
                  className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300 hover:text-orange-700 dark:hover:text-orange-300 shadow-sm hover:shadow-md"
                  title="Restart puzzle (R)"
                >
                  <Icons.Refresh />
                  <span className="hidden sm:inline">Restart</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    name: "Easy",
                    color: "from-green-500 to-emerald-600",
                    hoverColor: "hover:from-green-400 hover:to-emerald-500",
                    activeRing: "ring-green-300",
                  },
                  {
                    name: "Medium",
                    color: "from-yellow-500 to-orange-500",
                    hoverColor: "hover:from-yellow-400 hover:to-orange-400",
                    activeRing: "ring-yellow-300",
                  },
                  {
                    name: "Hard",
                    color: "from-red-500 to-rose-600",
                    hoverColor: "hover:from-red-400 hover:to-rose-500",
                    activeRing: "ring-red-300",
                  },
                  {
                    name: "Daily",
                    color: "from-blue-500 to-indigo-600",
                    hoverColor: "hover:from-blue-400 hover:to-indigo-500",
                    activeRing: "ring-blue-300",
                  },
                ].map((d) => (
                  <button
                    key={d.name}
                    onClick={() => {
                      if (soundEnabled) SoundManager.play("startGame");
                      startNewGame(d.name);
                    }}
                    disabled={loading}
                    className={`py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100 ${
                      difficulty === d.name
                        ? `bg-gradient-to-br ${d.color} text-white shadow-lg ring-2 ${d.activeRing}`
                        : `bg-gradient-to-br ${d.color} ${d.hoverColor} text-white shadow-md opacity-80 hover:opacity-100`
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings (Mobile/Tablet Only) */}
            <div className="xl:hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </h3>
              <label className="flex items-center justify-between cursor-pointer bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Highlight Conflicts
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showConflicts}
                    onChange={(e) => setShowConflicts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>

            {/* Leaderboard Button (Mobile/Tablet Only) */}
            <button
              onClick={handleOpenLeaderboard}
              className="xl:hidden w-full py-3 sm:py-3.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-400 hover:via-amber-400 hover:to-orange-400 text-white rounded-xl shadow-lg text-sm font-bold transition-all transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="text-lg relative z-10">🏆</span>
              <span className="relative z-10">Leaderboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="keyboardhelp-title"
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg animate-pop relative">
            <button
              onClick={() => setShowKeyboardHelp(false)}
              aria-label="Close keyboard help"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Icons.X />
            </button>

            <h2
              id="keyboardhelp-title"
              className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2"
            >
              <Icons.HelpCircle />
              Keyboard Shortcuts
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                      1-9
                    </kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Enter number
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                      N
                    </kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Toggle notes
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                      Z
                    </kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Undo
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                      Del
                    </kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Erase cell
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                      H
                    </kbd>
                    <span className="text-gray-400">/</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                      ?
                    </kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Get hint
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                      P
                    </kbd>
                    <span className="text-gray-400">/</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                      Space
                    </kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Pause/Resume
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                      R
                    </kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Quick restart
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                      Esc
                    </kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Close dialogs
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2">
                  Navigation
                </p>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                    ←
                  </kbd>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                    ↑
                  </kbd>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                    →
                  </kbd>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                    ↓
                  </kbd>
                  <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                    Move between cells
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Restart Confirmation Modal */}
      {showRestartConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="restart-title"
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-pop relative">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Icons.Refresh />
              </div>
              <h2
                id="restart-title"
                className="text-xl font-bold text-gray-800 dark:text-white mb-2"
              >
                Sudoku{" "}
                <span className="text-blue-800 dark:text-white">Logic</span> Lab
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All your progress will be lost. The puzzle will reset to its
                initial state.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={confirmRestart}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition-colors"
              >
                Yes, Restart Puzzle
              </button>
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {chatNotification && !isChatOpen && (
          <div
            onClick={toggleChat}
            className="bg-blue-600 text-white p-2 sm:p-3 rounded-lg shadow-lg cursor-pointer animate-slide-up flex items-center gap-2 sm:gap-3 max-w-xs"
          >
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-full">
              <Icons.Chat />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] sm:text-[10px] font-bold opacity-80">
                {chatNotification.sender} says:
              </div>
              <div className="text-xs sm:text-sm truncate">
                {chatNotification.text}
              </div>
            </div>
          </div>
        )}
        {isChatOpen && (
          <div
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md w-80 sm:w-96 h-96 sm:h-[28rem] rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 flex flex-col animate-pop overflow-hidden mb-2"
            onTouchStart={handleChatTouchStart}
            onTouchMove={handleChatTouchMove}
            onTouchEnd={handleChatTouchEnd}
          >
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-2 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-100/80 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700">
              <div className="flex justify-center">
                <div
                  className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"
                  aria-hidden="true"
                ></div>
              </div>
              <div className="flex justify-between items-center gap-2">
                <button
                  onClick={toggleChat}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-blue-100/70 dark:hover:bg-gray-700/70 transition-colors cursor-pointer"
                  aria-label="Close chat"
                >
                  <span className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-100">
                    Live Chat
                  </span>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-600 dark:text-gray-300">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    Online
                  </div>
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-colors"
                  aria-label="Collapse chat"
                >
                  <Icons.X />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 bg-white/90 dark:bg-gray-900/70 border border-blue-100 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Set a status (50 chars)"
                  maxLength={50}
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value.slice(0, 50))}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white/80 dark:bg-gray-900/70 scrollbar-thin">
              {chatMessages.length === 0 && (
                <p className="text-center text-sm text-gray-400 mt-4">
                  No messages yet. Say hi!
                </p>
              )}
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === userId ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 mb-0.5 px-1 max-w-[90%] leading-tight">
                    <button
                      onClick={() =>
                        msg.sender !== userId && handleViewProfile(msg.sender)
                      }
                      onMouseEnter={(e) =>
                        msg.sender !== userId &&
                        handleProfileHoverStart(msg.sender, e)
                      }
                      onMouseLeave={handleProfileHoverEnd}
                      className={`font-semibold ${
                        msg.sender === userId
                          ? "text-gray-700 dark:text-gray-200 cursor-default"
                          : "text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      }`}
                      disabled={msg.sender === userId}
                    >
                      {msg.sender === userId ? "You" : msg.sender}
                    </button>
                    {msg.status && (
                      <span className="text-gray-400 truncate">
                        · {msg.status}
                      </span>
                    )}
                  </div>
                  <div
                    className={`px-3.5 sm:px-4 py-2 text-sm max-w-[85%] leading-snug break-words shadow-md ${
                      msg.sender === userId
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl rounded-tr-sm ring-1 ring-blue-400/40"
                        : "bg-gray-100/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-3xl rounded-tl-sm"
                    }
                  `}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95">
              <div className="relative flex gap-2 sm:gap-3 items-center">
                <button
                  aria-label="Emoji picker"
                  className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-lg shadow-sm"
                  onClick={() => {
                    if (soundEnabled) SoundManager.play("uiTap");
                    setShowEmojiPicker((v) => !v);
                  }}
                >
                  😀
                </button>
                <input
                  className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow placeholder:text-gray-500 dark:placeholder:text-gray-500"
                  placeholder="Type a message..."
                  maxLength={140}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onFocus={() => setIsChatInputFocused(true)}
                  onBlur={() => setIsChatInputFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleChatSend(chatInput);
                  }}
                />
                <button
                  className="p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0 shadow-md"
                  onClick={() => handleChatSend(chatInput)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-14 left-0 right-0 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-2 z-10">
                    <div className="flex gap-1 overflow-x-auto pb-1">
                      {EMOJI_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setEmojiCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                            emojiCategory === cat.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 max-h-36 overflow-y-auto grid grid-cols-8 gap-1 text-lg">
                      {(
                        EMOJI_CATEGORIES.find((c) => c.id === emojiCategory) ||
                        EMOJI_CATEGORIES[0]
                      ).emojis.map((emo) => (
                        <button
                          key={emo}
                          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => handleEmojiInsert(emo)}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={toggleChat}
          className={`p-3 sm:p-4 rounded-full shadow-xl transition-all hover:scale-105 flex items-center justify-center relative ${
            isChatOpen
              ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              : `${getChatButtonColors.bg} ${getChatButtonColors.text} ${getChatButtonColors.hover}`
          }`}
        >
          {isChatOpen ? <Icons.X /> : <Icons.Chat />}
          {chatNotification && !isChatOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>
      </div>

      {/* Hover Profile Preview */}
      {hoverProfile && (
        <div
          className="fixed z-[60] pointer-events-none"
          style={{
            left: `${Math.min(hoverProfilePos.x, window.innerWidth - 280)}px`,
            top: `${Math.min(hoverProfilePos.y, window.innerHeight - 200)}px`,
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-3 w-64 border border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {(hoverProfile.displayName ||
                  hoverProfile.username ||
                  "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-800 dark:text-white truncate">
                  {hoverProfile.displayName || hoverProfile.username}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{hoverProfile.username}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded">
                <div className="font-bold text-blue-600 dark:text-blue-400">
                  {hoverProfile.totalGames || 0}
                </div>
                <div className="text-[9px] text-gray-600 dark:text-gray-400">
                  Games
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-1.5 rounded">
                <div className="font-bold text-green-600 dark:text-green-400">
                  {hoverProfile.totalWins || 0}
                </div>
                <div className="text-[9px] text-gray-600 dark:text-gray-400">
                  Wins
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-1.5 rounded">
                <div className="font-bold text-purple-600 dark:text-purple-400">
                  {hoverProfile.totalGames > 0
                    ? Math.round(
                        (hoverProfile.totalWins / hoverProfile.totalGames) * 100
                      )
                    : 0}
                  %
                </div>
                <div className="text-[9px] text-gray-600 dark:text-gray-400">
                  Win Rate
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-[10px] text-center text-gray-500 dark:text-gray-400">
              Click name to view full profile
            </div>
          </div>
        </div>
      )}

      {renderModal()}
      {showUserPanel && (
        <UserPanel
          soundEnabled={soundEnabled}
          onClose={handleUserPanelClose}
          appUserSession={appUserSession}
        />
      )}
      {viewingProfile && (
        <ProfileViewModal
          profile={viewingProfile}
          onClose={handleCloseViewProfile}
          soundEnabled={soundEnabled}
          loading={profileLoading}
        />
      )}
      {showAwardsZone && (
        <AwardsZone
          soundEnabled={soundEnabled}
          onClose={handleAwardsClose}
          activeThemeId={activeThemeId}
          unlockedThemes={unlockedThemes}
          onSelectTheme={(id) => handleThemeChange(id, { persist: false })}
          activePackId={activeSoundPackId}
          unlockedPacks={unlockedSoundPacks}
          onSelectPack={(id) => handleSoundPackChange(id, { persist: false })}
        />
      )}

      {(loading || isHydrating) && (
        <FullScreenLoader
          message={isHydrating ? "Preparing your game..." : "Updating data..."}
        />
      )}

      {/* Unlock Notification - appears during gameplay */}
      {showUnlockNotification &&
        (newlyUnlockedThemes.length > 0 ||
          newlyUnlockedSoundPacks.length > 0) && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-4 rounded-xl shadow-2xl border-2 border-white dark:border-gray-200 max-w-sm animate-pulse-glow">
              <div className="flex items-start gap-3">
                <div className="text-3xl animate-bounce">🎉</div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-base mb-1 flex items-center gap-2">
                    <span>✨ Unlocked!</span>
                  </h3>
                  {newlyUnlockedThemes.length > 0 && (
                    <div className="text-white text-sm mb-2">
                      <strong>
                        Theme{newlyUnlockedThemes.length > 1 ? "s" : ""}:
                      </strong>{" "}
                      {newlyUnlockedThemes
                        .map((id) => THEMES[id]?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                  {newlyUnlockedSoundPacks.length > 0 && (
                    <div className="text-white text-sm">
                      <strong>
                        Sound{newlyUnlockedSoundPacks.length > 1 ? "s" : ""}:
                      </strong>{" "}
                      {newlyUnlockedSoundPacks
                        .map((id) => SOUND_PACKS[id]?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                  <button
                    onClick={() => setShowUnlockNotification(false)}
                    className="mt-2 text-xs bg-white text-purple-600 px-3 py-1 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
                <button
                  onClick={() => setShowUnlockNotification(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <Icons.X />
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Tutorial Overlay */}
      {showTutorial && view === "game" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-title"
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full animate-pop">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="tutorial-title"
                className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
              >
                <span>🎓</span>
                <span>Tutorial</span>
              </h2>
              <button
                onClick={() => setShowTutorial(false)}
                aria-label="Close tutorial"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Icons.X />
              </button>
            </div>

            {tutorialStep === 0 && (
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Welcome to Sudoku Logic Lab! Let's learn the basics.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                    Goal
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Fill the 9×9 grid so that each row, column, and 3×3 box
                    contains the digits 1-9 without repetition.
                  </p>
                </div>
              </div>
            )}

            {tutorialStep === 1 && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">
                    Controls
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-2">
                    <li>• Click a cell to select it</li>
                    <li>• Press 1-9 to enter a number</li>
                    <li>• Use arrow keys to navigate</li>
                    <li>• Press N to toggle notes mode</li>
                  </ul>
                </div>
              </div>
            )}

            {tutorialStep === 2 && (
              <div className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-2">
                    Practice Mode
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    Practice mode removes the 3-mistake limit and provides extra
                    guidance. Toggle it in the New Game section!
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                disabled={tutorialStep === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <div className="flex gap-2">
                {[0, 1, 2].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all ${
                      step === tutorialStep ? "bg-blue-600 w-4" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              {tutorialStep < 2 ? (
                <button
                  onClick={() => setTutorialStep(tutorialStep + 1)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowTutorial(false);
                    setTutorialStep(0);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Got it!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer - legible over all themes */}
      <footer className="mt-6 sm:mt-8 pt-4 pb-5 text-[10px] sm:text-xs md:text-sm text-center px-3 w-full">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/30 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/75 backdrop-blur shadow-md text-gray-700 dark:text-gray-200 px-3 py-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
          <span className="font-semibold text-gray-700 dark:text-white">
            Sudoku Logic Lab v2.3
          </span>
          <span className="hidden sm:inline text-gray-400">•</span>
          <span>Created by Edmund</span>
          <span className="hidden sm:inline text-gray-400">•</span>
          <span className="flex gap-2">
            <a
              href="https://github.com/edmund-alexander"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-300 hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://www.paypal.com/paypalme/edmundalexanders"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-300 hover:underline"
            >
              Buy me a green tea
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};

const AppLoader = () => {
  const [ready, setReady] = useState(typeof StorageService !== "undefined");

  useEffect(() => {
    if (!ready) {
      const checkInterval = setInterval(() => {
        if (typeof StorageService !== "undefined") {
          setReady(true);
          clearInterval(checkInterval);
        }
      }, 50);

      // Timeout after 5 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        console.error("StorageService failed to load within timeout");
      }, 5000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, [ready]);

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold">Loading Resources...</h2>
      </div>
    );
  }

  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <AppLoader />
  </ErrorBoundary>
);
