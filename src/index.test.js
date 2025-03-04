import { Gameboard, Ship, receiveAttack } from "./index.js";

test("analyze ship", () => {
  const gameboard = new Gameboard();
  const battleship = new Ship("A", 4);
  gameboard.placeShip(2, 3, battleship, "horizontal");
  gameboard.receiveAttack(2, 3);
  gameboard.receiveAttack(2, 4);
  gameboard.receiveAttack(2, 5);
  expect(gameboard.receiveAttack(2, 6)).toBe(true);
});
