import { setupAndRenderBoard } from "./boardModule.js";
import { playerBoard, computerBoard } from "./dom-elements.js";
import { player, computer } from "./gameState.js";
import "./styles.css";

setupAndRenderBoard(playerBoard, player.board, false);
setupAndRenderBoard(computerBoard, computer.board, true);
