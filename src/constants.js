/**
 * Sudoku Logic Lab - Constants
 * 
 * Global constants for themes, sound packs, campaign levels, and storage keys.
 * This file uses plain JavaScript (no JSX) and can be loaded before React.
 * 
 * @version 2.3.0
 */

// ============================================================================
// STORAGE KEYS
// ============================================================================

const KEYS = Object.freeze({
  GAME_STATE: 'sudoku_v2_state',
  LEADERBOARD: 'sudoku_v2_leaderboard',
  CHAT: 'sudoku_v2_chat',
  USER_ID: 'sudoku_v2_uid',
  SOUND_ENABLED: 'sudoku_v2_sound',
  CAMPAIGN_PROGRESS: 'sudoku_v2_campaign',
  USER_SESSION: 'sudoku_v2_user_session',
  UNLOCKED_THEMES: 'sudoku_v2_unlocked_themes',
  ACTIVE_THEME: 'sudoku_v2_active_theme',
  UNLOCKED_SOUND_PACKS: 'sudoku_v2_unlocked_sound_packs',
  ACTIVE_SOUND_PACK: 'sudoku_v2_active_sound_pack',
  GAME_STATS: 'sudoku_v2_game_stats',
  USER_STATUS: 'sudoku_v2_user_status'
});

// ============================================================================
// DIFFICULTY SETTINGS
// ============================================================================

const DIFFICULTY = Object.freeze({
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  DAILY: 'Daily'
});

const DIFFICULTY_REMOVE_COUNTS = Object.freeze({
  [DIFFICULTY.EASY]: 30,
  [DIFFICULTY.MEDIUM]: 45,
  [DIFFICULTY.HARD]: 55,
  [DIFFICULTY.DAILY]: 40 // Base, modified by date
});

// ============================================================================
// GAME SETTINGS
// ============================================================================

const GAME_SETTINGS = Object.freeze({
  MAX_MISTAKES: 3,
  CHAT_POLL_INTERVAL: 5000,
  CHAT_MAX_LENGTH: 140,
  STATUS_MAX_LENGTH: 50,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  HISTORY_MAX_LENGTH: 10,
  LEADERBOARD_MAX_ENTRIES: 50,
  CHAT_MAX_MESSAGES: 50
});

// ============================================================================
// CAMPAIGN LEVELS
// ============================================================================

const CAMPAIGN_LEVELS = Object.freeze([
  {
    id: 1,
    title: "First Moves",
    difficulty: DIFFICULTY.EASY,
    desc: "Learn the basics: fill in cells with numbers 1-9. Each row, column, and 3×3 box needs each number once.",
    lesson: "📖 LESSON: Each row, column, and 3×3 box must contain digits 1-9 exactly once.",
    stars: {
      star1: { label: "Complete", criteria: (s) => s.status === 'won' },
      star2: { label: "Perfect", criteria: (s) => s.status === 'won' && s.mistakes === 0 },
      star3: { label: "Speed", criteria: (s) => s.status === 'won' && s.time < 120 }
    },
    biome: 'grass'
  },
  {
    id: 2,
    title: "Row Mastery",
    difficulty: DIFFICULTY.EASY,
    desc: "Focus on row logic: use process of elimination within rows to find values.",
    lesson: "💡 SKILL: Scan rows to find where numbers can go - spot which cells must contain a value.",
    stars: {
      star1: { label: "Complete", criteria: (s) => s.status === 'won' },
      star2: { label: "Flawless", criteria: (s) => s.status === 'won' && s.mistakes === 0 },
      star3: { label: "Champion", criteria: (s) => s.status === 'won' && s.mistakes === 0 && s.time < 90 }
    },
    biome: 'grass'
  },
  {
    id: 3,
    title: "Hidden Treasures",
    difficulty: DIFFICULTY.EASY,
    desc: "Bonus: Put it all together! Combine row, column, and box logic to solve under 2 min.",
    lesson: "🎯 TIP: When stuck, look for candidates with only 1 possibility.",
    stars: {
      star1: { label: "Complete", criteria: (s) => s.status === 'won' },
      star2: { label: "Swift", criteria: (s) => s.status === 'won' && s.time < 120 },
      star3: { label: "Flawless Swift", criteria: (s) => s.status === 'won' && s.time < 120 && s.mistakes === 0 }
    },
    biome: 'grass',
    isChest: true
  },
  {
    id: 4,
    title: "Column Challenge",
    difficulty: DIFFICULTY.MEDIUM,
    desc: "Step up: Now puzzles have fewer clues. Use column elimination alongside rows and boxes.",
    lesson: "📚 ADVANCED: Combine row + column + box constraints - each limits where numbers go.",
    stars: {
      star1: { label: "Complete", criteria: (s) => s.status === 'won' },
      star2: { label: "Precise", criteria: (s) => s.status === 'won' && s.mistakes <= 1 },
      star3: { label: "Mastery", criteria: (s) => s.status === 'won' && s.mistakes === 0 && s.time < 300 }
    },
    biome: 'desert'
  },
  {
    id: 5,
    title: "Box Logic",
    difficulty: DIFFICULTY.MEDIUM,
    desc: "Master the 3×3 boxes: use box-specific constraints to eliminate possibilities.",
    lesson: "🔍 TECHNIQUE: Look at intersections - where rows meet columns within boxes.",
    stars: {
      star1: { label: "Complete", criteria: (s) => s.status === 'won' },
      star2: { label: "Strategic", criteria: (s) => s.status === 'won' && s.mistakes === 0 },
      star3: { label: "Legend", criteria: (s) => s.status === 'won' && s.mistakes === 0 && s.time < 300 }
    },
    biome: 'desert'
  },
  {
    id: 6,
    title: "Oasis Ascension",
    difficulty: DIFFICULTY.MEDIUM,
    desc: "Bonus: Combine all your skills - solve a medium puzzle with zero mistakes under 8 min.",
    lesson: "⭐ INSIGHT: Expert players use 'candidate sets' - track all possible values per cell.",
    stars: {
      star1: { label: "Complete", criteria: (s) => s.status === 'won' },
      star2: { label: "Quick-Witted", criteria: (s) => s.status === 'won' && s.time < 480 },
      star3: { label: "Expert", criteria: (s) => s.status === 'won' && s.time < 300 && s.mistakes === 0 }
    },
    biome: 'desert',
    isChest: true
  },
  {
    id: 7,
    title: "The Hard Void",
    difficulty: DIFFICULTY.HARD,
    desc: "Elite training begins: Hard puzzles require advanced deduction. Stay logical, stay patient.",
    lesson: "🧠 MASTER TECHNIQUE: Naked pairs, pointing pairs, box/line reduction - advanced logic.",
    stars: {
      star1: { label: "Complete", criteria: (s) => s.status === 'won' },
      star2: { label: "Flawless", criteria: (s) => s.status === 'won' && s.mistakes === 0 },
      star3: { label: "Legend", criteria: (s) => s.status === 'won' && s.mistakes === 0 && s.time < 600 }
    },
    biome: 'space'
  },
  {
    id: 8,
    title: "Void Ascendant",
    difficulty: DIFFICULTY.HARD,
    desc: "Final test: Solve a hard puzzle perfectly. No mistakes. Under 15 minutes. Become a Sudoku master.",
    lesson: "👑 MASTERY: You now understand the deeper patterns of Sudoku. Every puzzle has a logical path.",
    stars: {
      star1: { label: "Complete", criteria: (s) => s.status === 'won' },
      star2: { label: "Perfect", criteria: (s) => s.status === 'won' && s.mistakes === 0 },
      star3: { label: "Master", criteria: (s) => s.status === 'won' && s.mistakes === 0 && s.time < 900 }
    },
    biome: 'space'
  }
]);

