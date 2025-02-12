class BattleGame extends Phaser.Scene {
    constructor() {
        super({ key: "BattleGame" });
        this.gridSize = 10; // Tamaño de la cuadrícula (10x10)
        this.tileSize = 50; // Tamaño de cada celda en píxeles
        this.attacks = []; // Almacena los disparos realizados
        this.isMyTurn = false; // Indica si es el turno del jugador
    }

    preload() {
        // Cargar la imagen de fondo (agua)
        this.load.image("water", "assets/agua.jpg");
    }

    create() {
        // Conectar con el servidor Socket.IO
        this.socket = io();

        // Crear la cuadrícula del juego
        this.createGrid();

        // Escuchar el evento "gameStart" para iniciar el juego
        this.socket.on("gameStart", (turn) => {
            this.isMyTurn = turn === this.socket.id; // Verificar si es el turno del jugador
            this.updateTurnIndicator(); // Actualizar el indicador de turno
        });

        // Escuchar el evento "yourTurn" para indicar que es el turno del jugador
        this.socket.on("yourTurn", () => {
            this.isMyTurn = true;
            this.updateTurnIndicator();
        });

        // Escuchar el evento "opponentTurn" para indicar que es el turno del oponente
        this.socket.on("opponentTurn", () => {
            this.isMyTurn = false;
            this.updateTurnIndicator();
        });

        // Escuchar el evento "shotFired" para marcar un disparo en la cuadrícula
        this.socket.on("shotFired", ({ row, col }) => {
            this.markHit(row, col, true); // Marcar el disparo del oponente
        });
    }

    // Método para crear la cuadrícula del juego
    createGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                // Calcular la posición de cada celda
                let x = col * this.tileSize;
                let y = row * this.tileSize;

                // Crear una celda (tile) con la imagen de agua
                let tile = this.add
                    .image(x, y, "water")
                    .setOrigin(0, 0)
                    .setInteractive(); // Hacer la celda interactiva

                // Escuchar el evento "pointerdown" (clic) en la celda
                tile.on("pointerdown", () => {
                    if (this.isMyTurn && !this.attacks.includes(`${row}-${col}`)) {
                        console.log(`Disparo en fila ${row}, columna ${col}`);
                        this.attacks.push(`${row}-${col}`); // Registrar el disparo

                        // Emitir el evento "shoot" al servidor
                        this.socket.emit("shoot", {
                            row,
                            col,
                            room: document.getElementById("room").value,
                        });

                        this.isMyTurn = false; // Cambiar el turno al oponente
                        this.updateTurnIndicator(); // Actualizar el indicador de turno
                    }
                });
            }
        }
    }

    // Método para marcar un disparo en la cuadrícula
    markHit(row, col, isOpponent = false) {
        // Calcular la posición del disparo
        let x = col * this.tileSize;
        let y = row * this.tileSize;

        // Definir el color del marcador (rojo para el oponente, verde para el jugador)
        let color = isOpponent ? 0xff0000 : 0x00ff00;

        // Dibujar un rectángulo en la celda para marcar el disparo
        this.add.rectangle(
            x + this.tileSize / 2,
            y + this.tileSize / 2,
            this.tileSize,
            this.tileSize,
            color,
            0.5
        );
    }

    // Método para actualizar el indicador de turno en la interfaz
    updateTurnIndicator() {
        const turnIndicator = document.getElementById("turnIndicator");
        if (turnIndicator) {
            turnIndicator.innerText = this.isMyTurn ? "🔥 Es tu turno!" : "⏳ Turno del oponente...";
        }
    }
}

// Configuración del juego Phaser
const config = {
    type: Phaser.AUTO, // Renderizado automático (WebGL o Canvas)
    width: 500, // Ancho del canvas
    height: 500, // Alto del canvas
    scene: BattleGame, // Escena principal del juego
};

// Inicializar el juego Phaser
const game = new Phaser.Game(config);