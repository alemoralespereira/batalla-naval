class BattleGame extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleGame' });
        this.gridSize = 10;
        this.tileSize = 50;
        this.attacks = [];
        this.isMyTurn = false;
    }

    preload() {
        this.load.image('water', 'assets/agua.jpg');
        this.load.image('hit', 'assets/hit.png');  // Imagen para impacto
        this.load.image('miss', 'assets/miss.png'); // Imagen para fallo
    }

    create() {
        this.socket = window.socket; // Usar el socket global de index.html
        this.createGrid();

        this.statusText = this.add.text(10, 10, "Esperando jugadores...", {
            fontSize: '20px',
            fill: '#ffffff'
        });

        this.socket.on("yourTurn", () => {
            this.isMyTurn = true;
            this.statusText.setText("¡Tu turno!");
        });

        this.socket.on("opponentTurn", () => {
            this.isMyTurn = false;
            this.statusText.setText("Turno del oponente...");
        });

        this.socket.on("shotFired", ({ row, col, hit }) => {
            this.markShot(row, col, hit);
        });
    }

    createGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                let x = col * this.tileSize;
                let y = row * this.tileSize + 50; // Espacio para el texto de estado
                let tile = this.add.image(x, y, 'water').setOrigin(0, 0).setInteractive();

                tile.on('pointerdown', () => {
                    if (this.isMyTurn && !this.attacks.includes(`${row}-${col}`)) {
                        console.log(`Disparo en fila ${row}, columna ${col}`);
                        this.attacks.push(`${row}-${col}`);
                        this.socket.emit("shoot", { row, col });
                        this.isMyTurn = false;
                        this.statusText.setText("Esperando respuesta...");
                    }
                });
            }
        }
    }

    markShot(row, col, hit) {
        let x = col * this.tileSize;
        let y = row * this.tileSize + 50;
        let image = hit ? 'hit' : 'miss';
        this.add.image(x, y, image).setOrigin(0, 0);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 550,
    scene: BattleGame
};

function startGame() {
    new Phaser.Game(config);
}
