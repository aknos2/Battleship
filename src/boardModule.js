import { Ship } from "./game.js";
import { handleAttack } from "./event-handler.js";
import { randomizeBtn } from "./dom-elements.js";

export function renderBoard(containerElement, gameboard, isComputer = false) {
  containerElement.innerHTML = "";

  // Main board container
  const boardGrid = document.createElement("div");
  boardGrid.classList.add("board");

  const columnLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let x = -1; x < gameboard.size; x++) {
    for (let y = -1; y < gameboard.size; y++) {
      const cell = document.createElement("div");

      if (x === -1 && y === -1) {
        cell.classList.add("empty");
      } else if (x === -1) {
        cell.classList.add("label-letters");
        cell.textContent = columnLetters[y];
      } else if (y === -1) {
        cell.classList.add("label-numbers");
        cell.textContent = x;
      } else {
        cell.classList.add("cell");
        cell.dataset.x = x;
        cell.dataset.y = y;

        // Check if a ship is at this position and add a class to the cell
        const shipName = gameboard.board[x][y];
        if (shipName !== null) {
          cell.classList.add("ship"); // Adds a class for ship cells
          if (isComputer) {
            // Hide ships for computer's board, for player visibility
            cell.classList.add("hidden-ship");
          }
        }

        if (isComputer) {
          // Only allow attacks on the computer board
          cell.addEventListener("click", () => {
            randomizeBtn.textContent = "";
            randomizeBtn.textContent = "Restart game";
            handleAttack(gameboard, x, y, cell);
          });
        }
      }

      boardGrid.appendChild(cell);
    }
  }
  containerElement.appendChild(boardGrid);
}

export function getShipModel(boardName) {
  return {
    carrier: [new Ship(`${boardName}-B`, 4)],
    battleship: [
      new Ship(`${boardName}-C1`, 3),
      new Ship(`${boardName}-C2`, 3),
    ],
    destroyer: [
      new Ship(`${boardName}-D1`, 2),
      new Ship(`${boardName}-D2`, 2),
      new Ship(`${boardName}-D3`, 2),
    ],
    "patrol-boat": [
      new Ship(`${boardName}-P1`, 1),
      new Ship(`${boardName}-P2`, 1),
      new Ship(`${boardName}-P3`, 1),
      new Ship(`${boardName}-P4`, 1),
    ],
  };
}

export function randomizePlaceShip(gameboard) {
  // Clear existing ships from the gameboard
  gameboard.shipsContainer = [];
  
  const ships = getShipModel(gameboard.name);
  
  for (const shipType in ships) {
      const shipList = ships[shipType];

      shipList.forEach((ship) => {
          placeShipRandomly(gameboard, ship);
      });
  }
  
  console.log(`${gameboard.name} board now has ${gameboard.shipsContainer.length} ships`);
}

function placeShipRandomly(gameboard, ship) {
  let placed = false;

  while (!placed) {
      const x = Math.floor(Math.random() * gameboard.size);
      const y = Math.floor(Math.random() * gameboard.size);
      const direction = Math.random() > 0.5 ? "horizontal" : "vertical";

      if (gameboard.isValidPlacement(x, y, ship.length, direction)) {
          gameboard.placeShip(x, y, ship, direction);
          placed = true;
          console.log(`Successfully placed ${ship.name} at (${x},${y}) ${direction}`);
      } 
  }
}

export function setupAndRenderBoard(
  containerElement,
  gameboard,
  isComputer = false,
) {
  randomizePlaceShip(gameboard);
  renderBoard(containerElement, gameboard, isComputer);

  // Enable dragging only for player's board
  if (!isComputer) {
    enableShipDragging(gameboard);
  }
}