// ============================================================================
// THEMES
// ============================================================================

const THEMES = Object.freeze({
  default: {
    id: 'default',
    name: 'Classic',
    description: 'The original Sudoku experience',
    background: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800',
    boardBg: 'bg-white dark:bg-gray-800',
    cellBg: 'bg-white dark:bg-gray-800',
    fixedCellBg: 'bg-gray-50 dark:bg-gray-800',
    selectedCellBg: 'bg-blue-200 dark:bg-blue-900',
    icon: '📋',
    unlocked: true,
    pairedSoundPack: 'classic',
    pairingName: 'Classic Logic'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Dive into tranquil waters',
    background: 'bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-950 dark:to-blue-950',
    boardBg: 'bg-cyan-50/80 dark:bg-cyan-900/50',
    cellBg: 'bg-cyan-50 dark:bg-cyan-900/70',
    fixedCellBg: 'bg-cyan-100 dark:bg-cyan-950',
    selectedCellBg: 'bg-blue-300 dark:bg-blue-800',
    icon: '🌊',
    unlocked: false,
    unlockCriteria: 'Win 5 games',
    pairedSoundPack: 'zen',
    pairingName: 'Underwater Meditation'
  },
  forest: {
    id: 'forest',
    name: 'Emerald Forest',
    description: 'Find peace among the trees',
    background: 'bg-gradient-to-br from-emerald-100 to-green-300 dark:from-emerald-950 dark:to-green-900',
    boardBg: 'bg-emerald-50/80 dark:bg-emerald-900/50',
    cellBg: 'bg-emerald-50 dark:bg-emerald-900/70',
    fixedCellBg: 'bg-emerald-100 dark:bg-emerald-950',
    selectedCellBg: 'bg-green-300 dark:bg-green-800',
    icon: '🌲',
    unlocked: false,
    unlockCriteria: 'Win 10 games',
    pairedSoundPack: 'nature',
    pairingName: 'Woodland Breeze'
  },
  sunset: {
    id: 'sunset',
    name: 'Golden Sunset',
    description: 'Bask in warm twilight hues',
    background: 'bg-gradient-to-br from-orange-100 to-pink-300 dark:from-orange-900 dark:to-pink-900',
    boardBg: 'bg-orange-50/80 dark:bg-orange-900/50',
    cellBg: 'bg-orange-50 dark:bg-orange-800/70',
    fixedCellBg: 'bg-orange-100 dark:bg-orange-900',
    selectedCellBg: 'bg-orange-300 dark:bg-orange-700',
    icon: '🌅',
    unlocked: false,
    unlockCriteria: 'Complete a Hard puzzle',
    pairedSoundPack: 'funfair',
    pairingName: 'Carnival Twilight'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Sky',
    description: 'Puzzle under the stars',
    background: 'bg-gradient-to-br from-indigo-900 to-purple-900 dark:from-black dark:to-indigo-950',
    boardBg: 'bg-indigo-900/50 dark:bg-black/50',
    cellBg: 'bg-indigo-800/70 dark:bg-gray-900/70',
    fixedCellBg: 'bg-indigo-900 dark:bg-black',
    selectedCellBg: 'bg-purple-700 dark:bg-purple-900',
    icon: '🌙',
    unlocked: false,
    unlockCriteria: 'Win a puzzle with 0 mistakes',
    pairedSoundPack: 'space',
    pairingName: 'Cosmic Stargazing'
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura Bloom',
    description: 'Cherry blossoms in spring',
    background: 'bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900 dark:to-rose-900',
    boardBg: 'bg-pink-50/80 dark:bg-pink-900/50',
    cellBg: 'bg-pink-50 dark:bg-pink-800/70',
    fixedCellBg: 'bg-pink-100 dark:bg-pink-900',
    selectedCellBg: 'bg-pink-300 dark:bg-pink-700',
    icon: '🌸',
    unlocked: false,
    unlockCriteria: 'Win 3 Easy puzzles',
    pairedSoundPack: 'retro',
    pairingName: '8-Bit Blossom Garden'
  },
  volcano: {
    id: 'volcano',
    name: 'Volcanic Heat',
    description: 'Feel the magma flow',
    background: 'bg-gradient-to-br from-red-100 to-orange-400 dark:from-red-900 dark:to-orange-900',
    boardBg: 'bg-red-50/80 dark:bg-red-900/50',
    cellBg: 'bg-red-50 dark:bg-red-800/70',
    fixedCellBg: 'bg-red-100 dark:bg-red-900',
    selectedCellBg: 'bg-red-300 dark:bg-red-700',
    icon: '🌋',
    unlocked: false,
    unlockCriteria: 'Win 3 Medium puzzles',
    pairedSoundPack: 'minimal',
    pairingName: 'Focused Intensity'
  },
  arctic: {
    id: 'arctic',
    name: 'Arctic Ice',
    description: 'Cool crystalline clarity',
    background: 'bg-gradient-to-br from-blue-50 to-cyan-200 dark:from-blue-950 dark:to-cyan-950',
    boardBg: 'bg-blue-50/80 dark:bg-blue-950/50',
    cellBg: 'bg-blue-50 dark:bg-blue-900/70',
    fixedCellBg: 'bg-blue-100 dark:bg-blue-950',
    selectedCellBg: 'bg-blue-200 dark:bg-blue-800',
    icon: '❄️',
    unlocked: false,
    unlockCriteria: 'Win a puzzle in under 3 minutes',
    pairedSoundPack: 'crystal',
    pairingName: 'Ice Crystal Sparkle'
  }
});

// ============================================================================
// SOUND PACKS
// ============================================================================

const SOUND_PACKS = Object.freeze({
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Original Logic Lab blips',
    icon: '🎛️',
    unlocked: true
  },
  zen: {
    id: 'zen',
    name: 'Zen',
    description: 'Calm sine tones and long tails',
    icon: '🧘',
    unlocked: true
  },
  funfair: {
    id: 'funfair',
    name: 'Funfair',
    description: 'Playful bells and ramps',
    icon: '🎡',
    unlocked: false,
    unlockCriteria: 'Win 3 games'
  },
  retro: {
    id: 'retro',
    name: 'Retro',
    description: '8-bit inspired pulses',
    icon: '🕹️',
    unlocked: false,
    unlockCriteria: 'Win 3 Easy games'
  },
  space: {
    id: 'space',
    name: 'Space',
    description: 'Cosmic arps and sweeps',
    icon: '🪐',
    unlocked: false,
    unlockCriteria: 'Win a Hard game'
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    description: 'Soft wood and breeze chimes',
    icon: '🍃',
    unlocked: false,
    unlockCriteria: 'Win 3 Medium games'
  },
  crystal: {
    id: 'crystal',
    name: 'Crystal',
    description: 'Clean triangle sparkles',
    icon: '💎',
    unlocked: false,
    unlockCriteria: 'Win with 0 mistakes'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Short, dry clicky cues',
    icon: '◽',
    unlocked: false,
    unlockCriteria: 'Win under 3 minutes'
  }
});

// ============================================================================
// COMBINATORIAL THEME SYSTEM
// ============================================================================

