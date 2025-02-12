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
        this.load.image('hit', 'assets/hit.png');
        this.load.image('miss', 'assets/miss.png');
    }

    create() {
        this.socket = window.socket;
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

        this.socket.on("shotFired", ({ row, col }) => {
            this.markShot(row, col);
        });
    }

    createGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                let x = col * this.tileSize;
                let y = row * this.tileSize + 50;
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

    markShot(row, col) {
        let x = col * this.tileSize;
        let y = row * this.tileSize + 50;
        this.add.image(x, y, 'hit').setOrigin(0, 0);
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
