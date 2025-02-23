import Entity from './entity.js';

class Avion extends Entity {
    constructor(avionData) {
        super(
            avionData.x,
            avionData.y,
            avionData.velocidad,
            avionData.velocidadMaxima,
            avionData.aceleracion,
            null, // Objetivo
            avionData.combustible,
            // avionData.rangoVision
        );

        this.piloto = avionData.piloto;
        this.observador = avionData.observador;
        this.operador = avionData.operador;
    }

    init(escena) {
        this.objetivo = escena.physics.add.sprite(this.x, this.y, "avion").setScale(0.2).setOrigin(0.5, 0.5);
        if (!this.objetivo || !(this.objetivo instanceof Phaser.GameObjects.Sprite)) {
            console.error("Error: No se pudo crear el sprite para el avión.");
        }
        super.init(escena);

        this.rangoVision = escena.add.zone(this.x, this.y, 500, 500).setOrigin(0.5, 0.5);
        this.graphics = escena.add.graphics();
        this.dibujarRangoVision();
    }
    
    dibujarRangoVision() {
        // Limpiar el dibujo anterior
        this.graphics.clear();

        // Estilo del rectángulo (color y grosor del borde)
        this.graphics.lineStyle(2, 0xff0000); // Borde rojo de 2px de grosor

        // Dibujar el rectángulo de la Zone
        const bounds = this.rangoVision.getBounds();
        this.graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    update() {
        super.update();
        this.rangoVision.setPosition(this.objetivo.x, this.objetivo.y);
        this.dibujarRangoVision();
    }

    mover(controles) {
        if (!this.objetivo) {
            console.error(`Sprite no encontrado para la entidad`);
            return;
        }
        this.calcularCombustible();

        if (this.combustible > 0) {
            // Movimiento con las teclas W, A, S, D
            if (controles.izquierda.isDown || controles.derecha.isDown || controles.arriba.isDown) {

                // Rotación (A y D)
                if (controles.izquierda.isDown) {
                    this.objetivo.setAngularVelocity(-25);
                } else if (controles.derecha.isDown) {
                    this.objetivo.setAngularVelocity(25);
                } else {
                    this.objetivo.setAngularVelocity(0);
                }

                // Aceleración (W)
                if (controles.arriba.isDown) {
                    this.velocidad = Math.min(this.velocidad + this.aceleracion, this.velocidadMaxima);
                }

                // Calcular nueva velocidad
                const angle = Phaser.Math.DegToRad(this.objetivo.angle);
                const velocityX = Math.cos(angle) * this.velocidad;
                const velocityY = Math.sin(angle) * this.velocidad;

                // Actualizar las posiciones
                this.objetivo.setVelocityX(velocityX);
                this.objetivo.setVelocityY(velocityY);

                // Actualizar las posiciones internas
                this.x = this.objetivo.x;
                this.y = this.objetivo.y;
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

export default Avion;
