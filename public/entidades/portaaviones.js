import Panel from '../ui/panel.js';
import Barco from './barco.js';

class Portaaviones extends Barco {
    constructor(portaavionesData) {
        super(
            portaavionesData.x,
            portaavionesData.y,
            portaavionesData.velocidad,
            portaavionesData.velocidadMaxima,
            portaavionesData.angulo,
            portaavionesData.aceleracion,
            portaavionesData.objetivo,
            portaavionesData.combustible,
            // portaavionesData.rangoVision
        );
        this.seleccionado = false;
    }

    init(escena) {
        this.escena = escena; 
        this.objetivo = escena.physics.add.sprite(this.x, this.y, "portaaviones").setScale(1.5).setOrigin(0.5, 0.5);
        this.rangoVision = escena.add.zone(this.x, this.y, 500, 500).setOrigin(0.5, 0.5);
        this.objetivo.rangoVision = this.rangoVision;
       // this.graphics = escena.add.graphics();
       // this.dibujarRangoVision();
       this.indicadorCombustible = escena.add.text(-100, 430, `COMBUSTIBLE PORTAAVIONES:  ${this.combustible}`,{
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.indicadorCombustible.setVisible(false);
        this.indicadorCombustible.setScrollFactor(0); 
        super.init(escena);
    }   

    configurar() {
        const panel = new Panel(this.escena);
        
        // Botón para seleccionar el portaaviones
        const botonPortaaviones = panel.agregarBoton(-100, 460, 'Portaaviones')
            .on('pointerdown', () => {
                this.escena.seleccionarEntidad('portaaviones');
            });
        panel.agregarBotonAlPanel(botonPortaaviones);

        // Botones para seleccionar los aviones
        for (let i = 1; i < 11; i++) {
            const botonAviones = panel.agregarBoton(-100, 460 + i * 30, `Avión ${i}`)
                .on('pointerdown', () => {
                    //this.escena.cambiarObjetivoCamara(`avion_${i}`);
                    this.escena.seleccionarEntidad(`avion_${i}`);

                    if (!this.escena.entidades[`avion_${i}`].piloto) {
                        const botonObservador = panel.agregarBoton(40, 460, 'Observador')
                            .on('pointerdown', () => {
                                this.escena.entidades[`avion_${i}`].observador = true;
                                botonObservador.setBackgroundColor('#00ff00');
                            });

                        const botonOperador = panel.agregarBoton(160, 460, 'Operador')
                            .on('pointerdown', () => {
                                this.escena.entidades[`avion_${i}`].operador = true;
                                botonOperador.setBackgroundColor('#00ff00');
                            });

                        const botonDespegar = panel.agregarBoton(260, 460, 'Despegar', '#00ff00')
                            .on('pointerdown', () => {
                                botonAviones.setBackgroundColor('#00ff00');
                                const avion = this.escena.entidades[`avion_${i}`];
                                avion.init(this.escena);
                                avion.piloto = true;
                                avion.calcularRangoVision();
                                avion.calcularAlcanceVuelo();
                                avion.objetivo.setVisible(true);
                                botonDespegar.setVisible(false);
                                botonOperador.setVisible(false);
                                botonObservador.setVisible(false);

                                //botonPiloto.setVisible(false);
                            });
                    }

                });
            panel.agregarBotonAlPanel(botonAviones);
        }

        //BISMARCK NO VISIBLE PARA EL EQUIPO AZUL.
        this.escena.entidades.bismarck.objetivo.setVisible(false);
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
       if(this.escena.rol === "portaaviones")
        {
         if(this.x != this.objetivo.x || this.y != this.objetivo.y)
             {    
                  this.indicadorCombustible.setVisible(true);
                  this.indicadorCombustible.setText(`COMBUSTIBLE PORTAAVIONES: ${this.combustible}`);
             }
        }
    }

}

export default Portaaviones;
