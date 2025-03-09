import Panel from '../ui/panel.js';
import Entidad from './entidad.js';
import Arma from './arma.js';
import Avion from './avion.js';
import socket from '../socket.js';

class Bismarck extends Entidad {
    constructor(bismarckData) {
        super(
            Number(bismarckData.x), //xInicial
            Number(bismarckData.y), //yInicial
            bismarckData.velocidad,
            bismarckData.velocidadMaxima,
            Number(bismarckData.angulo),
            bismarckData.aceleracion,
            bismarckData.combustible,
        );
        this.salud = bismarckData.salud;
        this.armas = []
        this.armaSeleccionada = null;
        this.cursorMira = null;
        this.indicadorSalud = null;
        this.sonidoMotor = null;
    }

    init(escena) {
        this.escena = escena;

        this.sonidoMotor = this.escena.sound.add('barco', { loop: true, volume: 0.4 });

        this.objeto = escena.physics.add.sprite(this.xInicial, this.yInicial, "bismarck").setOrigin(0.5, 0.5);
        this.objeto.body.setCircle(40, 210, 85);
        this.objeto.setVisible(true);
        this.objeto.setCollideWorldBounds(true);
        //this.objeto.setBounce(1);

        this.proa = escena.physics.add.sprite(this.objeto.x, this.objeto.y, null).setOrigin(0.5, 0.5);
        this.proa.body.setCircle(40, -25, -25);
        this.proa.setVisible(false);

        this.popa = escena.physics.add.sprite(this.objeto.x, this.objeto.y, null).setOrigin(0.5, 0.5);
        this.popa.body.setCircle(40, -25, -25);
        this.popa.setVisible(false);

        this.helices = escena.physics.add.sprite(this.objeto.x, this.objeto.y, null).setOrigin(0.5, 0.5);
        this.helices.body.setSize(10,10);
        this.helices.setVisible(false);

        this.updateHitboxes();

        this.puntosDeColision = escena.add.group();
        this.puntosDeColision.addMultiple([this.objeto, this.proa, this.popa]);

        this.rangoVision = escena.add.zone(this.xInicial, this.yInicial, 500, 500).setOrigin(0.5, 0.5);
        this.objeto.rangoVision = this.rangoVision;
        //this.graphics = escena.add.graphics();
        //this.dibujarRangoVision();
        
        super.init(escena);

        this.armas = [
            new Arma({
                escena: this.escena,
                nombre: "Antiaereo pesado 1", 
                calibre: 38,
                rango: 300,
                velocidad: 150,
                daño: 1,
                cadenciaDisparo: 10,
                cantidadMuniciones: 5,
            }),
             new Arma({
                 escena: this.escena,
                 nombre: "Antiaereo pesado 2", 
                 calibre: 38,
                 rango: 300,
                 velocidad: 150,
                 daño: 1,
                 cadenciaDisparo: 10,
                 cantidadMuniciones: 5,
             }),
            new Arma({
                escena: this.escena,
                nombre: "Antiaereo ligero", 
                calibre: 19,
                rango: 250,
                velocidad: 250,
                daño: 0.5,
                cadenciaDisparo: 4,
                cantidadMuniciones: 10,
            })
        ];
    }

    updateHitboxes() {
        const angleRad = this.objeto.rotation;
        const offsetProa = 90; // Distancia desde el centro hacia la proa
        const offsetPopa = -85; // Distancia desde el centro hacia la popa
        const offsetHelices = -150; // Distancia desde el centro hacia las hélices

        // Posición de la proa
        this.proa.x = this.objeto.x + Math.cos(angleRad) * offsetProa;
        this.proa.y = this.objeto.y + Math.sin(angleRad) * offsetProa;
        this.proa.rotation = angleRad;

        // Posición de la popa
        this.popa.x = this.objeto.x + Math.cos(angleRad) * offsetPopa;
        this.popa.y = this.objeto.y + Math.sin(angleRad) * offsetPopa;
        this.popa.rotation = angleRad;

        // Posición de las hélices
        this.helices.x = this.objeto.x + Math.cos(angleRad) * offsetHelices;
        this.helices.y = this.objeto.y + Math.sin(angleRad) * offsetHelices;   
        this.helices.rotation = angleRad;
    }

