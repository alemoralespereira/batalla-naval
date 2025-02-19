import Entity from './entity.js';

class Barco extends Entity {
    constructor(x, y, speed, maxSpeed, acceleration, target, combustible, vision, rangoVision) {
        super(x, y, speed, maxSpeed, acceleration, target, combustible, vision, rangoVision);
    }

    init(scene){
        super.init(scene);
    }

    update(){
        super.update();
    }

    move(cursors) {
        if (!this.target) {
            console.error(`Sprite no encontrado para la entidad`);
            return;
        }
        this.calcularCombustible();

        if(this.combustible > 0) {

            // Movimiento con las teclas W, A, S, D
            if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
                // Rotación (A y D)
                if (cursors.left.isDown) {
                    this.target.setAngularVelocity(-25);
                } else if (cursors.right.isDown) {
                    this.target.setAngularVelocity(25);
                } else {
                    this.target.setAngularVelocity(0);
                }

                // Aceleración (W y S)
                if (cursors.up.isDown) {
                    this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
                } else if (cursors.down.isDown) {
                    this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed);
                }

                // Calcular nueva velocidad
                const angle = Phaser.Math.DegToRad(this.target.angle);
                this.target.setVelocityX(Math.cos(angle) * this.speed);
                this.target.setVelocityY(Math.sin(angle) * this.speed);
            } else {
                this.target.setAngularVelocity(0);
            }
        } else {
            this.target.setAngularVelocity(0);  // Detener rotación también cuando el combustible sea 0
            this.target.setVelocityX(0);        // Detener movimiento horizontal
            this.target.setVelocityY(0);
        }
    }
}

export default Barco;
