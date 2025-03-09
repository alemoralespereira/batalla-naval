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
        const coordenadasMouse = this.escena.getCoordenadasMouse();

        if (circulo.contains(coordenadasMouse.x, coordenadasMouse.y)) {
            cursorMira.setVisible(true);
            const colorLinea = this.disparoActivado ? 0xff0000 : 0xffffff;
            this.lineaAtaque = this.escena.add.line(0, 0, x, y, destX, destY,  colorLinea).setOrigin(0);
            
        } else {
            cursorMira.setVisible(false);
        }
    }

    dispararArma(origenX, origenY, destX, destY, entidadAtacante) {
        if(!this.escena){
            console.error("Error: La escena no está definida en el arma.");
            return;
        }

        this.escena.scene.get('EscenaAtaque').iniciarEscena({ escena: this.escena, entidadAtacante });
        
        console.log(`Disparando arma desde (${origenX}, ${origenY}) hacia (${destX}, ${destY})`);

        this.contadorMuniciones -= 1;

        const proyectil = this.escena.physics.add.sprite(origenX, origenY, "proyectil");
        this.escena.proyectiles.add(proyectil);
        proyectil.daño = this.daño;
        proyectil.nombre = this.nombre;
        
        console.log(`Proyectil creado en (${proyectil.x}, ${proyectil.y}) con daño ${proyectil.daño}`);
        this.escena.physics.moveTo(proyectil, destX, destY, this.velocidad);
        
        //Se multiplica la cadenciaDisparo en segundos por 1000 para convertirlo en milisegundos.
        this.escena.time.delayedCall(this.cadenciaDisparo*1000, () => {
            this.disparoActivado = false;
        });

        // Se calcula la duracion que le lleva al proyectil salir del rango de ataque segun su velocidad
        const duracion = (this.rango / this.velocidad) * 1000;
        console.log(`Duración del proyectil: ${duracion}`);
        this.escena.time.delayedCall(duracion, () => {
            proyectil.destroy();
        });
    }
}
export default Arma;
