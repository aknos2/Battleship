import { setupAndRenderBoard, randomizePlaceShip } from "./boardModule.js";
import { Gameboard, Player } from "./game.js";
import { playerBoard, computerBoard, randomizeBtn} from "./dom-elements.js"
import { player, computer } from "./gameState.js";
import "./styles.css";


setupAndRenderBoard(playerBoard, player.board);
setupAndRenderBoard(computerBoard, computer.board, true);
