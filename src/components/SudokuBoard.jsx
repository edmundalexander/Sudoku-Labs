import React, { memo } from "react";

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

    const texturePatterns = window.TEXTURE_PATTERNS || {};

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

export { SudokuBoard };