/**
 * ThemeAssetSet defines the unique visual output for each (Audio, Visual) combination.
 * Each combination results in a distinct "recipe" with specific:
 * - name: Display name for this combination
 * - description: Flavor text describing the aesthetic
 * - background: CSS gradient classes for the page background
 * - backgroundImage: Optional subtle background image/pattern
 * - boardTexture: Visual texture for the Sudoku grid (wood, pixel, stone, paper, etc.)
 * - boardBg: Background color/style for the board container
 * - cellBg: Default cell background
 * - fixedCellBg: Pre-filled cell background
 * - selectedCellBg: Selected cell highlight
 * - decor: Theme-specific decorative elements to render around the UI
 */

// Helper to generate combination key
const getComboKey = (visualId, audioId) => `${visualId}_${audioId}`;

// Base visual themes (extracted from THEMES for cleaner combination logic)
const VISUAL_BASES = Object.freeze({
  default: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800',
    boardBg: 'bg-white dark:bg-gray-800',
    cellBg: 'bg-white dark:bg-gray-800',
    fixedCellBg: 'bg-gray-50 dark:bg-gray-800',
    selectedCellBg: 'bg-blue-200 dark:bg-blue-900'
  },
  ocean: {
    background: 'bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-950 dark:to-blue-950',
    boardBg: 'bg-cyan-50/80 dark:bg-cyan-900/50',
    cellBg: 'bg-cyan-50 dark:bg-cyan-900/70',
    fixedCellBg: 'bg-cyan-100 dark:bg-cyan-950',
    selectedCellBg: 'bg-blue-300 dark:bg-blue-800'
  },
  forest: {
    background: 'bg-gradient-to-br from-emerald-100 to-green-300 dark:from-emerald-950 dark:to-green-900',
    boardBg: 'bg-emerald-50/80 dark:bg-emerald-900/50',
    cellBg: 'bg-emerald-50 dark:bg-emerald-900/70',
    fixedCellBg: 'bg-emerald-100 dark:bg-emerald-950',
    selectedCellBg: 'bg-green-300 dark:bg-green-800'
  },
  sunset: {
    background: 'bg-gradient-to-br from-orange-100 to-pink-300 dark:from-orange-900 dark:to-pink-900',
    boardBg: 'bg-orange-50/80 dark:bg-orange-900/50',
    cellBg: 'bg-orange-50 dark:bg-orange-800/70',
    fixedCellBg: 'bg-orange-100 dark:bg-orange-900',
    selectedCellBg: 'bg-orange-300 dark:bg-orange-700'
  },
  midnight: {
    background: 'bg-gradient-to-br from-indigo-900 to-purple-900 dark:from-black dark:to-indigo-950',
    boardBg: 'bg-indigo-900/50 dark:bg-black/50',
    cellBg: 'bg-indigo-800/70 dark:bg-gray-900/70',
    fixedCellBg: 'bg-indigo-900 dark:bg-black',
    selectedCellBg: 'bg-purple-700 dark:bg-purple-900'
  },
  sakura: {
    background: 'bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900 dark:to-rose-900',
    boardBg: 'bg-pink-50/80 dark:bg-pink-900/50',
    cellBg: 'bg-pink-50 dark:bg-pink-800/70',
    fixedCellBg: 'bg-pink-100 dark:bg-pink-900',
    selectedCellBg: 'bg-pink-300 dark:bg-pink-700'
  },
  volcano: {
    background: 'bg-gradient-to-br from-red-100 to-orange-400 dark:from-red-900 dark:to-orange-900',
    boardBg: 'bg-red-50/80 dark:bg-red-900/50',
    cellBg: 'bg-red-50 dark:bg-red-800/70',
    fixedCellBg: 'bg-red-100 dark:bg-red-900',
    selectedCellBg: 'bg-red-300 dark:bg-red-700'
  },
  arctic: {
    background: 'bg-gradient-to-br from-blue-50 to-cyan-200 dark:from-blue-950 dark:to-cyan-950',
    boardBg: 'bg-blue-50/80 dark:bg-blue-950/50',
    cellBg: 'bg-blue-50 dark:bg-blue-900/70',
    fixedCellBg: 'bg-blue-100 dark:bg-blue-950',
    selectedCellBg: 'bg-blue-200 dark:bg-blue-800'
  }
});

// ============================================================================
// SVG PATTERN LIBRARY - Theme-specific visual assets
// ============================================================================

/**
 * SVG pattern generators for each theme
 * Each pattern is encoded as a data URI for direct use in backgroundImage
 */
const SVG_PATTERNS = Object.freeze({
  // Default theme - clean, minimal lines
  default_bg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3ClinearGradient id='grad'%3E%3Cstop offset='0%25' stop-color='%234f46e5' stop-opacity='0.05'/%3E%3Cstop offset='100%25' stop-color='%232563eb' stop-opacity='0.02'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23grad)'/%3E%3Cline x1='0' y1='0' x2='200' y2='200' stroke='%234f46e5' stroke-width='0.5' opacity='0.08'/%3E%3Cline x1='200' y1='0' x2='0' y2='200' stroke='%232563eb' stroke-width='0.5' opacity='0.08'/%3E%3C/svg%3E")`,
  
  // Ocean theme - wave-like flowing patterns
  ocean_bg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Cdefs%3E%3ClinearGradient id='oceanGrad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2306b6d4' stop-opacity='0.08'/%3E%3Cstop offset='100%25' stop-color='%230369a1' stop-opacity='0.04'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='150' fill='url(%23oceanGrad)'/%3E%3Cpath d='M0,50 Q75,30 150,50 T300,50' stroke='%230ea5e9' stroke-width='1' fill='none' opacity='0.15'/%3E%3Cpath d='M0,80 Q75,60 150,80 T300,80' stroke='%230284c7' stroke-width='0.8' fill='none' opacity='0.12'/%3E%3Cpath d='M0,110 Q75,90 150,110 T300,110' stroke='%230369a1' stroke-width='0.8' fill='none' opacity='0.1'/%3E%3C/svg%3E")`,
  
  // Forest theme - organic leaves and branches
  forest_bg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3ClinearGradient id='forestGrad'%3E%3Cstop offset='0%25' stop-color='%2310b981' stop-opacity='0.06'/%3E%3Cstop offset='100%25' stop-color='%23047857' stop-opacity='0.04'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23forestGrad)'/%3E%3Cpath d='M50,30 Q40,60 50,90 Q60,60 50,30' fill='%2310b981' opacity='0.1'/%3E%3Cpath d='M150,50 Q140,80 150,110 Q160,80 150,50' fill='%2334d399' opacity='0.08'/%3E%3Ccircle cx='40' cy='50' r='8' fill='%236ee7b7' opacity='0.12'/%3E%3Ccircle cx='160' cy='160' r='6' fill='%2310b981' opacity='0.1'/%3E%3C/svg%3E")`,
  
  // Sunset theme - gradient waves and warmth
  sunset_bg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Cdefs%3E%3ClinearGradient id='sunsetGrad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f97316' stop-opacity='0.08'/%3E%3Cstop offset='100%25' stop-color='%23ec4899' stop-opacity='0.06'/%3E%3C/linearGradient%3E%3CradialGradient id='sunGlow'%3E%3Cstop offset='0%25' stop-color='%23fbbf24' stop-opacity='0.15'/%3E%3Cstop offset='100%25' stop-color='%23f97316' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='300' height='200' fill='url(%23sunsetGrad)'/%3E%3Ccircle cx='250' cy='80' r='40' fill='url(%23sunGlow)'/%3E%3Cpath d='M0,150 Q75,140 150,150 T300,150' stroke='%23f97316' stroke-width='1.5' fill='none' opacity='0.1'/%3E%3C/svg%3E")`,
  
  // Midnight theme - stars and cosmic
  midnight_bg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3CradialGradient id='starGlow' r='50%25'%3E%3Cstop offset='0%25' stop-color='white' stop-opacity='0.8'/%3E%3Cstop offset='100%25' stop-color='white' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='%23111827' opacity='0.04'/%3E%3Ccircle cx='30' cy='40' r='1.5' fill='url(%23starGlow)'/%3E%3Ccircle cx='170' cy='50' r='1' fill='url(%23starGlow)'/%3E%3Ccircle cx='100' cy='30' r='0.8' fill='url(%23starGlow)'/%3E%3Ccircle cx='180' cy='150' r='1.2' fill='url(%23starGlow)'/%3E%3Ccircle cx='40' cy='170' r='0.9' fill='url(%23starGlow)'/%3E%3C/svg%3E")`,
  
  // Sakura theme - floating petals and circles
  sakura_bg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3ClinearGradient id='sakuraGrad'%3E%3Cstop offset='0%25' stop-color='%23ec4899' stop-opacity='0.06'/%3E%3Cstop offset='100%25' stop-color='%23be185d' stop-opacity='0.03'/%3E%3C/linearGradient%3E%3CradialGradient id='petalGlow'%3E%3Cstop offset='0%25' stop-color='%23f472b6' stop-opacity='0.2'/%3E%3Cstop offset='100%25' stop-color='%23ec4899' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23sakuraGrad)'/%3E%3Ccircle cx='50' cy='60' r='15' fill='url(%23petalGlow)'/%3E%3Ccircle cx='150' cy='100' r='18' fill='url(%23petalGlow)'/%3E%3Ccircle cx='100' cy='160' r='12' fill='url(%23petalGlow)'/%3E%3C/svg%3E")`,
  
  // Volcano theme - heat waves and intensity
  volcano_bg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='200'%3E%3Cdefs%3E%3ClinearGradient id='volcanoGrad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23dc2626' stop-opacity='0.08'/%3E%3Cstop offset='100%25' stop-color='%23991b1b' stop-opacity='0.05'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='250' height='200' fill='url(%23volcanoGrad)'/%3E%3Cpath d='M50,80 L100,20 L150,80 Z' fill='%23ef4444' opacity='0.08'/%3E%3Cpath d='M60,100 Q125,30 190,100' stroke='%23f97316' stroke-width='1.5' fill='none' opacity='0.12'/%3E%3Cpath d='M40,120 Q125,50 210,120' stroke='%23ea580c' stroke-width='1' fill='none' opacity='0.1'/%3E%3C/svg%3E")`,
  
  // Arctic theme - crystalline and geometric
  arctic_bg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cdefs%3E%3ClinearGradient id='arcticGrad'%3E%3Cstop offset='0%25' stop-color='%230ea5e9' stop-opacity='0.08'/%3E%3Cstop offset='100%25' stop-color='%230369a1' stop-opacity='0.04'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='180' height='180' fill='url(%23arcticGrad)'/%3E%3Cpath d='M90,10 L130,60 L90,90 L50,60 Z' fill='%2399ccff' opacity='0.12'/%3E%3Cpath d='M30,50 L50,80 L30,110 L10,80 Z' fill='%237dd3fc' opacity='0.1'/%3E%3Cpath d='M140,120 L160,150 L140,170 L120,150 Z' fill='%2399ccff' opacity='0.08'/%3E%3C/svg%3E")`
});

