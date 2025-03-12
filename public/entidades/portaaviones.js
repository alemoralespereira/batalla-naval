import Panel from '../ui/panel.js';
import Entidad from './entidad.js';
import Avion from './avion.js';

class Portaaviones extends Entidad {
    constructor(portaavionesData) {
        super(
            portaavionesData.idEntidad,
            Number(portaavionesData.x), //xInicial
            Number(portaavionesData.y), //yInicial
            portaavionesData.velocidad,
            portaavionesData.velocidadMaxima,
            Number(portaavionesData.angulo),
            portaavionesData.aceleracion,
            portaavionesData.combustible,
        );
        this.seleccionado = portaavionesData.seleccionado;
    }

    init(escena) {
        this.escena = escena; 
        this.objeto = escena.physics.add.sprite(this.xInicial, this.yInicial, "portaaviones").setScale(1.5).setOrigin(0.5, 0.5);
        this.objeto.setCollideWorldBounds(true);
        //this.objeto.setBounce(1); 

        this.rangoVision = escena.add.zone(this.xInicial, this.yInicial, 500, 500).setOrigin(0.5, 0.5);
        this.objeto.rangoVision = this.rangoVision;
       // this.graphics = escena.add.graphics();
       // this.dibujarRangoVision();
       this.indicadorCombustible = escena.add.text(-100, 430, `COMBUSTIBLE PORTAAVIONES:  ${Math.max(this.combustible, 0)}`,{
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.escena.camaraMinimapa.ignore(this.indicadorCombustible);
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
                this.escena.cambiarObjetivoCamara('portaaviones');
            });
        panel.agregarBotonAlPanel(botonPortaaviones);
        this.escena.camaraMinimapa.ignore(botonPortaaviones);
        
        //Array para los botones
        this.escena.botonesAviones = [];
        // Botones para seleccionar los aviones
        for (let i = 1; i < 11; i++) {
            let botonAvion = panel.agregarBoton(-100, 460 + i * 30, `Avión ${i}`);
            botonAvion.numero = i;
            this.escena.botonesAviones.push(botonAvion);
            this.escena.camaraMinimapa.ignore(botonAvion);
            if(!this.escena.entidades[`avion_${i}`]){
                botonAvion.setBackgroundColor('rgba(195, 19, 19, 0.9)');
                botonAvion.disableInteractive();
            } else {
                botonAvion.on('pointerdown', () => {               
                    this.escena.seleccionarEntidad(`avion_${i}`);

                    if(this.escena.entidades[`avion_${i}`].piloto)
                        this.escena.cambiarObjetivoCamara(`avion_${i}`);

                    if(!this.escena.entidades[`avion_${i}`].piloto) {
                        if (this.escena.botonObservador) {
                            this.escena.camaraMinimapa.ignore(this.escena.botonObservador);
                            this.escena.botonObservador.setVisible(true);
                            this.escena.botonObservador.setBackgroundColor('#808080');
                            this.escena.entidades[`avion_${i}`].observador = false;
                        }
                        
                        if (this.escena.botonOperador) {
                            this.escena.camaraMinimapa.ignore(this.escena.botonOperador);
                            this.escena.botonOperador.setVisible(true);
                            this.escena.botonOperador.setBackgroundColor('#808080');
                            this.escena.entidades[`avion_${i}`].operador = false;
                        }
                        
                        if (this.escena.botonDespegar) {
                            this.escena.camaraMinimapa.ignore(this.escena.botonDespegar);
                            this.escena.botonDespegar.setVisible(true);
                        }
                    }
                });
            }
            panel.agregarBotonAlPanel(botonAvion);
        }

        this.escena.botonObservador = panel.agregarBoton(40, 460, 'Observador').setVisible(false);
        this.escena.botonObservador.on('pointerdown', () => {
            const entidadSeleccionada = this.escena.entidades[this.escena.nombreEntidadSeleccionada];

            if (entidadSeleccionada instanceof Avion) {   
                if (entidadSeleccionada.observador) {
                    entidadSeleccionada.observador = false;
                    this.escena.botonObservador.setBackgroundColor('#808080');
                } else {
                    entidadSeleccionada.observador = true;
                    this.escena.botonObservador.setBackgroundColor('#00ff00');
                }
            }
        });
        
        this.escena.botonOperador = panel.agregarBoton(160, 460, 'Operador').setVisible(false);
        this.escena.botonOperador.on('pointerdown', () => {
            const entidadSeleccionada = this.escena.entidades[this.escena.nombreEntidadSeleccionada];

            if (entidadSeleccionada instanceof Avion) {   
                if (entidadSeleccionada.operador) {
                    entidadSeleccionada.operador = false;
                    this.escena.botonOperador.setBackgroundColor('#808080');
                } else {
                    entidadSeleccionada.operador = true;
                    this.escena.botonOperador.setBackgroundColor('#00ff00');
                }
            }
        });

        this.escena.botonDespegar = panel.agregarBoton(260, 460, 'Despegar', '#00ff00').setVisible(false);
        this.escena.botonDespegar.on('pointerdown', () => {
            const entidadSeleccionada = this.escena.entidades[this.escena.nombreEntidadSeleccionada];
            
            if (entidadSeleccionada instanceof Avion) {   
                const botonAvion = this.escena.botonesAviones[entidadSeleccionada.numeroAvion - 1];
                botonAvion.setBackgroundColor('#00ff00');
                const avion = entidadSeleccionada;
                avion.piloto = true;
                avion.calcularRangoVision();
                avion.calcularAlcanceVuelo();
                avion.init(this.escena);
                avion.objeto.setVisible(true);     
                console.log(`Despegando ${this.escena.nombreEntidadSeleccionada} desde (${this.objeto.x}, ${this.objeto.y}) a (${avion.objeto.x}, ${avion.objeto.y})`);                                                   
                this.escena.botonDespegar.setVisible(false);
                this.escena.botonOperador.setVisible(false);
                this.escena.botonObservador.setVisible(false);
                this.escena.cambiarObjetivoCamara(this.escena.nombreEntidadSeleccionada);
                this.escena.puntosAviones[`avion_${avion.numeroAvion}`].setVisible(true);
            }
        });

        //BISMARCK NO VISIBLE PARA EL EQUIPO AZUL.
        this.escena.entidades.bismarck.objeto.setVisible(false);
        this.escena.puntoBismarck.setVisible(false);
        this.escena.entidades.bismarck.indicadorSalud.setVisible(false);
    }
    
    
    dibujarRangoVision() {
        this.graphics.clear();
        this.graphics.lineStyle(2, 0xff0000);
        const bounds = this.rangoVision.getBounds();
        this.graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    update() {
        super.update();
        this.rangoVision.setPosition(this.objeto.x, this.objeto.y);
       // this.dibujarRangoVision();
       if(this.escena.rol === "portaaviones") {
            if(this.xInicial != this.objeto.x || this.yInicial != this.objeto.y) {    
                this.indicadorCombustible.setVisible(true);
                this.indicadorCombustible.setText(`COMBUSTIBLE PORTAAVIONES: ${Math.max(this.combustible, 0)}`);
            }   
        }       
    }

    mover(controles) {
        if (!this.objeto) {
            console.error(`Sprite no encontrado para la entidad`);
            return;
        }
    //    this.calcularCombustible();

        if(this.combustible > 0) {

            // Movimiento con las teclas W, A, S, D
            if (controles.izquierda.isDown || controles.derecha.isDown || controles.arriba.isDown || controles.abajo.isDown) {
                // Rotación (A y D)
                if (controles.izquierda.isDown) {
                    this.objeto.setAngularVelocity(-25);
                } else if (controles.derecha.isDown) {
                    this.objeto.setAngularVelocity(25);
                } else {
                    this.objeto.setAngularVelocity(0);
                }

                // Aceleración (W y S)
                if (controles.arriba.isDown) {
                    this.velocidad = Math.min(this.velocidad + this.aceleracion, this.velocidadMaxima);
                } else if (controles.abajo.isDown) {
                    this.velocidad = Math.max(this.velocidad - this.aceleracion, -this.velocidadMaxima);
                }

                // Calcular nueva velocidad
                const angle = Phaser.Math.DegToRad(this.objeto.angle);
                const velocityX = Math.cos(angle) * this.velocidad;
                const velocityY = Math.sin(angle) * this.velocidad;

                // Actualizar las posiciones
                this.objeto.setVelocityX(velocityX);
                this.objeto.setVelocityY(velocityY);

                // Actualizar las posiciones internas
                // this.x = this.objeto.x;
                // this.y = this.objeto.y;
                // this.angulo = this.objeto.angle;
        
            } else {
                this.objeto.setAngularVelocity(0);
            }
        } else {
            this.objeto.setAngularVelocity(0);  // Detener rotación también cuando el combustible sea 0
            this.objeto.setVelocityX(0);        // Detener movimiento horizontal
            this.objeto.setVelocityY(0);
        }
    }



}

export default Portaaviones;
