import Entity from './entity.js';

class Avion extends Entity {
    constructor(avionData) {
        super(
            avionData.x,
            avionData.y,
            0,
            100,
            2,
            null,
            10000, //COMBUSTIBLE
            null,
            50
        )
       this.piloto = false;
       this.observador = false;
       this.operador = false;
    }

    init(scene) {
        this.target = scene.physics.add.sprite(50, 500, "avion").setScale(0.2).setOrigin(0.5, 0.5);
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
                const angle = Phaser.Math.DegToRad(this.target.angle);
                const velocityX = Math.cos(angle) * this.speed;
                const velocityY = Math.sin(angle) * this.speed;
            
                // Actualizar las posiciones
                this.target.setVelocityX(velocityX);
                this.target.setVelocityY(velocityY);

                // Actualizar las posiciones internas
                this.x = this.target.x;
                this.y = this.target.y;
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

export default Avion;
