import Entity from './entity.js';
import socket from '../socket.js';
import Arma from "./arma.js";

class Avion extends Entity {
    constructor(avionData, numeroAvion) {
        super(
            Number(avionData.x), //xInicial
            Number(avionData.y), //yInicial
            avionData.velocidad,
            avionData.velocidadMaxima,
            Number(avionData.angulo),
            avionData.aceleracion,
            avionData.combustible,
        );
        this.sonidoMotor = null;
        this.piloto = Boolean(avionData.piloto);
        this.observador = Boolean(avionData.observador);
        this.operador = Boolean(avionData.operador);
        this.seleccionado = Boolean(avionData.seleccionado);
        this.numeroAvion = avionData.numeroAvion;
        this.torpedo = Boolean(avionData.torpedo);
        this.multiplicadorCombustible = avionData.multiplicadorCombustible;
        this.despego = Boolean(avionData.despego);
        this.salud = avionData.salud;
        this.arma = null;
    }
    

    init(escena) {
        this.escena = escena;

       // Cargar el sonido del motor del avión
        this.sonidoMotor = this.escena.sound.add('motoravion', { loop: true, volume: 0.5 });

        if (!this.sonidoMotor.isPlaying) {
            this.sonidoMotor.play(); // Inicia el sonido del motor al despegar
        }


        this.arma = new Arma({
            nombre: "Torpedo avion",
            rango: 500,
            velocidad: 300,
            daño: 5,
            cadenciaDisparo:0,
            cantidadMuniciones:1,
            escena: this.escena
            });

        //this.torpedo = true;  // Cada avión obtiene un torpedo al despegar
        console.log(`Inicializando avion_${this.numeroAvion} con x=${this.xInicial}, y=${this.yInicial}`);
        if (this.objeto) {
            // Si el sprite ya existe, actualiza su posición
            this.objeto.x = this.escena.entidades.portaaviones.objeto.x;
            this.objeto.y = this.escena.entidades.portaaviones.objeto.y;
            this.objeto.angle = this.escena.entidades.portaaviones.objeto.angle;

        } else {
            this.objeto = escena.physics.add.sprite(this.xInicial, this.yInicial, "avion").setScale(0.2).setOrigin(0.5, 0.5);
            //this.objeto.setVisible(true);
            if(this.velocidad > 0) {
                // Calcular nueva velocidad
            const angle = this.anguloInicial;
            const velocityX = Math.cos(angle) * this.velocidad;
            const velocityY = Math.sin(angle) * this.velocidad;

            // Actualizar las posiciones
            this.objeto.setVelocityX(velocityX);
            this.objeto.setVelocityY(velocityY);
            this.objeto.angle = this.anguloInicial;
            }
            

            console.log(`Sprite creado para avion_${this.numeroAvion} en x=${this.objeto.x}, y=${this.objeto.y}`);
            this.rangoVision = escena.add.zone(this.xInicial, this.yInicial, 250, 250).setOrigin(0.5, 0.5);
            this.objeto.rangoVision = this.rangoVision;
        

            
            this.graphics = escena.add.graphics();
            this.dibujarRangoVision();
            this.indicadorCombustible = escena.add.text(10, (460 + (this.numeroAvion * 30)), `COMBUSTIBLE:  ${this.combustible}`,{
                fontSize: '20px',
                fill: '#ffffff'
            });
            this.escena.camaraMinimapa.ignore(this.indicadorCombustible);
            this.indicadorCombustible.setVisible(false);
            this.indicadorCombustible.setScrollFactor(0); 
        }      
        //this.objeto.numeroAvion = this.numeroAvion;
        //this.objeto.piloto = this.piloto;
        //this.objeto.despego = this.despego;
        super.init(escena);

    }

    disparar(){
        const anguloRad = Phaser.Math.DegToRad(this.objeto.angle);
        const destinoX = this.objeto.x + Math.cos(anguloRad) * this.arma.rango;
        const destinoY = this.objeto.y + Math.sin(anguloRad) * this.arma.rango;

        console.log(`Avión ${this.numeroAvion} disparando torpedo.`);
        this.escena.sound.play('disparoAvion'); // Reproducir sonido de disparo
        this.arma.dispararArma(this.objeto.x, this.objeto.y, destinoX, destinoY,this);

        this.torpedo = false; // Torpedo agotado hasta recargar
    }

   /* recargar(){
        console.log(`Avión ${this.numeroAvion} recargando torpedo.`);
        this.torpedo = true;
    }*/

    recibirDaño(daño) {
        this.salud -= daño;
        console.log("Daño recibido: ", daño, " Salud actual: ", this.salud);

        if (this.salud <= 0) {
            this.escena.sound.play('explosion');
            this.salud = 0;
            const nombreEntidad = `avion_${this.numeroAvion}`;
            this.objeto.destroy();
            this.objeto = null;
            this.escena.equipoAzul = this.escena.equipoAzul.filter((a) => a.numeroAvion !== this.numeroAvion);

            if (this.escena.rol === "portaaviones") {
                this.escena.botonesAviones[this.numeroAvion - 1].setBackgroundColor('rgba(195, 19, 19, 0.9)');
                this.escena.botonesAviones[this.numeroAvion - 1].disableInteractive();
                //this.avion.indicadorCombustible.setVisible(false);
            }

            delete this.escena.entidades[nombreEntidad];

            if (this.escena.equipoAzul.length === 1) {
                this.escena.victoriaBismarck();
            }
        }
    }
   