// ============================================================================
// MATERIAL ICONS - Theme-aware icon decorations
// ============================================================================

/**
 * Material Icons for each theme combination
 * Icon names from Google Material Icons Outlined font
 */
const MATERIAL_ICONS = Object.freeze({
  // Watercolor/Zen themes - peaceful, flowing
  watercolor: ['waves', 'brush', 'palette', 'water_droplet'],
  
  // Ocean/Aquatic - water elements
  aquatic: ['bubble_chart', 'water', 'waves', 'water_droplet', 'bubble_chart'],
  
  // Forest/Nature - organic, living
  organic: ['eco', 'leaf', 'nature', 'oak', 'park', 'forest'],
  
  // Pixel/Retro - geometric, sharp
  pixel: ['apps', 'grid_3x3', 'grid_4x4', 'dashboard', 'pentagon'],
  
  // Cosmic/Space - celestial, vast
  cosmic: ['star', 'stars', 'starstruck', 'rocket', 'explore', 'public'],
  
  // Sakura/Blossom - floral, delicate
  blossom: ['local_florist', 'favorite', 'favorite_border', 'spa', 'toy_brick'],
  
  // Volcano/Heat - intense, powerful
  flame: ['local_fire_department', 'whatshot', 'power', 'bolt', 'energy_savings_leaf'],
  
  // Arctic/Crystal - cool, geometric
  crystal: ['diamond', 'ac_unit', 'auto_awesome', 'snow_shoeing', 'cloud']
});

// Audio theme modifiers (how audio themes influence the visual rendering)
const AUDIO_MODIFIERS = Object.freeze({
  classic: { style: 'clean', textureHint: 'smooth' },
  zen: { style: 'watercolor', textureHint: 'paper' },
  funfair: { style: 'playful', textureHint: 'carnival' },
  retro: { style: 'pixel', textureHint: 'pixelgrid' },
  space: { style: 'cosmic', textureHint: 'nebula' },
  nature: { style: 'organic', textureHint: 'wood' },
  crystal: { style: 'crystalline', textureHint: 'ice' },
  minimal: { style: 'stark', textureHint: 'concrete' }
});

// Board texture definitions
const BOARD_TEXTURES = Object.freeze({
  smooth: { name: 'Smooth', pattern: 'none', opacity: 0 },
  paper: { name: 'Rice Paper', pattern: 'paper', opacity: 0.15 },
  wood: { name: 'Wood Grain', pattern: 'wood', opacity: 0.2 },
  pixelgrid: { name: 'Pixel Grid', pattern: 'pixel', opacity: 0.25 },
  stone: { name: 'Stone', pattern: 'stone', opacity: 0.18 },
  ice: { name: 'Ice Crystal', pattern: 'ice', opacity: 0.12 },
  nebula: { name: 'Cosmic Dust', pattern: 'nebula', opacity: 0.15 },
  carnival: { name: 'Carnival', pattern: 'carnival', opacity: 0.1 },
  concrete: { name: 'Concrete', pattern: 'concrete', opacity: 0.08 }
});

// Decorative element sets
const DECOR_SETS = Object.freeze({
  none: [],
  bubbles: ['🫧', '💧', '🐚'],
  petals: ['🌸', '🎀', '✨'],
  leaves: ['🍃', '🌿', '🍂'],
  stars: ['⭐', '✨', '💫'],
  pixels: ['▪️', '◾', '◽'],
  flames: ['🔥', '✨', '💥'],
  snowflakes: ['❄️', '🌨️', '💎'],
  clouds: ['☁️', '🌤️', '✨'],
  notes: ['🎵', '🎶', '🎼']
});

/**
 * THEME_COMBINATIONS - The Recipe System
 * Maps (visualId, audioId) => unique ThemeAssetSet
 * Every permutation produces a distinct visual experience
 */
