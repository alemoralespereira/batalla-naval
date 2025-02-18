class Entity {
    constructor(x, y, speed, maxSpeed, acceleration, target) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.maxSpeed = maxSpeed;
        this.acceleration = acceleration;
        this.target = target;
    }

    init(scene) {
        //
    }

    update() {
        //
    }

    move(cursors) {
        if (!this.target) {
            console.error(`Sprite no encontrado para la entidad`);
            return;
        }

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
            // Detener movimiento
            this.target.setVelocityX(0);
            this.target.setVelocityY(0);
            this.target.setAngularVelocity(0);
        }
    }
}

export default Entity;
