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

       if (this.rol === "bismarck") {
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
       // this.dibujarRangoVision();
       if(this.escena.rol === "bismarck")
        {
         if(this.x != this.objetivo.x || this.y != this.objetivo.y)
             {    
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

}

export default Bismarck;