const THEME_COMBINATIONS = Object.freeze({
  // Default visual + all audio themes
  'default_classic': {
    name: 'Classic Logic',
    description: 'The original Sudoku experience',
    boardTexture: 'smooth',
    decor: 'none'
  },
  'default_zen': {
    name: 'Mindful Classic',
    description: 'Clean design with calming energy',
    boardTexture: 'paper',
    decor: 'clouds'
  },
  'default_funfair': {
    name: 'Classic Carnival',
    description: 'Traditional puzzles with playful flair',
    boardTexture: 'carnival',
    decor: 'notes'
  },
  'default_retro': {
    name: '8-Bit Logic',
    description: 'Classic puzzles, pixel perfect',
    boardTexture: 'pixelgrid',
    decor: 'pixels'
  },
  'default_space': {
    name: 'Cosmic Classic',
    description: 'Timeless puzzles among the stars',
    boardTexture: 'nebula',
    decor: 'stars'
  },
  'default_nature': {
    name: 'Natural Logic',
    description: 'Classic design with organic warmth',
    boardTexture: 'wood',
    decor: 'leaves'
  },
  'default_crystal': {
    name: 'Crystal Clear',
    description: 'Pristine clarity for focused solving',
    boardTexture: 'ice',
    decor: 'snowflakes'
  },
  'default_minimal': {
    name: 'Pure Logic',
    description: 'Stripped down to essentials',
    boardTexture: 'concrete',
    decor: 'none'
  },

  // Ocean visual + all audio themes
  'ocean_classic': {
    name: 'Ocean Breeze',
    description: 'Tranquil waters with classic sounds',
    boardTexture: 'smooth',
    decor: 'bubbles'
  },
  'ocean_zen': {
    name: 'Underwater Meditation',
    description: 'Deep sea tranquility',
    boardTexture: 'paper',
    decor: 'bubbles'
  },
  'ocean_funfair': {
    name: 'Beach Carnival',
    description: 'Seaside fun and games',
    boardTexture: 'carnival',
    decor: 'bubbles'
  },
  'ocean_retro': {
    name: '8-Bit Ocean',
    description: 'Pixel art sea creatures, chiptune waves',
    boardTexture: 'pixelgrid',
    decor: 'pixels'
  },
  'ocean_space': {
    name: 'Cosmic Depths',
    description: 'Where the ocean meets the cosmos',
    boardTexture: 'nebula',
    decor: 'stars'
  },
  'ocean_nature': {
    name: 'Coral Garden',
    description: 'Living reef atmosphere',
    boardTexture: 'wood',
    decor: 'bubbles'
  },
  'ocean_crystal': {
    name: 'Frozen Depths',
    description: 'Ice crystals beneath the waves',
    boardTexture: 'ice',
    decor: 'snowflakes'
  },
  'ocean_minimal': {
    name: 'Silent Sea',
    description: 'Calm waters, minimal distractions',
    boardTexture: 'concrete',
    decor: 'none'
  },

  // Forest visual + all audio themes
  'forest_classic': {
    name: 'Forest Logic',
    description: 'Classic solving among the trees',
    boardTexture: 'smooth',
    decor: 'leaves'
  },
  'forest_zen': {
    name: 'Bamboo Grove',
    description: 'Eastern forest meditation',
    boardTexture: 'paper',
    decor: 'leaves'
  },
  'forest_funfair': {
    name: 'Enchanted Forest',
    description: 'Whimsical woodland adventure',
    boardTexture: 'carnival',
    decor: 'notes'
  },
  'forest_retro': {
    name: 'Pixel Woods',
    description: '8-bit forest adventure',
    boardTexture: 'pixelgrid',
    decor: 'pixels'
  },
  'forest_space': {
    name: 'Alien Forest',
    description: 'Bioluminescent alien flora',
    boardTexture: 'nebula',
    decor: 'stars'
  },
  'forest_nature': {
    name: 'Woodland Breeze',
    description: 'Pure forest immersion',
    boardTexture: 'wood',
    decor: 'leaves'
  },
  'forest_crystal': {
    name: 'Frost Forest',
    description: 'Winter wonderland among the pines',
    boardTexture: 'ice',
    decor: 'snowflakes'
  },
  'forest_minimal': {
    name: 'Quiet Grove',
    description: 'Simple serenity in nature',
    boardTexture: 'concrete',
    decor: 'none'
  },

  // Sunset visual + all audio themes
  'sunset_classic': {
    name: 'Golden Hour',
    description: 'Classic puzzles at twilight',
    boardTexture: 'smooth',
    decor: 'clouds'
  },
  'sunset_zen': {
    name: 'Twilight Meditation',
    description: 'Peaceful sunset contemplation',
    boardTexture: 'paper',
    decor: 'clouds'
  },
  'sunset_funfair': {
    name: 'Carnival Twilight',
    description: 'Evening fair under warm skies',
    boardTexture: 'carnival',
    decor: 'notes'
  },
  'sunset_retro': {
    name: 'Pixel Sunset',
    description: 'Retro vibes at dusk',
    boardTexture: 'pixelgrid',
    decor: 'pixels'
  },
  'sunset_space': {
    name: 'Cosmic Dusk',
    description: 'Where sunset meets starlight',
    boardTexture: 'nebula',
    decor: 'stars'
  },
  'sunset_nature': {
    name: 'Evening Meadow',
    description: 'Golden fields at golden hour',
    boardTexture: 'wood',
    decor: 'leaves'
  },
  'sunset_crystal': {
    name: 'Amber Crystal',
    description: 'Warm light through crystal prisms',
    boardTexture: 'ice',
    decor: 'snowflakes'
  },
  'sunset_minimal': {
    name: 'Simple Sunset',
    description: 'Clean lines at twilight',
    boardTexture: 'concrete',
    decor: 'none'
  },

  // Midnight visual + all audio themes
  'midnight_classic': {
    name: 'Midnight Logic',
    description: 'Classic puzzles under the stars',
    boardTexture: 'smooth',
    decor: 'stars'
  },
  'midnight_zen': {
    name: 'Night Meditation',
    description: 'Peaceful darkness for focus',
    boardTexture: 'paper',
    decor: 'stars'
  },
  'midnight_funfair': {
    name: 'Night Carnival',
    description: 'Neon lights in the darkness',
    boardTexture: 'carnival',
    decor: 'notes'
  },
  'midnight_retro': {
    name: 'Neon Nights',
    description: 'Cyberpunk pixel aesthetic',
    boardTexture: 'pixelgrid',
    decor: 'pixels'
  },
  'midnight_space': {
    name: 'Cosmic Stargazing',
    description: 'Deep space exploration',
    boardTexture: 'nebula',
    decor: 'stars'
  },
  'midnight_nature': {
    name: 'Moonlit Forest',
    description: 'Nocturnal woodland atmosphere',
    boardTexture: 'wood',
    decor: 'leaves'
  },
  'midnight_crystal': {
    name: 'Starlight Crystal',
    description: 'Crystalline beauty in moonlight',
    boardTexture: 'ice',
    decor: 'snowflakes'
  },
  'midnight_minimal': {
    name: 'Dark Mode',
    description: 'Pure focus in darkness',
    boardTexture: 'concrete',
    decor: 'none'
  },

  // Sakura visual + all audio themes
  'sakura_classic': {
    name: 'Cherry Blossom',
    description: 'Classic beauty in bloom',
    boardTexture: 'smooth',
    decor: 'petals'
  },
  'sakura_zen': {
    name: 'Watercolor Garden',
    description: 'Eastern watercolor paintings, paper textures',
    boardTexture: 'paper',
    decor: 'petals'
  },
  'sakura_funfair': {
    name: 'Hanami Festival',
    description: 'Cherry blossom celebration',
    boardTexture: 'carnival',
    decor: 'petals'
  },
  'sakura_retro': {
    name: '8-Bit Blossom',
    description: 'Pixel petals falling',
    boardTexture: 'pixelgrid',
    decor: 'pixels'
  },
  'sakura_space': {
    name: 'Cosmic Petals',
    description: 'Blossoms among the stars',
    boardTexture: 'nebula',
    decor: 'stars'
  },
  'sakura_nature': {
    name: 'Spring Garden',
    description: 'Natural cherry blossom grove',
    boardTexture: 'wood',
    decor: 'petals'
  },
  'sakura_crystal': {
    name: 'Frozen Blossoms',
    description: 'Ice-preserved spring beauty',
    boardTexture: 'ice',
    decor: 'snowflakes'
  },
  'sakura_minimal': {
    name: 'Simple Sakura',
    description: 'Elegant minimalist spring',
    boardTexture: 'concrete',
    decor: 'none'
  },

  // Volcano visual + all audio themes
  'volcano_classic': {
    name: 'Volcanic Logic',
    description: 'Classic puzzles with fiery intensity',
    boardTexture: 'smooth',
    decor: 'flames'
  },
  'volcano_zen': {
    name: 'Lava Meditation',
    description: 'Finding calm in the heat',
    boardTexture: 'paper',
    decor: 'flames'
  },
  'volcano_funfair': {
    name: 'Fire Festival',
    description: 'Celebration of flames',
    boardTexture: 'carnival',
    decor: 'flames'
  },
  'volcano_retro': {
    name: 'Pixel Inferno',
    description: '8-bit volcanic action',
    boardTexture: 'pixelgrid',
    decor: 'pixels'
  },
  'volcano_space': {
    name: 'Solar Flare',
    description: 'Cosmic fire and fury',
    boardTexture: 'nebula',
    decor: 'stars'
  },
  'volcano_nature': {
    name: 'Geothermal Springs',
    description: 'Natural volcanic beauty',
    boardTexture: 'stone',
    decor: 'flames'
  },
  'volcano_crystal': {
    name: 'Obsidian Crystal',
    description: 'Volcanic glass formations',
    boardTexture: 'ice',
    decor: 'snowflakes'
  },
  'volcano_minimal': {
    name: 'Focused Intensity',
    description: 'Channeled volcanic energy',
    boardTexture: 'concrete',
    decor: 'none'
  },

  // Arctic visual + all audio themes
  'arctic_classic': {
    name: 'Arctic Logic',
    description: 'Crystal clear cold solving',
    boardTexture: 'smooth',
    decor: 'snowflakes'
  },
  'arctic_zen': {
    name: 'Frozen Meditation',
    description: 'Ice cold focus',
    boardTexture: 'paper',
    decor: 'snowflakes'
  },
  'arctic_funfair': {
    name: 'Winter Wonderland',
    description: 'Festive ice carnival',
    boardTexture: 'carnival',
    decor: 'snowflakes'
  },
  'arctic_retro': {
    name: 'Pixel Tundra',
    description: '8-bit frozen landscape',
    boardTexture: 'pixelgrid',
    decor: 'pixels'
  },
  'arctic_space': {
    name: 'Frozen Cosmos',
    description: 'Cold reaches of space',
    boardTexture: 'nebula',
    decor: 'stars'
  },
  'arctic_nature': {
    name: 'Snowy Forest',
    description: 'Winter woodland serenity',
    boardTexture: 'wood',
    decor: 'snowflakes'
  },
  'arctic_crystal': {
    name: 'Ice Crystal Sparkle',
    description: 'Pure crystalline beauty',
    boardTexture: 'ice',
    decor: 'snowflakes'
  },
  'arctic_minimal': {
    name: 'Arctic Minimal',
    description: 'Clean ice, clean mind',
    boardTexture: 'concrete',
    decor: 'none'
  }
});

