import Panel from '../ui/panel.js';
import Barco from './barco.js';
import Arma from './arma.js';

class Bismarck extends Barco {
    constructor(bismarckData) {
        super(
            bismarckData.x,
            bismarckData.y,
            bismarckData.velocidad,
            bismarckData.velocidadMaxima,
            bismarckData.angulo,
            bismarckData.aceleracion,
            bismarckData.objetivo,
            bismarckData.combustible,
        );

        this.armas = [
            new Arma("Antiaereo pesado", 38, 200, 150, 30),
            new Arma("Antiaereo ligero", 19, 250, 100, 60)
        ]
        this.armaSeleccionada = null; // this.armas[0];
    }

    init(escena) {
        this.escena = escena; 
        this.objetivo = escena.physics.add.sprite(this.x, this.y, "bismarck").setScale(0.8).setOrigin(0.5, 0.5);
        this.rangoVision = escena.add.zone(this.x, this.y, 500, 500).setOrigin(0.5, 0.5);
        this.objetivo.rangoVision = this.rangoVision;
    //    this.graphics = escena.add.graphics();
    //    this.dibujarRangoVision();
       this.indicadorCombustible = escena.add.text(-100, 760, `COMBUSTIBLE BISMARCK:  ${this.combustible}`,{
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.indicadorCombustible.setVisible(false);
        this.indicadorCombustible.setScrollFactor(0);
       super.init(escena);
    }

    configurar() {
        // Configurar la cámara para seguir al Bismarck
        this.escena.cameras.main.startFollow(this.escena.entidades.bismarck.objetivo);
        this.escena.entidades.portaaviones.objetivo.setVisible(false);
        this.escena.equipoAzul.forEach((avion) => {
            //console.log('Avion:', avion);
            //console.log('Objetivo del avion:', avion.objetivo);
            avion.objetivo.setVisible(false);
        });

        const panel = new Panel(this.escena);
        const botonesArmas = {};

        // Botones para seleccionar armas biscmarck
        for (let i = 0; i < this.escena.entidades.bismarck.armas.length; i++) {
            const arma = this.escena.entidades.bismarck.armas[i];
            const x = -100;
            const y = 460 + i * 30;
            const botonArma = panel.agregarBoton(x, y, arma.nombre);
            botonesArmas[arma.nombre] = botonArma;
            const cuadroInformativoAvion = this.escena.add.group();
            cuadroInformativoAvion.addMultiple([
                panel.agregarRectangulo(x + 200, y, 300, 130),
                panel.agregarTexto(x + 205, y + 10, `Calibre:  ${arma.calibre}`),
                panel.agregarTexto(x + 205, y + 40, `Rango:  ${arma.rango}`),
                panel.agregarTexto(x + 205, y + 70, `Daño:  ${arma.daño}`),
                panel.agregarTexto(x + 205, y + 100, `Cadencia disparo:  ${arma.cadenciaDisparo}`),
            ]);
            cuadroInformativoAvion.setVisible(false);
            botonArma.on('pointerover', () => {
                cuadroInformativoAvion.setVisible(true);
            });
            botonArma.on('pointerout', () => {
                cuadroInformativoAvion.setVisible(false);
            });
            botonArma.on('pointerdown', () => {
                if (this.armaSeleccionada) {
                    if (this.armaSeleccionada === arma) {
                        this.armaSeleccionada = null;
                        botonArma.setBackgroundColor('#808080');
                    } else {
                        botonArma.setBackgroundColor('#00ff00')
                        botonesArmas[this.armaSeleccionada.nombre].setBackgroundColor('#808080')
                        this.armaSeleccionada = arma;
                    }
                } else {
                    this.armaSeleccionada = arma;
                    botonArma.setBackgroundColor('#00ff00');
                }
            });
            panel.agregarBotonAlPanel(botonArma);
        }
    }
    
    dibujarRangoVision() {
        this.graphics.clear();
        this.graphics.lineStyle(2, 0xff0000);
        const bounds = this.rangoVision.getBounds();
        this.graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    update() {
        super.update();
        this.rangoVision.setPosition(this.objetivo.x, this.objetivo.y);
       // this.dibujarRangoVision();
       if(this.escena.rol === "bismarck") {
            if(this.x != this.objetivo.x || this.y != this.objetivo.y) {    
                this.indicadorCombustible.setVisible(true);
                this.indicadorCombustible.setText(`COMBUSTIBLE BISMARCK: ${this.combustible}`);
            }
        }

        this.armas.forEach((arma) => {
            if (arma.rangoAtaque) {
                arma.rangoAtaque.destroy();
            }
        });

        if (this.armaSeleccionada) {
            this.armaSeleccionada.dibujarRangoAtaque(this.escena, this.objetivo.x, this.objetivo.y);
        }
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
                const velocityX = Math.cos(angle) * this.velocidad;
                const velocityY = Math.sin(angle) * this.velocidad;

                // Actualizar las posiciones
                this.objetivo.setVelocityX(velocityX);
                this.objetivo.setVelocityY(velocityY);

                // Actualizar las posiciones internas
                this.x = this.objetivo.x;
                this.y = this.objetivo.y;
                this.angulo = this.objetivo.angle;
            } else {
                this.objetivo.setAngularVelocity(0);
            }
        } else {
            this.objetivo.setAngularVelocity(0);
            this.objetivo.setVelocityX(0);
            this.objetivo.setVelocityY(0);
        }
    }
}

export default Bismarck;
