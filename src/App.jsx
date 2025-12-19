import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
  useMemo,
  Component,
} from "react";
import ReactDOM from "react-dom/client";
import {
  KEYS,
  THEMES,
  SOUND_PACKS,
  BADGES,
  BADGE_CATEGORIES,
  BADGE_RARITY,
  EMOJI_CATEGORIES,
  GAME_SETTINGS,
  getThemeAssetSet,
} from "./lib/constants.js";
import {
  validateUsername,
  formatTime,
  formatDate,
  generateGuestId,
  getRow,
  getCol,
  getBox,
  isValidMove,
  getRemainingNumbers,
  getCompletedBoxes,
  generateLocalBoard,
  triggerConfetti,
  sortLeaderboard,
} from "./lib/utils.js";
import { SoundManager } from "./lib/sound.js";
import {
  runApiFn,
  StorageService,
  LeaderboardService,
  ChatService,
  isBackendAvailable,
  isUserAuthenticated,
  UnlockService,
  logError,
  getChatMessages,
  saveScore,
  BadgeService,
  postChatMessage,
  getLeaderboard,
} from "./lib/services.js";
import { Icons } from "./components/Icons.jsx";
import { UserPanel } from "./components/UserPanel.jsx";
import { ProfileViewModal } from "./components/ProfileViewModal.jsx";
import { OpeningScreen } from "./components/OpeningScreen.jsx";
import { ClosingScreen } from "./components/ClosingScreen.jsx";
import { AwardsZone } from "./components/AwardsZone.jsx";
import { SudokuBoard } from "./components/SudokuBoard.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { AdminConsole } from "./components/admin/AdminConsole.jsx";

