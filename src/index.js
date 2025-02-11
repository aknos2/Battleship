import { setupAndRenderBoard, randomizePlaceShip } from "./boardModule.js";
import { Gameboard, Player } from "./game.js";
import { playerBoard, computerBoard, randomizeBtn} from "./dom-elements.js"
import {  renderBoard} from "./boardModule.js";
import "./styles.css";

const player = new Player("Player");
const computer = new Player("Computer", true);

// Assign the same gameboard instances to ensure consistency
player.board = new Gameboard();
computer.board = new Gameboard();

setupAndRenderBoard(playerBoard, player.board);
setupAndRenderBoard(computerBoard, computer.board, true);
