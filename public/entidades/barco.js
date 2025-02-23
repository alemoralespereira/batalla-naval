import Entity from './entity.js';

class Barco extends Entity {
    constructor(x, y, velocidad, velocidadMaxima, angulo, aceleracion, objetivo, combustible) {
        super(x, y, velocidad, velocidadMaxima, angulo, aceleracion, objetivo, combustible);
    }

    init(escena){
        super.init(escena);
    }
    
    update(){
        super.update();
    }

    mover(controles) {
        if (!this.objetivo) {
            console.error(`Sprite no encontrado para la entidad`);
            return;
        }
        this.calcularCombustible();

        if(this.combustible > 0) {

            // Movimiento con las teclas W, A, S, D
            if (controles.izquierda.isDown || controles.derecha.isDown || controles.arriba.isDown || controles.abajo.isDown) {
                // Rotación (A y D)
                if (controles.izquierda.isDown) {
                    this.objetivo.setAngularVelocity(-25);
                } else if (controles.derecha.isDown) {
                    this.objetivo.setAngularVelocity(25);
                } else {
                    this.objetivo.setAngularVelocity(0);
                }

                // Aceleración (W y S)
                if (controles.arriba.isDown) {
                    this.velocidad = Math.min(this.velocidad + this.aceleracion, this.velocidadMaxima);
                } else if (controles.abajo.isDown) {
                    this.velocidad = Math.max(this.velocidad - this.aceleracion, -this.velocidadMaxima);
                }

                // Calcular nueva velocidad
                const angle = Phaser.Math.DegToRad(this.objetivo.angle);
                this.objetivo.setVelocityX(Math.cos(angle) * this.velocidad);
                this.objetivo.setVelocityY(Math.sin(angle) * this.velocidad);
            } else {
                this.objetivo.setAngularVelocity(0);
            }
        } else {
            this.objetivo.setAngularVelocity(0);  // Detener rotación también cuando el combustible sea 0
            this.objetivo.setVelocityX(0);        // Detener movimiento horizontal
            this.objetivo.setVelocityY(0);
        }
    }
}

export default Barco;
