import { computerBoard, gameOverMessage, playerBoard, randomizeBtn, restartBtn, winText } from "./dom-elements.js";
import { setupAndRenderBoard} from "./boardModule.js";
import { player, computer} from "./gameState.js";

let currentTurn = player;
let isGameOver = false;

export function handleAttack(gameboard, x, y, cell) {
    if (currentTurn.isComputer || isGameOver) return;

    const result = computer.board.receiveAttack(x, y);

    if (result === null) return;

    if (result === true) {
        cell.classList.add("hit");
    } else {
        cell.classList.add("miss");
    }

    const sunkShip = allShipsSank(computer);
    if (sunkShip) {
            markAdjacentCells(sunkShip, gameboard === player.board); 
    }

    if (gameOver(computer)) return;
    
    console.log(computer.board.board);
    currentTurn = computer;
    setTimeout(() => computerTurn(player.board), 1000);
}


export function computerTurn(gameboard) {
    if (!currentTurn.isComputer || isGameOver) return;

    let x, y, validMove = false;

    while (!validMove) {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);

        if (gameboard.board[x][y] !== "X" && gameboard.board[x][y] !== "O") {
            validMove = true;
        }
    }

    const result = player.board.receiveAttack(x, y);

    if (result !== null) {
        const cell = document.querySelector(`#player-board [data-x="${x}"][data-y="${y}"]`);

        if (result === true) {
            cell.classList.add("hit");
        } else {
            cell.classList.add("miss");
        }
    }
    
    const sunkShip = allShipsSank(computer)
    if (allShipsSank(computer)) {
            markAdjacentCells(sunkShip, gameboard === computer.board); 
    }

    if (gameOver(player)) return;

    console.log(player.board.board);
    currentTurn = player;
}

function allShipsSank(whosBoard) {
    return whosBoard.board.shipsContainer.find(ship => ship.isSunk);
}

export function markAdjacentCells(ship, isComputer) {
    const boardSelector = isComputer ? "#player-board" : "#computer-board"; // Select correct board
    const gameboard = isComputer ? player.board : computer.board;

    const directions = [
        [-1, 0], [1, 0], // Top and Bottom
        [0, -1], [0, 1], // Left and Right
        [-1, -1], [1, 1], // Top-left and Bottom-right diagonals
        [-1, 1], [1, -1]  // Top-right and Bottom-left diagonals
    ];

    for (let i = 0; i < ship.length; i++) {
        const shipX = ship.x + (ship.direction === "horizontal" ? 0 : i);
        const shipY = ship.y + (ship.direction === "horizontal" ? i : 0);

        for (let [dx, dy] of directions) {
            const adjX = shipX + dx;
            const adjY = shipY + dy;

            if (adjX >= 0 && adjX < 10 && adjY >= 0 && adjY < 10) {
                const cell = document.querySelector(`${boardSelector} .cell[data-x="${adjX}"][data-y="${adjY}"]`);
                
                if (
                    cell && 
                    !cell.classList.contains("marked") && 
                    !cell.classList.contains("ship")
                ) {
                    cell.classList.add("marked"); 

                    if (gameboard.board[adjX][adjY] === null) {
                        gameboard.board[adjX][adjY] = "X"; 
                    }
                    
                    console.log(`Marking adjacent cells for ${ship.name} on: ${boardSelector}`);
                } 
            }
        }
    }
}



export function gameOver(who) { 
    if (who.board.shipsContainer.every(ship => ship.isSunk)) {
        winText.innerHTML = `${who === player ? "Computer Wins!" : "Player Wins!"}`;
        gameOverMessage.classList.remove("hidden");
        isGameOver = true;
        return;
    }
}

function resetGame() {
    isGameOver = false;
    gameOverMessage.classList.add("hidden");

    // Reset hit count and sunk status for all ships
    player.board.shipsContainer.forEach(ship => {
        ship.hitCount = 0;
        ship.sunk = false;
    });

    computer.board.shipsContainer.forEach(ship => {
        ship.hitCount = 0;
        ship.sunk = false;
    });

    // Reset board state (clear hit/miss markers)
    player.board.board = Array.from({ length: 10 }, () => Array(10).fill(null));
    computer.board.board = Array.from({ length: 10 }, () => Array(10).fill(null));
    document.querySelectorAll(".cell.marked").forEach(cell => cell.classList.remove("marked"));


    // Re-render boards without placing new ships
    setupAndRenderBoard(playerBoard, player.board);
    setupAndRenderBoard(computerBoard, computer.board, true);

    currentTurn = player; // Ensure player starts first
}


randomizeBtn.addEventListener("click", resetGame);


restartBtn.addEventListener("click", resetGame);

