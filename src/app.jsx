const { useState, useEffect, useCallback, useRef, memo, useMemo } = React;

      // --- CAMPAIGN DATA ---
      const CAMPAIGN_LEVELS = [
        { id: 1, title: "The Awakening", difficulty: "Easy", desc: "Start your journey. Complete an Easy puzzle.", criteria: (s) => s.status === 'won', biome: 'grass' },
        { id: 2, title: "Swift Mind", difficulty: "Easy", desc: "Solve an Easy puzzle in under 3 minutes.", criteria: (s) => s.status === 'won' && s.time < 180, biome: 'grass' },
        { id: 3, title: "Treasure Trove", difficulty: "Easy", desc: "Bonus Level! Solve with 0 mistakes.", criteria: (s) => s.status === 'won' && s.mistakes === 0, biome: 'grass', isChest: true },
        { id: 4, title: "Sandstorm", difficulty: "Medium", desc: "Step up the challenge. Complete a Medium puzzle.", criteria: (s) => s.status === 'won', biome: 'desert' },
        { id: 5, title: "Mirage", difficulty: "Medium", desc: "Medium puzzle, max 1 mistake.", criteria: (s) => s.status === 'won' && s.mistakes <= 1, biome: 'desert' },
        { id: 6, title: "Oasis Cache", difficulty: "Medium", desc: "Bonus! Medium puzzle under 8 mins.", criteria: (s) => s.status === 'won' && s.time < 480, biome: 'desert', isChest: true },
        { id: 7, title: "Void Walker", difficulty: "Hard", desc: "Face the ultimate test. Complete a Hard puzzle.", criteria: (s) => s.status === 'won', biome: 'space' },
        { id: 8, title: "Star Lord", difficulty: "Hard", desc: "Hard puzzle, 0 mistakes, under 15 min.", criteria: (s) => s.status === 'won' && s.mistakes === 0 && s.time < 900, biome: 'space' }
      ];

      // --- THEME SYSTEM ---
      const THEMES = {
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
          background: 'bg-gradient-to-br from-cyan-100 to-blue-300 dark:from-blue-900 dark:to-cyan-900',
          boardBg: 'bg-cyan-50/80 dark:bg-blue-900/50',
          cellBg: 'bg-cyan-50 dark:bg-blue-800/70',
          fixedCellBg: 'bg-cyan-100 dark:bg-blue-900',
          selectedCellBg: 'bg-cyan-300 dark:bg-cyan-700',
          icon: '🌊',
          unlocked: false,
          unlockCriteria: 'Win 5 games'
        },
        forest: {
          id: 'forest',
          name: 'Emerald Forest',
          description: 'Find peace among the trees',
          background: 'bg-gradient-to-br from-green-100 to-emerald-300 dark:from-green-900 dark:to-emerald-900',
          boardBg: 'bg-green-50/80 dark:bg-green-900/50',
          cellBg: 'bg-green-50 dark:bg-green-800/70',
          fixedCellBg: 'bg-green-100 dark:bg-green-900',
          selectedCellBg: 'bg-green-300 dark:bg-green-700',
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
      };

      // --- SOUND MANAGER ---
      const SoundManager = {
        ctx: null,
        init: () => {
          if (!SoundManager.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) SoundManager.ctx = new AudioContext();
          }
          if (SoundManager.ctx && SoundManager.ctx.state === 'suspended') {
            SoundManager.ctx.resume();
          }
        },
        play: (type) => {
          if (!SoundManager.ctx) SoundManager.init();
          if (!SoundManager.ctx) return;
          
          const t = SoundManager.ctx.currentTime;
          const osc = SoundManager.ctx.createOscillator();
          const gain = SoundManager.ctx.createGain();
          
          osc.connect(gain);
          gain.connect(SoundManager.ctx.destination);

          switch (type) {
            case 'select':
              osc.type = 'sine'; osc.frequency.setValueAtTime(800, t);
              gain.gain.setValueAtTime(0.02, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
              osc.start(t); osc.stop(t + 0.05); break;
            case 'uiTap':
              osc.frequency.setValueAtTime(400, t); osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
              gain.gain.setValueAtTime(0.05, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
              osc.start(t); osc.stop(t + 0.1); break;
            case 'chestOpen':
               const oC = SoundManager.ctx.createOscillator(); oC.type = 'triangle';
               oC.frequency.setValueAtTime(300, t); oC.frequency.linearRampToValueAtTime(800, t+0.3);
               gain.gain.setValueAtTime(0.1, t); gain.gain.linearRampToValueAtTime(0, t+0.5);
               oC.start(t); oC.stop(t+0.5);
               setTimeout(() => SoundManager.play('success'), 300);
               break;
            case 'toggle':
              osc.type = 'triangle'; osc.frequency.setValueAtTime(1200, t);
              gain.gain.setValueAtTime(0.05, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
              osc.start(t); osc.stop(t + 0.08); break;
            case 'write':
              osc.type = 'sine'; osc.frequency.setValueAtTime(600, t);
              gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
              osc.start(t); osc.stop(t + 0.1); break;
            case 'erase':
              osc.type = 'triangle'; osc.frequency.setValueAtTime(300, t); osc.frequency.linearRampToValueAtTime(50, t + 0.15);
              gain.gain.setValueAtTime(0.08, t); gain.gain.linearRampToValueAtTime(0, t + 0.15);
              osc.start(t); osc.stop(t + 0.15); break;
            case 'undo':
              osc.type = 'sine'; osc.frequency.setValueAtTime(200, t); osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
              gain.gain.setValueAtTime(0.05, t); gain.gain.linearRampToValueAtTime(0, t + 0.15);
              osc.start(t); osc.stop(t + 0.15); break;
            case 'pencil':
              osc.type = 'square'; osc.frequency.setValueAtTime(2000, t);
              gain.gain.setValueAtTime(0.02, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
              osc.start(t); osc.stop(t + 0.03); break;
            case 'startGame':
              [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
                 const o = SoundManager.ctx.createOscillator(); const g = SoundManager.ctx.createGain();
                 o.connect(g); g.connect(SoundManager.ctx.destination);
                 o.type = 'triangle'; o.frequency.value = freq;
                 g.gain.setValueAtTime(0.02, t + i*0.05); g.gain.exponentialRampToValueAtTime(0.001, t + i*0.05 + 0.5);
                 o.start(t + i*0.05); o.stop(t + i*0.05 + 0.5);
              }); break;
            case 'questStart':
               // Epic deep boom + shimmer
               const o1 = SoundManager.ctx.createOscillator(); o1.frequency.setValueAtTime(100, t); o1.frequency.exponentialRampToValueAtTime(40, t+1);
               const g1 = SoundManager.ctx.createGain(); g1.gain.setValueAtTime(0.1, t); g1.gain.linearRampToValueAtTime(0, t+1);
               o1.connect(g1); g1.connect(SoundManager.ctx.destination); o1.start(t); o1.stop(t+1);
               break;
            case 'error':
              osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, t); osc.frequency.linearRampToValueAtTime(100, t + 0.3);
              gain.gain.setValueAtTime(0.1, t); gain.gain.linearRampToValueAtTime(0.001, t + 0.3);
              osc.start(t); osc.stop(t + 0.3); break;
            case 'success':
              [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((freq, i) => {
                  const o = SoundManager.ctx.createOscillator(); const g = SoundManager.ctx.createGain();
                  o.connect(g); g.connect(SoundManager.ctx.destination);
                  const st = t + i * 0.08; o.frequency.value = freq;
                  g.gain.setValueAtTime(0.05, st); g.gain.exponentialRampToValueAtTime(0.001, st + 0.6);
                  o.start(st); o.stop(st + 0.6);
              }); break;
            case 'chat':
               osc.type = 'sine'; osc.frequency.setValueAtTime(800, t); osc.frequency.setValueAtTime(1200, t + 0.1);
               gain.gain.setValueAtTime(0.02, t); gain.gain.linearRampToValueAtTime(0, t + 0.2);
               osc.start(t); osc.stop(t + 0.2); break;
            case 'unlock':
               // Magical wind chime
               [800, 1200, 1500, 2000].forEach((freq, i) => {
                 const o = SoundManager.ctx.createOscillator(); const g = SoundManager.ctx.createGain();
                 o.connect(g); g.connect(SoundManager.ctx.destination);
                 o.type = 'sine'; o.frequency.value = freq;
                 g.gain.setValueAtTime(0, t + i*0.1); g.gain.linearRampToValueAtTime(0.05, t + i*0.1 + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + i*0.1 + 1);
                 o.start(t + i*0.1); o.stop(t + i*0.1 + 1);
               });
               break;
             default: break;
          }
        }
      };

      // --- STORAGE SERVICE ---
      const KEYS = {
        GAME_STATE: 'sudoku_v2_state',
        LEADERBOARD: 'sudoku_v2_leaderboard',
        CHAT: 'sudoku_v2_chat',
        USER_ID: 'sudoku_v2_uid',
        SOUND_ENABLED: 'sudoku_v2_sound',
        CAMPAIGN_PROGRESS: 'sudoku_v2_campaign',
        USER_SESSION: 'sudoku_v2_user_session',
        UNLOCKED_THEMES: 'sudoku_v2_unlocked_themes',
        ACTIVE_THEME: 'sudoku_v2_active_theme',
        GAME_STATS: 'sudoku_v2_game_stats'
      };

      // GAS Backend API URL - Configure this with your deployment URL
      // Format: https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
      // SECURITY: Do not hardcode deployment URLs. Use config/config.local.js in production.
      const DEFAULT_GAS_URL = '';
      const GAS_URL = (typeof CONFIG !== 'undefined' && CONFIG.GAS_URL) || DEFAULT_GAS_URL;

      // Unified function caller: uses fetch to call GAS API endpoints
      const runGasFn = async (fnName, ...args) => {
        if (!GAS_URL) {
          console.error('GAS_URL not configured');
          return null;
        }

        try {
          // Map function names to API actions
          const actionMap = {
            generateSudoku: { action: 'generateSudoku', method: 'GET' },
            getLeaderboardData: { action: 'getLeaderboard', method: 'GET' },
            saveLeaderboardScore: { action: 'saveScore', method: 'GET' },
            getChatData: { action: 'getChat', method: 'GET' },
            postChatData: { action: 'postChat', method: 'GET' },
            logClientError: { action: 'logError', method: 'GET' },
            registerUser: { action: 'register', method: 'GET' },
            loginUser: { action: 'login', method: 'GET' },
            getUserProfile: { action: 'getUserProfile', method: 'GET' },
            updateUserProfile: { action: 'updateUserProfile', method: 'GET' }
          };

          const mapping = actionMap[fnName];
          if (!mapping) {
            console.error('Unknown function:', fnName);
            return null;
          }

          const { action } = mapping;
          const url = new URL(GAS_URL);
          url.searchParams.set('action', action);

          // Add all arguments as URL parameters
          if (args[0] !== undefined) {
            if (typeof args[0] === 'object') {
              Object.entries(args[0]).forEach(([k, v]) => {
                url.searchParams.set(k, v);
              });
            } else {
              url.searchParams.set('data', args[0]);
            }
          }

          // All requests use GET to avoid GAS POST redirect issues
          const response = await fetch(url.toString(), {
            method: 'GET',
            redirect: 'follow'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error('GAS API Error:', error);
          throw error;
        }
      };

      // Local fallback generator for dev when GAS is not available
      const generateLocalBoard = (difficulty) => {
        // Known valid solution to use as baseline
        const solution = [
          5,3,4,6,7,8,9,1,2,6,7,2,1,9,5,3,4,8,1,9,8,3,4,2,5,6,7,
          8,5,9,7,6,1,4,2,3,4,2,6,8,5,3,7,9,1,7,1,3,9,2,4,8,5,6,
          9,6,1,5,3,7,2,8,4,2,8,7,4,1,9,6,3,5,3,4,5,2,8,6,1,7,9
        ];

        let boardArray = [...solution];

        let removeCount = 30;
        if (difficulty === 'Easy') removeCount = 30;
        if (difficulty === 'Medium') removeCount = 45;
        if (difficulty === 'Hard') removeCount = 55;
        if (difficulty === 'Daily') removeCount = 40;

        let attempts = 0;
        const indices = Array.from({length:81}, (_,i) => i);
        while (attempts < removeCount && indices.length) {
          const idx = Math.floor(Math.random() * indices.length);
          const i = indices.splice(idx,1)[0];
          if (boardArray[i] !== 0) {
            boardArray[i] = 0;
            attempts++;
          }
        }

        return boardArray.map((val, index) => ({
          id: index,
          row: Math.floor(index / 9),
          col: index % 9,
          value: val === 0 ? null : val,
          solution: solution[index],
          isFixed: val !== 0,
          notes: [],
          isError: false,
          isHinted: false
        }));
      };

      const saveGame = (state) => {
        try { localStorage.setItem(KEYS.GAME_STATE, JSON.stringify(state)); } catch (e) {}
      };

      const loadGame = () => {
        try { return JSON.parse(localStorage.getItem(KEYS.GAME_STATE)); } catch (e) { return null; }
      };

      const clearSavedGame = () => { localStorage.removeItem(KEYS.GAME_STATE); };

      const getLocalLeaderboard = () => {
        try { return JSON.parse(localStorage.getItem(KEYS.LEADERBOARD)) || []; } catch (e) { return []; }
      };

      const sortLeaderboard = (list) => {
        const diffOrder = { 'Hard': 3, 'Medium': 2, 'Daily': 1.5, 'Easy': 1 };
        list.sort((a, b) => {
          if (diffOrder[a.difficulty] !== diffOrder[b.difficulty]) {
              return diffOrder[b.difficulty] - diffOrder[a.difficulty]; 
          }
          return a.time - b.time; 
        });
      };

      const saveScore = async (entry) => {
        if (isGasEnvironment()) {
          try { await runGasFn('saveLeaderboardScore', entry); } catch (e) {}
        } 
        const current = getLocalLeaderboard();
        current.push(entry);
        sortLeaderboard(current);
        localStorage.setItem(KEYS.LEADERBOARD, JSON.stringify(current.slice(0, 50)));
      };

      const getLeaderboard = async () => {
        if (isGasEnvironment()) {
          try {
            const data = await runGasFn('getLeaderboardData');
            if (Array.isArray(data)) { sortLeaderboard(data); return data; }
          } catch (e) {}
        }
        return getLocalLeaderboard();
      };

      const getLocalChat = () => {
          try { return JSON.parse(localStorage.getItem(KEYS.CHAT)) || []; } catch(e) { return []; }
      }

      const getChatMessages = async () => {
        if (isGasEnvironment()) {
          try {
            const data = await runGasFn('getChatData');
            if (Array.isArray(data)) return data;
          } catch (e) {}
        }
        return getLocalChat();
      };

      const postChatMessage = async (msg) => {
        if (isGasEnvironment()) {
            try {
              const data = await runGasFn('postChatData', msg);
              if (Array.isArray(data)) return data;
            } catch (e) {}
        }
        const current = getLocalChat();
        current.push(msg);
        const trimmed = current.length > 50 ? current.slice(current.length - 50) : current;
        localStorage.setItem(KEYS.CHAT, JSON.stringify(trimmed));
        return trimmed;
      };

      const getCampaignProgress = () => {
        try {
          const stored = localStorage.getItem(KEYS.CAMPAIGN_PROGRESS);
          // Default: Level 1 unlocked, others locked
          return stored ? JSON.parse(stored) : { 1: { unlocked: true, stars: 0 } };
        } catch(e) { return { 1: { unlocked: true, stars: 0 } }; }
      }

      const saveCampaignProgress = (prog) => {
        localStorage.setItem(KEYS.CAMPAIGN_PROGRESS, JSON.stringify(prog));
      }

      // --- THEME SYSTEM HELPERS ---
      const getGameStats = () => {
        try {
          const stored = localStorage.getItem(KEYS.GAME_STATS);
          return stored ? JSON.parse(stored) : {
            totalWins: 0,
            easyWins: 0,
            mediumWins: 0,
            hardWins: 0,
            perfectWins: 0, // 0 mistakes
            fastWins: 0 // under 3 minutes
          };
        } catch(e) {
          return { totalWins: 0, easyWins: 0, mediumWins: 0, hardWins: 0, perfectWins: 0, fastWins: 0 };
        }
      };

      const saveGameStats = (stats) => {
        try {
          localStorage.setItem(KEYS.GAME_STATS, JSON.stringify(stats));
        } catch(e) {}
      };

      const getUnlockedThemes = () => {
        try {
          const stored = localStorage.getItem(KEYS.UNLOCKED_THEMES);
          return stored ? JSON.parse(stored) : ['default'];
        } catch(e) {
          return ['default'];
        }
      };

      const saveUnlockedThemes = (themes) => {
        try {
          localStorage.setItem(KEYS.UNLOCKED_THEMES, JSON.stringify(themes));
        } catch(e) {}
      };

      const getActiveTheme = () => {
        try {
          const stored = localStorage.getItem(KEYS.ACTIVE_THEME);
          return stored || 'default';
        } catch(e) {
          return 'default';
        }
      };

      const saveActiveTheme = (themeId) => {
        try {
          localStorage.setItem(KEYS.ACTIVE_THEME, themeId);
        } catch(e) {}
      };

      const checkThemeUnlocks = (stats) => {
        const newlyUnlocked = [];
        const currentUnlocked = getUnlockedThemes();
        
        // Ocean: Win 5 games
        if (stats.totalWins >= 5 && !currentUnlocked.includes('ocean')) {
          newlyUnlocked.push('ocean');
        }
        
        // Forest: Win 10 games
        if (stats.totalWins >= 10 && !currentUnlocked.includes('forest')) {
          newlyUnlocked.push('forest');
        }
        
        // Sunset: Complete a Hard puzzle
        if (stats.hardWins >= 1 && !currentUnlocked.includes('sunset')) {
          newlyUnlocked.push('sunset');
        }
        
        // Midnight: Win with 0 mistakes
        if (stats.perfectWins >= 1 && !currentUnlocked.includes('midnight')) {
          newlyUnlocked.push('midnight');
        }
        
        // Sakura: Win 3 Easy puzzles
        if (stats.easyWins >= 3 && !currentUnlocked.includes('sakura')) {
          newlyUnlocked.push('sakura');
        }
        
        // Volcano: Win 3 Medium puzzles
        if (stats.mediumWins >= 3 && !currentUnlocked.includes('volcano')) {
          newlyUnlocked.push('volcano');
        }
        
        // Arctic: Win in under 3 minutes
        if (stats.fastWins >= 1 && !currentUnlocked.includes('arctic')) {
          newlyUnlocked.push('arctic');
        }
        
        if (newlyUnlocked.length > 0) {
          const updatedUnlocked = [...currentUnlocked, ...newlyUnlocked];
          saveUnlockedThemes(updatedUnlocked);
        }
        
        return newlyUnlocked;
      };

      const getUserId = () => {
          let uid = localStorage.getItem(KEYS.USER_ID);
          if (!uid) {
              uid = generateGuestId();
              localStorage.setItem(KEYS.USER_ID, uid);
          }
          return uid;
      }

      const generateGuestId = () => {
        // Use cryptographically secure randomness
        if (window.crypto && window.crypto.getRandomValues) {
          const array = new Uint32Array(1);
          window.crypto.getRandomValues(array);
          return 'User' + (array[0] % 10000);
        } else {
          // Fallback (not cryptographically secure, should rarely happen)
          return 'User' + Math.floor(Math.random() * 10000);
        }
      };

      // User session management
      const getUserSession = () => {
        try {
          const session = localStorage.getItem(KEYS.USER_SESSION);
          return session ? JSON.parse(session) : null;
        } catch (e) { return null; }
      };

      const setUserSession = (user) => {
        try {
          localStorage.setItem(KEYS.USER_SESSION, JSON.stringify(user));
          // Also update USER_ID to match authenticated username
          if (user && user.username) {
            localStorage.setItem(KEYS.USER_ID, user.username);
          }
        } catch (e) {
          console.warn('Failed to save user session to localStorage:', e);
        }
      };

      const clearUserSession = () => {
        localStorage.removeItem(KEYS.USER_SESSION);
        // Reset to guest ID
        const guestId = generateGuestId();
        localStorage.setItem(KEYS.USER_ID, guestId);
      };

      const getCurrentUserId = () => {
        const session = getUserSession();
        if (session && session.username) {
          return session.username;
        }
        return getUserId();
      };

      const isUserAuthenticated = () => {
        const session = getUserSession();
        return session !== null && session.userId;
      };

      const logError = async (message, error) => { 
        console.log(message, error); 
        try {
          await runGasFn('logClientError', {
            type: error?.name || 'Error',
            message: message || error?.message || 'Unknown error',
            userAgent: navigator.userAgent,
            count: 1
          });
        } catch (e) {
          console.error('Failed to log error to GAS:', e);
        }
      };

      // Detect whether GAS backend is configured/available
      const isGasEnvironment = () => {
        try {
          if (typeof GAS_URL !== 'string') return false;
          const host = (new URL(GAS_URL)).host;
          return host === 'script.google.com';
        } catch (e) { return false; }
      };

      // --- VISUAL EFFECTS ---
      const triggerConfetti = () => {
          const colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'];
          const root = document.getElementById('root');
          for(let i=0; i<50; i++) {
              const el = document.createElement('div');
              el.classList.add('confetti-piece');
              el.style.left = Math.random() * 100 + 'vw';
              el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
              el.style.animation = `confettiDrop ${1 + Math.random() * 2}s linear forwards`;
              root.appendChild(el);
              setTimeout(() => el.remove(), 3000);
          }
      };

      // --- COMPONENTS ---

      const Cell = memo(({ data, isSelected, onClick, isCompletedBox }) => {
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

      const SudokuBoard = ({ board, selectedId, onCellClick, completedBoxes }) => {
        return (
          <div className="border-4 border-gray-800 dark:border-gray-400 rounded-sm overflow-hidden shadow-xl inline-block">
            <div className="grid grid-cols-9">
              {board.map((cell) => {
                  const boxIdx = Math.floor(cell.row / 3) * 3 + Math.floor(cell.col / 3);
                  const isCompleted = completedBoxes.includes(boxIdx);
                  return (
                      <Cell key={cell.id} data={cell} isSelected={selectedId === cell.id} onClick={() => onCellClick(cell.id)} isCompletedBox={isCompleted} />
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
        Star: ({filled}) => <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.545.044.77.77.326 1.163l-4.304 3.86a.562.562 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.304-3.86c-.444-.393-.219-1.119.326-1.163l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
        Chest: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M21 11.25H3M21 11.25a1.5 1.5 0 00-1.5-1.5H16.5m-3 0h3m-3 0c0-1.242-1.008-2.25-2.25-2.25s-2.25 1.008-2.25 2.25m4.5 0h-4.5m4.5 0H21m-4.5 0H4.5m0 0a1.5 1.5 0 00-1.5 1.5m1.5-1.5h-3" /></svg>,
        Avatar: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white drop-shadow-lg"><circle cx="12" cy="12" r="10" className="text-blue-500"/><path fill="white" d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 18a6 6 0 0112 0H6z" /></svg>,
        User: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
        Login: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>,
        Logout: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
      };

      const CHAT_POLL_INTERVAL = 5000;

      // --- THEME SELECTOR COMPONENT ---
      const ThemeSelector = ({ soundEnabled, onClose, activeThemeId, unlockedThemes, onSelectTheme }) => {
        const stats = getGameStats();
        
        const isThemeUnlocked = (themeId) => {
          return unlockedThemes.includes(themeId);
        };
        
        const getThemeProgress = (themeId) => {
          const theme = THEMES[themeId];
          if (!theme || theme.unlocked || isThemeUnlocked(themeId)) return null;
          
          // Return progress towards unlocking this theme
          switch(themeId) {
            case 'ocean':
              return `${Math.min(stats.totalWins, 5)}/5 wins`;
            case 'forest':
              return `${Math.min(stats.totalWins, 10)}/10 wins`;
            case 'sunset':
              return stats.hardWins >= 1 ? 'Unlocked!' : `${stats.hardWins}/1 Hard win`;
            case 'midnight':
              return stats.perfectWins >= 1 ? 'Unlocked!' : `${stats.perfectWins}/1 perfect win`;
            case 'sakura':
              return `${Math.min(stats.easyWins, 3)}/3 Easy wins`;
            case 'volcano':
              return `${Math.min(stats.mediumWins, 3)}/3 Medium wins`;
            case 'arctic':
              return stats.fastWins >= 1 ? 'Unlocked!' : `${stats.fastWins}/1 fast win`;
            default:
              return null;
          }
        };
        
        const handleThemeSelect = (themeId) => {
          if (!isThemeUnlocked(themeId)) return;
          if (soundEnabled) SoundManager.play('uiTap');
          onSelectTheme(themeId);
          saveActiveTheme(themeId);
        };
        
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-pop relative">
              <button 
                onClick={() => { if(soundEnabled) SoundManager.play('uiTap'); onClose(); }} 
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Icons.X />
              </button>
              
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-gray-100">🎨 Themes</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                Unlock themes by completing challenges. Customize your Sudoku experience!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {Object.values(THEMES).map((theme) => {
                  const unlocked = isThemeUnlocked(theme.id);
                  const isActive = theme.id === activeThemeId;
                  const progress = getThemeProgress(theme.id);
                  
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                          : unlocked 
                            ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer' 
                            : 'border-gray-200 dark:border-gray-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-3xl sm:text-4xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
                          {theme.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                              {theme.name}
                            </h3>
                            {isActive && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Active</span>
                            )}
                            {!unlocked && (
                              <span className="text-xs text-gray-500">🔒</span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {theme.description}
                          </p>
                          {!unlocked && theme.unlockCriteria && (
                            <div className="mt-2 text-xs">
                              <p className="text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Unlock:</span> {theme.unlockCriteria}
                              </p>
                              {progress && (
                                <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                                  Progress: {progress}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`mt-3 h-12 rounded ${theme.background} border border-gray-300 dark:border-gray-600`}></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      };

      // --- USER PANEL COMPONENT ---
      const UserPanel = ({ soundEnabled, onClose }) => {
        const [mode, setMode] = useState('menu'); // menu, login, register
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        const [loading, setLoading] = useState(false);
        const [localUserSession, setLocalUserSession] = useState(getUserSession());

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
              setUserSession(result.user);
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

          if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
          }

          if (password.length < 6) {
            setError('Password must be at least 6 characters');
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
              setUserSession(result.user);
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
          clearUserSession();
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
          return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-sm animate-pop relative">
                <button onClick={() => onClose(localUserSession)} className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Icons.X />
                </button>
                
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Icons.User />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{localUserSession.displayName || localUserSession.username}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">@{localUserSession.username}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Games:</span>
                    <span className="font-bold text-gray-800 dark:text-white">{localUserSession.totalGames || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Wins:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{localUserSession.totalWins || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Win Rate:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {localUserSession.totalGames > 0 ? Math.round((localUserSession.totalWins / localUserSession.totalGames) * 100) : 0}%
                    </span>
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

      const CampaignMap = ({ progress, onPlayLevel, soundEnabled, onBack }) => {
         const [selectedLevel, setSelectedLevel] = useState(null);
         const scrollContainerRef = useRef(null);
         
         const highestUnlockedId = useMemo(() => {
             return Math.max(...Object.keys(progress).filter(k => progress[k].unlocked).map(Number), 1);
         }, [progress]);

         useEffect(() => {
            if(scrollContainerRef.current) {
                const scrollPos = (highestUnlockedId * 100) - 200; 
                scrollContainerRef.current.scrollTo({ top: scrollPos, behavior: 'smooth' });
            }
         }, [highestUnlockedId]);

         const getPoints = () => {
             const points = [];
             for(let i=1; i<=CAMPAIGN_LEVELS.length; i++) {
                 const x = 50 + Math.sin(i * 1.5) * 35; 
                 const y = i * 100;
                 points.push(`${x},${y}`);
             }
             return points;
         };
         
         const points = getPoints();

         return (
             <div className="h-screen w-full bg-gray-900 text-gray-100 flex flex-col relative overflow-hidden animate-fade-in">
                 <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-gray-900 z-0 pointer-events-none"></div>
                 
                 <div className="relative z-20 flex justify-between items-center p-2 sm:p-3 md:p-4 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
                     <button onClick={onBack} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-800 transition-colors"><Icons.Undo /></button>
                     <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Campaign Saga</h1>
                     <div className="w-6 sm:w-8"></div>
                 </div>

                 <div ref={scrollContainerRef} className="flex-1 w-full overflow-y-auto relative z-10 scrollbar-hide pb-20">
                    <div className="w-full max-w-md mx-auto relative" style={{ height: `${(CAMPAIGN_LEVELS.length + 2) * 100}px` }}>
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
                            {CAMPAIGN_LEVELS.map((lvl, i) => {
                                const y = i * 100 + 50;
                                if (lvl.biome === 'grass') return <circle key={'d'+i} cx={i%2===0 ? '20%' : '80%'} cy={y} r="15" fill="#4ade80" />;
                                if (lvl.biome === 'desert') return <path key={'d'+i} d={`M ${i%2===0?10:80} ${y} l 20 -20 l 20 20 z`} fill="#fbbf24" />;
                                if (lvl.biome === 'space') return <circle key={'d'+i} cx={i%2===0 ? '15%' : '85%'} cy={y} r="2" fill="white" className="animate-pulse" />;
                                return null;
                            })}
                        </svg>

                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
                            <polyline points={points.map(p => { const [x,y] = p.split(','); return `${x}%,${y}`; }).join(' ')} fill="none" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
                             <polyline 
                                points={points.slice(0, highestUnlockedId).map(p => { const [x,y] = p.split(','); return `${x}%,${y}`; }).join(' ')} 
                                fill="none" 
                                stroke="url(#gradientPath)" 
                                strokeWidth="8" 
                                strokeLinecap="round"
                                className="path-dash"
                             />
                             <defs>
                                <linearGradient id="gradientPath" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#60a5fa" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                             </defs>
                        </svg>

                        {CAMPAIGN_LEVELS.map((level, i) => {
                             const p = progress[level.id] || { unlocked: false, stars: 0 };
                             const isLocked = !p.unlocked;
                             const isCompleted = p.stars > 0;
                             const isCurrent = highestUnlockedId === level.id;
                             
                             const leftPos = 50 + Math.sin((i+1) * 1.5) * 35; 
                             const topPos = (i+1) * 100;

                             return (
                                 <div 
                                    key={level.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
                                    style={{ left: `${leftPos}%`, top: `${topPos}px` }}
                                 >
                                    {isCurrent && (
                                        <div className="absolute -top-10 sm:-top-12 animate-float z-30 pointer-events-none scale-75 sm:scale-100">
                                            <Icons.Avatar />
                                            <div className="w-6 sm:w-8 h-2 bg-black/30 rounded-full blur-sm mt-1 mx-auto"></div>
                                        </div>
                                    )}

                                    <div 
                                        onClick={() => {
                                            if(!isLocked) {
                                                if(soundEnabled) SoundManager.play('select');
                                                setSelectedLevel(level);
                                            } else {
                                                if(soundEnabled) SoundManager.play('error');
                                            }
                                        }}
                                        className={`
                                            relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl rotate-45 flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer
                                            ${isLocked ? 'bg-gray-800 border-2 border-gray-600 grayscale opacity-60' : 'hover:scale-110 active:scale-95'}
                                            ${isCompleted ? 'bg-green-900 border-2 border-green-500' : ''}
                                            ${!isLocked && !isCompleted ? 'bg-blue-600 border-2 border-blue-400 animate-pulse-glow' : ''}
                                            ${level.isChest ? 'rounded-full rotate-0' : ''} 
                                        `}
                                    >
                                        <div className={`-rotate-45 ${level.isChest ? 'rotate-0' : ''} scale-75 sm:scale-90 md:scale-100`}>
                                            {isLocked 
                                                ? <Icons.Lock /> 
                                                : level.isChest 
                                                    ? <div className="text-yellow-400 animate-bounce-slow"><Icons.Chest /></div> 
                                                    : <span className="font-bold text-lg sm:text-xl text-white">{level.id}</span>
                                            }
                                        </div>
                                    </div>

                                    {!isLocked && (
                                        <div className="absolute -bottom-6 sm:-bottom-8 flex gap-0.5 sm:gap-1 bg-gray-900/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-gray-700 backdrop-blur-md">
                                            {[1,2,3].map(s => (
                                                <div key={s} className={`${s <= p.stars ? "text-yellow-400" : "text-gray-600"} scale-75 sm:scale-100`}>
                                                    <Icons.Star filled={true} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                 </div>
                             );
                        })}
                    </div>
                 </div>

                 {selectedLevel && (
                     <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-fade-in">
                         <div className="bg-gray-800 text-white p-1 rounded-2xl shadow-2xl max-w-sm w-full relative border border-gray-600 animate-pop overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                             <div className="p-4 sm:p-6">
                                <button onClick={() => setSelectedLevel(null)} className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-white"><Icons.X /></button>
                                
                                <div className="text-center mb-4 sm:mb-6">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 bg-gray-700 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-inner">
                                        {selectedLevel.biome === 'grass' ? '🌿' : selectedLevel.biome === 'desert' ? '🌵' : '🌌'}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold mb-1">{selectedLevel.title}</h2>
                                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded border ${
                                            selectedLevel.difficulty === 'Hard' ? 'border-red-500 text-red-400 bg-red-900/30' : 
                                            selectedLevel.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-400 bg-yellow-900/30' :
                                            'border-green-500 text-green-400 bg-green-900/30'
                                    }`}>
                                        {selectedLevel.difficulty}
                                    </span>
                                </div>
                                
                                <div className="bg-gray-900/50 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 border border-gray-700/50">
                                    <h3 className="text-[10px] sm:text-xs font-bold uppercase text-gray-500 mb-2">Mission Objective</h3>
                                    <p className="text-base sm:text-lg font-medium text-blue-100">{selectedLevel.desc}</p>
                                </div>

                                <button 
                                    onClick={() => {
                                        if(soundEnabled) SoundManager.play('questStart');
                                        onPlayLevel(selectedLevel);
                                    }}
                                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <span>Play Level</span> <Icons.Play />
                                </button>
                             </div>
                         </div>
                     </div>
                 )}
             </div>
         )
      };

      const OpeningScreen = ({ onStart, onResume, onCampaign, hasSavedGame, darkMode, toggleDarkMode, loading, soundEnabled, toggleSound, onShowUserPanel, onShowThemes, userSession }) => (
        <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 text-gray-900 dark:text-gray-100 animate-fade-in relative z-10">
           <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2">
              <button onClick={onShowUserPanel} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative">
                  <Icons.User />
                  {userSession && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                  )}
              </button>
              <button onClick={onShowThemes} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Themes">
                  🎨
              </button>
              <button onClick={toggleSound} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  {soundEnabled ? <Icons.VolumeUp /> : <Icons.VolumeOff />}
              </button>
              <button onClick={toggleDarkMode} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  {darkMode ? <Icons.Sun /> : <Icons.Moon />}
              </button>
           </div>
           
           <div className="text-center mb-6 sm:mb-10">
             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2">Sudoku <span className="text-blue-600">Logic</span> Lab</h1>
           </div>

           <div className="w-full max-w-sm space-y-3 sm:space-y-4">
              <button 
                  onClick={() => { if(soundEnabled) SoundManager.play('select'); onCampaign(); }}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg font-bold text-base sm:text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                  <Icons.Map /> Campaign Saga
              </button>

              {hasSavedGame && (
                <button 
                  onClick={() => { if(soundEnabled) SoundManager.play('startGame'); onResume(); }}
                  disabled={loading}
                  className="w-full py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg font-bold text-base sm:text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icons.Play /> Resume Game
                </button>
              )}
              
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                <h2 className="text-xs sm:text-sm font-bold uppercase text-gray-500 mb-3 sm:mb-4 text-center">
                    {loading ? 'Generating Puzzle...' : 'Quick Play'}
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {['Easy', 'Medium', 'Hard', 'Daily'].map(d => (
                    <button 
                      key={d}
                      onClick={() => { if(soundEnabled) SoundManager.play('startGame'); onStart(d); }}
                      disabled={loading}
                      className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-wait"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
           </div>
           
           <footer className="mt-6 sm:mt-8 text-xs md:text-sm lg:text-base text-gray-400">v2.1 &bull; Logic Lab Series</footer>
        </div>
      );

      const ClosingScreen = ({ status, time, difficulty, mistakes, onRestart, onMenu, loading, soundEnabled, activeQuest, questCompleted, newlyUnlockedThemes }) => {
        const isWin = status === 'won';
        
        useEffect(() => {
            if (questCompleted) {
                if (soundEnabled) SoundManager.play(activeQuest.isChest ? 'chestOpen' : 'success');
                triggerConfetti();
            }
        }, [questCompleted, soundEnabled]);

        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 text-gray-900 dark:text-gray-100 animate-fade-in relative">
             <div className="text-center max-w-md w-full bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden z-10">
                {questCompleted && <div className="absolute inset-0 pointer-events-none overflow-hidden"><div className="sparkle top-10 left-10"></div><div className="sparkle top-20 right-20"></div></div>}
                
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 animate-bounce-slow">{isWin ? (questCompleted && activeQuest.isChest ? '🎁' : '🏆') : '💔'}</div>
                <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isWin ? 'text-blue-600' : 'text-red-500'}`}>
                  {isWin ? (questCompleted ? (activeQuest.isChest ? 'Loot Acquired!' : 'Quest Complete!') : 'Puzzle Solved!') : 'Game Over'}
                </h1>
                
                {activeQuest && (
                    <div className="my-3 sm:my-4 p-2.5 sm:p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                        <p className="text-[10px] sm:text-xs uppercase font-bold text-indigo-500">Quest Objective</p>
                        <p className="text-xs sm:text-sm font-medium">{activeQuest.desc}</p>
                        {questCompleted 
                            ? <div className="mt-2 text-green-600 font-bold flex items-center justify-center gap-1 text-xs sm:text-sm"><Icons.Star filled={true}/> Objective Met!</div>
                            : <div className="mt-2 text-red-500 text-[10px] sm:text-xs">Objective Failed</div>
                        }
                    </div>
                )}

                {newlyUnlockedThemes && newlyUnlockedThemes.length > 0 && (
                    <div className="my-3 sm:my-4 p-2.5 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-700 animate-pulse-glow">
                        <p className="text-sm sm:text-base font-bold text-purple-700 dark:text-purple-300 mb-2">🎨 New Theme{newlyUnlockedThemes.length > 1 ? 's' : ''} Unlocked!</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {newlyUnlockedThemes.map(themeId => (
                                <div key={themeId} className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <span className="text-lg">{THEMES[themeId].icon}</span>
                                    <span className="text-xs sm:text-sm font-medium">{THEMES[themeId].name}</span>
                                </div>
                            ))}
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
                        <div className="font-mono text-sm sm:text-base">{Math.floor(time/60)}:{(time%60).toString().padStart(2, '0')}</div>
                    </div>
                     <div>
                        <div className="text-[10px] sm:text-xs text-gray-500 uppercase">Errors</div>
                        <div className={`font-bold text-sm sm:text-base ${mistakes >= 3 ? 'text-red-500' : ''}`}>{mistakes}/3</div>
                    </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                    {!activeQuest && (
                        <button onClick={() => { if(soundEnabled) SoundManager.play('startGame'); onRestart(); }} disabled={loading} className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm sm:text-base transition-colors disabled:opacity-50">
                        {loading ? 'Generating...' : (isWin ? 'Play Another' : 'Try Again')}
                        </button>
                    )}
                    <button onClick={() => { if(soundEnabled) SoundManager.play('uiTap'); onMenu(); }} className="w-full py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-bold text-sm sm:text-base transition-colors">
                      {activeQuest ? 'Return to Map' : 'Main Menu'}
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
        const [chatMessages, setChatMessages] = useState([]);
        const [chatNotification, setChatNotification] = useState(null);
        const [leaderboard, setLeaderboard] = useState([]);
        const [loading, setLoading] = useState(false);
        
        // Campaign State
        const [activeQuest, setActiveQuest] = useState(null);
        const [campaignProgress, setCampaignProgress] = useState(getCampaignProgress());
        const [questCompleted, setQuestCompleted] = useState(false);
        
        // User Authentication State
        const [showUserPanel, setShowUserPanel] = useState(false);
        const [appUserSession, setAppUserSession] = useState(getUserSession());
        
        // Theme State
        const [activeThemeId, setActiveThemeId] = useState(getActiveTheme());
        const [unlockedThemes, setUnlockedThemes] = useState(getUnlockedThemes());
        const [newlyUnlockedThemes, setNewlyUnlockedThemes] = useState([]);
        const [showThemeSelector, setShowThemeSelector] = useState(false);
        
        const timerRef = useRef(null);
        const chatEndRef = useRef(null);
        const isSendingRef = useRef(false);

        useEffect(() => {
          const handleError = (event) => logError(event.message, event.error);
          window.addEventListener('error', handleError);
          return () => window.removeEventListener('error', handleError);
        }, []);

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

          const saved = loadGame();
          if (saved && saved.status === 'playing') {
            setBoard(saved.board); setTimer(saved.timer); setMistakes(saved.mistakes);
            setDifficulty(saved.difficulty); setStatus('paused'); setHistory(saved.history);
            setView('game');
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
            saveGame({ board, difficulty, status, timer, mistakes, history, historyIndex: history.length - 1, selectedCell, mode });
          }
        }, [board, timer, status]);

        useEffect(() => {
          let interval;
          const fetchChat = async () => {
            if (isSendingRef.current) return;
            const msgs = await getChatMessages();
            if (!isSendingRef.current && msgs.length > 0) {
               setChatMessages(prev => {
                   if (prev.length > 0 && msgs.length > prev.length) {
                       const lastMsg = msgs[msgs.length - 1];
                       if (!isChatOpen && lastMsg.sender !== getCurrentUserId()) {
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

        const startNewGame = async (diff, quest = null) => {
          if(soundEnabled) SoundManager.init();
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
            setShowModal('none'); setActiveQuest(quest); setQuestCompleted(false);
            setView('game');
          } catch (e) { console.error(e); alert("Failed to start game."); } finally { setLoading(false); }
        };

        const handleNumberInput = useCallback((num) => {
          if (selectedCell === null || status !== 'playing') return;
          const currentCell = board[selectedCell];
          if (currentCell.isFixed) return;

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
                  setBoard(newBoard); setStatus('lost'); clearSavedGame(); return;
              }
              setTimeout(() => {
                  setBoard(prev => {
                      const b = [...prev];
                      if(b[selectedCell]) { b[selectedCell].isError = false; b[selectedCell].value = null; }
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
            clearSavedGame();
            handleWin(newBoard, mistakes, timer); 
          }
        }, [board, selectedCell, status, mode, mistakes, soundEnabled, timer]);

        const handleWin = async (finalBoard, finalMistakes, finalTime) => {
            const currentUserId = getCurrentUserId();
            saveScore({ name: currentUserId, time: finalTime, difficulty, date: new Date().toLocaleDateString() });
            
            // Update game stats for theme unlocking
            const stats = getGameStats();
            stats.totalWins += 1;
            if (difficulty === 'Easy') stats.easyWins += 1;
            if (difficulty === 'Medium') stats.mediumWins += 1;
            if (difficulty === 'Hard') stats.hardWins += 1;
            if (finalMistakes === 0) stats.perfectWins += 1;
            if (finalTime < 180) stats.fastWins += 1;
            saveGameStats(stats);
            
            // Check for theme unlocks
            const newThemes = checkThemeUnlocks(stats);
            if (newThemes.length > 0) {
              setNewlyUnlockedThemes(newThemes);
              setUnlockedThemes(getUnlockedThemes()); // Update state with newly unlocked themes
            }
            
            // Update user stats if authenticated
            // Note: This function is only called when the player wins, so we increment both games and wins
            // Game losses are not tracked in the current implementation
            if (isUserAuthenticated() && isGasEnvironment()) {
                const session = getUserSession();
                if (session && session.userId) {
                    try {
                        await runGasFn('updateUserProfile', { 
                            userId: session.userId,  // Backend requires userId for lookups
                            incrementGames: true,
                            incrementWins: true
                        });
                        // Refresh user profile to get updated stats
                        const updatedProfile = await runGasFn('getUserProfile', { userId: session.userId });
                        if (updatedProfile && updatedProfile.success) {
                            // Update both global storage and component state for consistency
                            setUserSession(updatedProfile.user);
                            setAppUserSession(updatedProfile.user);
                        }
                    } catch (err) {
                        console.error('Failed to update user stats:', err);
                    }
                }
            }
            
            if (activeQuest) {
                const gameStats = { status: 'won', time: finalTime, mistakes: finalMistakes };
                if (activeQuest.criteria(gameStats)) {
                    setQuestCompleted(true);
                    if (soundEnabled) setTimeout(() => SoundManager.play('unlock'), 1000); 

                    // Update Progress
                    const nextId = activeQuest.id + 1;
                    const newProg = { ...campaignProgress };
                    newProg[activeQuest.id] = { unlocked: true, stars: 3 };
                    if (nextId <= CAMPAIGN_LEVELS.length) {
                         if (!newProg[nextId]) newProg[nextId] = { unlocked: true, stars: 0 };
                         else newProg[nextId].unlocked = true;
                    }
                    setCampaignProgress(newProg);
                    saveCampaignProgress(newProg);
                }
            }
        };

        const handleUndo = () => {
          if (history.length > 1) {
            if(soundEnabled) SoundManager.play('undo');
            const newHistory = [...history]; newHistory.pop(); 
            setBoard(newHistory[newHistory.length - 1]); setHistory(newHistory);
          }
        };

        const handleChatSend = async (text) => {
            const txt = text.trim(); if (!txt) return;
            if (soundEnabled) SoundManager.play('uiTap');
            setChatInput('');
            const currentUserId = getCurrentUserId();
            const msg = { id: Date.now().toString(), sender: currentUserId, text: txt, timestamp: Date.now() };
            setChatMessages(prev => [...prev, msg]); 
            isSendingRef.current = true;
            const updated = await postChatMessage(msg);
            if (updated && Array.isArray(updated)) setChatMessages(updated);
            isSendingRef.current = false;
        };

        const handleUserPanelClose = (updatedUser) => {
          if (updatedUser) {
            // Update both global storage and component state for consistency
            setUserSession(updatedUser);
            setAppUserSession(updatedUser);
          }
          setShowUserPanel(false);
        };

        useEffect(() => {
          const handleKeyDown = (e) => {
            if (status !== 'playing') return;
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

        const completedBoxes = useMemo(() => {
            const completed = [];
            for(let b=0; b<9; b++) {
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

        const toggleChat = () => {
            if (soundEnabled) SoundManager.play('uiTap');
            setChatNotification(null); setIsChatOpen(prev => !prev);
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
                                              <td className="px-2 sm:px-3 py-2 sm:py-3 font-mono text-[10px] sm:text-xs">{Math.floor(entry.time/60)}:{(entry.time%60).toString().padStart(2, '0')}</td>
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
        const userId = getCurrentUserId();

        // --- RENDER LOGIC ---

        // 1. CAMPAIGN MAP
        if (view === 'campaign') {
            return (
                <>
                  <CampaignMap 
                      progress={campaignProgress} 
                      onPlayLevel={(level) => startNewGame(level.difficulty, level)} 
                      soundEnabled={soundEnabled}
                      onBack={() => { if(soundEnabled) SoundManager.play('uiTap'); setView('menu'); }}
                  />
                  {showUserPanel && <UserPanel soundEnabled={soundEnabled} onClose={handleUserPanelClose} />}
                </>
            );
        }

        // 2. MAIN MENU (Opening Screen)
        if (view === 'menu') {
            return (
                <>
                <OpeningScreen 
                    onStart={startNewGame} 
                    onResume={() => { setView('game'); setStatus('playing'); }}
                    onCampaign={() => setView('campaign')}
                    hasSavedGame={status === 'paused'}
                    darkMode={darkMode} toggleDarkMode={toggleDarkMode}
                    loading={loading} soundEnabled={soundEnabled} toggleSound={toggleSound}
                    onShowUserPanel={() => setShowUserPanel(true)}
                    onShowThemes={() => { if(soundEnabled) SoundManager.play('uiTap'); setShowThemeSelector(true); }}
                    userSession={appUserSession}
                />
                {showUserPanel && <UserPanel soundEnabled={soundEnabled} onClose={handleUserPanelClose} />}
                {showThemeSelector && (
                    <ThemeSelector 
                        soundEnabled={soundEnabled}
                        onClose={() => setShowThemeSelector(false)}
                        activeThemeId={activeThemeId}
                        unlockedThemes={unlockedThemes}
                        onSelectTheme={(themeId) => {
                            setActiveThemeId(themeId);
                        }}
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
                    if(activeQuest) setView('campaign'); 
                    else setView('menu'); 
                    setActiveQuest(null);
                    setNewlyUnlockedThemes([]);
                }} 
                loading={loading} soundEnabled={soundEnabled}
                activeQuest={activeQuest} questCompleted={questCompleted}
                newlyUnlockedThemes={newlyUnlockedThemes}
             />
             {showThemeSelector && (
                 <ThemeSelector 
                     soundEnabled={soundEnabled}
                     onClose={() => setShowThemeSelector(false)}
                     activeThemeId={activeThemeId}
                     unlockedThemes={unlockedThemes}
                     onSelectTheme={(themeId) => {
                         setActiveThemeId(themeId);
                     }}
                 />
             )}
             </>
           );
        }

        // 4. GAME SCREEN
        const activeTheme = THEMES[activeThemeId] || THEMES.default;
        return (
          <div className={`min-h-screen flex flex-col items-center p-2 sm:p-4 transition-colors duration-300 text-gray-900 dark:text-gray-100 ${activeTheme.background}`}>
            <div className="w-full max-w-7xl flex flex-col gap-3 sm:gap-6 flex-grow">
                {!isGasEnvironment() && (
                  <div className="w-full mx-auto mb-2 p-2 rounded text-xs sm:text-sm text-yellow-800 bg-yellow-100 border border-yellow-200 text-center">GAS not configured — using local generator for puzzles. Create <span className="font-mono">config/config.local.js</span> with your <span className="font-mono">GAS_URL</span> to enable cloud persistence.</div>
                )}
                
                {/* Header */}
                <div className="flex justify-between items-center px-2 sm:px-4 lg:px-0">
                  <div className="flex flex-col">
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight cursor-pointer" onClick={() => { if(soundEnabled) SoundManager.play('uiTap'); setStatus('paused'); setView('menu'); }}>Sudoku <span className="text-blue-600">Logic</span> Lab</h1>
                      {activeQuest && <span className="text-[10px] sm:text-xs font-semibold text-indigo-500 uppercase tracking-widest flex items-center gap-1"><Icons.Map /> Campaign Mode</span>}
                  </div>
                  <div className="flex gap-1 sm:gap-2 items-center">
                    {loading && <span className="text-xs text-blue-500 animate-pulse hidden sm:inline">Generating...</span>}
                    <button onClick={() => setShowUserPanel(true)} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative">
                        <Icons.User />
                        {appUserSession && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                        )}
                    </button>
                    <button onClick={() => { if(soundEnabled) SoundManager.play('uiTap'); setShowThemeSelector(true); }} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Themes">
                        🎨
                    </button>
                    <button onClick={toggleSound} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {soundEnabled ? <Icons.VolumeUp /> : <Icons.VolumeOff />}
                    </button>
                    <button onClick={toggleDarkMode} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {darkMode ? <Icons.Sun /> : <Icons.Moon />}
                    </button>
                  </div>
                </div>

                {activeQuest && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-2 rounded-lg text-center text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300">
                        Objective: {activeQuest.desc}
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-7 lg:gap-8 justify-center items-start">
                  
                  {/* Left: Board */}
                  <div className="flex-shrink-0 mx-auto lg:mx-0">
                      <SudokuBoard 
                          board={board} selectedId={selectedCell} 
                          onCellClick={(id) => { if(soundEnabled) SoundManager.play('select'); setSelectedCell(id); }} 
                          completedBoxes={completedBoxes}
                      />
                  </div>

                  {/* Right: Sidebar */}
                  <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-md lg:w-80 mx-auto lg:mx-0">

                      {/* Number Pad (top of sidebar) */}
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                              <button
                                  key={num}
                                  onClick={() => { if (soundEnabled) SoundManager.play('select'); handleNumberInput(num); }}
                                  disabled={(status !== 'playing') || (remaining[num] === 0)}
                                  className={`h-12 sm:h-14 rounded-lg text-lg sm:text-xl font-bold transition-all transform active:scale-95 ${((status !== 'playing') || (remaining[num] === 0)) ? 'opacity-20 cursor-not-allowed bg-gray-200 dark:bg-gray-800' : 'bg-white dark:bg-gray-700 shadow-sm hover:bg-blue-50 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'}`}
                              >
                                  {num} <span className="block text-[8px] sm:text-[9px] text-gray-400 font-normal -mt-0.5">{remaining[num]} left</span>
                              </button>
                          ))}
                      </div>
                      


                      {/* Stats */}
                      <div className="w-full flex justify-between items-center bg-white dark:bg-gray-800 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
                          <div className="flex flex-col">
                              <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-semibold">Difficulty</span>
                              <span className="font-bold text-sm sm:text-base">{difficulty}</span>
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
                      <div className="flex w-full justify-between gap-1.5 sm:gap-2">
                          <button 
                              onClick={() => { handleUndo(); }}
                              className="flex-1 flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                          >
                              <Icons.Undo /><span className="text-[9px] sm:text-[10px] mt-1">Undo</span>
                          </button>
                          <button 
                              onClick={() => {
                                  if(soundEnabled) SoundManager.play('erase');
                                  if (selectedCell !== null && !board[selectedCell].isFixed) {
                                      const newBoard = [...board]; newBoard[selectedCell].value = null; newBoard[selectedCell].notes = [];
                                      setBoard(newBoard);
                                  }
                              }}
                              className="flex-1 flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                          >
                              <Icons.Eraser /><span className="text-[9px] sm:text-[10px] mt-1">Erase</span>
                          </button>
                          <button 
                              onClick={() => { if(soundEnabled) SoundManager.play('pencil'); setMode(mode === 'pen' ? 'pencil' : 'pen'); }}
                              className={`flex-1 flex flex-col items-center p-1.5 sm:p-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 ${mode === 'pencil' ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : 'bg-white dark:bg-gray-800'}`}
                          >
                              <div className="relative">
                                  <Icons.Pencil />
                                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 ${mode === 'pencil' ? '' : 'hidden'}`}></span>
                                      <span className={`relative inline-flex rounded-full h-2 w-2 ${mode === 'pencil' ? 'bg-blue-500' : 'bg-transparent'}`}></span>
                                  </span>
                              </div>
                              <span className="text-[9px] sm:text-[10px] mt-1">{mode === 'pencil' ? 'Notes' : 'Notes'}</span>
                          </button>
                      </div>

                      {/* New Game */}
                      {!activeQuest && <div className="bg-white dark:bg-gray-800 p-2.5 sm:p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                          <h3 className="text-[10px] sm:text-xs font-bold uppercase text-gray-500 mb-2">{loading ? 'Generating...' : 'New Game'}</h3>
                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                              {['Easy', 'Medium', 'Hard', 'Daily'].map(d => (
                                  <button key={d} onClick={() => { if(soundEnabled) SoundManager.play('startGame'); startNewGame(d); }} disabled={loading} className={`py-1.5 sm:py-2 px-2 rounded text-xs font-medium transition-colors ${difficulty === d ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'} disabled:opacity-50`}>{d}</button>
                              ))}
                          </div>
                      </div>}

                      <div className="grid grid-cols-1 gap-2">
                           <button onClick={handleOpenLeaderboard} className="py-2.5 sm:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded shadow-md text-xs font-bold hover:from-yellow-600 hover:to-orange-600 transition-colors transform hover:-translate-y-0.5">🏆 View Leaderboard</button>
                      </div>
                  </div>
                </div>
            </div>

            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
               {chatNotification && !isChatOpen && (
                   <div onClick={toggleChat} className="bg-blue-600 text-white p-2 sm:p-3 rounded-lg shadow-lg cursor-pointer animate-slide-up flex items-center gap-2 sm:gap-3 max-w-xs">
                      <div className="bg-white/20 p-1.5 sm:p-2 rounded-full"><Icons.Chat /></div>
                      <div className="flex-1 min-w-0"><div className="text-[9px] sm:text-[10px] font-bold opacity-80">{chatNotification.sender} says:</div><div className="text-xs sm:text-sm truncate">{chatNotification.text}</div></div>
                   </div>
               )}
               {isChatOpen && (
                 <div className="bg-white dark:bg-gray-800 w-72 sm:w-80 h-80 sm:h-96 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-pop overflow-hidden mb-2">
                    <div className="p-2.5 sm:p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                       <span className="font-bold text-xs sm:text-sm text-gray-700 dark:text-gray-200">Live Chat</span>
                       <div className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5 sm:space-y-3 bg-gray-50/50 dark:bg-gray-900/50 scrollbar-thin">
                       {chatMessages.length === 0 && <p className="text-center text-xs text-gray-400 mt-4">No messages yet. Say hi!</p>}
                       {chatMessages.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender === userId ? 'items-end' : 'items-start'}`}>
                             <span className="text-[8px] sm:text-[9px] text-gray-400 mb-0.5 px-1">{msg.sender === userId ? 'You' : msg.sender}</span>
                             <div className={`px-2.5 sm:px-3 py-1.5 text-xs max-w-[85%] break-words ${msg.sender === userId ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-sm shadow-sm'}`}>{msg.text}</div>
                          </div>
                       ))}
                       <div ref={chatEndRef} />
                    </div>
                    <div className="p-1.5 sm:p-2 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                       <div className="flex gap-1.5 sm:gap-2">
                          <input className="flex-1 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="Type a message..." maxLength={140} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleChatSend(chatInput); }} />
                          <button className="p-1.5 sm:p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0" onClick={() => handleChatSend(chatInput)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" /></svg></button>
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
            {showUserPanel && <UserPanel soundEnabled={soundEnabled} onClose={handleUserPanelClose} />}
            {showThemeSelector && (
                <ThemeSelector 
                    soundEnabled={soundEnabled}
                    onClose={() => setShowThemeSelector(false)}
                    activeThemeId={activeThemeId}
                    unlockedThemes={unlockedThemes}
                    onSelectTheme={(themeId) => {
                        setActiveThemeId(themeId);
                    }}
                />
            )}
            
            {/* Footer - positioned below content */}
            <footer className="mt-auto pt-8 pb-4 text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-400 text-center max-w-md px-2 w-full">
              <p>Sudoku Logic Lab v2.1</p>
              <p className="mt-1">
                Lovingly created by Edmund
                (<a href="https://github.com/edmund-alexander" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">GitHub</a> | <a href="https://www.paypal.com/paypalme/edmundalexanders" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Buy me a green tea</a>)
              </p>
              {!isGasEnvironment() && <p className="mt-1">Persistence simulates Google Apps Script using LocalStorage (Dev) / Sheets (Prod).</p>}
            </footer>
          </div>
        );
      };

      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
