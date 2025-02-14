import socket from './socket.js';

class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    init(data) {
        this.room = data.room;
        this.role = data.role;
        this.gameState = data.gameState;
        this.entities = {
            battleship: { target: null, speed: 0 },
            carrier: { target: null, speed: 0 },
        };
    }

    preload() {
        this.load.image("water", "assets/water.png");
        this.load.image("battleship", "assets/battleship.png");
        this.load.image("carrier", "assets/carrier.png");
    }

    create() {
        // Init mapa
        this.add.tileSprite(0, 0, this.scale.width * 2, this.scale.height * 2, "water").setOrigin(0, 0);

        const { battleship, carrier } = this.gameState.entities;

        // Init acorazado
        this.entities.battleship.target = this.physics.add.sprite(battleship.x, battleship.y, "battleship").setScale(0.5).setInteractive();
        this.entities.battleship.speed = battleship.speed;

        // Init portaviones
        this.entities.carrier.target = this.physics.add.sprite(carrier.x, carrier.y, "carrier").setScale(0.6).setInteractive();
        this.entities.carrier.speed = carrier.speed;

        this.input.on("pointerdown", (pointer) => {
            this.moveEntity(this.entities[this.role], pointer.x, pointer.y);
            socket.emit("moveEntity", {
                room: this.room,
                entity: this.role,
                x: pointer.x,
                y: pointer.y
            });
        });

        // Evento de actualización de entidades (los jugadores ven reflejados los movimientos)
        socket.on("updateEntityPosition", (data) => {
            if (this.entities[data.entity]) {
                const entity = this.entities[data.entity];
                this.moveEntity(entity, data.x, data.y);
            }
        });
    }

    moveEntity(entity, x, y) {
        const distance = Phaser.Math.Distance.Between(entity.target.x, entity.target.y, x, y);

        this.tweens.add({
            targets: entity.target,
            x: x,
            y: y,
            duration: (distance / entity.speed) * 1000,
            ease: "Power2",
        });
    }
}

export default Game;