    dibujarRangoVision() {
        this.graphics.clear();
        this.graphics.lineStyle(2, 0x0000FF); 
        const bounds = this.rangoVision.getBounds();
        this.graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    calcularRangoVision() {
        if (this.observador) {
            this.rangoVision.width = 500; // el doble de cuando se crea la "zone"
            this.rangoVision.height = 500;
        }
    }

    calcularAlcanceVuelo() {
        this.multiplicadorCombustible = 1; // 3 / 3;

        if (this.observador) {
            this.multiplicadorCombustible -= 1 / 3;  // 2 / 3;
        }

        if (this.operador) {
            this.multiplicadorCombustible -= 1 / 3; // 1 / 3;
        }

        // Se disminuye el combustible total para facilitar los calculos de alcance máximo según los tripulantes
        this.combustible = this.combustible * this.multiplicadorCombustible;
    }

    update() {
        super.update();

        if (this.escena.controles.disparo.isDown && this.escena.nombreEntidadSeleccionada === `avion_${this.numeroAvion}`) {
            // No puede disparar sin munición
            if (this.torpedo) {
                this.disparar();
                socket.emit("disparar", { 
                    nombreEntidad: `avion_${this.numeroAvion}`, 
                    sala: this.escena.sala,
                });
            }
        }

        this.rangoVision.setPosition(this.objeto.x, this.objeto.y);
        this.dibujarRangoVision();
       if(this.escena.rol === "portaaviones") {
            //Si esta seleccionado o si se esta moviendo pero tiene piloto.
            if(this.seleccionado || ((this.xInicial != this.objeto.x || this.yInicial != this.objeto.y) && this.piloto)) {    
                this.indicadorCombustible.setVisible(true);
                // El jugador ve que todos los aviones tienen el mismo combustible maximo pero cuanto más tripulantes más rápido se consume
                const combustible = Math.floor(Math.max(this.combustible, 0) / this.multiplicadorCombustible);
                this.indicadorCombustible.setText(`COMBUSTIBLE: ${combustible}`);
            }
        }
        
        //Si la diferencia entre la posicion del avion y la posicion del portaaviones sobre el eje de las X, es mayor a 150, es porque despegó.
        if((this.objeto.x - this.escena.entidades.portaaviones.objeto.x) > 250) {          
            this.despego = true;
            //this.objeto.despego = true;
        }     

        //this.piloto = this.objeto.piloto;
        //this.despego = this.objeto.despego;
        //this.objeto.piloto = this.piloto;
        //this.objeto.despego = this.despego;
       
        if(this.piloto && this.escena.rol === "portaaviones"){
        //    console.log("Avion:" , this.numeroAvion);
            const datosMovimiento = {
                //idUsuario: socket.id, // ID del socket
                nombreUsuario: this.escena.nombreUsuario,
                rol: this.escena.rol,
                sala: this.escena.sala,
                nombreEntidad: `avion_${this.numeroAvion}`,
                x: this.objeto.x,
                y: this.objeto.y,
                angulo: this.objeto.angle
            };
            // Enviar al servidor
            socket.emit("moverEntidad", datosMovimiento);
        }

        if(this.combustible <= 0) {
            this.salud = 0;
            
            this.splash = this.escena.add.image(this.objeto.x, this.objeto.y, "splash");
            this.escena.time.delayedCall(200, () => {
                this.splash.destroy();
            });
            
            const nombreEntidad = `avion_${this.numeroAvion}`;
            this.objeto.destroy();
            this.objeto = null;
            this.escena.equipoAzul = this.escena.equipoAzul.filter((a) => a.numeroAvion !== this.numeroAvion);
            
            if (this.escena.rol === "portaaviones") {
                this.escena.botonesAviones[this.numeroAvion - 1].setBackgroundColor('rgba(195, 19, 19, 0.9)');
                this.escena.botonesAviones[this.numeroAvion - 1].disableInteractive();
            }

            delete this.escena.entidades[nombreEntidad];
        }
           
      //  console.log(`Avion_${this.numeroAvion} posición: (${this.objeto.x}, ${this.objeto.y})`);
    }

    mover(controles) {
        if (!this.objeto) {
            console.error(`Sprite no encontrado para la entidad`);
            return;
        }
        this.calcularCombustible();

        if (this.combustible > 0 && this.piloto) {
            // Movimiento con las teclas W, A, S, D
            if (controles.izquierda.isDown || controles.derecha.isDown || controles.arriba.isDown) {
                
                // Rotación (A y D)
                if (controles.izquierda.isDown) {
                    this.objeto.setAngularVelocity(-40);
                } else if (controles.derecha.isDown) {
                    this.objeto.setAngularVelocity(40);
                } else {
                    this.objeto.setAngularVelocity(0);
                }

                // Aceleración (W)
                if (controles.arriba.isDown) {
                    this.velocidad = Math.min(this.velocidad + this.aceleracion, this.velocidadMaxima);
                }
            } else {
                this.objeto.setAngularVelocity(0);
            }
            if(this.velocidad > 0) {
                // Calcular nueva velocidad
                const angle = Phaser.Math.DegToRad(this.objeto.angle);
                const velocityX = Math.cos(angle) * this.velocidad;
                const velocityY = Math.sin(angle) * this.velocidad;

                // Actualizar las posiciones
                this.objeto.setVelocityX(velocityX);
                this.objeto.setVelocityY(velocityY);
            }
        } else {
            this.objeto.setAngularVelocity(0);
            this.objeto.setVelocityX(0);
            this.objeto.setVelocityY(0);
            }

       

                // Actualizar las posiciones internas
                // this.x = this.objeto.x;
                // this.y = this.objeto.y;
                // this.angulo = this.objeto.angle;
            
    }
}

export default Avion;
