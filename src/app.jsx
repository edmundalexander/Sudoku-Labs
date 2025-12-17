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

const { useState, useEffect, useCallback, useRef, memo, useMemo, Component } = React;

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);
    if (typeof logError === 'function') {
      logError('React Error Boundary: ' + error.message, error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md text-center">
            <div className="text-4xl mb-4">😕</div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The game encountered an unexpected error.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
      bgGradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      animation: 'float-slow',
      blur: 'blur(8px)'
    },
    ocean: {
      colors: ['#0891b2', '#06b6d4', '#67e8f9'],
      bgGradient: 'linear-gradient(135deg, #06b6d4, #67e8f9)',
      animation: 'float-slow-wave',
      blur: 'blur(12px)'
    },
    forest: {
      colors: ['#059669', '#10b981', '#34d399'],
      bgGradient: 'linear-gradient(135deg, #10b981, #6ee7b7)',
      animation: 'float-slow',
      blur: 'blur(10px)'
    },
    sunset: {
      colors: ['#ea580c', '#f97316', '#fb923c'],
      bgGradient: 'linear-gradient(135deg, #f97316, #fbbf24)',
      animation: 'float-glow',
      blur: 'blur(14px)'
    },
    midnight: {
      colors: ['#6366f1', '#818cf8', '#a5b4fc'],
      bgGradient: 'linear-gradient(135deg, #6366f1, #a5b4fc)',
      animation: 'float-pulse',
      blur: 'blur(16px)'
    },
    sakura: {
      colors: ['#db2777', '#ec4899', '#f472b6'],
      bgGradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
      animation: 'float-soft',
      blur: 'blur(11px)'
    },
    volcano: {
      colors: ['#dc2626', '#f87171', '#fca5a5'],
      bgGradient: 'linear-gradient(135deg, #dc2626, #f97316)',
      animation: 'float-intense',
      blur: 'blur(9px)'
    },
    arctic: {
      colors: ['#0284c7', '#0ea5e9', '#38bdf8'],
      bgGradient: 'linear-gradient(135deg, #0ea5e9, #7dd3fc)',
      animation: 'float-crystalline',
      blur: 'blur(13px)'
    }
  };

  // Audio theme shape and opacity modifiers
  const audioModifiers = {
    classic: { shape: 'rounded-full', opacity: 0.6, filter: 'none' },
    zen: { shape: 'rounded-3xl', opacity: 0.5, filter: 'opacity-50' },
    funfair: { shape: 'rounded-2xl', opacity: 0.7, filter: 'brightness-110 saturate-150' },
    retro: { shape: 'rounded-lg', opacity: 0.65, filter: 'hue-rotate-12' },
    space: { shape: 'rounded-full', opacity: 0.55, filter: 'hue-rotate-180 brightness-90' },
    nature: { shape: 'rounded-3xl', opacity: 0.6, filter: 'saturate-150' },
    crystal: { shape: 'rounded-2xl', opacity: 0.75, filter: 'brightness-125' },
    minimal: { shape: 'rounded-sm', opacity: 0.5, filter: 'grayscale-50' }
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
    size: 40 + (index % 3) * 15  // Vary sizes: 40px, 55px, 70px
  };
};

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

/**
 * Debug mode to test API endpoints and database synchronization
 * Call with: window.runDebugTests() in browser console
 */
