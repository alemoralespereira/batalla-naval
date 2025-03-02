import Entity from './entity.js';
import socket from '../socket.js';

class Avion extends Entity {
    constructor(avionData, numeroAvion) {
        super(
            avionData.x,
            avionData.y,
            avionData.velocidad,
            avionData.velocidadMaxima,
            avionData.angulo,
            avionData.aceleracion,
            avionData.objetivo,
            avionData.combustible,
            avionData.salud
        );
        this.piloto = avionData.piloto;
        this.observador = avionData.observador;
        this.operador = avionData.operador;
        this.seleccionado = false;
        this.numeroAvion = numeroAvion;
        this.torpedo = true;
        this.multiplicadorCombustible = 1;
        this.despego = false;
    }

    init(escena) {
        this.escena = escena; 
        if (this.objetivo) {
            // Si el sprite ya existe, actualiza su posición
            this.objetivo.x = this.escena.entidades.portaaviones.x;
            this.objetivo.y = this.escena.entidades.portaaviones.y;
            this.objetivo.angle = this.escena.entidades.portaaviones.angulo;
        } else {
            this.objetivo = escena.physics.add.sprite(this.x, this.y, "avion").setScale(0.2).setOrigin(0.5, 0.5);
            this.rangoVision = escena.add.zone(this.x, this.y, 250, 250).setOrigin(0.5, 0.5);
            this.objetivo.rangoVision = this.rangoVision;
     
            
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
        this.objetivo.numeroAvion = this.numeroAvion;
        this.objetivo.piloto = this.piloto;
        this.objetivo.despego = this.despego;
        super.init(escena);

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
        this.rangoVision.setPosition(this.objetivo.x, this.objetivo.y);
       // this.dibujarRangoVision();
       if(this.escena.rol === "portaaviones") {
            //Si esta seleccionado o si se esta moviendo pero tiene piloto.
            if(this.seleccionado || ((this.x != this.objetivo.x || this.y != this.objetivo.y) && this.piloto)) {    
                this.indicadorCombustible.setVisible(true);
                // El jugador ve que todos los aviones tienen el mismo combustible maximo pero cuanto más tripulantes más rápido se consume
                const combustible = Math.floor(Math.max(this.combustible, 0) / this.multiplicadorCombustible);
                this.indicadorCombustible.setText(`COMBUSTIBLE: ${combustible}`);
            }
        }
        
        //Si la diferencia entre la posicion del avion y la posicion del portaaviones sobre el eje de las X, es mayor a 150, es porque despegó.
        if((this.objetivo.x - this.escena.entidades.portaaviones.x) > 250) {          
            this.despego = true;
            this.objetivo.despego = true;
        }     

        this.objetivo.piloto = this.piloto;
        this.objetivo.despego = this.despego;
       
        if(this.piloto){
        //    console.log("Avion:" , this.numeroAvion);
            const datosMovimiento = {
                //idUsuario: socket.id, // ID del socket
                nombreUsuario: this.escena.nombreUsuario,
                rol: this.escena.rol,
                sala: this.escena.sala,
                nombreEntidad: `avion_${this.numeroAvion}`,
                x: this.objetivo.x,
                y: this.objetivo.y,
                angulo: this.objetivo.angle
            };
            // Enviar al servidor
            socket.emit("moverEntidad", datosMovimiento);
        }
    }

    mover(controles) {
        if (!this.objetivo) {
            console.error(`Sprite no encontrado para la entidad`);
            return;
        }
        this.calcularCombustible();

        if (this.combustible > 0 && this.piloto) {
            // Movimiento con las teclas W, A, S, D
            if (controles.izquierda.isDown || controles.derecha.isDown || controles.arriba.isDown) {
                
                // Rotación (A y D)
                if (controles.izquierda.isDown) {
                    this.objetivo.setAngularVelocity(-40);
                } else if (controles.derecha.isDown) {
                    this.objetivo.setAngularVelocity(40);
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

export default Avion;