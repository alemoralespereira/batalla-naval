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

        this.armas = []
        this.armaSeleccionada = null;
        this.cursorMira = null;
    }

    init(escena) {
        this.escena = escena; 
        this.objetivo = escena.physics.add.sprite(this.xInicial, this.yInicial, "bismarck").setOrigin(0.5, 0.5);
        this.objetivo.body.setCircle(40, 210, 85);
        this.objetivo.setVisible(true);

        this.proa = escena.physics.add.sprite(this.objetivo.x, this.objetivo.y, null).setOrigin(0.5, 0.5);
        this.proa.body.setCircle(40, -25, -25);
        this.proa.setVisible(false);

        this.popa = escena.physics.add.sprite(this.objetivo.x, this.objetivo.y, null).setOrigin(0.5, 0.5);
        this.popa.body.setCircle(40, -25, -25);
        this.popa.setVisible(false);

        this.updateHitboxes();

        this.rangoVision = escena.add.zone(this.xInicial, this.yInicial, 500, 500).setOrigin(0.5, 0.5);
        this.objetivo.rangoVision = this.rangoVision;
      //  this.graphics = escena.add.graphics();
       // this.dibujarRangoVision();
       this.indicadorCombustible = escena.add.text(-100, 760, `COMBUSTIBLE BISMARCK:  ${this.combustible}`,{
            fontSize: '20px',
            fill: '#ffffff'
        });
        //this.escena.camaraMinimapa.ignore(this.indicadorCombustible);
        this.indicadorCombustible.setVisible(false);
        this.indicadorCombustible.setScrollFactor(0);
        super.init(escena);
    }

    updateHitboxes() {
        const angleRad = this.objetivo.rotation;
        const offsetProa = 90; // Distancia desde el centro hacia la proa
        const offsetPopa = -85; // Distancia desde el centro hacia la popa

        // Posición de la proa
        this.proa.x = this.objetivo.x + Math.cos(angleRad) * offsetProa;
        this.proa.y = this.objetivo.y + Math.sin(angleRad) * offsetProa;
        this.proa.rotation = angleRad;

        // Posición de la popa
        this.popa.x = this.objetivo.x + Math.cos(angleRad) * offsetPopa;
        this.popa.y = this.objetivo.y + Math.sin(angleRad) * offsetPopa;
        this.popa.rotation = angleRad;
    }

    configurar() {
        this.armas = [
            new Arma({
                nombre: "Antiaereo pesado 1", 
                calibre: 38,
                rango: 200,
                daño: 150,
                cadenciaDisparo: 10,
                cantidadMuniciones: 5,
                // origenX: 0.7,
                // origenY: 0.5
            }),
             new Arma({
                 nombre: "Antiaereo pesado 2", 
                 calibre: 38,
                 rango: 200,
                 daño: 150,
                 cadenciaDisparo: 10,
                 cantidadMuniciones: 5,
                 //origenX: 0.3,
                 //origenY: 0.5
             }),
            new Arma({
                nombre: "Antiaereo ligero", 
                calibre: 19,
                rango: 250,
                daño: 100,
                cadenciaDisparo: 4,
                cantidadMuniciones: 10,
                // origenX: 0.5,
                // origenY: 0.5
            })
        ];
    
        this.cursorMira = this.escena.add.image(0, 0, "mira")
            .setOrigin(0.5, 0.5)
            .setScale(0.2, 0.2)
            .setVisible(false);

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
                panel.agregarRectangulo(x + 200, y, 460, 160),
                panel.agregarTexto(x + 205, y + 10, `Calibre:  ${arma.calibre}`),
                panel.agregarTexto(x + 205, y + 40, `Rango:  ${arma.rango}`),
                panel.agregarTexto(x + 205, y + 70, `Daño:  ${arma.daño}`),
                panel.agregarTexto(x + 205, y + 100, `Cadencia disparo:  1 cada ${arma.cadenciaDisparo} segundos`),
                panel.agregarTexto(x + 205, y + 130, `Cantidad municiones:  ${arma.cantidadMuniciones} / ${arma.cantidadMuniciones}`),
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
                        this.cursorMira.setVisible(false);
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
           this.cursorMira.setPosition(this.escena.input.activePointer.worldX, this.escena.input.activePointer.worldY);

            if(this.xInicial != this.objetivo.x || this.yInicial != this.objetivo.y) {    
                this.indicadorCombustible.setVisible(true);
                this.indicadorCombustible.setText(`COMBUSTIBLE BISMARCK: ${this.combustible}`);
            }

            this.armas.forEach((arma) => {
                if (arma.rangoAtaque) {
                    arma.rangoAtaque.destroy();
                    
                    if (arma.lineaAtaque) {
                        arma.lineaAtaque.destroy();
                    }
                }
            });
    
            if (this.armaSeleccionada) {
                if(this.armaSeleccionada.nombre === "Antiaereo pesado 1")
                {
                    this.armaSeleccionada.dibujarRangoAtaque(this.escena, this.cursorMira, this.popa.x, this.popa.y);
                } else if (this.armaSeleccionada.nombre === "Antiaereo pesado 2") {
                    this.armaSeleccionada.dibujarRangoAtaque(this.escena, this.cursorMira, this.proa.x, this.proa.y);
                } else {
                    this.armaSeleccionada.dibujarRangoAtaque(this.escena, this.cursorMira, this.objetivo.x, this.objetivo.y);
                }
                
            }
        }
        this.updateHitboxes();
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
                // this.x = this.objetivo.x;
                // this.y = this.objetivo.y;
                // this.angulo = this.objetivo.angle;
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
