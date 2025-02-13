export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: "BattleScene" });
    }

    preload() {
        this.load.image("water", "assets/water.png");
        this.load.image("battleship", "assets/battleship.png");
        this.load.image("carrier", "assets/carrier.png");
    }

    create() {
        this.add.tileSprite(0, 0, this.scale.width * 2, this.scale.height * 2, "water").setOrigin(0, 0);
        this.selectedEntity = null;

        // Conectar con el servidor
        this.socket = io();

        // Escuchar el inicio del juego desde el servidor
        this.socket.on("gameStart", (gameState) => {
            this.battleship = this.physics.add.sprite(gameState.battleship.x, gameState.battleship.y, "battleship").setScale(0.5).setInteractive();
            this.carrier = this.physics.add.sprite(gameState.carrier.x, gameState.carrier.y, "carrier").setScale(0.6).setInteractive();

            this.input.on("pointerdown", this.onClick, this);
        });

        // Escuchar cambios en la posición de barcos
        this.socket.on("updateShipPosition", ({ ship, x, y }) => {
            if (ship === "battleship") {
                this.battleship.setPosition(x, y);
            } else if (ship === "carrier") {
                this.carrier.setPosition(x, y);
            }
        });

        // Escuchar disparos
        this.socket.on("shotFired", ({ row, col }) => {
            this.createExplosion(col, row);
        });
    }

    onClick(pointer) {
        let clickedEntity = null;

        if (this.battleship && this.battleship.getBounds().contains(pointer.x, pointer.y)) {
            clickedEntity = this.battleship;
        } else if (this.carrier && this.carrier.getBounds().contains(pointer.x, pointer.y)) {
            clickedEntity = this.carrier;
        }

        if (clickedEntity) {
            if (this.selectedEntity) {
                this.moveEntityTo(this.selectedEntity, pointer.x, pointer.y);
                this.socket.emit("moveShip", { room: "sala1", ship: this.selectedEntity.texture.key, x: pointer.x, y: pointer.y });
                this.selectedEntity = null;
            } else {
                this.selectedEntity = clickedEntity;
            }
        }
    }

    moveEntityTo(entity, targetX, targetY) {
        this.tweens.add({
            targets: entity,
            x: targetX,
            y: targetY,
            duration: 1000,
            ease: "Power2"
        });
    }

    createExplosion(x, y) {
        const explosion = this.add.circle(x, y, 10, 0xff0000);
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            duration: 500,
            onComplete: () => explosion.destroy()
        });
    }
}