/**
 * Generate a pixel art character SVG based on theme combination.
 * Creates deterministic, theme-aware 8-bit style characters with theme colors.
 * 
 * @param {string} visualId - Visual theme ID (determines character color palette)
 * @param {string} audioId - Audio theme ID (determines character pose/expression)
 * @returns {string} SVG markup for the pixel art character
 */
const generatePixelCharacter = (visualId, audioId) => {
  // Enhanced theme-specific characters with more personality and detail
  const characters = {
    default: {
      name: 'Sage',
      color: '#6366F1',
      svg: `<!-- Head with wisdom aura -->
            <circle cx="40" cy="22" r="6" fill="#6366F1" stroke="#fff" stroke-width="1.5"/>
            <circle cx="40" cy="22" r="7.5" fill="none" stroke="#818CF8" stroke-width="1" opacity="0.5"/>
            <!-- Eyes (wisdom) -->
            <circle cx="37" cy="21" r="1" fill="#fff"/>
            <circle cx="43" cy="21" r="1" fill="#fff"/>
            <!-- Robe -->
            <path d="M 34 28 Q 32 38 34 50 L 46 50 Q 48 38 46 28 Z" fill="#6366F1" stroke="#fff" stroke-width="1.5"/>
            <path d="M 34 28 Q 40 25 46 28" fill="#4F46E5" stroke="#fff" stroke-width="1.5"/>
            <!-- Arms raised in teaching -->
            <path d="M 34 32 L 22 28" stroke="#6366F1" stroke-width="2" stroke-linecap="round"/>
            <path d="M 46 32 L 58 28" stroke="#6366F1" stroke-width="2" stroke-linecap="round"/>
            <!-- Book in hands -->
            <rect x="20" y="26" width="4" height="5" fill="#fbbf24" stroke="#fff" stroke-width="1"/>
            <rect x="56" y="26" width="4" height="5" fill="#fbbf24" stroke="#fff" stroke-width="1"/>`
    },
    ocean: {
      name: 'Tidal Guardian',
      color: '#0891b2',
      svg: `<!-- Head (fish-like) -->
            <ellipse cx="40" cy="22" rx="6" ry="8" fill="#0891b2" stroke="#fff" stroke-width="1.5"/>
            <!-- Gill details -->
            <path d="M 34.5 20 Q 33 22 34.5 24" stroke="#00d9ff" stroke-width="1" fill="none"/>
            <path d="M 45.5 20 Q 47 22 45.5 24" stroke="#00d9ff" stroke-width="1" fill="none"/>
            <!-- Eyes (large, fish-like) -->
            <circle cx="37" cy="20" r="1.5" fill="#fff"/>
            <circle cx="43" cy="20" r="1.5" fill="#fff"/>
            <circle cx="37" cy="20" r="0.8" fill="#06b6d4"/>
            <circle cx="43" cy="20" r="0.8" fill="#06b6d4"/>
            <!-- Flowing body/waves -->
            <path d="M 33 30 Q 30 35 32 42 Q 35 48 40 50 Q 45 48 48 42 Q 50 35 47 30 Z" fill="#0891b2" stroke="#fff" stroke-width="1.5"/>
            <!-- Fin-like arms -->
            <path d="M 33 35 Q 20 36 15 40" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M 47 35 Q 60 36 65 40" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round" fill="none"/>`
    },
    forest: {
      name: 'Forest Keeper',
      color: '#059669',
      svg: `<!-- Tree-like head (foliage) -->
            <circle cx="40" cy="18" r="6" fill="#22c55e" stroke="#fff" stroke-width="1.5"/>
            <circle cx="35" cy="20" r="4" fill="#22c55e" stroke="#fff" stroke-width="1"/>
            <circle cx="45" cy="20" r="4" fill="#22c55e" stroke="#fff" stroke-width="1"/>
            <!-- Eyes peering through leaves -->
            <circle cx="37" cy="17" r="0.8" fill="#fff"/>
            <circle cx="43" cy="17" r="0.8" fill="#fff"/>
            <!-- Trunk -->
            <rect x="36" y="24" width="8" height="12" fill="#92400e" stroke="#fff" stroke-width="1.5"/>
            <!-- Torso with leaves -->
            <ellipse cx="40" cy="40" rx="8" ry="10" fill="#059669" stroke="#fff" stroke-width="1.5"/>
            <circle cx="33" cy="38" r="3" fill="#22c55e" stroke="#fff" stroke-width="1"/>
            <circle cx="47" cy="38" r="3" fill="#22c55e" stroke="#fff" stroke-width="1"/>
            <!-- Arms as branches -->
            <path d="M 33 38 L 18 36" stroke="#92400e" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M 47 38 L 62 36" stroke="#92400e" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Leaves at hand ends -->
            <circle cx="16" cy="34" r="2" fill="#22c55e"/>
            <circle cx="64" cy="34" r="2" fill="#22c55e"/>`
    },
    sunset: {
      name: 'Horizon Seeker',
      color: '#ea580c',
      svg: `<!-- Head (glowing sun-like) -->
            <circle cx="40" cy="20" r="6" fill="#ea580c" stroke="#fff" stroke-width="1.5"/>
            <!-- Glow rays around head -->
            <line x1="40" y1="12" x2="40" y2="8" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="49" y1="15" x2="53" y2="11" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="48" y1="26" x2="52" y2="30" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="31" y1="15" x2="27" y2="11" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="32" y1="26" x2="28" y2="30" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/>
            <!-- Eyes filled with determination -->
            <circle cx="37" cy="19" r="1.2" fill="#fff"/>
            <circle cx="43" cy="19" r="1.2" fill="#fff"/>
            <!-- Body (torso reaching upward) -->
            <path d="M 35 26 L 35 48 L 45 48 L 45 26 Q 40 24 35 26" fill="#ea580c" stroke="#fff" stroke-width="1.5"/>
            <!-- Arms reaching to sky -->
            <path d="M 35 30 L 20 18" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M 45 30 L 60 18" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/>`
    },
    midnight: {
      name: 'Starlight Sage',
      color: '#7c3aed',
      svg: `<!-- Head with moon/star theme -->
            <circle cx="40" cy="22" r="6" fill="#7c3aed" stroke="#a78bfa" stroke-width="1.5"/>
            <!-- Stars around head -->
            <polygon points="40,10 42,14 46,14 43,17 44,21 40,18 36,21 37,17 34,14 38,14" fill="#fde047" stroke="#fff" stroke-width="0.5"/>
            <circle cx="28" cy="16" r="1" fill="#fde047"/>
            <circle cx="52" cy="16" r="1" fill="#fde047"/>
            <circle cx="26" cy="28" r="1.2" fill="#a78bfa"/>
            <circle cx="54" cy="28" r="1.2" fill="#a78bfa"/>
            <!-- Eyes seeing the unseen -->
            <circle cx="37" cy="21" r="1.2" fill="#a78bfa"/>
            <circle cx="43" cy="21" r="1.2" fill="#a78bfa"/>
            <circle cx="37" cy="21" r="0.5" fill="#fff"/>
            <circle cx="43" cy="21" r="0.5" fill="#fff"/>
            <!-- Mystical robe -->
            <path d="M 35 28 Q 33 38 35 50 L 45 50 Q 47 38 45 28 Z" fill="#7c3aed" stroke="#a78bfa" stroke-width="1.5"/>
            <!-- Magical aura arms -->
            <path d="M 35 34 L 18 36" stroke="#a78bfa" stroke-width="2" stroke-dasharray="2,2" opacity="0.7"/>
            <path d="M 45 34 L 62 36" stroke="#a78bfa" stroke-width="2" stroke-dasharray="2,2" opacity="0.7"/>`
    },
    sakura: {
      name: 'Blossom Guardian',
      color: '#ec4899',
      svg: `<!-- Petals forming head -->
            <circle cx="40" cy="16" r="2.5" fill="#f472b6"/>
            <circle cx="35" cy="19" r="2.5" fill="#f472b6"/>
            <circle cx="45" cy="19" r="2.5" fill="#f472b6"/>
            <circle cx="36" cy="26" r="2.5" fill="#f472b6"/>
            <circle cx="44" cy="26" r="2.5" fill="#f472b6"/>
            <!-- Center head -->
            <circle cx="40" cy="22" r="5" fill="#ec4899" stroke="#fff" stroke-width="1.5"/>
            <!-- Eyes with happiness -->
            <circle cx="37" cy="21" r="1" fill="#fff"/>
            <circle cx="43" cy="21" r="1" fill="#fff"/>
            <!-- Smile -->
            <path d="M 37 24 Q 40 25 43 24" stroke="#fff" stroke-width="1" stroke-linecap="round"/>
            <!-- Flowing petals body -->
            <path d="M 34 28 Q 32 35 33 45 Q 40 50 47 45 Q 48 35 46 28 Z" fill="#ec4899" stroke="#fff" stroke-width="1.5"/>
            <circle cx="32" cy="35" r="3" fill="#f472b6"/>
            <circle cx="48" cy="35" r="3" fill="#f472b6"/>
            <!-- Petal arms -->
            <path d="M 33 32 L 15 28" stroke="#ec4899" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M 47 32 L 65 28" stroke="#ec4899" stroke-width="2.5" stroke-linecap="round"/>`
    },
    volcano: {
      name: 'Magma Warden',
      color: '#dc2626',
      svg: `<!-- Mountain peak head -->
            <polygon points="40,10 48,24 32,24" fill="#dc2626" stroke="#fff" stroke-width="1.5"/>
            <!-- Lava glow -->
            <polygon points="40,10 48,24 32,24" fill="none" stroke="#fca5a5" stroke-width="2" opacity="0.6"/>
            <!-- Eyes in crater -->
            <circle cx="37" cy="20" r="1.2" fill="#fde2e4"/>
            <circle cx="43" cy="20" r="1.2" fill="#fde2e4"/>
            <!-- Crater mouth -->
            <ellipse cx="40" cy="22" rx="2.5" ry="1.5" fill="#7c2d12"/>
            <!-- Main body volcanic -->
            <path d="M 34 26 Q 32 36 35 50 L 45 50 Q 48 36 46 26 Z" fill="#9F2C0C" stroke="#fff" stroke-width="1.5"/>
            <!-- Lava flows inside -->
            <path d="M 37 32 Q 38 40 37 48" stroke="#fca5a5" stroke-width="2" opacity="0.8"/>
            <path d="M 43 32 Q 42 40 43 48" stroke="#fca5a5" stroke-width="2" opacity="0.8"/>
            <!-- Arms throwing lava -->
            <path d="M 34 35 L 18 38" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M 46 35 L 62 38" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Lava drips from hands -->
            <circle cx="16" cy="40" r="1.5" fill="#fca5a5"/>
            <circle cx="64" cy="40" r="1.5" fill="#fca5a5"/>`
    },
    arctic: {
      name: 'Frost Guardian',
      color: '#0ea5e9',
      svg: `<!-- Icy crystalline head -->
            <polygon points="40,14 48,22 44,26 40,28 36,26 32,22" fill="#0ea5e9" stroke="#fff" stroke-width="1.5"/>
            <!-- Frost sparkles -->
            <circle cx="40" cy="12" r="1.5" fill="#bae6fd" opacity="0.8"/>
            <circle cx="30" cy="20" r="1" fill="#bae6fd" opacity="0.8"/>
            <circle cx="50" cy="20" r="1" fill="#bae6fd" opacity="0.8"/>
            <!-- Ice crystal eyes -->
            <polygon points="37,21 37,23 39,22" fill="#fff"/>
            <polygon points="41,21 41,23 43,22" fill="#fff"/>
            <!-- Icicle body with ridges -->
            <path d="M 35 30 L 33 50 L 47 50 L 45 30 Q 40 28 35 30" fill="#0ea5e9" stroke="#fff" stroke-width="1.5"/>
            <!-- Vertical icy ridges -->
            <line x1="38" y1="30" x2="37" y2="50" stroke="#06b6d4" stroke-width="1.5" opacity="0.6"/>
            <line x1="42" y1="30" x2="43" y2="50" stroke="#06b6d4" stroke-width="1.5" opacity="0.6"/>
            <!-- Arms with ice shards -->
            <path d="M 35 38 L 18 42" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M 45 38 L 62 42" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Icicle hands -->
            <path d="M 18 42 L 17 48" stroke="#bae6fd" stroke-width="1.5"/>
            <path d="M 62 42 L 63 48" stroke="#bae6fd" stroke-width="1.5"/>`
    }
  };

  const char = characters[visualId] || characters.default;
  
  return `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
    <style>
      @keyframes float-char {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
      }
      svg { animation: float-char 3s ease-in-out infinite; }
    </style>
    ${char.svg}
  </svg>`;
};