window.runDebugTests = async function() {
  console.log('%c🔍 Starting Debug Tests...', 'color: blue; font-size: 16px; font-weight: bold');
  console.log('');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  try {
    // Test 1: Check GAS configuration
    console.log('%cTest 1: GAS Configuration...', 'font-weight: bold');
    if (isGasEnvironment()) {
      console.log('✅ GAS_URL is configured and valid');
      results.passed.push('GAS Configuration');
    } else {
      console.log('⚠️  GAS_URL not configured - using local fallback');
      results.warnings.push('GAS not configured');
    }
    
    // Test 2: Ping backend (if configured)
    if (isGasEnvironment()) {
      console.log('\n%cTest 2: Backend Ping...', 'font-weight: bold');
      try {
        const pingResult = await runGasFn('ping');
        if (pingResult && pingResult.ok) {
          console.log('✅ Backend is responding');
          console.log('   Timestamp:', pingResult.timestamp);
          results.passed.push('Backend Ping');
        } else {
          console.log('❌ Backend ping failed');
          results.failed.push('Backend Ping');
        }
      } catch (e) {
        console.log('❌ Backend unreachable:', e.message);
        results.failed.push('Backend Ping');
      }
    }
    
    // Test 3: Check user authentication
    console.log('\n%cTest 3: User Authentication Status...', 'font-weight: bold');
    const session = StorageService.getUserSession();
    if (session && session.userId) {
      console.log('✅ User authenticated:', session.username);
      console.log('   User ID:', session.userId);
      results.passed.push('User Session');
      
      // Test 4: Get user profile (if GAS configured)
      if (isGasEnvironment()) {
        console.log('\n%cTest 4: Fetching User Profile...', 'font-weight: bold');
        try {
          const profile = await runGasFn('getUserProfile', { userId: session.userId });
          if (profile && profile.success) {
            console.log('✅ User Profile Retrieved:');
            console.table({
              'Total Games': profile.user.totalGames,
              'Total Wins': profile.user.totalWins,
              'Easy Wins': profile.user.easyWins || 0,
              'Medium Wins': profile.user.mediumWins || 0,
              'Hard Wins': profile.user.hardWins || 0,
              'Perfect Wins': profile.user.perfectWins || 0,
              'Fast Wins': profile.user.fastWins || 0,
              'Win Rate': (profile.user.totalGames > 0 ? ((profile.user.totalWins / profile.user.totalGames) * 100).toFixed(2) : 0) + '%'
            });
            results.passed.push('User Profile Fetch');
          } else {
            console.log('❌ Failed to fetch user profile:', profile?.error);
            results.failed.push('User Profile Fetch');
          }
        } catch (e) {
          console.log('❌ User profile fetch error:', e.message);
          results.failed.push('User Profile Fetch');
        }
        
        // Test 5: Get user state
        console.log('\n%cTest 5: Fetching User State (Unlocks)...', 'font-weight: bold');
        try {
          const state = await runGasFn('getUserState', { userId: session.userId });
          if (state && state.success && state.state) {
            console.log('✅ User State Retrieved:');
            console.log('   Unlocked Themes:', state.state.unlockedThemes || []);
            console.log('   Unlocked Sound Packs:', state.state.unlockedSoundPacks || []);
            console.log('   Game Stats:', state.state.gameStats || {});
            results.passed.push('User State Fetch');
          } else {
            console.log('❌ Failed to fetch user state:', state?.error);
            results.failed.push('User State Fetch');
          }
        } catch (e) {
          console.log('❌ User state fetch error:', e.message);
          results.failed.push('User State Fetch');
        }
      }
    } else {
      console.log('⚠️  No authenticated user. Login first to test user endpoints.');
      results.warnings.push('No User Session');
    }
    
    // Test 6: Local storage check
    console.log('\n%cTest 6: Checking Local Storage...', 'font-weight: bold');
    const localStorage_stats = StorageService.getGameStats();
    const localStorage_themes = StorageService.getUnlockedThemes();
    const localStorage_packs = StorageService.getUnlockedSoundPacks();
    console.log('✅ Local Storage Accessible:');
    console.log('   Game Stats:', localStorage_stats);
    console.log('   Unlocked Themes:', localStorage_themes);
    console.log('   Unlocked Sound Packs:', localStorage_packs);
    results.passed.push('Local Storage Check');
    
    // Test 7: Sound Manager
    console.log('\n%cTest 7: Sound Manager...', 'font-weight: bold');
    if (typeof SoundManager !== 'undefined') {
      console.log('✅ SoundManager available');
      console.log('   Current Pack:', SoundManager.currentPack);
      console.log('   Available Packs:', Object.keys(SoundManager.packHandlers));
      results.passed.push('Sound Manager');
    } else {
      console.log('❌ SoundManager not loaded');
      results.failed.push('Sound Manager');
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('%c📊 DEBUG TEST SUMMARY', 'color: blue; font-size: 14px; font-weight: bold');
    console.log('='.repeat(50));
    console.log(`%c✅ Passed: ${results.passed.length} tests`, 'color: green');
    if (results.warnings.length > 0) {
      console.log(`%c⚠️  Warnings: ${results.warnings.length}`, 'color: orange');
      console.log('   ', results.warnings.join(', '));
    }
    if (results.failed.length > 0) {
      console.log(`%c❌ Failed: ${results.failed.length} tests`, 'color: red');
      console.log('   ', results.failed.join(', '));
    }
    console.log('\n💡 ' + (results.failed.length === 0 ? 'All systems operational!' : 'Some issues detected - check failed tests above.'));
    
    return results;
  } catch (err) {
    console.error('❌ Debug test error:', err);
    return { error: err.message };
  }
};

/**
 * Clear all local data (for testing)
 * Call with: window.clearAllData()
 */
window.clearAllData = function() {
  if (!confirm('This will clear all local game data including progress, unlocks, and settings. Continue?')) {
    return;
  }
  Object.values(KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('✅ All local data cleared. Refresh the page to start fresh.');
};

/**
 * Grant test unlocks (for testing)
 * Call with: window.grantTestUnlocks()
 */
window.grantTestUnlocks = function() {
  const allThemes = Object.keys(THEMES);
  const allPacks = Object.keys(SOUND_PACKS);
  StorageService.saveUnlockedThemes(allThemes);
  StorageService.saveUnlockedSoundPacks(allPacks);
  console.log('✅ All themes and sound packs unlocked for testing. Refresh to see changes.');
};

// Make debug mode available globally
console.log('%c🧩 Sudoku Logic Lab v2.3', 'color: blue; font-size: 16px; font-weight: bold');
console.log('%c🔧 Debug Commands:', 'color: gray; font-size: 12px');
console.log('%c   window.runDebugTests() - Run diagnostic tests', 'color: gray; font-size: 11px');
console.log('%c   window.clearAllData() - Clear all local data', 'color: gray; font-size: 11px');
console.log('%c   window.grantTestUnlocks() - Unlock all themes/sounds', 'color: gray; font-size: 11px');

const Cell = memo(({ data, isSelected, onClick, isCompletedBox, isConflicting = false }) => {
  const { row, col, value, isFixed, isError, notes, isHinted } = data;
  const isRightBorder = (col + 1) % 3 === 0 && col !== 8;
  const isBottomBorder = (row + 1) % 3 === 0 && row !== 8;
  let baseClasses = "relative flex items-center justify-center text-base sm:text-lg md:text-xl font-medium cursor-pointer transition-all duration-200 select-none h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-12 lg:w-12";
  if (isRightBorder) baseClasses += " border-r-2 border-gray-400 dark:border-gray-500";
  else baseClasses += " border-r border-gray-200 dark:border-gray-700";
  if (isBottomBorder) baseClasses += " border-b-2 border-gray-400 dark:border-gray-500";
  else baseClasses += " border-b border-gray-200 dark:border-gray-700";
  let bgClass = "bg-white dark:bg-gray-800";
  if (isSelected) bgClass = "bg-blue-200 dark:bg-blue-900";
  else if (isError) bgClass = "bg-red-100 dark:bg-red-900 animate-shake";
  else if (isHinted) bgClass = "bg-yellow-100 dark:bg-yellow-900";
  else if (isConflicting) bgClass = "bg-orange-100 dark:bg-orange-900/50 ring-1 ring-orange-300 dark:ring-orange-700";
  else if (isFixed) bgClass = "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold";
  else bgClass = "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400";
  if (isCompletedBox && !isSelected && !isError) {
    bgClass += " transition-colors duration-1000 bg-amber-50 dark:bg-amber-900/30";
  }
  const renderContent = () => {
    if (value !== null) return <span className={!isFixed ? "animate-pop" : ""}>{value}</span>;
    if (notes.length > 0) {
      return (
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <div key={n} className="flex items-center justify-center text-[0.4rem] sm:text-[0.5rem] md:text-xs leading-none text-gray-500 dark:text-gray-400">
              {notes.includes(n) ? n : ''}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  return (
    <div className={`${baseClasses} ${bgClass}`} onClick={onClick}>
      {renderContent()}
      {isCompletedBox && !isError && <div className="sparkle top-1/2 left-1/2" />}
    </div>
  );
});

const SudokuBoard = ({ board, selectedId, onCellClick, completedBoxes, boardTexture, conflictingCells = new Set() }) => {
  // Generate texture background style
  const getTextureStyle = () => {
    if (!boardTexture || boardTexture.pattern === 'none') return {};
    
    const texturePatterns = {
      paper: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
      wood: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='20' viewBox='0 0 100 20'%3E%3Cpath d='M0,10 Q25,8 50,10 T100,10' stroke='%23654321' stroke-width='0.5' fill='none' opacity='0.4'/%3E%3C/svg%3E")`,
      pixel: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000' opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000' opacity='0.03'/%3E%3C/svg%3E")`,
      stone: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Cpath d='M0,0 L15,2 L30,0 L28,15 L30,30 L15,28 L0,30 L2,15 Z' fill='none' stroke='%23888' stroke-width='0.3' opacity='0.3'/%3E%3C/svg%3E")`,
      ice: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20,0 L20,40 M0,20 L40,20 M5,5 L35,35 M35,5 L5,35' stroke='%2399ccff' stroke-width='0.3' opacity='0.3'/%3E%3C/svg%3E")`,
      nebula: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='15' cy='20' r='1' fill='white' opacity='0.5'/%3E%3Ccircle cx='45' cy='15' r='0.5' fill='white' opacity='0.4'/%3E%3Ccircle cx='30' cy='50' r='0.8' fill='white' opacity='0.5'/%3E%3C/svg%3E")`,
      carnival: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='5' cy='5' r='1' fill='%23ff6b6b' opacity='0.15'/%3E%3Ccircle cx='15' cy='15' r='1' fill='%234ecdc4' opacity='0.15'/%3E%3C/svg%3E")`,
      concrete: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Crect width='10' height='10' fill='%23888' opacity='0.02'/%3E%3C/svg%3E")`
    };
    
    return {
      backgroundImage: texturePatterns[boardTexture.pattern] || 'none',
      backgroundRepeat: 'repeat'
    };
  };
  
  return (
    <div className="border-4 border-gray-800 dark:border-gray-400 rounded-sm overflow-hidden shadow-xl inline-block relative">
      {/* Board texture overlay */}
      {boardTexture && boardTexture.pattern !== 'none' && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            ...getTextureStyle(),
            opacity: boardTexture.opacity || 0.15
          }}
        />
      )}
      <div className="grid grid-cols-9 relative z-0">
        {board.map((cell) => {
          const boxIdx = Math.floor(cell.row / 3) * 3 + Math.floor(cell.col / 3);
          const isCompleted = completedBoxes.includes(boxIdx);
          const isConflicting = conflictingCells.has(cell.id);
          return (
            <Cell key={cell.id} data={cell} isSelected={selectedId === cell.id} onClick={() => onCellClick(cell.id)} isCompletedBox={isCompleted} isConflicting={isConflicting} />
          );
        })}
      </div>
    </div>
  );
};

const Icons = {
  Undo: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>,
  Pencil: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>,
  Eraser: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" /></svg>,
  Moon: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>,
  Sun: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
  Play: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>,
  Chat: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  VolumeUp: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>,
  VolumeOff: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12h-3M3 3l18 18M11.25 5.25L11.25 18.75" /></svg>,
  Map: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  Star: ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.545.044.77.77.326 1.163l-4.304 3.86a.562.562 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.304-3.86c-.444-.393-.219-1.119.326-1.163l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
  Chest: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M21 11.25H3M21 11.25a1.5 1.5 0 00-1.5-1.5H16.5m-3 0h3m-3 0c0-1.242-1.008-2.25-2.25-2.25s-2.25 1.008-2.25 2.25m4.5 0h-4.5m4.5 0H21m-4.5 0H4.5m0 0a1.5 1.5 0 00-1.5 1.5m1.5-1.5h-3" /></svg>,
  Avatar: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white drop-shadow-lg"><circle cx="12" cy="12" r="10" className="text-blue-500" /><path fill="white" d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 18a6 6 0 0112 0H6z" /></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  Login: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>,
  Logout: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>,
  Palette: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" /></svg>,
  Awards: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-5 h-5"
      role="img"
      aria-label="Awards"
    >
      <title>Awards</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 4.5V3.75A1.5 1.5 0 0 0 15 2.25H9A1.5 1.5 0 0 0 7.5 3.75V4.5m9 0v3A4.5 4.5 0 0 1 12 12a4.5 4.5 0 0 1-4.5-4.5v-3m9 0h1.11A1.39 1.39 0 0 1 19.5 5.89V7.5A1.5 1.5 0 0 1 18 9h-1.5m-9-4.5H6.39A1.39 1.39 0 0 0 5 5.89V7.5A1.5 1.5 0 0 0 6.5 9H8m3 6h2m-4 0h6m-6 0v2.25c0 .621.504 1.125 1.125 1.125h3.75c.621 0 1.125-.504 1.125-1.125V15"
      />
    </svg>
  ),
  Music: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9.75V4.5l10.5-2.25v5.25M9 9.75L19.5 7.5M9 9.75v7.875A2.625 2.625 0 014.5 20.25 2.625 2.625 0 012 17.625 2.625 2.625 0 014.5 15c.986 0 1.84.533 2.304 1.32M19.5 7.5v9.375A2.625 2.625 0 0115 19.5a2.625 2.625 0 01-2.5-2.625A2.625 2.625 0 0115 14.25c.986 0 1.84.533 2.304 1.32" /></svg>,
  Pause: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>,
  Lightbulb: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>,
  HelpCircle: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
};

const CHAT_POLL_INTERVAL = 5000;

// --- AWARDS ZONE (Themes + Sound Packs) ---
const AwardsZone = ({ soundEnabled, onClose, activeThemeId, unlockedThemes, onSelectTheme, activePackId, unlockedPacks, onSelectPack }) => {
  const [stats, setStats] = useState(StorageService.getGameStats());
  
  // Compute current asset set for the preview
  const currentAssetSet = useMemo(() => {
    if (typeof getThemeAssetSet === 'function') {
      return getThemeAssetSet(activeThemeId, activePackId);
    }
    const theme = THEMES[activeThemeId] || THEMES.default;
    return {
      name: theme.name,
      description: theme.description,
      background: theme.background,
      texture: { pattern: 'none', opacity: 0, name: 'None' },
      decor: []
    };
  }, [activeThemeId, activePackId]);
  
  // Refresh stats from StorageService when component mounts
  useEffect(() => {
    const currentStats = StorageService.getGameStats();
    setStats(currentStats);
  }, []);

  const isThemeUnlocked = (themeId) => unlockedThemes.includes(themeId);
  const isPackUnlocked = (packId) => unlockedPacks.includes(packId) || SOUND_PACKS[packId]?.unlocked;

  const getThemeProgress = (themeId) => {
    if (!THEMES[themeId] || THEMES[themeId].unlocked || isThemeUnlocked(themeId)) return null;
    switch (themeId) {
      case 'ocean': return `${Math.min(stats.totalWins, 5)}/5 wins`;
      case 'forest': return `${Math.min(stats.totalWins, 10)}/10 wins`;
      case 'sunset': return stats.hardWins >= 1 ? 'Unlocked!' : `${stats.hardWins}/1 Hard win`;
      case 'midnight': return stats.perfectWins >= 1 ? 'Unlocked!' : `${stats.perfectWins}/1 perfect win`;
      case 'sakura': return `${Math.min(stats.easyWins, 3)}/3 Easy wins`;
      case 'volcano': return `${Math.min(stats.mediumWins, 3)}/3 Medium wins`;
      case 'arctic': return stats.fastWins >= 1 ? 'Unlocked!' : `${stats.fastWins}/1 fast win`;
      default: return null;
    }
  };

  const getPackProgress = (packId) => {
    switch (packId) {
      case 'funfair': return `${Math.min(stats.totalWins, 3)}/3 wins`;
      case 'retro': return `${Math.min(stats.easyWins, 3)}/3 Easy wins`;
      case 'space': return stats.hardWins >= 1 ? 'Unlocked!' : `${stats.hardWins}/1 Hard win`;
      case 'nature': return `${Math.min(stats.mediumWins, 3)}/3 Medium wins`;
      case 'crystal': return stats.perfectWins >= 1 ? 'Unlocked!' : `${stats.perfectWins}/1 perfect win`;
      case 'minimal': return stats.fastWins >= 1 ? 'Unlocked!' : `${stats.fastWins}/1 under 3 min`;
      default: return null;
    }
  };

  const handleThemeSelect = (themeId) => {
    if (!isThemeUnlocked(themeId)) return;
    if (soundEnabled) SoundManager.play('uiTap');
    onSelectTheme(themeId);
    StorageService.saveActiveTheme(themeId);
  };

  const handlePackSelect = (packId) => {
    if (!isPackUnlocked(packId)) return;
    if (soundEnabled) {
      SoundManager.setPack(packId);
      SoundManager.play('uiTap');
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
        <div className={`p-4 rounded-xl ${activeVisualTheme.background} border-2 border-gray-300 dark:border-gray-600 relative overflow-hidden`}>
          {/* SVG Background Pattern */}
          {currentAssetSet.svgBackground && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{ 
                backgroundImage: currentAssetSet.svgBackground,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.5
              }}
            />
          )}
          
          {/* Texture overlay visualization */}
          {currentAssetSet.texture.pattern !== 'none' && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{ 
                opacity: currentAssetSet.texture.opacity,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23666'/%3E%3C/svg%3E")`
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
              <span className="text-gray-600 dark:text-gray-300">Board Texture:</span>
              <span className="text-gray-800 dark:text-white font-semibold">{currentAssetSet.texture.name}</span>
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
              {Object.values(THEMES).map(theme => {
                const unlocked = isThemeUnlocked(theme.id);
                const isActive = theme.id === activeThemeId;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    disabled={!unlocked}
                    className={`p-2 rounded-lg text-xl transition-all ${
                      isActive 
                        ? 'bg-blue-500 ring-2 ring-blue-300' 
                        : unlocked 
                          ? 'bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500' 
                          : 'opacity-40 cursor-not-allowed bg-gray-200 dark:bg-gray-800'
                    }`}
                    title={unlocked ? theme.name : `🔒 ${theme.unlockCriteria}`}
                  >
                    {theme.icon}
                  </button>
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
              {Object.values(SOUND_PACKS).map(pack => {
                const unlocked = isPackUnlocked(pack.id);
                const isActive = pack.id === activePackId;
                return (
                  <button
                    key={pack.id}
                    onClick={() => handlePackSelect(pack.id)}
                    disabled={!unlocked}
                    className={`p-2 rounded-lg text-xl transition-all ${
                      isActive 
                        ? 'bg-blue-500 ring-2 ring-blue-300' 
                        : unlocked 
                          ? 'bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500' 
                          : 'opacity-40 cursor-not-allowed bg-gray-200 dark:bg-gray-800'
                    }`}
                    title={unlocked ? pack.name : `🔒 ${pack.unlockCriteria}`}
                  >
                    {pack.icon}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Combination hint */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Mix any visual theme with any audio theme to create 64 unique combinations!
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-pop relative">
        <button
          onClick={() => { if (soundEnabled) SoundManager.play('uiTap'); onClose(); }}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Icons.X />
        </button>

        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"><Icons.Awards /> Customizer</h2>
          <span className="text-[10px] sm:text-xs text-gray-500">Style Your Game</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
          Mix any visual theme with any sound pack to create your perfect experience.
        </p>

        {renderMixMatch()}
      </div>
    </div>
  );
};

// --- USER PANEL COMPONENT ---
const UserPanel = ({ soundEnabled, onClose, appUserSession }) => {
  const [mode, setMode] = useState('menu'); // menu, login, register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [localUserSession, setLocalUserSession] = useState(appUserSession || StorageService.getUserSession());

  // Update localUserSession whenever appUserSession changes (from parent)
  useEffect(() => {
    if (appUserSession) {
      setLocalUserSession(appUserSession);
    }
  }, [appUserSession]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    if (!isGasEnvironment()) {
      setError('Authentication requires backend connection');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await runGasFn('loginUser', { username, password });
      if (result && result.success) {
        setLocalUserSession(result.user);
        StorageService.setUserSession(result.user);
        if (soundEnabled) SoundManager.play('success');
        onClose(result.user);
      } else {
        setError(result.error || 'Login failed');
        if (soundEnabled) SoundManager.play('error');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
      if (soundEnabled) SoundManager.play('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (trimmedUsername.length > 20) {
      setError('Username must be 20 characters or less');
      return;
    }

    // Only allow alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password.length > 100) {
      setError('Password must be 100 characters or less');
      return;
    }

    if (!isGasEnvironment()) {
      setError('Authentication requires backend connection');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await runGasFn('registerUser', { username, password });
      if (result && result.success) {
        setLocalUserSession(result.user);
        StorageService.setUserSession(result.user);
        if (soundEnabled) SoundManager.play('success');
        onClose(result.user);
      } else {
        setError(result.error || 'Registration failed');
        if (soundEnabled) SoundManager.play('error');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Connection error. Please try again.');
      if (soundEnabled) SoundManager.play('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    StorageService.clearUserSession();
    setLocalUserSession(null);
    if (soundEnabled) SoundManager.play('uiTap');
    onClose(null);
  };

  const handleContinueAsGuest = () => {
    if (soundEnabled) SoundManager.play('uiTap');
    onClose(null);
  };

  // If user is already logged in, show profile
  if (localUserSession) {
    const localStats = StorageService.getGameStats();
    // Merge local stats with session stats (prefer higher values)
    // Note: localStats only tracks wins, session tracks both games and wins
    const mergedStats = {
      totalGames: localUserSession.totalGames || 0, // Only from session (games played includes losses)
      totalWins: Math.max(localUserSession.totalWins || 0, localStats.totalWins || 0),
      easyWins: Math.max(localUserSession.easyWins || 0, localStats.easyWins || 0),
      mediumWins: Math.max(localUserSession.mediumWins || 0, localStats.mediumWins || 0),
      hardWins: Math.max(localUserSession.hardWins || 0, localStats.hardWins || 0),
      perfectWins: Math.max(localUserSession.perfectWins || 0, localStats.perfectWins || 0),
      fastWins: Math.max(localUserSession.fastWins || 0, localStats.fastWins || 0)
    };
    const winRate = mergedStats.totalGames > 0 ? Math.round((mergedStats.totalWins / mergedStats.totalGames) * 100) : 0;
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md animate-pop relative overflow-hidden">
          {/* Decorative header gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20"></div>
          
          <button onClick={() => onClose(localUserSession)} className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10">
            <Icons.X />
          </button>

          <div className="relative text-center mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl sm:text-3xl text-white">
                {(localUserSession.displayName || localUserSession.username || '?')[0].toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{localUserSession.displayName || localUserSession.username}</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">@{localUserSession.username}</p>
          </div>

          {/* Main Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-xl text-center border border-blue-200 dark:border-blue-700">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{mergedStats.totalGames}</div>
              <div className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 font-medium uppercase">Games</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-xl text-center border border-green-200 dark:border-green-700">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{mergedStats.totalWins}</div>
              <div className="text-[10px] sm:text-xs text-green-700 dark:text-green-300 font-medium uppercase">Wins</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-3 rounded-xl text-center border border-purple-200 dark:border-purple-700">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{winRate}%</div>
              <div className="text-[10px] sm:text-xs text-purple-700 dark:text-purple-300 font-medium uppercase">Win Rate</div>
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
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{mergedStats.easyWins}</div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400">Easy</div>
              </div>
              <div className="text-center p-2 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{mergedStats.mediumWins}</div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400">Medium</div>
              </div>
              <div className="text-center p-2 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">{mergedStats.hardWins}</div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400">Hard</div>
              </div>
            </div>
            
            {/* Achievement stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Perfect</span>
                </div>
                <span className="font-bold text-sm text-gray-800 dark:text-white">{mergedStats.perfectWins}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Speed (&lt;3m)</span>
                </div>
                <span className="font-bold text-sm text-gray-800 dark:text-white">{mergedStats.fastWins}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2"
          >
            <Icons.Logout /> Logout
          </button>
        </div>
      </div>
    );
  }

  // Auth mode selection menu
  if (mode === 'menu') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-pop relative">
          <button onClick={handleContinueAsGuest} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Icons.X />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Icons.User />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Welcome!</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to track your progress across devices</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => { if (soundEnabled) SoundManager.play('uiTap'); setMode('login'); }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Icons.Login /> Sign In
            </button>

            <button
              onClick={() => { if (soundEnabled) SoundManager.play('uiTap'); setMode('register'); }}
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
  if (mode === 'login') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-pop relative">
          <button onClick={() => setMode('menu')} className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Icons.Undo />
          </button>
          <button onClick={handleContinueAsGuest} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Icons.X />
          </button>

          <div className="text-center mb-6 mt-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sign In</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back!</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter username"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button onClick={() => { setMode('register'); setError(''); }} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Create one
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Register form
  if (mode === 'register') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-pop relative">
          <button onClick={() => setMode('menu')} className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Icons.Undo />
          </button>
          <button onClick={handleContinueAsGuest} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Icons.X />
          </button>

          <div className="text-center mb-6 mt-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create Account</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Join the Sudoku community!</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Choose a username (3+ chars)"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); }} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign in
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-800 dark:text-yellow-300">
            <strong>Note:</strong> This is a demo authentication system. Don't use sensitive passwords.
          </div>
        </div>
      </div>
    );
  }

  return null;
};


const OpeningScreen = ({ onStart, onResume, hasSavedGame, darkMode, toggleDarkMode, loading, soundEnabled, toggleSound, onShowUserPanel, onShowAwards, userSession }) => {
  const localStats = StorageService.getGameStats();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 text-gray-900 dark:text-gray-100 animate-fade-in relative z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2 z-20">
        <button aria-label="User" onClick={onShowUserPanel} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
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
          <span className="hidden sm:inline text-[11px] font-semibold">Rewards</span>
        </button>
        <button aria-label="Sound" onClick={toggleSound} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          {soundEnabled ? <Icons.VolumeUp /> : <Icons.VolumeOff />}
        </button>
        <button aria-label="Theme" onClick={toggleDarkMode} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          {darkMode ? <Icons.Sun /> : <Icons.Moon />}
        </button>
      </div>

      <div className="relative text-center mb-6 sm:mb-8">
        <div className="text-5xl sm:text-6xl mb-3 animate-bounce-slow">🧩</div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-1">
          Sudoku <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Logic</span> Lab
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Challenge your mind, unlock rewards</p>
      </div>

      <div className="relative w-full max-w-md space-y-4 px-2">
        {/* Resume Game - prominent if available */}
        {hasSavedGame && (
          <button
            onClick={() => { if (soundEnabled) SoundManager.play('startGame'); onResume(); }}
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
                { name: 'Easy', color: 'from-green-500 to-green-600', hoverColor: 'hover:from-green-400 hover:to-green-500' },
                { name: 'Medium', color: 'from-yellow-500 to-orange-500', hoverColor: 'hover:from-yellow-400 hover:to-orange-400' },
                { name: 'Hard', color: 'from-red-500 to-rose-600', hoverColor: 'hover:from-red-400 hover:to-rose-500' },
                { name: 'Daily', color: 'from-blue-500 to-cyan-500', hoverColor: 'hover:from-blue-400 hover:to-cyan-400' }
              ].map(d => (
                <button
                  key={d.name}
                  onClick={() => { if (soundEnabled) SoundManager.play('startGame'); onStart(d.name); }}
                  disabled={loading}
                  className={`py-2.5 px-2 rounded-xl bg-gradient-to-br ${d.color} ${d.hoverColor} text-white transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-wait shadow-md hover:shadow-lg transform hover:scale-105`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats preview */}
        {localStats.totalWins > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-around text-center">
            <div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{localStats.totalWins}</div>
              <div className="text-[10px] text-gray-500 uppercase">Wins</div>
            </div>
            <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
            <div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{localStats.perfectWins}</div>
              <div className="text-[10px] text-gray-500 uppercase">Perfect</div>
            </div>
            <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
            <div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{localStats.fastWins}</div>
              <div className="text-[10px] text-gray-500 uppercase">Speed</div>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-8 sm:mt-10 text-[10px] sm:text-xs text-gray-400">v2.3 • Logic Lab Series</footer>
    </div>
  );
};

const ClosingScreen = ({ status, time, difficulty, mistakes, onRestart, onMenu, loading, soundEnabled, newlyUnlockedThemes, newlyUnlockedSoundPacks }) => {
  const isWin = status === 'won';

  useEffect(() => {
    if (isWin) {
      if (soundEnabled) SoundManager.play('success');
      triggerConfetti();
    }
  }, [isWin, soundEnabled]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 text-gray-900 dark:text-gray-100 animate-fade-in relative">
      <div className="text-center max-w-md w-full bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden z-10">
        <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 animate-bounce-slow">{isWin ? '🏆' : '💔'}</div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isWin ? 'text-blue-600' : 'text-red-500'}`}>
          {isWin ? 'Puzzle Solved!' : 'Game Over'}
        </h1>

        {newlyUnlockedThemes && newlyUnlockedThemes.length > 0 && (
          <div className="my-3 sm:my-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/40 dark:via-pink-900/30 dark:to-purple-900/40 rounded-xl border-2 border-purple-400 dark:border-purple-600 animate-pulse-glow relative overflow-hidden">
            {/* Sparkle overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-4 right-6 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              <div className="absolute bottom-3 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl animate-bounce">🎉</span>
                <p className="text-base sm:text-lg font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Icons.Palette /> New Theme{newlyUnlockedThemes.length > 1 ? 's' : ''} Unlocked!
                </p>
                <span className="text-2xl animate-bounce" style={{animationDelay: '0.2s'}}>✨</span>
              </div>
              <p className="text-xs text-center text-purple-600 dark:text-purple-200 mb-3">Visit Awards to equip your new look!</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {newlyUnlockedThemes.map((themeId, idx) => (
                  <div 
                    key={themeId} 
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border-2 border-purple-300 dark:border-purple-700 shadow-lg transform hover:scale-105 transition-all animate-bounce-in"
                    style={{animationDelay: `${idx * 0.1}s`}}
                  >
                    <span className="text-2xl drop-shadow-lg">{THEMES[themeId].icon}</span>
                    <div className="text-left">
                      <span className="text-sm font-bold text-gray-800 dark:text-white block">{THEMES[themeId].name}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{THEMES[themeId].description}</span>
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
              <div className="absolute top-4 left-6 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              <div className="absolute bottom-3 right-1/4 w-1 h-1 bg-indigo-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl animate-bounce">🎵</span>
                <p className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Icons.Music /> New Sound Pack{newlyUnlockedSoundPacks.length > 1 ? 's' : ''} Unlocked!
                </p>
                <span className="text-2xl animate-bounce" style={{animationDelay: '0.2s'}}>🔊</span>
              </div>
              <p className="text-xs text-center text-blue-600 dark:text-blue-200 mb-3">Visit Awards to try out your new sounds!</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {newlyUnlockedSoundPacks.map((packId, idx) => (
                  <div 
                    key={packId} 
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-lg transform hover:scale-105 transition-all animate-bounce-in"
                    style={{animationDelay: `${idx * 0.1}s`}}
                  >
                    <span className="text-2xl drop-shadow-lg">{SOUND_PACKS[packId]?.icon}</span>
                    <div className="text-left">
                      <span className="text-sm font-bold text-gray-800 dark:text-white block">{SOUND_PACKS[packId]?.name}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{SOUND_PACKS[packId]?.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8 text-center bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-xl">
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">Diff</div>
            <div className="font-bold text-sm sm:text-base">{difficulty}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">Time</div>
            <div className="font-mono text-sm sm:text-base">{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">Errors</div>
            <div className={`font-bold text-sm sm:text-base ${mistakes >= 3 ? 'text-red-500' : ''}`}>{mistakes}/3</div>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <button onClick={() => { if (soundEnabled) SoundManager.play('startGame'); onRestart(); }} disabled={loading} className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm sm:text-base transition-colors disabled:opacity-50">
            {loading ? 'Generating...' : (isWin ? 'Play Another' : 'Try Again')}
          </button>
          <button onClick={() => { if (soundEnabled) SoundManager.play('uiTap'); onMenu(); }} className="w-full py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-bold text-sm sm:text-base transition-colors">
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

const App = () => {
  const [view, setView] = useState('menu');
  const [board, setBoard] = useState([]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [status, setStatus] = useState('idle');
  const [timer, setTimer] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [mode, setMode] = useState('pen');
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showModal, setShowModal] = useState('none');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [userStatus, setUserStatus] = useState(StorageService.getUserStatus());
  const [chatMessages, setChatMessages] = useState([]);
  const [chatNotification, setChatNotification] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState(EMOJI_CATEGORIES[0].id);

  // User Authentication State
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [appUserSession, setAppUserSession] = useState(StorageService.getUserSession());

  // Theme State
  const [activeThemeId, setActiveThemeId] = useState(StorageService.getActiveTheme());
  const [unlockedThemes, setUnlockedThemes] = useState(StorageService.getUnlockedThemes());
  const [newlyUnlockedThemes, setNewlyUnlockedThemes] = useState([]);

  // Sound Pack State
  const [activeSoundPackId, setActiveSoundPackId] = useState(StorageService.getActiveSoundPack());
  const [unlockedSoundPacks, setUnlockedSoundPacks] = useState(StorageService.getUnlockedSoundPacks());
  const [newlyUnlockedSoundPacks, setNewlyUnlockedSoundPacks] = useState([]);
  const [showAwardsZone, setShowAwardsZone] = useState(false);
  const [pendingActiveThemeId, setPendingActiveThemeId] = useState(null);
  const [pendingActiveSoundPackId, setPendingActiveSoundPackId] = useState(null);
  const [awardsDirty, setAwardsDirty] = useState(false);
  const [bgAssetUrl, setBgAssetUrl] = useState(null);
  
  // QoL improvements state
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showConflicts, setShowConflicts] = useState(true);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  const isSendingRef = useRef(false);
  const persistTimerRef = useRef(null);
  const pendingPersistRef = useRef(null);
  const themeTouchedRef = useRef(false);
  const soundPackTouchedRef = useRef(false);
  const chatTouchStartRef = useRef(null);
  const chatTouchLastRef = useRef(null);

  const closeChat = useCallback((playSound = true) => {
    if (playSound && soundEnabled) SoundManager.play('uiTap');
    setChatNotification(null);
    setShowEmojiPicker(false);
    setIsChatOpen(false);
  }, [soundEnabled]);

  const openChat = useCallback(() => {
    if (soundEnabled) SoundManager.play('uiTap');
    setChatNotification(null);
    setShowEmojiPicker(false);
    setIsChatOpen(true);
  }, [soundEnabled]);

  // Persist merged unlock/theme/sound state to backend for authenticated users
  const persistUserStateToBackend = useCallback(async (partial = {}) => {
    const session = StorageService.getUserSession();
    if (!isGasEnvironment() || !session?.userId) return;

    const payload = {
      userId: session.userId,
      unlockedThemes: partial.unlockedThemes || StorageService.getUnlockedThemes(),
      unlockedSoundPacks: partial.unlockedSoundPacks || StorageService.getUnlockedSoundPacks(),
      activeTheme: partial.activeTheme ?? activeThemeId,
      activeSoundPack: partial.activeSoundPack ?? activeSoundPackId,
      gameStats: partial.gameStats || StorageService.getGameStats()
    };

    try {
      await runGasFn('saveUserState', payload);
    } catch (err) {
      console.error('Failed to persist user state:', err);
    }
  }, [activeThemeId, activeSoundPackId]);

  // Debounced persist to avoid UI lag when toggling themes/sound packs rapidly
  const flushPendingPersist = useCallback(async () => {
    const payload = pendingPersistRef.current;
    pendingPersistRef.current = null;
    persistTimerRef.current = null;
    if (payload) {
      await persistUserStateToBackend(payload);
    }
  }, [persistUserStateToBackend, activeThemeId, activeSoundPackId]);

  const schedulePersist = useCallback((partial) => {
    if (!isUserAuthenticated() || !isGasEnvironment()) return;
    pendingPersistRef.current = { ...(pendingPersistRef.current || {}), ...partial };
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(flushPendingPersist, 350);
  }, [flushPendingPersist]);

  const openAwards = async () => {
    setPendingActiveThemeId(activeThemeId);
    setPendingActiveSoundPackId(activeSoundPackId);
    setAwardsDirty(false);
    setShowAwardsZone(true);
    
    // Sync latest gameStats from backend to ensure database edits are reflected
    // This merges local and cloud data, taking the higher values
    if (isUserAuthenticated() && isGasEnvironment() && appUserSession?.userId) {
      try {
        const remote = await runGasFn('getUserState', { userId: appUserSession.userId });
        if (remote?.success && remote.state) {
          const localStats = StorageService.getGameStats();
          const remoteStats = remote.state.gameStats || {};
          
          // Merge stats - take max of each field to preserve progress from both sources
          const mergedStats = { ...localStats };
          Object.keys({ ...localStats, ...remoteStats }).forEach((k) => {
            mergedStats[k] = Math.max(Number(localStats[k] || 0), Number(remoteStats[k] || 0));
          });
          StorageService.saveGameStats(mergedStats);
          
          // Merge unlocks from local and remote
          const localThemes = StorageService.getUnlockedThemes();
          const localPacks = StorageService.getUnlockedSoundPacks();
          const mergedThemes = Array.from(new Set([...localThemes, ...(remote.state.unlockedThemes || [])]));
          const mergedPacks = Array.from(new Set([...localPacks, ...(remote.state.unlockedSoundPacks || [])]));
          
          // Re-run unlock checks with merged stats
          const newThemes = UnlockService.checkThemeUnlocks(mergedStats);
          const newPacks = UnlockService.checkSoundPackUnlocks(mergedStats);
          
          // Update state with merged unlocks
          const finalThemes = Array.from(new Set([...mergedThemes, ...newThemes]));
          const finalPacks = Array.from(new Set([...mergedPacks, ...newPacks]));
          
          StorageService.saveUnlockedThemes(finalThemes);
          StorageService.saveUnlockedSoundPacks(finalPacks);
          setUnlockedThemes(finalThemes);
          setUnlockedSoundPacks(finalPacks);
          
          // Persist merged state back to cloud
          await persistUserStateToBackend({
            unlockedThemes: finalThemes,
            unlockedSoundPacks: finalPacks,
            gameStats: mergedStats
          });
        }
      } catch (err) {
        console.error('Failed to sync game stats:', err);
      }
    }
  };

  // Hydrate local unlocks and selections from backend, merging with local progress
  const hydrateUserState = useCallback(async (user) => {
    if (!user?.userId || !isGasEnvironment()) return;
    try {
      const remote = await runGasFn('getUserState', { userId: user.userId });
      if (!remote || !remote.success || !remote.state) return;

      const localStats = StorageService.getGameStats();
      const remoteStats = remote.state.gameStats || {};
      const mergedStats = { ...localStats };
      Object.keys({ ...localStats, ...remoteStats }).forEach((k) => {
        mergedStats[k] = Math.max(Number(localStats[k] || 0), Number(remoteStats[k] || 0));
      });

      const mergedThemes = Array.from(new Set([...(StorageService.getUnlockedThemes()), ...(remote.state.unlockedThemes || [])]));
      const mergedPacks = Array.from(new Set([...(StorageService.getUnlockedSoundPacks()), ...(remote.state.unlockedSoundPacks || [])]));

      const currentActiveTheme = themeTouchedRef.current ? activeThemeId : StorageService.getActiveTheme();
      const currentActivePack = soundPackTouchedRef.current ? activeSoundPackId : StorageService.getActiveSoundPack();
      const remoteActiveTheme = remote.state.activeTheme;
      const remoteActivePack = remote.state.activeSoundPack;

      const activeTheme = themeTouchedRef.current ? currentActiveTheme : (remoteActiveTheme || currentActiveTheme);
      const activePack = soundPackTouchedRef.current ? currentActivePack : (remoteActivePack || currentActivePack);

      StorageService.saveUnlockedThemes(mergedThemes); setUnlockedThemes(mergedThemes);
      StorageService.saveUnlockedSoundPacks(mergedPacks); setUnlockedSoundPacks(mergedPacks);
      if (!themeTouchedRef.current) { StorageService.saveActiveTheme(activeTheme); setActiveThemeId(activeTheme); }
      if (!soundPackTouchedRef.current) { StorageService.saveActiveSoundPack(activePack); setActiveSoundPackId(activePack); }
      StorageService.saveGameStats(mergedStats);

      await persistUserStateToBackend({
        unlockedThemes: mergedThemes,
        unlockedSoundPacks: mergedPacks,
        activeTheme,
        activeSoundPack: activePack,
        gameStats: mergedStats
      });
    } catch (err) {
      console.error('Failed to hydrate user state:', err);
    }
  }, [persistUserStateToBackend]);

  useEffect(() => {
    const handleError = (event) => logError(event.message, event.error);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    StorageService.saveUserStatus(userStatus);
  }, [userStatus]);

  useEffect(() => {
    if (!showEmojiPicker) return undefined;
    const handleKey = (e) => { if (e.key === 'Escape') setShowEmojiPicker(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showEmojiPicker]);

  useEffect(() => {
    const handleGlobalChatClose = (e) => {
      if (e.key === 'Escape' && isChatOpen) {
        closeChat();
      }
    };
    window.addEventListener('keydown', handleGlobalChatClose);
    return () => window.removeEventListener('keydown', handleGlobalChatClose);
  }, [isChatOpen, closeChat]);

  useEffect(() => () => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
  }, []);

  useEffect(() => {
    SoundManager.setPack(activeSoundPackId);
  }, [activeSoundPackId]);

  useEffect(() => {
    if (!unlockedSoundPacks.includes(activeSoundPackId)) {
      const fallback = unlockedSoundPacks.includes('classic') ? 'classic' : unlockedSoundPacks[0] || 'classic';
      setActiveSoundPackId(fallback);
      SoundManager.setPack(fallback);
    }
  }, [unlockedSoundPacks, activeSoundPackId]);

  useEffect(() => {
    if (appUserSession) {
      hydrateUserState(appUserSession);
    }
  }, [appUserSession, hydrateUserState]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedSound = localStorage.getItem(KEYS.SOUND_ENABLED);

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true); document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false); document.documentElement.classList.remove('dark');
    }
    if (savedSound === 'false') setSoundEnabled(false);

    const saved = StorageService.loadGame();
    if (saved && saved.status === 'playing') {
      setBoard(saved.board); setTimer(saved.timer); setMistakes(saved.mistakes);
      setDifficulty(saved.difficulty); setStatus('paused'); setHistory(saved.history); setView('game');
    }
  }, []);

  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = window.setInterval(() => { setTimer(t => t + 1); }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  useEffect(() => {
    if (status === 'playing' || status === 'paused') {
      StorageService.saveGame({ board, difficulty, status, timer, mistakes, history, historyIndex: history.length - 1, selectedCell, mode });
    }
  }, [board, timer, status, difficulty, mistakes, history, selectedCell, mode]);

  useEffect(() => {
    let interval;
    const fetchChat = async () => {
      if (isSendingRef.current) return;
      const msgs = await getChatMessages();
      if (!isSendingRef.current && Array.isArray(msgs) && msgs.length > 0) {
        setChatMessages(prev => {
          if (prev.length > 0 && msgs.length > prev.length) {
            const lastMsg = msgs[msgs.length - 1];
            if (!isChatOpen && lastMsg.sender !== StorageService.getCurrentUserId()) {
              setChatNotification(lastMsg);
              if (soundEnabled) SoundManager.play('chat');
              setTimeout(() => setChatNotification(null), 4000);
            }
          }
          return msgs;
        });
      }
    };
    fetchChat();
    interval = setInterval(fetchChat, CHAT_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isChatOpen, soundEnabled]);

  useEffect(() => { if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, isChatOpen]);

  const toggleDarkMode = () => {
    if (soundEnabled) SoundManager.play('toggle');
    setDarkMode(prev => {
      const newVal = !prev;
      if (newVal) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
      else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
      return newVal;
    });
  };

  const toggleSound = () => {
    if (!soundEnabled) SoundManager.play('toggle');
    setSoundEnabled(prev => {
      const newVal = !prev; localStorage.setItem(KEYS.SOUND_ENABLED, String(newVal)); return newVal;
    });
  };
  
  const togglePause = () => {
    if (soundEnabled) SoundManager.play('uiTap');
    setStatus(prev => prev === 'playing' ? 'paused' : 'playing');
  };
  
  const handleHint = () => {
    if (selectedCell === null || status !== 'playing' || !board.length) return;
    const currentCell = board[selectedCell];
    if (!currentCell || currentCell.isFixed || currentCell.value !== null) return;
    
    if (soundEnabled) SoundManager.play('write');
    const newBoard = JSON.parse(JSON.stringify(board));
    const target = newBoard[selectedCell];
    target.value = target.solution;
    target.isHinted = true;
    target.notes = [];
    
    setHistory(prev => [...prev.slice(-10), newBoard]);
    setBoard(newBoard);
    
    if (newBoard.every((c) => c.value === c.solution)) {
      if (soundEnabled) SoundManager.play('success');
      setStatus('won');
      StorageService.clearSavedGame();
      handleWin(newBoard, mistakes, timer);
    }
  };
  
  const handleQuickRestart = () => {
    if (soundEnabled) SoundManager.play('uiTap');
    setShowRestartConfirm(true);
  };
  
  const confirmRestart = () => {
    if (soundEnabled) SoundManager.play('startGame');
    const initialBoard = history[0];
    if (initialBoard) {
      setBoard(JSON.parse(JSON.stringify(initialBoard)));
      setTimer(0);
      setMistakes(0);
      setHistory([initialBoard]);
      setSelectedCell(null);
      setStatus('playing');
    }
    setShowRestartConfirm(false);
  };

  const startNewGame = async (diff) => {
    if (soundEnabled) SoundManager.init();
    setLoading(true);
    try {
      let newBoard = null;
      try {
        newBoard = await runGasFn('generateSudoku', diff);
      } catch (err) {
        console.warn('GAS generation failed, falling back to local generator', err);
        newBoard = null;
      }

      if (!newBoard) {
        // Fallback to local generator for dev when GAS isn't configured
        newBoard = generateLocalBoard(diff);
      }

      setBoard(newBoard); setDifficulty(diff); setStatus('playing');
      setTimer(0); setMistakes(0); setHistory([newBoard]); setSelectedCell(null);
      setShowModal('none');
      setView('game');
    } catch (e) { console.error(e); alert("Failed to start game."); } finally { setLoading(false); }
  };

  const handleNumberInput = useCallback((num) => {
    if (selectedCell === null || status !== 'playing' || !board.length) return;
    const currentCell = board[selectedCell];
    if (!currentCell || currentCell.isFixed) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    const target = newBoard[selectedCell];

    if (mode === 'pen') {
      if (target.value === num) return;
      target.value = num;
      if (num !== target.solution) {
        if (soundEnabled) SoundManager.play('error');
        target.isError = true;
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);

        if (newMistakes >= 3) {
          setBoard(newBoard); setStatus('lost'); StorageService.clearSavedGame(); return;
        }
        setTimeout(() => {
          setBoard(prev => {
            const b = [...prev];
            if (b[selectedCell]) { b[selectedCell].isError = false; b[selectedCell].value = null; }
            return b;
          });
        }, 500);
      } else {
        if (soundEnabled) SoundManager.play('write');
        target.isError = false; target.notes = [];
      }
    } else {
      if (soundEnabled) SoundManager.play('pencil');
      if (target.notes.includes(num)) target.notes = target.notes.filter((n) => n !== num);
      else { target.notes.push(num); target.notes.sort(); }
    }

    setHistory(prev => [...prev.slice(-10), newBoard]);
    setBoard(newBoard);

    if (mode === 'pen' && newBoard.every((c) => c.value === c.solution)) {
      if (soundEnabled) SoundManager.play('success');
      setStatus('won');
      StorageService.clearSavedGame();
      handleWin(newBoard, mistakes, timer);
    }
  }, [board, selectedCell, status, mode, mistakes, soundEnabled, timer]);

  const handleWin = async (finalBoard, finalMistakes, finalTime) => {
    const currentUserId = StorageService.getCurrentUserId();
    saveScore({ name: currentUserId, time: finalTime, difficulty, date: new Date().toLocaleDateString() });

    // Update game stats for theme unlocking
    const stats = StorageService.getGameStats();
    stats.totalWins += 1;
    if (difficulty === 'Easy') stats.easyWins += 1;
    if (difficulty === 'Medium') stats.mediumWins += 1;
    if (difficulty === 'Hard') stats.hardWins += 1;
    if (finalMistakes === 0) stats.perfectWins += 1;
    if (finalTime < 180) stats.fastWins += 1;
    StorageService.saveGameStats(stats);

    // Check for theme unlocks
    const newThemes = UnlockService.checkThemeUnlocks(stats);
    if (newThemes.length > 0) {
      setNewlyUnlockedThemes(newThemes);
      setUnlockedThemes(StorageService.getUnlockedThemes()); // Update state with newly unlocked themes
      if (soundEnabled) setTimeout(() => SoundManager.play('unlock'), 250);
    }

    // Check for sound pack unlocks
    const newPacks = UnlockService.checkSoundPackUnlocks(stats);
    if (newPacks.length > 0) {
      setNewlyUnlockedSoundPacks(newPacks);
      setUnlockedSoundPacks(StorageService.getUnlockedSoundPacks());
      if (soundEnabled) setTimeout(() => SoundManager.play('unlock'), 250);
    }

    // Update user stats if authenticated
    // Note: This function is only called when the player wins, so we increment both games and wins
    // Game losses are not tracked in the current implementation
    if (isUserAuthenticated() && isGasEnvironment()) {
      const session = StorageService.getUserSession();
      if (session && session.userId) {
        try {
          // Prepare win metadata for backend tracking
          const updateData = {
            userId: session.userId,  // Backend requires userId for lookups
            incrementGames: true,
            incrementWins: true,
            difficulty: difficulty,  // Track which difficulty was won
            perfectWin: finalMistakes === 0,  // Perfect win if no mistakes
            fastWin: finalTime < 180  // Fast win if under 3 minutes
          };
          
          await runGasFn('updateUserProfile', updateData);
          // Refresh user profile to get updated stats
          const updatedProfile = await runGasFn('getUserProfile', { userId: session.userId });
          if (updatedProfile && updatedProfile.success) {
            // Update both global storage and component state for consistency
            StorageService.setUserSession(updatedProfile.user);
            setAppUserSession(updatedProfile.user);
          }

          await persistUserStateToBackend({
            unlockedThemes: StorageService.getUnlockedThemes(),
            unlockedSoundPacks: StorageService.getUnlockedSoundPacks(),
            activeTheme: activeThemeId,
            activeSoundPack: activeSoundPackId,
            gameStats: stats
          });
        } catch (err) {
          console.error('Failed to update user stats:', err);
        }
      }
    }
  };

  const handleUndo = () => {
    if (history.length > 1) {
      if (soundEnabled) SoundManager.play('undo');
      const newHistory = [...history]; newHistory.pop();
      setBoard(newHistory[newHistory.length - 1]); setHistory(newHistory);
    }
  };

  const handleEmojiInsert = (emoji) => {
    if (soundEnabled) SoundManager.play('uiTap');
    setChatInput((prev) => `${prev}${emoji}`);
  };

  const handleChatSend = async (text) => {
    const txt = text.trim(); if (!txt) return;
    if (soundEnabled) SoundManager.play('uiTap');
    setChatInput('');
    const currentUserId = StorageService.getCurrentUserId();
    const msg = { id: Date.now().toString(), sender: currentUserId, text: txt, timestamp: Date.now(), status: (userStatus || '').slice(0, 50) };
    setChatMessages(prev => [...prev, msg]);
    isSendingRef.current = true;
    const updated = await postChatMessage(msg);
    if (updated && Array.isArray(updated)) setChatMessages(updated);
    isSendingRef.current = false;
  };

  const handleUserPanelClose = (updatedUser) => {
    if (updatedUser) {
      // Update both global storage and component state for consistency
      StorageService.setUserSession(updatedUser);
      setAppUserSession(updatedUser);
    }
    setShowUserPanel(false);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === 'playing') {
        setStatus('paused');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [status]);
  
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape' && showKeyboardHelp) {
        setShowKeyboardHelp(false);
        return;
      }
      if ((e.key === '?' || e.key === '/') && !showKeyboardHelp && view === 'game') {
        e.preventDefault();
        setShowKeyboardHelp(true);
        return;
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showKeyboardHelp, view]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (status !== 'playing' || showKeyboardHelp) return;
      if (e.key >= '1' && e.key <= '9') handleNumberInput(parseInt(e.key));
      else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedCell !== null && !board[selectedCell].isFixed) {
          if (soundEnabled) SoundManager.play('erase');
          const newBoard = [...board]; newBoard[selectedCell].value = null; newBoard[selectedCell].notes = [];
          setBoard(newBoard);
        }
      } else if (e.key === 'n' || e.key === 'N') {
        if (soundEnabled) SoundManager.play('pencil'); setMode(prev => prev === 'pen' ? 'pencil' : 'pen');
      } else if (e.key === 'z' || e.key === 'Z') { handleUndo(); }
      else if (e.key === 'h' || e.key === 'H' || e.key === '?') { handleHint(); }
      else if (e.key === 'p' || e.key === 'P' || e.key === ' ') { e.preventDefault(); togglePause(); }
      else if (e.key === 'r' || e.key === 'R') { handleQuickRestart(); }
      else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        if (selectedCell === null) { if (soundEnabled) SoundManager.play('select'); setSelectedCell(0); return; }
        if (soundEnabled) SoundManager.play('select');
        let next = selectedCell;
        if (e.key === 'ArrowRight') next = (selectedCell + 1) % 81;
        if (e.key === 'ArrowLeft') next = (selectedCell - 1 + 81) % 81;
        if (e.key === 'ArrowDown') next = (selectedCell + 9) % 81;
        if (e.key === 'ArrowUp') next = (selectedCell - 9 + 81) % 81;
        setSelectedCell(next);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, status, board, mode, handleNumberInput, soundEnabled]);

  const getRemainingNumbers = () => {
    const counts = Array(10).fill(9);
    board.forEach(c => { if (c.value) counts[c.value]--; });
    return counts;
  };
  
  const getConflictingCells = useCallback((cellId) => {
    if (!showConflicts || cellId === null) return new Set();
    const cell = board[cellId];
    if (!cell || !cell.value) return new Set();
    
    const conflicts = new Set();
    const row = cell.row;
    const col = cell.col;
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    board.forEach((c, idx) => {
      if (idx === cellId || !c.value || c.value !== cell.value) return;
      if (c.row === row || c.col === col || 
          (c.row >= boxRow && c.row < boxRow + 3 && c.col >= boxCol && c.col < boxCol + 3)) {
        conflicts.add(idx);
      }
    });
    
    return conflicts;
  }, [board, showConflicts]);
  
  const getProgressPercentage = () => {
    const filled = board.filter(c => c.value !== null).length;
    return Math.round((filled / 81) * 100);
  };

  const completedBoxes = useMemo(() => {
    const completed = [];
    for (let b = 0; b < 9; b++) {
      const cells = board.filter(c => Math.floor(c.row / 3) * 3 + Math.floor(c.col / 3) === b);
      if (cells.length !== 9) continue;
      const values = cells.map(c => c.value).filter(v => v !== null);
      if (new Set(values).size === 9) completed.push(b);
    }
    return completed;
  }, [board]);

  const handleOpenLeaderboard = async () => {
    if (soundEnabled) SoundManager.play('uiTap');
    setLeaderboard(await getLeaderboard()); setShowModal('leaderboard');
  };

  const handleThemeChange = (themeId, { persist = true } = {}) => {
    if (themeId === activeThemeId) return;
    themeTouchedRef.current = true;
    setActiveThemeId(themeId);
    if (!persist) {
      setPendingActiveThemeId(themeId);
      setAwardsDirty(true);
      return;
    }
    StorageService.saveActiveTheme(themeId);
    schedulePersist({ activeTheme: themeId });
  };

  const handleSoundPackChange = (packId, { persist = true } = {}) => {
    if (packId === activeSoundPackId) return;
    soundPackTouchedRef.current = true;
    setActiveSoundPackId(packId);
    SoundManager.setPack(packId);
    if (!persist) {
      setPendingActiveSoundPackId(packId);
      setAwardsDirty(true);
      return;
    }
    StorageService.saveActiveSoundPack(packId);
    schedulePersist({ activeSoundPack: packId });
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
    chatTouchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    chatTouchLastRef.current = chatTouchStartRef.current;
  };

  const handleChatTouchMove = (e) => {
    const touch = e.touches[0];
    chatTouchLastRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
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
    if (showModal === 'none') return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md animate-pop relative">
          <button onClick={() => setShowModal('none')} className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
          {showModal === 'leaderboard' && (
            <div>
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2"><span>🏆</span> Global Leaderboard</h2>
              </div>
              <div className="max-h-[60vh] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin">
                <table className="w-full text-xs sm:text-sm text-left text-gray-600 dark:text-gray-300">
                  <thead className="text-[10px] sm:text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400 sticky top-0 backdrop-blur-md">
                    <tr><th className="px-2 sm:px-3 py-2 sm:py-3">Rank</th><th className="px-2 sm:px-3 py-2 sm:py-3">User</th><th className="px-2 sm:px-3 py-2 sm:py-3">Time</th><th className="px-2 sm:px-3 py-2 sm:py-3">Diff</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {leaderboard.map((entry, i) => {
                      let rankIcon = <span className="text-gray-400 font-mono text-[10px] sm:text-xs">#{i + 1}</span>;
                      let rowClass = "";
                      if (i === 0) { rankIcon = "🥇"; rowClass = "bg-yellow-50 dark:bg-yellow-900/10 font-bold text-yellow-700 dark:text-yellow-400"; }
                      else if (i === 1) { rankIcon = "🥈"; rowClass = "bg-gray-50 dark:bg-gray-800/50 font-semibold"; }
                      else if (i === 2) { rankIcon = "🥉"; rowClass = "bg-orange-50 dark:bg-orange-900/10 font-semibold"; }
                      return (
                        <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${rowClass}`}>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-center">{rankIcon}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 truncate max-w-[80px] sm:max-w-[120px]">{entry.name}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 font-mono text-[10px] sm:text-xs">{Math.floor(entry.time / 60)}:{(entry.time % 60).toString().padStart(2, '0')}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3"><span className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border ${entry.difficulty === 'Hard' ? 'border-red-200 text-red-600 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-900/30' : entry.difficulty === 'Medium' ? 'border-yellow-200 text-yellow-600 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-900/30' : 'border-green-200 text-green-600 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-900/30'}`}>{entry.difficulty}</span></td>
                        </tr>
                      );
                    })}
                    {leaderboard.length === 0 && <tr><td colSpan={4} className="p-6 sm:p-8 text-center text-gray-400 text-xs sm:text-sm">No records yet.</td></tr>}
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
    if (typeof getThemeAssetSet === 'function') {
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
      texture: { pattern: 'none', opacity: 0 },
      decor: []
    };
  }, [activeThemeId, activeSoundPackId]);

  // Probe filesystem backgrounds in order (png -> svg -> jpg) and pick the first that loads
  useEffect(() => {
    const paths = activeAssetSet?.assetPaths;
    if (!paths) {
      setBgAssetUrl(null);
      return;
    }

    const order = [paths.bgPng, paths.bgSvg, paths.bgJpg].filter(Boolean);
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
      img.onload = () => { if (!cancelled) setBgAssetUrl(order[idx]); };
      img.onerror = () => tryLoad(idx + 1);
      img.src = order[idx];
    };

    tryLoad(0);
    return () => { cancelled = true; };
  }, [activeAssetSet?.assetPaths?.bgPng, activeAssetSet?.assetPaths?.bgSvg, activeAssetSet?.assetPaths?.bgJpg, activeAssetSet?.comboKey]);

  // --- RENDER LOGIC ---

  // 1. MAIN MENU (Opening Screen)
  if (view === 'menu') {
    return (
      <>
        <OpeningScreen
          onStart={startNewGame}
          onResume={() => { setView('game'); setStatus('playing'); }}
          hasSavedGame={status === 'paused'}
          darkMode={darkMode} toggleDarkMode={toggleDarkMode}
          loading={loading} soundEnabled={soundEnabled} toggleSound={toggleSound}
          onShowUserPanel={() => setShowUserPanel(true)}
          onShowAwards={() => { if (soundEnabled) SoundManager.play('uiTap'); openAwards(); }}
          userSession={appUserSession}
        />
        {showUserPanel && <UserPanel soundEnabled={soundEnabled} onClose={handleUserPanelClose} appUserSession={appUserSession} />}
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
  if (status === 'won' || status === 'lost') {
    return (
      <>
        <ClosingScreen
          status={status} time={timer} difficulty={difficulty} mistakes={mistakes}
          onRestart={() => startNewGame(difficulty)}
          onMenu={() => {
            setStatus('idle');
            setView('menu');
            setNewlyUnlockedThemes([]);
            setNewlyUnlockedSoundPacks([]);
          }}
          loading={loading} soundEnabled={soundEnabled}
          newlyUnlockedThemes={newlyUnlockedThemes}
          newlyUnlockedSoundPacks={newlyUnlockedSoundPacks}
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
    <div className={`min-h-screen flex flex-col items-center p-2 sm:p-4 transition-colors duration-300 text-gray-900 dark:text-gray-100 ${activeAssetSet.background} relative overflow-x-hidden`}>
      {/* SVG Background Pattern Layer (theme-specific) */}
      {activeAssetSet.svgBackground && (
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{ 
            backgroundImage: activeAssetSet.svgBackground,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.6
          }}
        />
      )}
      
      {/* Texture overlay layer */}
      {activeAssetSet.texture.pattern !== 'none' && (
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{ 
            opacity: activeAssetSet.texture.opacity,
            backgroundImage: activeAssetSet.texture.pattern === 'paper' 
              ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`
              : activeAssetSet.texture.pattern === 'wood'
                ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cpattern id='wood' patternUnits='userSpaceOnUse' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23b5651d' opacity='0.1'/%3E%3Cpath d='M0,20 Q50,15 100,20 T200,20' stroke='%23654321' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3Cpath d='M0,60 Q50,55 100,60 T200,60' stroke='%23654321' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3Cpath d='M0,100 Q50,95 100,100 T200,100' stroke='%23654321' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3Cpath d='M0,140 Q50,135 100,140 T200,140' stroke='%23654321' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3Cpath d='M0,180 Q50,175 100,180 T200,180' stroke='%23654321' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23wood)'/%3E%3C/svg%3E")`
                : activeAssetSet.texture.pattern === 'pixel'
                  ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='8' height='8' fill='%23000' opacity='0.05'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23000' opacity='0.05'/%3E%3C/svg%3E")`
                  : activeAssetSet.texture.pattern === 'stone'
                    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M0,0 L30,5 L60,0 L55,30 L60,60 L30,55 L0,60 L5,30 Z' fill='none' stroke='%23666' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`
                    : activeAssetSet.texture.pattern === 'ice'
                      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40,0 L40,80 M0,40 L80,40 M10,10 L70,70 M70,10 L10,70' stroke='%2399ccff' stroke-width='0.5' opacity='0.3'/%3E%3C/svg%3E")`
                      : activeAssetSet.texture.pattern === 'nebula'
                        ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cdefs%3E%3CradialGradient id='star'%3E%3Cstop offset='0%25' stop-color='white' stop-opacity='0.8'/%3E%3Cstop offset='100%25' stop-color='white' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='20' cy='30' r='1' fill='url(%23star)'/%3E%3Ccircle cx='70' cy='20' r='0.5' fill='url(%23star)'/%3E%3Ccircle cx='50' cy='80' r='0.8' fill='url(%23star)'/%3E%3Ccircle cx='85' cy='60' r='0.6' fill='url(%23star)'/%3E%3C/svg%3E")`
                        : activeAssetSet.texture.pattern === 'carnival'
                          ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23ff6b6b' opacity='0.2'/%3E%3Ccircle cx='30' cy='30' r='2' fill='%234ecdc4' opacity='0.2'/%3E%3Ccircle cx='30' cy='10' r='1.5' fill='%23ffe66d' opacity='0.2'/%3E%3Ccircle cx='10' cy='30' r='1.5' fill='%23c9b1ff' opacity='0.2'/%3E%3C/svg%3E")`
                          : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' fill='%23888' opacity='0.03'/%3E%3C/svg%3E")`
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
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: bgAssetUrl ? 0.85 : 0.7
            }}
          />
        </>
      )}
      
      {/* Decorative elements layer - Procedural theme-aware shapes */}
      {activeAssetSet.icons && activeAssetSet.icons.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {activeAssetSet.icons.map((_, i) => {
            const element = getThemeVisualElement(activeThemeId, activeSoundPackId, i);
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
                  filter: `${element.blur}${element.filter ? ' ' + element.filter : ''}`,
                  boxShadow: `0 8px 24px ${element.color}40, inset 0 0 12px ${element.color}20`,
                  transition: 'all 0.3s ease'
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Fallback emoji decorations (if no Material Icons available) */}
      {(!activeAssetSet.icons || activeAssetSet.icons.length === 0) && activeAssetSet.decor.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {activeAssetSet.decor.map((emoji, i) => (
            <span
              key={i}
              className="absolute text-2xl sm:text-3xl opacity-20 animate-float-slow"
              style={{
                left: `${15 + i * 30}%`,
                top: `${10 + (i % 2) * 70}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${8 + i * 2}s`
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
      
      <div className="w-full max-w-7xl flex flex-col gap-3 sm:gap-6 flex-grow relative z-10">
        {!isGasEnvironment() && (
          <div className="w-full mx-auto mb-2 p-2 rounded text-xs sm:text-sm text-yellow-800 bg-yellow-100 border border-yellow-200 text-center">GAS not configured — using local generator for puzzles. Create <span className="font-mono">config/config.local.js</span> with your <span className="font-mono">GAS_URL</span> to enable cloud persistence.</div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center px-2 sm:px-4 lg:px-0">
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight cursor-pointer" onClick={() => { if (soundEnabled) SoundManager.play('uiTap'); setStatus('paused'); setView('menu'); }}>Sudoku <span className="text-blue-600">Logic</span> Lab</h1>
          </div>
          <div className="flex gap-1 sm:gap-2 items-center">
            {loading && <span className="text-xs text-blue-500 animate-pulse hidden sm:inline">Generating...</span>}
            {status === 'playing' && (
              <button
                onClick={togglePause}
                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Pause (P or Space)"
              >
                <Icons.Pause />
              </button>
            )}
            {status === 'paused' && (
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
            <button onClick={() => setShowUserPanel(true)} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative">
              <Icons.User />
              {appUserSession && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
              )}
            </button>
            <button aria-label="Awards" onClick={() => { if (soundEnabled) SoundManager.play('uiTap'); openAwards(); }} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Awards">
              <Icons.Awards />
            </button>
            <button onClick={toggleSound} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {soundEnabled ? <Icons.VolumeUp /> : <Icons.VolumeOff />}
            </button>
            <button onClick={toggleDarkMode} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-5 justify-center items-start">

          {/* Left: Board */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <SudokuBoard
              board={board} selectedId={selectedCell}
              onCellClick={(id) => { if (soundEnabled) SoundManager.play('select'); setSelectedCell(id); }}
              completedBoxes={completedBoxes}
              boardTexture={activeAssetSet.texture}
              conflictingCells={getConflictingCells(selectedCell)}
            />
          </div>

          {/* Right: Sidebar */}
          <div className="flex flex-col gap-2 sm:gap-2.5 w-full max-w-xs lg:w-72 mx-auto lg:mx-0">

            {/* Number Pad (top of sidebar) */}
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => { if (soundEnabled) SoundManager.play('select'); handleNumberInput(num); }}
                  disabled={(status !== 'playing') || (remaining[num] === 0)}
                  className={`h-11 sm:h-12 rounded-lg text-base sm:text-lg font-bold transition-all transform active:scale-95 ${((status !== 'playing') || (remaining[num] === 0)) ? 'opacity-20 cursor-not-allowed bg-gray-200 dark:bg-gray-800' : 'bg-white dark:bg-gray-700 shadow-sm hover:bg-blue-50 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'}`}
                >
                  {num} <span className="block text-[8px] sm:text-[9px] text-gray-400 font-normal -mt-0.5">{remaining[num]} left</span>
                </button>
              ))}
            </div>



            {/* Stats */}
            <div className="w-full flex justify-between items-center bg-white dark:bg-gray-800 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold">Difficulty</span>
                <span className="font-bold text-sm sm:text-base">{difficulty}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold">Progress</span>
                <span className="font-bold text-sm sm:text-base">{getProgressPercentage()}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold">Mistakes</span>
                <span className={`font-bold text-sm sm:text-base ${mistakes > 2 ? 'text-red-500' : ''}`}>{mistakes}/3</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold">Time</span>
                <span className="font-mono text-sm sm:text-base">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>

            {/* Tools */}
            <div className="flex w-full justify-between gap-1 sm:gap-1.5">
              <button
                onClick={() => { handleUndo(); }}
                className="flex-1 flex flex-col items-center p-1 sm:p-1.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <Icons.Undo /><span className="text-[8px] sm:text-[9px] mt-0.5">Undo</span>
              </button>
              <button
                onClick={handleHint}
                disabled={status !== 'playing' || selectedCell === null || board[selectedCell]?.isFixed}
                className="flex-1 flex flex-col items-center p-1 sm:p-1.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Reveal solution (H or ?)"
              >
                <Icons.Lightbulb /><span className="text-[8px] sm:text-[9px] mt-0.5">Hint</span>
              </button>
              <button
                onClick={() => {
                  if (soundEnabled) SoundManager.play('erase');
                  if (selectedCell !== null && !board[selectedCell].isFixed) {
                    const newBoard = [...board]; newBoard[selectedCell].value = null; newBoard[selectedCell].notes = [];
                    setBoard(newBoard);
                  }
                }}
                className="flex-1 flex flex-col items-center p-1 sm:p-1.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <Icons.Eraser /><span className="text-[8px] sm:text-[9px] mt-0.5">Erase</span>
              </button>
              <button
                onClick={() => { if (soundEnabled) SoundManager.play('pencil'); setMode(mode === 'pen' ? 'pencil' : 'pen'); }}
                className={`flex-1 flex flex-col items-center p-1 sm:p-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 ${mode === 'pencil' ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : 'bg-white dark:bg-gray-800'}`}
              >
                <div className="relative">
                  <Icons.Pencil />
                  <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 ${mode === 'pencil' ? '' : 'hidden'}`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${mode === 'pencil' ? 'bg-blue-500' : 'bg-transparent'}`}></span>
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] mt-0.5">{mode === 'pencil' ? 'Notes' : 'Notes'}</span>
              </button>
            </div>

            {/* New Game */}
            <div className="bg-white dark:bg-gray-800 p-2 sm:p-2.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-1.5">
                <h3 className="text-[9px] sm:text-[10px] font-bold uppercase text-gray-500">{loading ? 'Generating...' : 'New Game'}</h3>
                <button
                  onClick={handleQuickRestart}
                  disabled={status !== 'playing' && status !== 'paused'}
                  className="text-[10px] sm:text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  title="Restart puzzle (R)"
                >
                  <Icons.Refresh />
                  <span className="hidden sm:inline">Restart</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                {['Easy', 'Medium', 'Hard', 'Daily'].map(d => (
                  <button key={d} onClick={() => { if (soundEnabled) SoundManager.play('startGame'); startNewGame(d); }} disabled={loading} className={`py-1 sm:py-1.5 px-2 rounded text-[11px] font-medium transition-colors ${difficulty === d ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'} disabled:opacity-50`}>{d}</button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 p-2 sm:p-2.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-[9px] sm:text-[10px] font-bold uppercase text-gray-500 mb-1.5">Settings</h3>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1.5 rounded transition-colors">
                <input 
                  type="checkbox" 
                  checked={showConflicts} 
                  onChange={(e) => setShowConflicts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Highlight Conflicts</span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <button onClick={handleOpenLeaderboard} className="py-1.5 sm:py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded shadow-md text-xs font-bold hover:from-yellow-600 hover:to-orange-600 transition-colors transform hover:-translate-y-0.5">🏆 Leaderboard</button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg animate-pop relative">
            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Icons.X />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Icons.HelpCircle />
              Keyboard Shortcuts
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">1-9</kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Enter number</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">N</kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Toggle notes</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">Z</kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Undo</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">Del</kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Erase cell</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">H</kbd>
                    <span className="text-gray-400">/</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">?</kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get hint</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">P</kbd>
                    <span className="text-gray-400">/</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">Space</kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Pause/Resume</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">R</kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Quick restart</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">Esc</kbd>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Close dialogs</p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2">Navigation</p>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">←</kbd>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">↑</kbd>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">→</kbd>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">↓</kbd>
                  <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">Move between cells</span>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-pop relative">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Icons.Refresh />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Restart Puzzle?</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">All your progress will be lost. The puzzle will reset to its initial state.</p>
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
          <div onClick={toggleChat} className="bg-blue-600 text-white p-2 sm:p-3 rounded-lg shadow-lg cursor-pointer animate-slide-up flex items-center gap-2 sm:gap-3 max-w-xs">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-full"><Icons.Chat /></div>
            <div className="flex-1 min-w-0"><div className="text-[9px] sm:text-[10px] font-bold opacity-80">{chatNotification.sender} says:</div><div className="text-xs sm:text-sm truncate">{chatNotification.text}</div></div>
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
                <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden="true"></div>
              </div>
              <div className="flex justify-between items-center gap-2">
                <button
                  onClick={toggleChat}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-blue-100/70 dark:hover:bg-gray-700/70 transition-colors cursor-pointer"
                  aria-label="Close chat"
                >
                  <span className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-100">Live Chat</span>
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
              {chatMessages.length === 0 && <p className="text-center text-sm text-gray-400 mt-4">No messages yet. Say hi!</p>}
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === userId ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 mb-0.5 px-1 max-w-[90%] leading-tight">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{msg.sender === userId ? 'You' : msg.sender}</span>
                    {msg.status && <span className="text-gray-400 truncate">· {msg.status}</span>}
                  </div>
                  <div className={`px-3.5 sm:px-4 py-2 text-sm max-w-[85%] leading-snug break-words shadow-md ${msg.sender === userId
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl rounded-tr-sm ring-1 ring-blue-400/40'
                      : 'bg-gray-100/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-3xl rounded-tl-sm'}
                  `}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95">
              <div className="relative flex gap-2 sm:gap-3 items-center">
                <button
                  aria-label="Emoji picker"
                  className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-lg shadow-sm"
                  onClick={() => { if (soundEnabled) SoundManager.play('uiTap'); setShowEmojiPicker((v) => !v); }}
                >😀</button>
                <input className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow placeholder:text-gray-500 dark:placeholder:text-gray-500" placeholder="Type a message..." maxLength={140} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleChatSend(chatInput); }} />
                <button className="p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0 shadow-md" onClick={() => handleChatSend(chatInput)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" /></svg></button>

                {showEmojiPicker && (
                  <div className="absolute bottom-14 left-0 right-0 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-2 z-10">
                    <div className="flex gap-1 overflow-x-auto pb-1">
                      {EMOJI_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setEmojiCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${emojiCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 max-h-36 overflow-y-auto grid grid-cols-8 gap-1 text-lg">
                      {(EMOJI_CATEGORIES.find((c) => c.id === emojiCategory) || EMOJI_CATEGORIES[0]).emojis.map((emo) => (
                        <button
                          key={emo}
                          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => handleEmojiInsert(emo)}
                        >{emo}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <button onClick={toggleChat} className={`p-3 sm:p-4 rounded-full shadow-xl transition-all hover:scale-105 flex items-center justify-center relative ${isChatOpen ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          {isChatOpen ? <Icons.X /> : <Icons.Chat />}
          {chatNotification && !isChatOpen && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
        </button>
      </div>
      {renderModal()}
      {showUserPanel && <UserPanel soundEnabled={soundEnabled} onClose={handleUserPanelClose} appUserSession={appUserSession} />}
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

      {/* Footer - legible over all themes */}
      <footer className="mt-6 sm:mt-8 pt-4 pb-5 text-[10px] sm:text-xs md:text-sm text-center px-3 w-full">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/30 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/75 backdrop-blur shadow-md text-gray-700 dark:text-gray-200 px-3 py-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
          <span className="font-semibold">Sudoku Logic Lab v2.3</span>
          <span className="hidden sm:inline text-gray-400">•</span>
          <span>Created by Edmund</span>
          <span className="hidden sm:inline text-gray-400">•</span>
          <span className="flex gap-2">
            <a href="https://github.com/edmund-alexander" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 hover:underline">GitHub</a>
            <a href="https://www.paypal.com/paypalme/edmundalexanders" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 hover:underline">Buy me a green tea</a>
          </span>
        </div>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