export function enableShipDragging(gameboard) {
  const playerBoardElement = document.querySelector("#player-board");
  let draggedShip = null;
  let originalPosition = null;
  let dragDirection = null;
  let draggedShipCells = [];

  // Find all ship cells on the player's board
  const shipCells = playerBoardElement.querySelectorAll(".cell.ship");

  shipCells.forEach((cell) => {
    cell.draggable = true;

    cell.addEventListener("dragstart", (e) => {
      // Get the ship name from the board data
      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      const shipName = gameboard.board[x][y];

      // Find the ship object
      draggedShip = gameboard.shipsContainer.find(
        (ship) => ship.name === shipName,
      );

      if (!draggedShip) return;

      // Store original position
      originalPosition = {
        x: draggedShip.x,
        y: draggedShip.y,
        direction: draggedShip.direction,
      };

      dragDirection = draggedShip.direction;

      // Collect all cells of this ship
      draggedShipCells = [];
      for (let i = 0; i < draggedShip.length; i++) {
        const shipX =
          draggedShip.x + (draggedShip.direction === "vertical" ? i : 0);
        const shipY =
          draggedShip.y + (draggedShip.direction === "horizontal" ? i : 0);
        const shipCell = document.querySelector(
          `#player-board [data-x="${shipX}"][data-y="${shipY}"]`,
        );

        if (shipCell) {
          draggedShipCells.push(shipCell);
          // Make the original ship invisible
          shipCell.classList.add("dragging-origin");
        }
      }

      // This avoids the flickering issue
      const img = new Image();
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // Transparent 1x1 pixel
      e.dataTransfer.setDragImage(img, 0, 0);

      // Set data for the drag operation
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          shipName: draggedShip.name,
          length: draggedShip.length,
          direction: draggedShip.direction,
          originX: x,
          originY: y,
        }),
      );

      e.dataTransfer.effectAllowed = "move";
    });

    cell.addEventListener("dragend", () => {
      // Remove dragging classes from all cells
      draggedShipCells.forEach((cell) => {
        cell.classList.remove("dragging-origin");
      });

      // Remove any preview elements
      document.querySelectorAll(".drop-preview").forEach((el) => el.remove());

      // Clear any drop indicators
      document.querySelectorAll(".valid-drop, .invalid-drop").forEach((el) => {
        el.classList.remove("valid-drop", "invalid-drop");
      });

      draggedShip = null;
      draggedShipCells = [];
    });
  });

  // Make all cells potential drop targets
  const allCells = playerBoardElement.querySelectorAll(".cell");

  allCells.forEach((cell) => {
    cell.addEventListener("dragover", (e) => {
      e.preventDefault(); // Allow drop

      if (!draggedShip) return;

      // Clean up previous preview
      document.querySelectorAll(".drop-preview").forEach((el) => el.remove());
      document.querySelectorAll(".valid-drop, .invalid-drop").forEach((el) => {
        el.classList.remove("valid-drop", "invalid-drop");
      });

      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);

      // Temporarily remove the ship from the board for validation
      const originalShipData = removeShipFromBoardTemporarily(
        gameboard,
        draggedShip,
      );

      // Check if this would be a valid placement
      const isValid = gameboard.isValidPlacement(
        x,
        y,
        draggedShip.length,
        dragDirection,
      );

      // Create preview of ship placement
      for (let i = 0; i < draggedShip.length; i++) {
        const previewX = x + (dragDirection === "vertical" ? i : 0);
        const previewY = y + (dragDirection === "horizontal" ? i : 0);

        // Only show preview for valid board positions
        if (
          previewX >= 0 &&
          previewX < gameboard.size &&
          previewY >= 0 &&
          previewY < gameboard.size
        ) {
          const targetCell = document.querySelector(
            `#player-board [data-x="${previewX}"][data-y="${previewY}"]`,
          );

          if (targetCell) {
            targetCell.classList.add(isValid ? "valid-drop" : "invalid-drop");
          }
        }
      }

      // Restore the ship to its original position in the data model
      restoreShipToBoard(gameboard, draggedShip, originalShipData);
    });

    cell.addEventListener("dragleave", () => {
      // Handle this in dragover
    });

    cell.addEventListener("drop", (e) => {
      e.preventDefault();

      // Clean up visual indicators
      document.querySelectorAll(".valid-drop, .invalid-drop").forEach((el) => {
        el.classList.remove("valid-drop", "invalid-drop");
      });

      if (!draggedShip) return;

      const targetX = parseInt(cell.dataset.x);
      const targetY = parseInt(cell.dataset.y);

      // Try to place ship at new position
      // First, remove the ship from its current position
      removeShipFromBoard(gameboard, draggedShip);

      // Now try to place it at the new position
      if (
        gameboard.isValidPlacement(
          targetX,
          targetY,
          draggedShip.length,
          dragDirection,
        )
      ) {
        // Place the ship at new position
        gameboard.placeShip(targetX, targetY, draggedShip, dragDirection);
      } else {
        // If placement fails, put ship back at original position
        gameboard.placeShip(
          originalPosition.x,
          originalPosition.y,
          draggedShip,
          originalPosition.direction,
        );
      }

      // Re-render the board to reflect changes
      renderBoard(playerBoardElement, gameboard);
      enableShipDragging(gameboard); // Re-enable dragging for the new layout
    });
  });

  // Add right-click to rotate ship
  shipCells.forEach((cell) => {
    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault(); // Prevent standard context menu

      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      const shipName = gameboard.board[x][y];

      const shipToRotate = gameboard.shipsContainer.find(
        (ship) => ship.name === shipName,
      );

      if (!shipToRotate) return;

      // Store original position
      const origX = shipToRotate.x;
      const origY = shipToRotate.y;
      const origDir = shipToRotate.direction;

      // Calculate new direction
      const newDirection = origDir === "horizontal" ? "vertical" : "horizontal";

      // Remove ship from board temporarily
      removeShipFromBoard(gameboard, shipToRotate);

      // Try to place in new orientation
      if (
        gameboard.isValidPlacement(
          origX,
          origY,
          shipToRotate.length,
          newDirection,
        )
      ) {
        gameboard.placeShip(origX, origY, shipToRotate, newDirection);
      } else {
        // If rotation is not valid, restore original placement
        gameboard.placeShip(origX, origY, shipToRotate, origDir);
      }

      // Re-render and re-enable dragging
      renderBoard(playerBoardElement, gameboard);
      enableShipDragging(gameboard);
    });
  });
}

