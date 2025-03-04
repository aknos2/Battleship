import {
  computerBoard,
  gameOverMessage,
  playerBoard,
  randomizeBtn,
  restartBtn,
  winText,
} from "./dom-elements.js";
import { setupAndRenderBoard, disableShipDragging } from "./boardModule.js";
import { player, computer } from "./gameState.js";

let currentTurn = player;
let isGameOver = false;
let gameStarted = false;

export function handleAttack(gameboard, x, y, cell) {
  if (!gameStarted) {
    gameStarted = true;
    // Disable ship dragging now that game has started
    disableShipDragging();
  }

  if (currentTurn.isComputer || isGameOver) return;

  const result = computer.board.receiveAttack(x, y);

  if (result === null) return;

  if (result === true) {
    cell.classList.add("hit");

    // Check if a ship was sunk
    const sunkShip = shipSank(computer);
    if (sunkShip) {
      console.log(`Ship ${sunkShip.name} has been sunk!`);
      markAdjacentCells(sunkShip, false);
    }

    // Check if the game is over
    if (gameOver(computer)) return true;

    // Player hit a ship - they get another turn (do not change currentTurn)
    return;
  } else {
    cell.classList.add("miss");

    // Player missed - end their turn
    currentTurn = computer;
    highlightPageSide();
    highlightBoard();
    setTimeout(() => computerTurn(player.board), 1500);
  }

  console.log(computer.board.board);
}

export function computerTurn(gameboard) {
  if (!currentTurn.isComputer || isGameOver) return;

  let x,
    y,
    validMove = false;

  // Create a 2D array to represent hits on the player's board
  const hitPositions = [];

  // Find all hit positions that might have adjacent unhit ship sections
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (gameboard.board[i][j] === "O") {
        // "O" is the hit marker
        hitPositions.push([i, j]);
      }
    }
  }

  // If there are hit positions, try to target adjacent cells
  if (hitPositions.length > 0) {
    // Choose a random hit position to follow up on
    const [lastX, lastY] =
      hitPositions[Math.floor(Math.random() * hitPositions.length)];

    // Try adjacent positions
    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    // Shuffle directions for more realistic gameplay
    directions.sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const newX = lastX + dx;
      const newY = lastY + dy;

      if (
        newX >= 0 &&
        newX < 10 &&
        newY >= 0 &&
        newY < 10 &&
        gameboard.board[newX][newY] !== "X" &&
        gameboard.board[newX][newY] !== "O"
      ) {
        x = newX;
        y = newY;
        validMove = true;
        break;
      }
    }
  }

  // If no valid moves found around hits, choose random position
  if (!validMove) {
    while (!validMove) {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);

      if (gameboard.board[x][y] !== "X" && gameboard.board[x][y] !== "O") {
        validMove = true;
      }
    }
  }

  const result = player.board.receiveAttack(x, y);

  if (result !== null) {
    const cell = document.querySelector(
      `#player-board [data-x="${x}"][data-y="${y}"]`,
    );

    if (result === true) {
      cell.classList.add("hit");

      // Check if this hit sunk a ship
      const sunkShip = shipSank(player);
      if (sunkShip) {
        console.log(`Ship ${sunkShip.name} has been sunk!`);
        markAdjacentCells(sunkShip, true);

        if (gameOver(player)) return;

        setTimeout(() => computerTurn(gameboard), 1200);
      } else {
        console.log("Ship was hit but not sunk. Computer attacks again.");
        setTimeout(() => computerTurn(gameboard), 1200);
      }
    } else {
      console.log("Miss. Player's turn.");
      cell.classList.add("miss");
      currentTurn = player;
      highlightPageSide();
      highlightBoard();
    }
  }
}

function shipSank(whosBoard) {
  const currentSunkShips = whosBoard.board.shipsContainer.filter(
    (ship) => ship.isSunk,
  );

  const newlySunkShip = currentSunkShips.find((ship) => {
    if (!whosBoard.board.processedSunkShips.has(ship.name)) {
      whosBoard.board.processedSunkShips.add(ship.name);
      console.log(
        `${ship.name}: hits=${ship.hitCount}, length=${ship.length}, isSunk=${ship.isSunk}`,
      );
      return true;
    }
    return false;
  });

  return newlySunkShip;
}

