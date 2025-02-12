class BattleGame extends Phaser.Scene {
    constructor() {
        super({ key: "BattleGame" });
        this.gridSize = 10;
        this.tileSize = 50;
        this.attacks = [];
        this.isMyTurn = false;
    }

    preload() {
        this.load.image("water", "assets/agua.jpg");
    }

    create() {
        this.socket = io();
        this.createGrid();

        this.socket.on("gameStart", (turn) => {
            this.isMyTurn = turn;
            this.updateTurnIndicator();
        });

        this.socket.on("yourTurn", () => {
            this.isMyTurn = true;
            this.updateTurnIndicator();
        });

        this.socket.on("opponentTurn", () => {
            this.isMyTurn = false;
            this.updateTurnIndicator();
        });

        this.socket.on("shotFired", ({ row, col }) => {
            this.markHit(row, col);
        });
    }

    createGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                let x = col * this.tileSize;
                let y = row * this.tileSize;
                let tile = this.add
                    .image(x, y, "water")
                    .setOrigin(0, 0)
                    .setInteractive();

                tile.on("pointerdown", () => {
                    if (this.isMyTurn && !this.attacks.includes(`${row}-${col}`)) {
                        console.log(`Disparo en fila ${row}, columna ${col}`);
                        this.attacks.push(`${row}-${col}`);
                        this.socket.emit("shoot", {
                            row,
                            col,
                            room: document.getElementById("room").value,
                        });
                        this.isMyTurn = false;
                        this.updateTurnIndicator();
                    }
                });
            }
        }
    }

    markHit(row, col) {
        let x = col * this.tileSize;
        let y = row * this.tileSize;
        this.add.rectangle(x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize, this.tileSize, 0xff0000, 0.5);
    }

    updateTurnIndicator() {
        document.getElementById("turnIndicator").innerText = this.isMyTurn ? "🔥 Es tu turno!" : "⏳ Turno del oponente...";
    }
}

const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    scene: BattleGame,
};

const game = new Phaser.Game(config);