// Helper function to remove a ship from the board temporarily for validation
function removeShipFromBoardTemporarily(gameboard, ship) {
  // Store the original ship data
  const originalShipData = {
    cells: [],
  };

  // Clear all cells occupied by the ship
  for (let i = 0; i < ship.length; i++) {
    const x = ship.x + (ship.direction === "vertical" ? i : 0);
    const y = ship.y + (ship.direction === "horizontal" ? i : 0);
    if (x >= 0 && x < gameboard.size && y >= 0 && y < gameboard.size) {
      originalShipData.cells.push({
        x: x,
        y: y,
        value: gameboard.board[x][y],
      });
      gameboard.board[x][y] = null;
    }
  }

  return originalShipData;
}

// Helper function to restore a ship to the board after validation
function restoreShipToBoard(gameboard, ship, originalShipData) {
  // Restore the original ship cells
  originalShipData.cells.forEach((cell) => {
    gameboard.board[cell.x][cell.y] = cell.value;
  });
}

// Helper function to remove a ship from the board
function removeShipFromBoard(gameboard, ship) {
  // Clear all cells occupied by the ship
  for (let i = 0; i < ship.length; i++) {
    const x = ship.x + (ship.direction === "vertical" ? i : 0);
    const y = ship.y + (ship.direction === "horizontal" ? i : 0);
    if (x >= 0 && x < gameboard.size && y >= 0 && y < gameboard.size) {
      gameboard.board[x][y] = null;
    }
  }
}

export function disableShipDragging() {
  const shipCells = document.querySelectorAll("#player-board .cell.ship");

  shipCells.forEach((cell) => {
    // Remove draggable attribute
    cell.draggable = false;

    // Remove event listeners by cloning and replacing elements
    // This is a clean way to remove all event listeners
    const newCell = cell.cloneNode(true);
    cell.parentNode.replaceChild(newCell, cell);

    // Update the style to indicate ships are no longer draggable
    newCell.style.cursor = "default";
  });
}