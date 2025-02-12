class BattleGame extends Phaser.Scene {
    constructor() {
        super({ key: "BattleGame" });
        this.gridSize = 10;
        this.tileSize = 50;
        this.attacks = [];
        this.isMyTurn = false;
        this.room = localStorage.getItem("room");
        this.username = localStorage.getItem("username");
    }

    preload() {
        this.load.image("water", "assets/agua.jpg");
    }

    create() {
        this.socket = io();

        this.createGrid();

        this.socket.emit("joinRoom", { username: this.username, room: this.room });

        this.socket.on("roomFull", () => {
            alert("La sala está llena. Por favor, elige otra.");
            location.reload();
        });

        this.socket.on("player", (data) => {
            console.log(`🎮 Jugador ${data.username} asignado en la sala ${this.room}`);
        });

        this.socket.on("gameStart", (players) => {
            console.log("🎮 El juego ha comenzado en la sala:", this.room, "con los jugadores:", players);
            document.getElementById("turno").innerText = "¡El juego ha comenzado!";
        });

        this.socket.on("yourTurn", (isMyTurn) => {
            this.isMyTurn = isMyTurn;
            console.log(isMyTurn ? "🔥 Es tu turno" : "⏳ Turno del oponente");
            document.getElementById("turno").innerText = isMyTurn ? "🔥 Tu turno" : "⏳ Turno del oponente";
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
                        console.log(`🎯 Disparo en fila ${row}, columna ${col}`);
                        this.attacks.push(`${row}-${col}`);
                        this.socket.emit("shoot", { room: this.room, row, col });

                        tile.removeInteractive();
                        tile.setTint(0xff0000);
                        this.isMyTurn = false;
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
