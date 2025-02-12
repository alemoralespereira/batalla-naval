class BattleGame extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleGame' });
        this.gridSize = 10;
        this.tileSize = 50;
        this.attacks = [];
        this.isMyTurn = false;
        this.playerName = "";
        this.room = "";
    }

    preload() {
        this.load.image('water', 'assets/agua.jpg');
    }

    create() {
        this.socket = io();

        // Mostrar formulario de ingreso
        document.getElementById('startMenu').style.display = 'block';
        document.getElementById('gameCanvas').style.display = 'none';

        document.getElementById('joinGame').addEventListener('click', () => {
            this.playerName = document.getElementById('playerName').value;
            this.room = document.getElementById('roomSelect').value;

            if (this.playerName && this.room) {
                this.socket.emit('joinRoom', { playerName: this.playerName, room: this.room });
            }
        });

        this.socket.on('playerAssigned', ({ playerName, room }) => {
            console.log(`Jugador ${playerName} asignado en la sala ${room}`);
            document.getElementById('startMenu').style.display = 'none';
            document.getElementById('gameCanvas').style.display = 'block';
            this.createGrid();
        });

        this.socket.on('gameStart', (players) => {
            console.log("El juego ha comenzado. Jugadores:", players);
        });

        this.socket.on('turn', (isMyTurn) => {
            this.isMyTurn = isMyTurn;
            console.log(isMyTurn ? 'Tu turno' : 'Turno del oponente');
        });

        this.socket.on('hit', ({ row, col }) => {
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
                        console.log(`Disparo en fila ${row}, columna ${col}`);
                        this.attacks.push(`${row}-${col}`);
                        this.socket.emit('shoot', { row, col, room: this.room });
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

const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    scene: BattleGame
};

const game = new Phaser.Game(config);
