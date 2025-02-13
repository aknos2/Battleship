import { Ship } from "./game.js";
import { handleAttack } from "./event-handler.js";

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
               
                if (isComputer) { // Only allow attacks on the computer board
                    cell.addEventListener("click", () => handleAttack(gameboard, x, y, cell));
                }
            }

            boardGrid.appendChild(cell);
        }
    }
    containerElement.appendChild(boardGrid);
}

const shipModel = {
    carrier: [new Ship("B", 4)],
    battleship: [new Ship("C1", 3), new Ship("C2", 3)],
    destroyer: [new Ship("D1", 2), new Ship("D2", 2), new Ship("D3", 2)],
    "patrol-boat": [new Ship("P1", 1), new Ship("P2", 1), new Ship("P3", 1), new Ship("P4", 1)]
}

export function randomizePlaceShip(gameboard) {
    for (const shipType in shipModel) {
        const ships = shipModel[shipType];

        ships.forEach((ship) => {
            let placed = false;

            while (!placed) {
                const x = Math.floor(Math.random() * gameboard.size);
                const y = Math.floor(Math.random() * gameboard.size);
                const direction = Math.random() > 0.5 ? "horizontal" : "vertical";
    
                if (gameboard.isValidPlacement(x, y, ship.length, direction)) {
                    gameboard.placeShip(x, y, ship, direction);
                    placed = true;
                } 
            }
        })
    }
}

export function setupAndRenderBoard(containerElement, gameboard, isComputer = false) {
    randomizePlaceShip(gameboard); 
    renderBoard(containerElement, gameboard, isComputer); 
}
