import Bismarck from './bismarck.js';

class Arma {
    constructor({ nombre, rango, velocidad, daño, cadenciaDisparo, cantidadMuniciones, escena }) {
        this.nombre = nombre;
        this.rango = rango;
        this.velocidad = velocidad;
        this.daño = daño;
        this.cadenciaDisparo = cadenciaDisparo; // Disparo cada x cantidad de segundos
        this.cantidadMuniciones = cantidadMuniciones;
        this.contadorMuniciones = cantidadMuniciones;
        this.disparoActivado = false;
        this.escena = escena;
    }

    dibujarRangoAtaque(cursorMira, x, y, destX, destY) {
        this.rangoAtaque = this.escena.add.circle(
            x,
            y,
            this.rango,
            0x00ff00,
            0.2
        ).setStrokeStyle(2, 0x00ff00).setOrigin(0.5, 0.5); // .setOrigin(this.origenX, this.origenY);

        const circulo = new Phaser.Geom.Circle(x, y, this.rango);
        
        if (circulo.contains(this.escena.input.activePointer.worldX, this.escena.input.activePointer.worldY)) {
            cursorMira.setVisible(true);
            const colorLinea = this.disparoActivado ? 0xff0000 : 0xffffff;
            this.lineaAtaque = this.escena.add.line(0, 0, x, y, destX, destY,  colorLinea).setOrigin(0);
            
        } else {
            cursorMira.setVisible(false);
        }
    }

    //dibujarLineaAtaque(

    dispararArma(origenX, origenY, destX, destY, avionDisparador=null) {
        if(!this.escena){
            console.error("Error: La escena no está definida en el arma.");
            return;
            }

        console.log(`Disparando arma desde (${origenX}, ${origenY}) hacia (${destX}, ${destY})`);

        this.contadorMuniciones -= 1;

        const proyectil = this.escena.physics.add.sprite(origenX, origenY, "proyectil");
        this.escena.proyectiles.add(proyectil);
        proyectil.daño = this.daño;
        
        console.log(`Proyectil creado en (${proyectil.x}, ${proyectil.y}) con daño ${proyectil.daño}`);
        this.escena.physics.moveTo(proyectil, destX, destY, this.velocidad);

        // Si el disparo es del Bismarck, reproducir su sonido
        if (avionDisparador && avionDisparador instanceof Bismarck) {
        this.escena.sound.play('disparoBismarck');
        }
      
        //proyectil.destroy();
        //Se multiplica la cadenciaDisparo en segundos por 1000 para convertirlo en milisegundos.
        this.escena.time.delayedCall(this.cadenciaDisparo*1000, () => {
            this.disparoActivado = false;
        });

        //
        const duracion = (this.rango / this.velocidad) * 1000;
        console.log(`Duración del proyectil: ${duracion}`);
        this.escena.time.delayedCall(duracion, () => {
            proyectil.destroy();
        });

    // **Colisión con el Bismarck**
    if (this.escena.entidades.bismarck) {
        const bismarck = this.escena.entidades.bismarck; // Obtener la instancia real del Bismarck
        this.escena.physics.add.overlap(proyectil, bismarck.objeto, (proy, obj) => {
        console.log("Torpedo impactó al Bismarck!");

        if (typeof bismarck.recibirDaño === "function") {
            bismarck.recibirDaño(proyectil.daño);
            proy.destroy(); // Eliminar el proyectil tras la colisión
        } else {
            console.error("Error: Bismarck no tiene el método recibirDaño()");
        }
    });
    }

    // **Evitar que el proyectil impacte contra el avión que lo disparó**
    if (avionDisparador) {
        proyectil.body.checkCollision.none = true; // Evita la colisión con todo por unos milisegundos
        this.escena.time.delayedCall(200, () => {
            proyectil.body.checkCollision.none = false; // Reactivar colisiones después de 0.2 segundos
        });

        this.escena.physics.add.collider(proyectil, avionDisparador.objeto, (proy, avion) => {
            console.log(`Proyectil ignorado por el avión ${avionDisparador.numeroAvion}`);
        }, null, this);
    }

    }
}
export default Arma;
