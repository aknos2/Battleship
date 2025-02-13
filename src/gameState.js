import { Gameboard, Player } from "./game.js";

export const player = new Player("Player");
export const computer = new Player("Computer", true);

player.board = new Gameboard(10, "Player Board");
computer.board = new Gameboard(10, "Computer Board");

