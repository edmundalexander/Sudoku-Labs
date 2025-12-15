/**
 * Sudoku Logic Lab - Constants
 * 
 * Global constants for themes, sound packs, campaign levels, and storage keys.
 * This file uses plain JavaScript (no JSX) and can be loaded before React.
 * 
 * @version 2.2.0
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
    title: "The Awakening",
    difficulty: DIFFICULTY.EASY,
    desc: "Start your journey. Complete an Easy puzzle.",
    criteria: (s) => s.status === 'won',
    biome: 'grass'
  },
  {
    id: 2,
    title: "Swift Mind",
    difficulty: DIFFICULTY.EASY,
    desc: "Solve an Easy puzzle in under 3 minutes.",
    criteria: (s) => s.status === 'won' && s.time < 180,
    biome: 'grass'
  },
  {
    id: 3,
    title: "Treasure Trove",
    difficulty: DIFFICULTY.EASY,
    desc: "Bonus Level! Solve with 0 mistakes.",
    criteria: (s) => s.status === 'won' && s.mistakes === 0,
    biome: 'grass',
    isChest: true
  },
  {
    id: 4,
    title: "Sandstorm",
    difficulty: DIFFICULTY.MEDIUM,
    desc: "Step up the challenge. Complete a Medium puzzle.",
    criteria: (s) => s.status === 'won',
    biome: 'desert'
  },
  {
    id: 5,
    title: "Mirage",
    difficulty: DIFFICULTY.MEDIUM,
    desc: "Medium puzzle, max 1 mistake.",
    criteria: (s) => s.status === 'won' && s.mistakes <= 1,
    biome: 'desert'
  },
  {
    id: 6,
    title: "Oasis Cache",
    difficulty: DIFFICULTY.MEDIUM,
    desc: "Bonus! Medium puzzle under 8 mins.",
    criteria: (s) => s.status === 'won' && s.time < 480,
    biome: 'desert',
    isChest: true
  },
  {
    id: 7,
    title: "Void Walker",
    difficulty: DIFFICULTY.HARD,
    desc: "Face the ultimate test. Complete a Hard puzzle.",
    criteria: (s) => s.status === 'won',
    biome: 'space'
  },
  {
    id: 8,
    title: "Star Lord",
    difficulty: DIFFICULTY.HARD,
    desc: "Hard puzzle, 0 mistakes, under 15 min.",
    criteria: (s) => s.status === 'won' && s.mistakes === 0 && s.time < 900,
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
    unlocked: true
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
    unlockCriteria: 'Win 5 games'
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
    unlockCriteria: 'Win 10 games'
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
    unlockCriteria: 'Complete a Hard puzzle'
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
    unlockCriteria: 'Win a puzzle with 0 mistakes'
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
    unlockCriteria: 'Win 3 Easy puzzles'
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
    unlockCriteria: 'Win 3 Medium puzzles'
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
    unlockCriteria: 'Win a puzzle in under 3 minutes'
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