const App = () => {
  const [currentScreen, setCurrentScreen] = useState("opening"); // opening, game, closing
  const [difficulty, setDifficulty] = useState("Medium");
  const [board, setBoard] = useState(Array(81).fill(null));
  const [initialBoard, setInitialBoard] = useState(Array(81).fill(null));
  const [solution, setSolution] = useState(Array(81).fill(null));
  const [selectedCell, setSelectedCell] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [notes, setNotes] = useState(Array(81).fill([]));
  const [noteMode, setNoteMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(
    StorageService.getPreferences().sound
  );
  const [darkMode, setDarkMode] = useState(
    StorageService.getPreferences().darkMode
  );
  const [loading, setLoading] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showAwards, setShowAwards] = useState(false);
  const [userSession, setUserSession] = useState(StorageService.getUser());
  const [showAuthModal, setShowAuthModal] = useState(null); // 'login' or 'register'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [theme, setTheme] = useState(StorageService.getPreferences().theme);
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState(
    StorageService.getActiveTheme() || "default"
  );
  const [unlockedThemes, setUnlockedThemes] = useState(
    StorageService.getUnlockedThemes() || ["default"]
  );
  const [activePackId, setActivePackId] = useState(
    StorageService.getActiveSoundPack() || "classic"
  );
  const [unlockedPacks, setUnlockedPacks] = useState(
    StorageService.getUnlockedSoundPacks() || ["classic"]
  );

  // Merge notes into board cells for rendering
  const boardWithNotes = useMemo(() => {
    if (!board || board.length === 0 || !Array.isArray(board) || typeof board[0] !== 'object') {
      return board;
    }
    return board.map((cell, index) => ({
      ...cell,
      notes: notes[index] || [],
    }));
  }, [board, notes]);

  // Load sound preferences
  useEffect(() => {
    SoundManager.init(soundEnabled);
  }, [soundEnabled]);

  // Apply dark mode and theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.body.className = `theme-${theme} ${
      darkMode ? "dark" : ""
    } bg-gray-50 dark:bg-gray-900 transition-colors duration-300`;
  }, [darkMode, theme]);

  // Check backend status and load initial data
  useEffect(() => {
    const init = async () => {
      // Refresh user session if token exists
      if (userSession && userSession.token) {
        // Here we would ideally validate the token with the backend
        // For now, we trust the local storage
      }

      // Load leaderboard and chat if available
      try {
        if (await isBackendAvailable()) {
          const lb = await getLeaderboard();
          setLeaderboardData(lb);
          const chat = await getChatMessages();
          setChatMessages(chat);
        }
      } catch (err) {
        console.warn("Backend features unavailable:", err);
      }
    };
    init();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    if (currentScreen === "game" && !isPaused && !isGameWon) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentScreen, isPaused, isGameWon]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentScreen !== "game" || isPaused || isGameWon) return;

      // Admin console shortcut (Ctrl+Alt+A)
      if (e.ctrlKey && e.altKey && (e.key === "a" || e.key === "A")) {
        setShowAdminConsole((prev) => !prev);
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        handleNumberInput(null);
      } else if (
        ["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)
      ) {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveSelection(-9);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveSelection(9);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveSelection(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveSelection(1);
      } else if (e.key === "n" || e.key === "N") {
        toggleNoteMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentScreen, isPaused, isGameWon, selectedCell, noteMode]);

  const moveSelection = (delta) => {
    if (selectedCell === null) {
      setSelectedCell(0);
      return;
    }
    const newIndex = selectedCell + delta;
    if (newIndex >= 0 && newIndex < 81) {
      // Prevent wrapping across rows for left/right movement
      if (Math.abs(delta) === 1) {
        const currentRow = Math.floor(selectedCell / 9);
        const newRow = Math.floor(newIndex / 9);
        if (currentRow !== newRow) return;
      }
      setSelectedCell(newIndex);
    }
  };

  const startGame = async (diff, practice = false) => {
    setLoading(true);
    setPracticeMode(practice);
    try {
      // Generate a new board locally
      // In a real app, this might come from the server or a more sophisticated generator
      // Using a simplified generator for this demo
      const { newBoard, solvedBoard } = generateLocalBoard(diff);

      setBoard(newBoard);
      setInitialBoard([...newBoard]);
      setSolution(solvedBoard);
      setDifficulty(diff);
      setMistakes(0);
      setTimer(0);
      setNotes(Array(81).fill([]));
      setHistory([]);
      setIsGameWon(false);
      setIsPaused(false);
      setCurrentScreen("game");

      // Increment games started stat
      StorageService.incrementGamesStarted();

      StorageService.saveGameState({
        board: newBoard,
        initialBoard: [...newBoard],
        solution: solvedBoard,
        difficulty: diff,
        mistakes: 0,
        timer: 0,
        notes: Array(81).fill([]),
        isGameWon: false,
        practiceMode: practice,
      });
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Failed to generate puzzle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resumeGame = () => {
    const savedState = StorageService.getGameState();
    if (savedState) {
      setBoard(savedState.board);
      setInitialBoard(savedState.initialBoard);
      setSolution(savedState.solution);
      setDifficulty(savedState.difficulty);
      setMistakes(savedState.mistakes);
      setTimer(savedState.timer);
      setNotes(savedState.notes);
      setIsGameWon(savedState.isGameWon);
      setPracticeMode(savedState.practiceMode || false);
      setCurrentScreen("game");
      setIsPaused(false);
    }
  };

  const handleCellClick = (index) => {
    if (isGameWon) return;
    setSelectedCell(index);
    if (soundEnabled) SoundManager.play("select");
  };

  const handleNumberInput = (number) => {
    // Check if cell is fixed (either from initialBoard or board.isFixed)
    const cell = board[selectedCell];
    const isFixed = cell?.isFixed || (initialBoard[selectedCell]?.isFixed);
    
    if (
      selectedCell === null ||
      isGameWon ||
      isFixed
    )
      return;

    if (noteMode) {
      if (number === null) {
        // Clear notes
        const newNotes = [...notes];
        newNotes[selectedCell] = [];
        setNotes(newNotes);
      } else {
        // Toggle note
        const newNotes = [...notes];
        const currentNotes = newNotes[selectedCell] || [];
        if (currentNotes.includes(number)) {
          newNotes[selectedCell] = currentNotes.filter((n) => n !== number);
        } else {
          newNotes[selectedCell] = [...currentNotes, number].sort();
        }
        setNotes(newNotes);
        if (soundEnabled) SoundManager.play("note");
      }
      return;
    }

    // Move logic
    if (number === null) {
      // Clear cell - update the cell's value while preserving other properties
      const cell = board[selectedCell];
      if (cell && cell.value !== null) {
        const newBoard = board.map((c, idx) => {
          if (idx === selectedCell) {
            return { ...c, value: null };
          }
          return c;
        });
        setBoard(newBoard);
        if (soundEnabled) SoundManager.play("erase");
      }
      return;
    }

    // Check correctness - solution contains cell objects, compare with .value or .solution
    const solutionCell = solution[selectedCell];
    const correctValue = solutionCell?.value || solutionCell?.solution;
    const isCorrect = number === correctValue;

    if (!practiceMode && !isCorrect) {
      setMistakes((prev) => prev + 1);
      if (soundEnabled) SoundManager.play("error");
      // Check for game over
      if (mistakes + 1 >= GAME_SETTINGS.maxMistakes) {
        // Game Over logic could go here
        // For now, we just let them continue but maybe invalid move
      }
    } else {
      if (soundEnabled) SoundManager.play("place");
    }

    // Update the cell's value while preserving other properties
    const newBoard = board.map((cell, idx) => {
      if (idx === selectedCell) {
        return { ...cell, value: number };
      }
      return cell;
    });
    setBoard(newBoard);

    // Auto-remove notes in row/col/box
    const newNotes = [...notes];
    const row = getRow(selectedCell);
    const col = getCol(selectedCell);
    const box = getBox(selectedCell);

    // Simple implementation: clear notes in related cells
    // (A more advanced implementation would be specific about which notes to remove)

    setNotes(newNotes);

    // Check for win - compare .value properties of cell objects
    const hasWon = newBoard.every((cell, idx) => {
      const solutionCell = solution[idx];
      const correctValue = solutionCell?.value || solutionCell?.solution;
      return cell.value === correctValue;
    });
    if (hasWon) {
      handleGameWin();
    }

    // Save state
    StorageService.saveGameState({
      board: newBoard,
      initialBoard,
      solution,
      difficulty,
      mistakes: !practiceMode && !isCorrect ? mistakes + 1 : mistakes,
      timer,
      notes: newNotes,
      isGameWon: false,
      practiceMode,
    });
  };

  const handleGameWin = () => {
    setIsGameWon(true);
    triggerConfetti();
    if (soundEnabled) SoundManager.play("win");

    // Update stats
    StorageService.updateStats({
      difficulty,
      time: timer,
      mistakes,
      perfect: mistakes === 0,
    });

    // Clear saved game
    StorageService.clearGameState();

    // Submit score if online
    if (userSession && !practiceMode) {
      saveScore({
        username: userSession.username,
        difficulty,
        time: timer,
        mistakes,
      }).then(() => {
        // Refresh leaderboard
        getLeaderboard().then(setLeaderboardData);
      });
    }

    setTimeout(() => {
      setCurrentScreen("closing");
    }, 2000);
  };

  const toggleNoteMode = () => {
    setNoteMode(!noteMode);
    if (soundEnabled) SoundManager.play("uiTap");
  };

  const handleHint = () => {
    // Find an empty cell (cells where value is null)
    const emptyIndices = board
      .map((cell, idx) => (cell?.value === null ? idx : null))
      .filter((val) => val !== null);
    if (emptyIndices.length === 0) return;

    const randomIdx =
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

    // Get the correct value from solution
    const solutionCell = solution[randomIdx];
    const correctValue = solutionCell?.value || solutionCell?.solution;

    // Update the cell with the hint
    const newBoard = board.map((cell, idx) => {
      if (idx === randomIdx) {
        return { ...cell, value: correctValue, isHinted: true };
      }
      return cell;
    });
    setBoard(newBoard);

    // Add time penalty
    setTimer((prev) => prev + 30);

    if (soundEnabled) SoundManager.play("hint");
  };

  const handleUndo = () => {
    // Basic undo implementation could be added here
    // For now just a placeholder
    if (soundEnabled) SoundManager.play("uiTap");
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    StorageService.savePreferences({ sound: newState, darkMode, theme });
  };

  const toggleDarkMode = () => {
    const newState = !darkMode;
    setDarkMode(newState);
    StorageService.savePreferences({
      sound: soundEnabled,
      darkMode: newState,
      theme,
    });
  };

  const handleAuth = async (type, data) => {
    setLoading(true);
    try {
      // Simulate auth for now or use real backend
      // const res = await runApiFn(...)

      // Mock successful login
      const mockUser = { username: data.username, token: "mock-token" };
      setUserSession(mockUser);
      StorageService.saveUser(mockUser);
      setShowAuthModal(null);
    } catch (err) {
      alert("Authentication failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    StorageService.clearUser();
    setShowUserPanel(false);
  };

  const handleSelectTheme = (themeId) => {
    setActiveThemeId(themeId);
    StorageService.saveActiveTheme(themeId);
    if (soundEnabled) SoundManager.play("select");
  };

  const handleSelectPack = (packId) => {
    setActivePackId(packId);
    StorageService.saveActiveSoundPack(packId);
    if (soundEnabled) SoundManager.play("select");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {currentScreen === "opening" && (
        <OpeningScreen
          onStart={startGame}
          onResume={resumeGame}
          hasSavedGame={!!StorageService.getGameState()}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          loading={loading}
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
          onShowUserPanel={() => setShowUserPanel(true)}
          onShowAwards={() => setShowAwards(true)}
          userSession={userSession}
          onOpenAuth={setShowAuthModal}
        />
      )}

      {currentScreen === "game" && (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="p-2 sm:p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm z-10">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => {
                  setCurrentScreen("opening");
                  setIsPaused(true);
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Icons.ArrowLeft />
              </button>
              <div>
                <h1 className="text-xl font-bold hidden sm:block">Sudoku</h1>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      difficulty === "Easy"
                        ? "bg-green-100 text-green-700"
                        : difficulty === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {difficulty}
                  </span>
                  {practiceMode && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px]">
                      Practice
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <div className="text-lg font-mono font-bold tabular-nums">
                  {formatTime(timer)}
                </div>
                <div className="text-xs text-gray-500">
                  Mistakes:{" "}
                  <span
                    className={mistakes > 0 ? "text-red-500 font-bold" : ""}
                  >
                    {mistakes}
                  </span>
                  /3
                </div>
              </div>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {isPaused ? <Icons.Play /> : <Icons.Pause />}
              </button>
            </div>
          </header>

          {/* Main Game Area */}
          <main className="flex-1 overflow-hidden relative flex flex-col md:flex-row items-center justify-center gap-4 p-2 sm:p-4">
            <div className="w-full max-w-md md:max-w-lg aspect-square flex-shrink-0">
              <SudokuBoard
                board={boardWithNotes}
                selectedId={selectedCell}
                onCellClick={handleCellClick}
                completedBoxes={getCompletedBoxes(board)}
              />
            </div>

            {/* Controls */}
            <div className="w-full max-w-md flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={handleUndo}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icons.Undo />
                  <span className="text-[10px] uppercase font-bold mt-1">
                    Undo
                  </span>
                </button>
                <button
                  onClick={() => {
                    const cell = board[selectedCell];
                    if (
                      selectedCell !== null &&
                      cell &&
                      !cell.isFixed
                    ) {
                      const newBoard = board.map((c, idx) => {
                        if (idx === selectedCell) {
                          return { ...c, value: null };
                        }
                        return c;
                      });
                      setBoard(newBoard);
                      // Also clear notes
                      const newNotes = [...notes];
                      newNotes[selectedCell] = [];
                      setNotes(newNotes);
                    }
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icons.Erase />
                  <span className="text-[10px] uppercase font-bold mt-1">
                    Erase
                  </span>
                </button>
                <button
                  onClick={toggleNoteMode}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                    noteMode
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icons.Note />
                  <span className="text-[10px] uppercase font-bold mt-1">
                    Notes
                  </span>
                </button>
                <button
                  onClick={handleHint}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icons.Hint />
                  <span className="text-[10px] uppercase font-bold mt-1">
                    Hint
                  </span>
                </button>
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-9 gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    className="aspect-[4/5] rounded-lg bg-white dark:bg-gray-800 border-b-4 border-gray-200 dark:border-gray-700 active:border-b-0 active:translate-y-[4px] transition-all text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </main>
        </div>
      )}

      {currentScreen === "closing" && (
        <ClosingScreen
          timer={timer}
          mistakes={mistakes}
          difficulty={difficulty}
          onHome={() => setCurrentScreen("opening")}
          onNewGame={() => startGame(difficulty, practiceMode)}
          isNewBest={false} // logic to check best score needed
        />
      )}

      {showUserPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowUserPanel(false)}
          ></div>
          <div className="relative w-full max-w-sm h-full bg-white dark:bg-gray-900 shadow-2xl animate-slide-in-right overflow-y-auto">
            <UserPanel
              user={userSession}
              onClose={() => setShowUserPanel(false)}
              onLogout={handleLogout}
              stats={StorageService.getGameStats()}
              history={[]} // Load history
            />
          </div>
        </div>
      )}

      {showAwards && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setShowAwards(false)}
          ></div>
          <div className="relative w-full max-w-4xl h-[80vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <AwardsZone
              onClose={() => setShowAwards(false)}
              soundEnabled={soundEnabled}
              activeThemeId={activeThemeId}
              unlockedThemes={unlockedThemes}
              onSelectTheme={handleSelectTheme}
              activePackId={activePackId}
              unlockedPacks={unlockedPacks}
              onSelectPack={handleSelectPack}
            />
          </div>
        </div>
      )}

      {showAdminConsole && (
        <div className="fixed inset-0 z-[100] bg-black/90 text-green-400 font-mono p-4 overflow-auto">
          <button
            onClick={() => setShowAdminConsole(false)}
            className="absolute top-4 right-4 text-white"
          >
            Close
          </button>
          <AdminConsole />
        </div>
      )}
    </div>
  );
};

export default App;
