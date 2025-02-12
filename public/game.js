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
        // Asegurar que el socket está configurado correctamente
        this.socket = window.socket;
        if (!this.socket) {
            console.error("Error: No se encontró el socket.");
            return;
        }

        // Crear el tablero
        this.add.text(20, 20, "Batalla Naval", { fontSize: "20px", fill: "#fff" });
        this.createGrid();

        // Recibir eventos del servidor
        this.socket.on("turn", (isMyTurn) => {
            this.isMyTurn = isMyTurn;
            console.log(isMyTurn ? "Tu turno" : "Turno del oponente");
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
                let tile = this.add.image(x, y, "water").setOrigin(0, 0).setInteractive();

                tile.on("pointerdown", () => {
                    if (this.isMyTurn && !this.attacks.includes(`${row}-${col}`)) {
                        console.log(`Disparo en fila ${row}, columna ${col}`);
                        this.attacks.push(`${row}-${col}`);
                        this.socket.emit("shoot", { row, col });
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
}

// Inicializar Phaser solo cuando inicie el juego
function startGame() {
    document.getElementById("phaser-game").innerHTML = ""; // Limpia el contenedor
    const config = {
        type: Phaser.AUTO,
        width: 500,
        height: 500,
        parent: "phaser-game",
        scene: BattleGame
    };
    new Phaser.Game(config);
}
