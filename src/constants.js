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
    unlockCriteria: 'Win in 3 minutes or less'
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

/**
 * Get the combined ThemeAssetSet for a given visual and audio theme
 * @param {string} visualId - Visual theme ID
 * @param {string} audioId - Audio/sound pack ID
 * @returns {Object} Combined ThemeAssetSet with all styling properties
 */
const getThemeAssetSet = (visualId, audioId) => {
  // Validate and sanitize input IDs - ensure they're strings, not arrays or other types
  const safeVisualId = (typeof visualId === 'string' && visualId.trim()) ? visualId.trim() : 'default';
  const safeAudioId = (typeof audioId === 'string' && audioId.trim()) ? audioId.trim() : 'classic';
  
  const comboKey = getComboKey(safeVisualId, safeAudioId);
  const combo = THEME_COMBINATIONS[comboKey] || THEME_COMBINATIONS['default_classic'];
  const visualBase = VISUAL_BASES[safeVisualId] || VISUAL_BASES.default;
  const texture = BOARD_TEXTURES[combo.boardTexture] || BOARD_TEXTURES.smooth;
  const decorSet = DECOR_SETS[combo.decor] || DECOR_SETS.none;
  
  // Optional filesystem-based assets (user-provided)
  // Use BASE_PATH from config for subdirectory deployments (e.g., GitHub Pages)
  const basePath = (window.CONFIG && window.CONFIG.BASE_PATH) || '';
  const assetBase = `${basePath}/public/assets/themes/${safeVisualId}/${safeAudioId}`.replace(/^\/\//, '/');
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
window.THEMES = THEMES;
window.SOUND_PACKS = SOUND_PACKS;
window.EMOJI_CATEGORIES = EMOJI_CATEGORIES;

// ============================================================================
// BADGE SYSTEM
// ============================================================================

/**
 * Badge definitions for achievements and milestones
 * Each badge has: id, name, description, icon, category, and criteria
 */
const BADGES = Object.freeze({
  // ===== MILESTONE BADGES =====
  first_win: {
    id: 'first_win',
    name: 'First Victory',
    description: 'Complete your first puzzle',
    icon: '🎯',
    category: 'milestone',
    rarity: 'common'
  },
  
  wins_10: {
    id: 'wins_10',
    name: 'Decade Master',
    description: 'Win 10 puzzles',
    icon: '🏆',
    category: 'milestone',
    rarity: 'common'
  },
  
  wins_25: {
    id: 'wins_25',
    name: 'Quarter Century',
    description: 'Win 25 puzzles',
    icon: '🎖️',
    category: 'milestone',
    rarity: 'uncommon'
  },
  
  wins_50: {
    id: 'wins_50',
    name: 'Half Century',
    description: 'Win 50 puzzles',
    icon: '⭐',
    category: 'milestone',
    rarity: 'rare'
  },
  
  wins_100: {
    id: 'wins_100',
    name: 'Centurion',
    description: 'Win 100 puzzles',
    icon: '👑',
    category: 'milestone',
    rarity: 'epic'
  },
  
  // ===== DIFFICULTY BADGES =====
  easy_specialist: {
    id: 'easy_specialist',
    name: 'Easy Specialist',
    description: 'Win 20 Easy puzzles',
    icon: '🟢',
    category: 'difficulty',
    rarity: 'common'
  },
  
  medium_master: {
    id: 'medium_master',
    name: 'Medium Master',
    description: 'Win 20 Medium puzzles',
    icon: '🟡',
    category: 'difficulty',
    rarity: 'uncommon'
  },
  
  hard_hero: {
    id: 'hard_hero',
    name: 'Hard Hero',
    description: 'Win 20 Hard puzzles',
    icon: '🔴',
    category: 'difficulty',
    rarity: 'rare'
  },
  
  // ===== ACHIEVEMENT BADGES =====
  perfect_game: {
    id: 'perfect_game',
    name: 'Flawless',
    description: 'Complete a puzzle with no mistakes',
    icon: '✨',
    category: 'achievement',
    rarity: 'uncommon'
  },
  
  perfect_5: {
    id: 'perfect_5',
    name: 'Perfectionist',
    description: 'Complete 5 puzzles with no mistakes',
    icon: '💎',
    category: 'achievement',
    rarity: 'rare'
  },
  
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a puzzle in under 3 minutes',
    icon: '⚡',
    category: 'achievement',
    rarity: 'uncommon'
  },
  
  lightning_fast: {
    id: 'lightning_fast',
    name: 'Lightning Fast',
    description: 'Complete 10 puzzles in under 3 minutes',
    icon: '🚀',
    category: 'achievement',
    rarity: 'epic'
  },
  
  // ===== SPECIAL BADGES =====
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Play before 8 AM',
    icon: '🌅',
    category: 'special',
    rarity: 'common'
  },
  
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Play after midnight',
    icon: '🦉',
    category: 'special',
    rarity: 'common'
  },
  
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Send 50 chat messages',
    icon: '🦋',
    category: 'special',
    rarity: 'uncommon'
  },
  
  theme_collector: {
    id: 'theme_collector',
    name: 'Theme Collector',
    description: 'Unlock all visual themes',
    icon: '🎨',
    category: 'special',
    rarity: 'epic'
  },
  
  sound_collector: {
    id: 'sound_collector',
    name: 'Sound Collector',
    description: 'Unlock all sound packs',
    icon: '🎵',
    category: 'special',
    rarity: 'epic'
  },
  
  completionist: {
    id: 'completionist',
    name: 'Completionist',
    description: 'Unlock everything and earn all other badges',
    icon: '🏅',
    category: 'special',
    rarity: 'legendary'
  }
});

/**
 * Badge categories for organization
 */
const BADGE_CATEGORIES = Object.freeze({
  milestone: { name: 'Milestones', icon: '🎯', color: 'blue' },
  difficulty: { name: 'Difficulty Master', icon: '🎮', color: 'purple' },
  achievement: { name: 'Achievements', icon: '⭐', color: 'yellow' },
  special: { name: 'Special', icon: '✨', color: 'pink' }
});

/**
 * Badge rarity levels
 */
const BADGE_RARITY = Object.freeze({
  common: { name: 'Common', color: 'bg-gray-400', textColor: 'text-gray-700' },
  uncommon: { name: 'Uncommon', color: 'bg-green-400', textColor: 'text-green-700' },
  rare: { name: 'Rare', color: 'bg-blue-400', textColor: 'text-blue-700' },
  epic: { name: 'Epic', color: 'bg-purple-400', textColor: 'text-purple-700' },
  legendary: { name: 'Legendary', color: 'bg-yellow-400', textColor: 'text-yellow-700' }
});

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

// Badge System exports
window.BADGES = BADGES;
window.BADGE_CATEGORIES = BADGE_CATEGORIES;
window.BADGE_RARITY = BADGE_RARITY;
