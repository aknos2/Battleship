import { Gameboard, Player } from "./game.js";
import { computerBoard, playerBoard, randomizeBtn } from "./dom-elements.js";
import { setupAndRenderBoard } from "./boardModule.js";

const player = new Player("Player");
const computer = new Player("Computer", true);
let currentTurn = player;

export function handleAttack(gameboard, x, y, cell) {
    if (currentTurn.isComputer) return;

    const result = computer.board.receiveAttack(x, y);

    if (result === null) return;

    if (result === true) {
        cell.classList.add("hit");
    } else {
        cell.classList.add("miss");
    }
    currentTurn = computer;
    setTimeout(() => computerTurn(player.board), 1000);
}

export function computerTurn(gameboard) {
    if (!currentTurn.isComputer) return;

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

    currentTurn = player; 
}


randomizeBtn.addEventListener("click", () => {
    player.board = new Gameboard();
    computer.board = new Gameboard();
    setupAndRenderBoard(playerBoard, player.board);
    setupAndRenderBoard(computerBoard, computer.board, true);
});


