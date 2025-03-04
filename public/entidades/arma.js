class Arma {
    constructor({ nombre, rango, velocidad, daño, cadenciaDisparo, cantidadMuniciones, origenX, origenY }) {
        this.nombre = nombre;
        this.rango = rango;
        this.velocidad = velocidad;
        this.daño = daño;
        this.cadenciaDisparo = cadenciaDisparo; // Disparo cada x cantidad de segundos
        this.cantidadMuniciones = cantidadMuniciones;
        this.disparoActivado = false;
        // this.origenX = origenX;
        // this.origenY = origenY;
    }

    dibujarRangoAtaque(escena, cursorMira, x, y, destX, destY) {
        this.escena = escena;
        this.rangoAtaque = escena.add.circle(
            x,
            y,
            this.rango,
            0x00ff00,
            0.2
        ).setStrokeStyle(2, 0x00ff00).setOrigin(0.5, 0.5); // .setOrigin(this.origenX, this.origenY);

        const circulo = new Phaser.Geom.Circle(x, y, this.rango);
        
        if (circulo.contains(escena.input.activePointer.worldX, escena.input.activePointer.worldY)) {
            cursorMira.setVisible(true);
            const colorLinea = this.disparoActivado ? 0xff0000 : 0xffffff;
            this.lineaAtaque = escena.add.line(0, 0, x, y, destX, destY,  colorLinea).setOrigin(0);
            
        } else {
            cursorMira.setVisible(false);
        }
    }

    //dibujarLineaAtaque(

    dispararArma(origenX, origenY, destX, destY) {
        console.log(`Disparando arma desde (${origenX}, ${origenY}) hacia (${destX}, ${destY})`);
        
        const proyectil = this.escena.physics.add.sprite(origenX, origenY, "proyectil");
        this.escena.proyectiles.add(proyectil);
        proyectil.daño = this.daño;
        
        console.log(`Proyectil creado en (${proyectil.x}, ${proyectil.y}) con daño ${proyectil.daño}`);
        this.escena.physics.moveTo(proyectil, destX, destY, this.velocidad);
        
      
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
        
    }
}

export default Arma;
