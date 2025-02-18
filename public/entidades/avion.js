import Entity from './entity.js';

class Avion extends Entity {
    constructor(avionData) {
        super(
            avionData.x,
            avionData.y,
            0,
            100,
            2,
            null
        );
    }

    init(scene) {
        this.target = scene.physics.add.sprite(this.x, this.y, "avion").setScale(0.2).setOrigin(0.5, 0.5);
    }

    move(cursors) {
        if (!this.target) {
            console.error(`Sprite no encontrado para la entidad`);
            return;
        }

        // Movimiento con las teclas W, A, S, D
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown) {
            // Rotación (A y D)
            if (cursors.left.isDown) {
                this.target.setAngularVelocity(-25);
            } else if (cursors.right.isDown) {
                this.target.setAngularVelocity(25);
            } else {
                this.target.setAngularVelocity(0);
            }

            // Aceleración (W)
            if (cursors.up.isDown) {
                this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
            }

            // Calcular nueva velocidad
            console.log(this.target.angle);
            const angle = Phaser.Math.DegToRad(this.target.angle);
            this.target.setVelocityX(Math.cos(angle) * this.speed);
            this.target.setVelocityY(Math.sin(angle) * this.speed);
        } else {
            this.target.setAngularVelocity(0);
        }
    }
}

export default Avion;
