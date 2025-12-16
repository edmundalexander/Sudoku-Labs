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
    
    // Texture overlay
    texture: {
      name: texture.name,
      pattern: texture.pattern,
      opacity: texture.opacity
    },
    
    // Decorative elements
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
window.getComboKey = getComboKey;
window.getThemeAssetSet = getThemeAssetSet;
