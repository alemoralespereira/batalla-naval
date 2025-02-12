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
    }

    create() {
        this.socket = io();

        // Crear el tablero de juego
        this.createGrid();

        // Escuchar el inicio del juego
        this.socket.on('gameStart', (turnoInicial) => {
            this.isMyTurn = turnoInicial;
            this.updateTurnText();
        });

        // Escuchar disparos y marcarlos
        this.socket.on('shotFired', ({ row, col }) => {
            this.markHit(row, col);
        });

        // Escuchar cambio de turno
        this.socket.on('yourTurn', () => {
            this.isMyTurn = true;
            this.updateTurnText();
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
                        console.log(`Disparo en fila ${row}, columna ${col}`);
                        this.attacks.push(`${row}-${col}`);
                        this.socket.emit('shoot', { row, col });
                        this.isMyTurn = false; // Bloquea nuevos disparos hasta recibir confirmación
                        this.updateTurnText();
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

    updateTurnText() {
        if (!this.turnText) {
            this.turnText = this.add.text(20, 20, '', { fontSize: '20px', fill: '#fff' });
        }
        this.turnText.setText(this.isMyTurn ? '🔥 Es tu turno!' : '⏳ Turno del oponente...');
    }
}

// Configuración de Phaser
const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    scene: BattleGame
};

const game = new Phaser.Game(config);
