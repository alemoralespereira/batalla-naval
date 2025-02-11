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
        // 🔹 Conectarse al servidor
        this.socket = io("wss://bismarck.atlassoftware.uy");

        this.createGrid();

        // 🔹 Recibir asignación de jugador
        this.socket.on("player", (data) => {
            console.log(`Jugador asignado: ${data.id}`);
            this.playerIndex = data.index;
        });

        // 🔹 Manejar el inicio del juego
        this.socket.on("gameStart", (players) => {
            console.log("🎮 El juego ha comenzado. Jugadores:", players);

            if (players.length === 2) {
                this.isMyTurn = this.playerIndex === 0; // Solo el jugador 0 comienza
                this.updateTurnMessage();
            }
        });

        // 🔹 Cambiar el turno
        this.socket.on("yourTurn", () => {
            console.log("✅ Es tu turno.");
            this.isMyTurn = true;
            this.updateTurnMessage();
        });

        // 🔹 Manejar disparos acertados
        this.socket.on("shotFired", ({ row, col }) => {
            this.markHit(row, col);
        });
    }

    createGrid() {
        this.tiles = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                let x = col * this.tileSize;
                let y = row * this.tileSize;
                let tile = this.add
                    .image(x, y, "water")
                    .setOrigin(0, 0)
                    .setInteractive();

                this.tiles[row][col] = tile;

                tile.on("pointerdown", () => {
                    if (this.isMyTurn && !this.attacks.includes(`${row}-${col}`)) {
                        console.log(`🎯 Disparo en fila ${row}, columna ${col}`);
                        this.attacks.push(`${row}-${col}`);

                        // 🔹 Enviar disparo al servidor
                        this.socket.emit("shoot", { row, col });

                        // 🔹 Desactivar clics en la celda disparada
                        tile.removeInteractive();
                        tile.setTint(0xff0000); // Marcar como disparo
                        this.isMyTurn = false;
                        this.updateTurnMessage();
                    }
                });
            }
        }
    }

    markHit(row, col) {
        let tile = this.tiles[row][col];
        if (tile) {
            tile.setTint(0xff0000);
        }
    }

    updateTurnMessage() {
        let turnText = this.isMyTurn ? "🔥 Tu turno. Dispara!" : "⏳ Turno del oponente...";
        console.log(turnText);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    scene: BattleGame,
};

const game = new Phaser.Game(config);
