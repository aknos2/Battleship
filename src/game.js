
export class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
        this.hitCount = 0;
    }

    hit() {
        if (this.hitCount < this.length) {
            this.hitCount += 1;
        }
    }

    get isSunk() {
        return this.hitCount >= this.length;
    }
}

export class Gameboard {
    constructor(size = 10, name) {
        console.log(`Gameboard created: ${name}`);
        this.size = size;
        this.board = Array.from({ length: size }, () => Array(size).fill(null)); // Creates 10x10 grid
        this.shipsContainer = [];
        this.missedShots = [];
        this.name = name;
    }

    isValidPlacement(x, y, length, direction) {
        // Check if the ship fits within the board's bounds
        if (x < 0 || y < 0 || x >= this.size || y >= this.size) return false;
        if (direction === "horizontal" && (y + length > this.size)) return false;
        if (direction === "vertical" && (x + length > this.size)) return false;
    
        // Determine the range of cells occupied by the ship
        let occupiedCells = [];
        if (direction === "horizontal") {
            for (let i = 0; i < length; i++) {
                occupiedCells.push([x, y + i]);
            }
        } else if (direction === "vertical") {
            for (let i = 0; i < length; i++) {
                occupiedCells.push([x + i, y]);
            }
        }
    
        // Check if the cells occupied by the ship are free
        for (let [cellX, cellY] of occupiedCells) {
            if (this.board[cellX][cellY] !== null) return false;
        }
    
        // Check the cells adjacent to the ship's occupied cells
        for (let [cellX, cellY] of occupiedCells) {
            if (!this.checkAdjacent(cellX, cellY)) return false;
        }
    
        return true; 
    }

    checkAdjacent(cellX, cellY) {
        const directions = [
            [-1, 0], [1, 0], // Top and Bottom
            [0, -1], [0, 1], // Left and Right
            [-1, -1], [1, 1], // Top-left and Bottom-right diagonals
            [-1, 1], [1, -1]  // Top-right and Bottom-left diagonals
        ];

        for (let [dx, dy] of directions) {
            const adjX = cellX + dx;
            const adjY = cellY + dy;
            // Only check adjacent cells within the bounds of the board
            if (adjX >= 0 && adjX < this.size && adjY >= 0 && adjY < this.size) {
                if (this.board[adjX][adjY] !== null) return false; 
            }
        }
        return true;
    }

    placeShip(x, y, ship, direction) {
        if (!ship || typeof ship.length !== "number") {  // Prevents undefined errors
            console.error("Invalid ship object", ship ? ship.length : "undefined");
            return false;
        }

        if (!this.isValidPlacement(x, y, ship.length, direction)) {
            console.error("Placement not valid");
            return false;
        }

        ship.x = x;
        ship.y = y;
        ship.direction = direction;

        for (let i = 0; i < ship.length; i++) {
            if (direction === "horizontal") {
                this.board[x][y + i] = ship.name;
            } else if (direction === "vertical") {
                this.board[x + i][y] = ship.name;
            }
        }

        this.shipsContainer.push(ship);

        return true;
    }

    receiveAttack(x, y) {
        console.log(`Attacking (${x}, ${y}), Current value: ${this.board[x][y]}`);

        const target = this.board[x][y];
        const HIT_MARKER = "O";
        const MISS_MARKER = "X";

        if (target === HIT_MARKER || target === MISS_MARKER) {
            console.log("This position has already been attacked.");
            return null;
        }

        if (target === null) {
            console.log("Missed");
            this.missedShots.push([x, y]);
            this.board[x][y] = MISS_MARKER;
            return false;
        }

        // If the cell contains a ship, find it in shipsContainer
        const hitShip = this.shipsContainer.find((ship) => ship.name === target);

        if (hitShip) {
            hitShip.hit();
            this.board[x][y] = HIT_MARKER;
            console.log(`Hit ${hitShip.name}!`);
            
            if (hitShip.isSunk) {
                console.log(`${hitShip.name} has been sunk! Marking adjacent cells.`);
                console.log(`Ship coordinates: (${hitShip.x}, ${hitShip.y}), Direction: ${hitShip.direction}`);
            }
            
            return true;
        }
    }
}

export class Player {
    constructor(name, isComputer = false) {
        this.name = name;
        this.isComputer = isComputer;
        this.board = new Gameboard();
    }
}
