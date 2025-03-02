import { Gameboard, Player } from "./game.js";

// Create the board outside the Player object
const playerBoard = new Gameboard(10, "Player");
const computerBoard = new Gameboard(10, "Computer");

// Then, create Player objects and pass the pre-existing boards
export const player = new Player("Player", false, playerBoard);
export const computer = new Player("Computer", true, computerBoard);
