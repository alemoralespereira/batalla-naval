import Entity from './entity.js';
import socket from '../socket.js';

class Avion extends Entity {
    constructor(avionData, numeroAvion) {
        super(
            avionData.x, //xInicial
            avionData.y, //yInicial
            avionData.velocidad,
            avionData.velocidadMaxima,
            avionData.angulo,
            avionData.aceleracion,
            avionData.objeto,
            avionData.combustible,
        );
        this.piloto = avionData.piloto;
        this.observador = avionData.observador;
        this.operador = avionData.operador;
        this.seleccionado = false;
        this.numeroAvion = numeroAvion;
        this.torpedo = true;
        this.multiplicadorCombustible = 1;
        this.despego = false;
        this.salud = avionData.salud;
    }

    init(escena) {
        this.escena = escena; 
        if (this.objeto) {
            // Si el sprite ya existe, actualiza su posición
            this.objeto.x = this.escena.entidades.portaaviones.objeto.x;
            this.objeto.y = this.escena.entidades.portaaviones.objeto.y;
            this.objeto.angle = this.escena.entidades.portaaviones.objeto.angle;
        } else {
            this.objeto = escena.physics.add.sprite(this.xInicial, this.yInicial, "avion").setScale(0.2).setOrigin(0.5, 0.5);
            this.rangoVision = escena.add.zone(this.xInicial, this.yInicial, 250, 250).setOrigin(0.5, 0.5);
            this.objeto.rangoVision = this.rangoVision;
            
            
            // this.graphics = escena.add.graphics();
            // this.dibujarRangoVision();
            this.indicadorCombustible = escena.add.text(10, (460 + (this.numeroAvion * 30)), `COMBUSTIBLE:  ${this.combustible}`,{
                fontSize: '20px',
                fill: '#ffffff'
            });
            this.escena.camaraMinimapa.ignore(this.indicadorCombustible);
            this.indicadorCombustible.setVisible(false);
            this.indicadorCombustible.setScrollFactor(0); 
        }      
        this.objeto.numeroAvion = this.numeroAvion;
        this.objeto.piloto = this.piloto;
        this.objeto.despego = this.despego;
        super.init(escena);

    }

    recibirDaño(daño) {
        console.log("Daño recibido: ", daño);   
        this.salud -= daño;
        if (this.salud <= 0) {
            this.salud = 0;
         //   this.objeto.destroy();
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
        this.rangoVision.setPosition(this.objeto.x, this.objeto.y);
       // this.dibujarRangoVision();
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
        this.objeto.piloto = this.piloto;
        this.objeto.despego = this.despego;
       
        if(this.piloto){
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
            this.objeto.setAngularVelocity(0);
            this.objeto.setVelocityX(0);
            this.objeto.setVelocityY(0);
        }
    }
}

export default Avion;
