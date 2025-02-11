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
        // 🔹 Asegurar conexión con el servidor correcto
        this.socket = io("wss://bismarck.atlassoftware.uy");

        this.createGrid();

        // 🔹 Recibir información de asignación de jugador
        this.socket.on("player", (data) => {
            console.log(`Jugador asignado: ${data.id}`);
            this.playerIndex = data.index;
        });

        // 🔹 Manejar el inicio del juego
        this.socket.on("gameStart", (players) => {
            console.log("El juego ha comenzado. Jugadores:", players);
            this.isMyTurn = this.playerIndex === 0; // Turno inicial para el jugador 0
            this.updateTurnMessage();
        });

        // 🔹 Manejar el turno del jugador
        this.socket.on("yourTurn", () => {
            this.isMyTurn = true;
            console.log("Es tu turno.");
            this.updateTurnMessage();
        });

        // 🔹 Manejar disparos acertados
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

                        // 🔹 Enviar disparo al servidor
                        this.socket.emit("shoot", { row, col });

                        // 🔹 Cambiar turno localmente hasta que el servidor lo confirme
                        this.isMyTurn = false;
                        this.updateTurnMessage();
                    }
                });
            }
        }
    }

    markHit(row, col) {
        let x = col * this.tileSize;
        let y = row * this.tileSize;
        this.add.rectangle(
            x + this.tileSize / 2,
            y + this.tileSize / 2,
            this.tileSize,
            this.tileSize,
            0xff0000,
            0.5
        );
    }

    updateTurnMessage() {
        let turnText = this.isMyTurn ? "Tu turno" : "Turno del oponente";
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