/**
 * Get the combined ThemeAssetSet for a given visual and audio theme
 * @param {string} visualId - Visual theme ID
 * @param {string} audioId - Audio/sound pack ID
 * @returns {Object} Combined ThemeAssetSet with all styling properties
 */
const getThemeAssetSet = (visualId, audioId) => {
  const comboKey = getComboKey(visualId, audioId);
  const combo = THEME_COMBINATIONS[comboKey] || THEME_COMBINATIONS['default_classic'];
  const visualBase = VISUAL_BASES[visualId] || VISUAL_BASES.default;
  const texture = BOARD_TEXTURES[combo.boardTexture] || BOARD_TEXTURES.smooth;
  const decorSet = DECOR_SETS[combo.decor] || DECOR_SETS.none;
  
  // Optional filesystem-based assets (user-provided)
  const assetBase = `assets/themes/${visualId}/${audioId}`;
  const assetPaths = {
    base: assetBase,
    bgJpg: `${assetBase}/background.jpg`,
    bgPng: `${assetBase}/background.png`,
    bgSvg: `${assetBase}/background.svg`
  };
  
  // Get theme-specific SVG background pattern
  const svgBgKey = `${visualId}_bg`;
  const svgBg = SVG_PATTERNS[svgBgKey] || '';
  
  // Map audio themes to Material Icon sets
  const audioIconMap = {
    zen: MATERIAL_ICONS.watercolor,
    funfair: MATERIAL_ICONS.pixel,
    retro: MATERIAL_ICONS.pixel,
    space: MATERIAL_ICONS.cosmic,
    nature: MATERIAL_ICONS.organic,
    crystal: MATERIAL_ICONS.crystal,
    minimal: [] // No decorations for minimal
  };
  
  // Get Material Icons based on audio theme, with visual theme fallbacks
  let icons = audioIconMap[audioId] || [];
  if (!icons.length) {
    if (audioId === 'classic') {
      // Default uses visual theme hints
      if (visualId === 'ocean') icons = MATERIAL_ICONS.aquatic;
      else if (visualId === 'sakura') icons = MATERIAL_ICONS.blossom;
      else if (visualId === 'volcano') icons = MATERIAL_ICONS.flame;
      else if (visualId === 'arctic') icons = MATERIAL_ICONS.crystal;
    }
  }
  
  return {
    // Combination metadata
    name: combo.name,
    description: combo.description,
    comboKey,
    
    // Visual base styles (from visual theme)
    background: visualBase.background,
    boardBg: visualBase.boardBg,
    cellBg: visualBase.cellBg,
    fixedCellBg: visualBase.fixedCellBg,
    selectedCellBg: visualBase.selectedCellBg,
    
    // SVG background pattern (theme-specific)
    svgBackground: svgBg,
    
    // Optional external background assets (filesystem)
    assetPaths,
    
    // Material Icon names (theme-specific)
    icons: icons,
    
    // Texture overlay
    texture: {
      name: texture.name,
      pattern: texture.pattern,
      opacity: texture.opacity
    },
    
    // Decorative elements (emoji - kept for fallback)
    decor: decorSet,
    
    // Original IDs for reference
    visualThemeId: visualId,
    audioThemeId: audioId
  };
};

