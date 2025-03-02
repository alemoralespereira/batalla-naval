class Arma {
    constructor({ nombre, rango, daño, cadenciaDisparo, cantidadMuniciones, origenX, origenY }) {
        this.nombre = nombre;
        this.rango = rango;
        this.daño = daño;
        this.cadenciaDisparo = cadenciaDisparo; // Disparo cada x cantidad de segundos
        this.cantidadMuniciones = cantidadMuniciones;
        // this.origenX = origenX;
        // this.origenY = origenY;
    }

    dibujarRangoAtaque(escena, cursorMira, x, y, destX, destY) {
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
            this.lineaAtaque = escena.add.line(0, 0, x, y, destX, destY,  0xffffff).setOrigin(0);
            cursorMira.on('pointerdown', () => {
                this.dispararArma(destX, destY);
            });
        } else {
            cursorMira.setVisible(false);
        }
    }

    dibujarLineaAtaque(

    dispararArma(destX, destY) {
        const torpedo = this.escena.physics.add.sprite(this.x, this.y, "torpedo");
        
        this.escena.physics.moveTo(torpedo, destX, destY, 50);
    
        // Guardar referencia para manejar colisiones
        this.torpedos.push(torpedo);
    
        // Desactivar modo de ataque
        this.torpedoActivo = false;
        this.cursorMira.setVisible(false);
    
        // Detectar colisión con el barco
        this.escena.physics.add.overlap(torpedo, this.escena.barco, (torpedo, barco) => {
            this.impactoTorpedo(torpedo, barco);
        });
        }
}

export default Arma;