    configurar() {
        const textosMuniciones = {};
    
        this.cursorMira = this.escena.add.image(0, 0, "mira")
            .setOrigin(0.5, 0.5)
            .setScale(0.2, 0.2)
            .setVisible(false)
            .setInteractive();

        this.indicadorCombustible = this.escena.add.text(-100, 760, `COMBUSTIBLE BISMARCK:  ${Math.max(this.combustible, 0)}`,{
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.escena.camaraMinimapa.ignore(this.indicadorCombustible);
        this.indicadorCombustible.setVisible(false);
        this.indicadorCombustible.setScrollFactor(0);

        this.indicadorSalud = this.escena.add.text(this.objeto.x, this.objeto.y - 30, `Vida: ${this.salud}`, {
            fontSize: "16px",
            fill: "#ff0000",
            fontWeight: "bold",
            backgroundColor: "#ffffff"
        }).setOrigin(0.5);
        
        this.cursorMira.on('pointerdown', () => {
            if (this.cursorMira.visible) {
                if(!this.armaSeleccionada.disparoActivado && this.armaSeleccionada.contadorMuniciones > 0) {
                    this.armaSeleccionada.disparoActivado = true;
                    this.escena.sound.play('disparoBismarck');
                    let origenX;
                    let origenY;
                    let angulo = null;

                    if(this.armaSeleccionada.nombre === "Antiaereo pesado 1") {
                        origenX = this.popa.x;
                        origenY = this.popa.y;
                        angulo = Phaser.Math.RadToDeg(this.calcularAngulo(this.popa.x, this.popa.y, this.cursorMira.x, this.cursorMira.y));
                        this.armaSeleccionada.dispararArma(this.popa.x, this.popa.y, angulo, this.cursorMira.x, this.cursorMira.y, "bismarck");
                    } else if (this.armaSeleccionada.nombre === "Antiaereo pesado 2") {
                        origenX = this.proa.x;
                        origenY = this.proa.y;
                        angulo = Phaser.Math.RadToDeg(this.calcularAngulo(this.proa.x, this.proa.y, this.cursorMira.x, this.cursorMira.y));
                        this.armaSeleccionada.dispararArma(this.proa.x, this.proa.y, angulo, this.cursorMira.x, this.cursorMira.y, "bismarck");
                    } else {
                        origenX = this.objeto.x;
                        origenY = this.objeto.y;
                        angulo = Phaser.Math.RadToDeg(this.calcularAngulo(this.objeto.x, this.objeto.y, this.cursorMira.x, this.cursorMira.y));
                        this.armaSeleccionada.dispararArma(this.objeto.x, this.objeto.y, angulo, this.cursorMira.x, this.cursorMira.y, "bismarck");
                    }

                    textosMuniciones[this.armaSeleccionada.nombre].setText(`Cantidad municiones:  ${this.armaSeleccionada.contadorMuniciones} / ${this.armaSeleccionada.cantidadMuniciones}`);

                    socket.emit("disparar", { 
                        nombreEntidad: "bismarck", 
                        sala: this.escena.sala,
                        nombreArma: this.armaSeleccionada.nombre,
                        origenX, 
                        origenY, 
                        destX: this.cursorMira.x,
                        destY: this.cursorMira.y,
                        angulo: this.angulo
                    });
                }
            }
        });

        // Configurar la cámara para seguir al Bismarck
        this.escena.cameras.main.startFollow(this.escena.entidades.bismarck.objeto);
        
        //Hacer invisibles los sprites y los puntos en el minimapa, del equipo Azul.
        this.escena.entidades.portaaviones.objeto.setVisible(false);
        this.escena.puntoPortaaviones.setVisible(false);
        this.escena.equipoAzul.forEach((avion) => {
            //console.log('Avion:', avion);
            //console.log('Objetivo del avion:', avion.objeto);
            avion.objeto.setVisible(false);
            if(avion instanceof Avion) {
                const nombreAvion = `avion_${avion.numeroAvion}`;
                this.escena.puntosAviones[nombreAvion].setVisible(false);
            }
        });

        const panel = new Panel(this.escena);
        const botonesArmas = {};

        // Botones para seleccionar armas biscmarck
        for (let i = 0; i < this.escena.entidades.bismarck.armas.length; i++) {
            const arma = this.escena.entidades.bismarck.armas[i];
            const x = -100;
            const y = 360 + i * 30;
            const botonArma = panel.agregarBoton(x, y, arma.nombre);
            this.escena.camaraMinimapa.ignore(botonArma);
            botonesArmas[arma.nombre] = botonArma;
            const cuadroInformativoAvion = this.escena.add.group();
            cuadroInformativoAvion.addMultiple([
                panel.agregarRectangulo(x + 200, y, 460, 160),
                panel.agregarTexto(x + 205, y + 10, `Rango:  ${arma.rango}m`),
                panel.agregarTexto(x + 205, y + 40, `Velocidad disapro:  ${arma.velocidad}m/s`),
                panel.agregarTexto(x + 205, y + 70, `Daño:  ${arma.daño}`),
                panel.agregarTexto(x + 205, y + 100, `Cadencia disparo:  1 cada ${arma.cadenciaDisparo} segundos`),
            ]);
            textosMuniciones[arma.nombre] = panel.agregarTexto(x + 205, y + 130, `Cantidad municiones:  ${arma.contadorMuniciones} / ${arma.cantidadMuniciones}`);
            cuadroInformativoAvion.add(textosMuniciones[arma.nombre]);
            this.escena.camaraMinimapa.ignore(cuadroInformativoAvion);
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

    calcularAngulo(origenX, origenY, destX, destY) {
        return Math.atan2(destY- origenY, destX - origenX);
    }

    disparar(origenX, origenY, angulo, destX, destY, nombreArma) {
        console.log(nombreArma);
        console.log(this.armas);
        const arma = this.armas.find((arma) => arma.nombre === nombreArma);
        
        arma.dispararArma(origenX, origenY, angulo, destX, destY, "bismarck");
    }

    update() {
        
        super.update();
        this.rangoVision.setPosition(this.objeto.x, this.objeto.y);

        if (this.objeto && this.indicadorSalud) {
            this.indicadorSalud.setPosition(this.objeto.x, this.objeto.y - 30); // Mantener indicador de vida en la posición del barco
        }

        // Si el barco está en movimiento, reproducir sonido del motor
        if (this.velocidad > 0 && !this.sonidoMotor.isPlaying) {
            this.sonidoMotor.play();
        }

        // Si el barco se detiene, detener el sonido del motor
        if (this.velocidad === 0 && this.sonidoMotor.isPlaying) {
            this.sonidoMotor.stop();
        }

        //this.dibujarRangoVision();
        this.updateHitboxes();
        if(this.escena.rol === "bismarck") {
            const coordenadasMouse = this.escena.getCoordenadasMouse();
           this.cursorMira.setPosition(coordenadasMouse.x, coordenadasMouse.y);

            //if(this.xInicial != this.objeto.x || this.yInicial != this.objeto.y) {    
            if(this.velocidad > 0) {
                // console.log("Adentro del if velocidad: ", this.velocidad);    
                this.indicadorCombustible.setVisible(true);
                this.indicadorCombustible.setText(`COMBUSTIBLE BISMARCK: ${Math.max(this.combustible, 0)}`);
            }

            /*if(this.vida > 0) {
                this.indicadorSalud.setVisible(true);
            }*/

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
                    this.armaSeleccionada.dibujarRangoAtaque(this.cursorMira, this.popa.x, this.popa.y, this.cursorMira.x, this.cursorMira.y);
                } else if (this.armaSeleccionada.nombre === "Antiaereo pesado 2") {
                    this.armaSeleccionada.dibujarRangoAtaque(this.cursorMira, this.proa.x, this.proa.y, this.cursorMira.x, this.cursorMira.y);
                } else {
                    this.armaSeleccionada.dibujarRangoAtaque(this.cursorMira, this.objeto.x, this.objeto.y, this.cursorMira.x, this.cursorMira.y);
                }
                
            }
        }
        
    }

    mover(controles) {
        if (!this.objeto) {
            console.error(`Sprite no encontrado para la entidad`);
            return;
        }
//        this.calcularCombustible();

        
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
            const mensaje = "Bismarck sin combutible";
            this.escena.victoriaEquipoAzul(mensaje);
        }
    }

    recibirDaño(daño) {
        this.escena.scene.get('EscenaAtaque').impactoBismarck = true;
        this.salud -= daño;
        console.log(`El Bismarck recibió ${daño} de daño. Salud restante: ${this.salud}`);

        // Actualizar el indicador de salud
        this.indicadorSalud.setText(`Vida: ${this.salud}`);
        this.indicadorSalud.setPosition(this.objeto.x, this.objeto.y - 30);

        if (this.salud <= 0) {
            this.salud = 0;
            console.log("Bismarck destruido!");
            this.escena.sound.play('explosion'); // Sonido de explosión
            this.objeto.destroy(); // Eliminar el barco si se queda sin salud
            this.objeto = null;

            delete this.escena.entidades["bismarck"];

            this.escena.victoriaEquipoAzul();
        }
    }
}

export default Bismarck;
