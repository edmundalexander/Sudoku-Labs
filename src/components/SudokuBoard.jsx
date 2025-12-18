const { memo } = React;

const Cell = memo(
  ({ data, isSelected, onClick, isCompletedBox, isConflicting = false }) => {
    const { row, col, value, isFixed, isError, notes, isHinted } = data;
    const isRightBorder = (col + 1) % 3 === 0 && col !== 8;
    const isBottomBorder = (row + 1) % 3 === 0 && row !== 8;
    let baseClasses =
      "relative flex items-center justify-center text-base sm:text-lg md:text-xl font-medium cursor-pointer transition-all duration-200 select-none h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-12 lg:w-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10";
    if (isRightBorder)
      baseClasses += " border-r-2 border-gray-400 dark:border-gray-500";
    else baseClasses += " border-r border-gray-200 dark:border-gray-700";
    if (isBottomBorder)
      baseClasses += " border-b-2 border-gray-400 dark:border-gray-500";
    else baseClasses += " border-b border-gray-200 dark:border-gray-700";
    let bgClass = "bg-white dark:bg-gray-800";
    if (isSelected) bgClass = "bg-blue-200 dark:bg-blue-900";
    else if (isError) bgClass = "bg-red-100 dark:bg-red-900 animate-shake";
    else if (isHinted) bgClass = "bg-yellow-100 dark:bg-yellow-900";
    else if (isConflicting)
      bgClass =
        "bg-orange-100 dark:bg-orange-900/50 ring-1 ring-orange-300 dark:ring-orange-700";
    else if (isFixed)
      bgClass =
        "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold";
    else bgClass = "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400";
    if (isCompletedBox && !isSelected && !isError) {
      bgClass +=
        " transition-colors duration-1000 bg-amber-50 dark:bg-amber-900/30";
    }

    // Accessibility labels
    const cellLabel = `Row ${row + 1}, Column ${col + 1}${
      value ? `, Value ${value}` : ", Empty"
    }${isFixed ? ", Fixed" : ""}`;

    const renderContent = () => {
      if (value !== null)
        return <span className={!isFixed ? "animate-pop" : ""}>{value}</span>;
      if (notes.length > 0) {
        return (
          <div
            className="grid grid-cols-3 gap-0 w-full h-full p-0.5"
            aria-label={`Notes: ${notes.join(", ")}`}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <div
                key={n}
                className="flex items-center justify-center text-[0.4rem] sm:text-[0.5rem] md:text-xs leading-none text-gray-500 dark:text-gray-400"
              >
                {notes.includes(n) ? n : ""}
              </div>
            ))}
          </div>
        );
      }
      return null;
    };
    return (
      <button
        className={`${baseClasses} ${bgClass}`}
        onClick={onClick}
        role="gridcell"
        aria-label={cellLabel}
        aria-selected={isSelected}
        aria-readonly={isFixed ? "true" : "false"}
        tabIndex={isSelected ? 0 : -1}
      >
        {renderContent()}
        {isCompletedBox && !isError && (
          <div className="sparkle top-1/2 left-1/2" />
        )}
      </button>
    );
  }
);

const SudokuBoard = ({
  board,
  selectedId,
  onCellClick,
  completedBoxes,
  boardTexture,
  conflictingCells = new Set(),
}) => {
  // Generate texture background style
  const getTextureStyle = () => {
    if (!boardTexture || boardTexture.pattern === "none") return {};

    const texturePatterns = {
      paper: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
      wood: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='20' viewBox='0 0 100 20'%3E%3Cpath d='M0,10 Q25,8 50,10 T100,10' stroke='%23654321' stroke-width='0.5' fill='none' opacity='0.4'/%3E%3C/svg%3E")`,
      pixel: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000' opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000' opacity='0.03'/%3E%3C/svg%3E")`,
      stone: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Cpath d='M0,0 L15,2 L30,0 L28,15 L30,30 L15,28 L0,30 L2,15 Z' fill='none' stroke='%23888' stroke-width='0.3' opacity='0.3'/%3E%3C/svg%3E")`,
      ice: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20,0 L20,40 M0,20 L40,20 M5,5 L35,35 M35,5 L5,35' stroke='%2399ccff' stroke-width='0.3' opacity='0.3'/%3E%3C/svg%3E")`,
      nebula: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='15' cy='20' r='1' fill='white' opacity='0.5'/%3E%3Ccircle cx='45' cy='15' r='0.5' fill='white' opacity='0.4'/%3E%3Ccircle cx='30' cy='50' r='0.8' fill='white' opacity='0.5'/%3E%3C/svg%3E")`,
      carnival: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='5' cy='5' r='1' fill='%23ff6b6b' opacity='0.15'/%3E%3Ccircle cx='15' cy='15' r='1' fill='%234ecdc4' opacity='0.15'/%3E%3C/svg%3E")`,
      concrete: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Crect width='10' height='10' fill='%23888' opacity='0.02'/%3E%3C/svg%3E")`,
    };

    return {
      backgroundImage: texturePatterns[boardTexture.pattern] || "none",
      backgroundRepeat: "repeat",
    };
  };

  return (
    <div className="border-4 border-gray-800 dark:border-gray-400 rounded-sm overflow-hidden shadow-xl inline-block relative">
      {/* Board texture overlay */}
      {boardTexture && boardTexture.pattern !== "none" && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            ...getTextureStyle(),
            opacity: boardTexture.opacity || 0.15,
          }}
        />
      )}
      <div
        className="grid grid-cols-9 relative z-0"
        role="grid"
        aria-label="Sudoku puzzle grid"
      >
        {board.map((cell) => {
          const boxIdx =
            Math.floor(cell.row / 3) * 3 + Math.floor(cell.col / 3);
          const isCompleted = completedBoxes.includes(boxIdx);
          const isConflicting = conflictingCells.has(cell.id);
          return (
            <Cell
              key={cell.id}
              data={cell}
              isSelected={selectedId === cell.id}
              onClick={() => onCellClick(cell.id)}
              isCompletedBox={isCompleted}
              isConflicting={isConflicting}
            />
          );
        })}
      </div>
    </div>
  );
};

window.SudokuBoard = SudokuBoard;
