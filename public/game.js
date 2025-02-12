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
        this.load.image('hit', 'assets/hit.png'); // Imagen para impacto
    }

    create() {
        this.socket = io();
        this.createGrid();

        // Notificación de jugador y sala
        this.socket.on('playerAssigned', ({ username, room }) => {
            console.log(`Jugador ${username} asignado en la sala ${room}`);
        });

        // Indicar quién juega
        this.socket.on("yourTurn", () => {
            this.isMyTurn = true;
            console.log("🔥 Es tu turno!");
        });

        this.socket.on("opponentTurn", () => {
            this.isMyTurn = false;
            console.log("⏳ Turno del oponente...");
        });

        // Disparo recibido
        this.socket.on("shotFired", ({ row, col }) => {
            this.markHit(row, col);
        });
    }

    createGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                let x = col * this.tileSize;
                let y = row * this.tileSize;
                let tile = this.add.image(x, y, 'water').setOrigin(0, 0).setInteractive();

                tile.on('pointerdown', () => {
                    if (this.isMyTurn && !this.attacks.includes(`${row}-${col}`)) {
                        console.log(`🚀 Disparo en fila ${row}, columna ${col}`);
                        this.attacks.push(`${row}-${col}`);
                        this.socket.emit('shoot', { row, col });
                        this.isMyTurn = false; // Bloquear clics hasta nuevo turno
                    }
                });
            }
        }
    }

    markHit(row, col) {
        let x = col * this.tileSize;
        let y = row * this.tileSize;
        this.add.image(x + this.tileSize / 2, y + this.tileSize / 2, 'hit').setOrigin(0.5);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    scene: BattleGame
};

const game = new Phaser.Game(config);
