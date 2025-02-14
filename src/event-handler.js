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
        computer.board.shipsContainer.forEach(ship => {
            console.log(`${ship.name}: ${ship.hits.size} hits out of ${ship.length}. Sunk: ${ship.isSunk}`);
        });
    } else {
        cell.classList.add("miss");
    }

    const sunkShip = shipSank(computer);
    if (sunkShip) {
        markAdjacentCells(sunkShip, gameboard === player.board); 
    }

    if (gameOver(computer)) return true;
    
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
    
    const sunkShip = shipSank(player)
    if (sunkShip) {
            markAdjacentCells(sunkShip, gameboard === computer.board); 
    }

    if (gameOver(player)) return true;

    console.log(player.board.board);
    currentTurn = player;
}

function shipSank(whosBoard) {
    const currentSunkShips = whosBoard.board.shipsContainer.filter(ship => ship.isSunk);
    
    const newlySunkShip = currentSunkShips.find(ship => {
        if (!whosBoard.board.processedSunkShips.has(ship.name)) {
            whosBoard.board.processedSunkShips.add(ship.name);
            return true;
        }
        return false;
    });
    
    return newlySunkShip;
}

export function markAdjacentCells(ship, isComputer) {
    const boardSelector = isComputer ? "#player-board" : "#computer-board";
    const gameboard = isComputer ? player.board : computer.board;
    
    // Get all cells occupied by the ship
    const shipCells = [];
    for (let i = 0; i < ship.length; i++) {
        shipCells.push({
            x: ship.x + (ship.direction === "vertical" ? i : 0),
            y: ship.y + (ship.direction === "horizontal" ? i : 0)
        });
    }

    // Get and mark all unique adjacent cells
    const markedPositions = new Set();
    
    for (const {x: shipX, y: shipY} of shipCells) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [1, 1], [-1, 1], [1, -1]
        ];

        for (const [dx, dy] of directions) {
            const adjX = shipX + dx;
            const adjY = shipY + dy;
            const posKey = `${adjX},${adjY}`;

            if (adjX >= 0 && adjX < 10 && adjY >= 0 && adjY < 10 && 
                !markedPositions.has(posKey)) {
                
                markedPositions.add(posKey);
                const cell = document.querySelector(
                    `${boardSelector} .cell[data-x="${adjX}"][data-y="${adjY}"]`
                );
                
                if (cell && !cell.classList.contains("hit")) {
                    cell.classList.add("marked");
                    if (gameboard.board[adjX][adjY] === null) {
                        gameboard.board[adjX][adjY] = "X";
                    }
                }
            }
        }
    }
    
    console.log(`Marked adjacent cells for ${ship.name} on ${boardSelector}`);
}



export function gameOver(who) { 
    if (who.board.shipsContainer.every(ship => ship.isSunk)) {
        winText.innerHTML = `${who === player ? "Computer Wins!" : "Player Wins!"}`;
        gameOverMessage.classList.remove("hidden");
        isGameOver = true;
        return true;
    } 
    return false;
}

function resetGame() {
    isGameOver = false;
    gameOverMessage.classList.add("hidden");
    winText.innerHTML = "";

    // Reset both gameboards
    player.board.reset();
    computer.board.reset();

    // Clear all visual markers
    document.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("marked", "hit", "miss", "ship");
    });

    // Re-render boards with new ship placements
    setupAndRenderBoard(playerBoard, player.board);
    setupAndRenderBoard(computerBoard, computer.board, true);

    currentTurn = player;
}

randomizeBtn.addEventListener("click", resetGame);


restartBtn.addEventListener("click", resetGame);