// ============================================================================
// EMOJI CATEGORIES (for chat)
// ============================================================================

// Build emoji library by Unicode range
const isEmojiChar = (ch) => /\p{Emoji}/u.test(ch);

const buildEmojiList = (ranges) => {
  const seen = new Set();
  const out = [];
  ranges.forEach(([start, end]) => {
    for (let cp = start; cp <= end; cp++) {
      const ch = String.fromCodePoint(cp);
      if (isEmojiChar(ch) && !seen.has(ch)) {
        seen.add(ch);
        out.push(ch);
      }
    }
  });
  return out;
};

const EMOJI_CATEGORIES = Object.freeze([
  { id: 'smileys', label: 'Smileys', emojis: buildEmojiList([[0x1f600, 0x1f64f]]) },
  { id: 'gestures', label: 'Gestures', emojis: buildEmojiList([[0x1f44a, 0x1f4ff], [0x270a, 0x270d]]) },
  { id: 'animals', label: 'Animals', emojis: buildEmojiList([[0x1f400, 0x1f43f], [0x1f980, 0x1f9ae]]) },
  { id: 'food', label: 'Food', emojis: buildEmojiList([[0x1f347, 0x1f37f], [0x1f950, 0x1f97a]]) },
  { id: 'activities', label: 'Activities', emojis: buildEmojiList([[0x1f3a0, 0x1f3fa], [0x26bd, 0x26be], [0x1f93f, 0x1f94f]]) },
  { id: 'travel', label: 'Travel', emojis: buildEmojiList([[0x1f680, 0x1f6ff], [0x1f690, 0x1f6c5]]) },
  { id: 'objects', label: 'Objects', emojis: buildEmojiList([[0x1f4a0, 0x1f4ff], [0x1f9e0, 0x1f9ff]]) },
  { id: 'symbols', label: 'Symbols', emojis: buildEmojiList([[0x1f300, 0x1f5ff], [0x2600, 0x26ff]]) }
]);

// Make constants available globally
window.KEYS = KEYS;
window.DIFFICULTY = DIFFICULTY;
window.DIFFICULTY_REMOVE_COUNTS = DIFFICULTY_REMOVE_COUNTS;
window.GAME_SETTINGS = GAME_SETTINGS;
window.CAMPAIGN_LEVELS = CAMPAIGN_LEVELS;
window.THEMES = THEMES;
window.SOUND_PACKS = SOUND_PACKS;
window.EMOJI_CATEGORIES = EMOJI_CATEGORIES;

// Combinatorial Theme System exports
window.VISUAL_BASES = VISUAL_BASES;
window.AUDIO_MODIFIERS = AUDIO_MODIFIERS;
window.BOARD_TEXTURES = BOARD_TEXTURES;
window.DECOR_SETS = DECOR_SETS;
window.THEME_COMBINATIONS = THEME_COMBINATIONS;
window.SVG_PATTERNS = SVG_PATTERNS;
window.MATERIAL_ICONS = MATERIAL_ICONS;
window.getComboKey = getComboKey;
window.getThemeAssetSet = getThemeAssetSet;
window.generatePixelCharacter = generatePixelCharacter;