export function markAdjacentCells(ship, isPlayerBoard) {
  // This parameter indicates which board we're working with
  // isPlayerBoard = true means we're marking on player's board
  // isPlayerBoard = false means we're marking on computer's board

  const boardSelector = isPlayerBoard ? "#player-board" : "#computer-board";
  const gameboard = isPlayerBoard ? player.board : computer.board;

  // Check if the ship has position information
  if (
    ship.x === undefined ||
    ship.y === undefined ||
    ship.direction === undefined
  ) {
    console.error(
      `Cannot mark adjacent cells: Ship ${ship.name} lacks position data`,
    );
    return;
  }

  // Get all cells occupied by the ship
  const shipCells = [];
  for (let i = 0; i < ship.length; i++) {
    const cellX = ship.x + (ship.direction === "vertical" ? i : 0);
    const cellY = ship.y + (ship.direction === "horizontal" ? i : 0);

    // Verify coordinates are valid
    if (
      cellX >= 0 &&
      cellX < gameboard.size &&
      cellY >= 0 &&
      cellY < gameboard.size
    ) {
      shipCells.push({
        x: cellX,
        y: cellY,
      });
    }
  }

  // Get and mark all unique adjacent cells
  const markedPositions = new Set();

  for (const { x: shipX, y: shipY } of shipCells) {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
    ];

    for (const [dx, dy] of directions) {
      const adjX = shipX + dx;
      const adjY = shipY + dy;

      // Only process valid board positions
      if (
        adjX >= 0 &&
        adjX < gameboard.size &&
        adjY >= 0 &&
        adjY < gameboard.size
      ) {
        const posKey = `${adjX},${adjY}`;

        // Skip if we've already marked this position in this function call
        if (markedPositions.has(posKey)) continue;

        markedPositions.add(posKey);

        // Skip if this position contains a ship or has already been attacked
        if (
          gameboard.board[adjX][adjY] === "X" ||
          gameboard.board[adjX][adjY] === "O"
        ) {
          continue;
        }

        // Skip ship positions - only mark empty spaces
        if (gameboard.board[adjX][adjY] !== null) {
          continue;
        }

        const cell = document.querySelector(
          `${boardSelector} .cell[data-x="${adjX}"][data-y="${adjY}"]`,
        );

        // Only mark cells that aren't already hit or marked
        if (
          cell &&
          !cell.classList.contains("hit") &&
          !cell.classList.contains("marked")
        ) {
          cell.classList.add("marked");
          gameboard.board[adjX][adjY] = "X"; // Mark on the data model too
        }
      }
    }
  }

  console.log(`Finished marking adjacent cells for ${ship.name}`);
}

export function gameOver(who) {
  if (who.board.shipsContainer.every((ship) => ship.isSunk)) {
    winText.innerHTML = `${who === player ? "Computer Wins!" : "Player Wins!"}`;
    gameOverMessage.classList.remove("hidden");
    isGameOver = true;
    return true;
  }
  return false;
}

function resetGame() {
  isGameOver = false;
  gameStarted = false;
  gameOverMessage.classList.add("hidden");
  winText.innerHTML = "";
  document.body.classList.remove(
    "highlight-upper-side",
    "highlight-bottom-side",
  );

  // Reset both gameboards
  player.board.reset();
  computer.board.reset();

  // Clear all visual board elements
  playerBoard.innerHTML = "";
  computerBoard.innerHTML = "";

  // Re-render boards with new ship placements
  setupAndRenderBoard(playerBoard, player.board);
  setupAndRenderBoard(computerBoard, computer.board, true);

  // Reset the current turn to player
  currentTurn = player;

  // Highlight the correct board
  highlightBoard();
  highlightPageSide();
}

function highlightBoard() {
  // Remove the highlight class from both boards first
  playerBoard.classList.remove("highlight-board");
  computerBoard.classList.remove("highlight-board");

  if (currentTurn === computer) {
    playerBoard.classList.add("highlight-board"); // ✅ Apply to correct DOM element
  } else {
    computerBoard.classList.add("highlight-board"); // ✅ Apply to correct DOM element
  }
}

function highlightPageSide() {
  document.body.classList.remove(
    "highlight-upper-side",
    "highlight-bottom-side",
  );

  if (currentTurn === computer) {
    document.body.classList.add("highlight-upper-side");
  } else {
    document.body.classList.add("highlight-bottom-side");
  }
}

randomizeBtn.addEventListener("click", () => {
  randomizeBtn.textContent = "";
  randomizeBtn.textContent = "Randomize";
  resetGame();
});
restartBtn.addEventListener("click", () => {
  randomizeBtn.textContent = "";
  randomizeBtn.textContent = "Randomize";
  resetGame();
});
