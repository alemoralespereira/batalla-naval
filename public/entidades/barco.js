import Entity from './entity.js';
import socket from '../socket.js';

class Barco extends Entity {
<<<<<<< Updated upstream
    constructor(x, y, velocidad, velocidadMaxima, angulo, aceleracion, objetivo, combustible, salud) {
        super(x, y, velocidad, velocidadMaxima, angulo, aceleracion, objetivo, combustible, salud);
=======
    constructor(x, y, velocidad, velocidadMaxima, angulo, aceleracion, objetivo, combustible) {
        super(x, y, velocidad, velocidadMaxima, angulo, aceleracion, objetivo, combustible);
        this.sonidoMotor = null;
        this.motorEncendido = false;
        this.vida=100;
>>>>>>> Stashed changes
    }

    init(escena){
        super.init(escena);
        this.sonidoMotor = this.escena.sound.add("motor_barco",{loop:true, volume:0.5});
    }
    
    update(){
        super.update();

        
    }


    recibirDanio(cantidad) {
        this.vida -= cantidad;
        console.log(`El barco ha recibido ${cantidad} de daño. Vida restante: ${this.vida}`);
        if (this.vida <= 0) {
            this.destruirBarco();
        }
    }

    destruirBarco() {
        console.log("¡El barco ha sido hundido!");
        this.objetivo.destroy(); // Eliminar barco de la escena
    }


    

    mover(controles) {
<<<<<<< Updated upstream
=======
        if (!this.objetivo) {
            console.error(`Sprite no encontrado para la entidad`);
            return;
        }
        this.calcularCombustible();

        if(this.combustible > 0) {

            // Movimiento con las teclas W, A, S, D
            if (controles.izquierda.isDown || controles.derecha.isDown || controles.arriba.isDown || controles.abajo.isDown) {

                if(!this.motorEncendido){
                    this.sonidoMotor.play();
                    this.motorEncendido = true;
                }




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

                if(this.motorEncendido){
                    this.sonidoMotor.stop();
                    this.motorEncendido = false;
                }
            }
        } else {
            this.objetivo.setAngularVelocity(0);  // Detener rotación también cuando el combustible sea 0
            this.objetivo.setVelocityX(0);        // Detener movimiento horizontal
            this.objetivo.setVelocityY(0);

            if(this.motorEncendido){
                this.sonidoMotor.stop();
                this.motorEncendido = false;
            }
        }
>>>>>>> Stashed changes
    }
}

export default Barco;
