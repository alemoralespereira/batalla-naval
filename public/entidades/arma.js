class Arma {
    constructor({ nombre, calibre, rango, daño, cadenciaDisparo, cantidadMuniciones, origenX, origenY }) {
        this.nombre = nombre;
        this.calibre = calibre;
        this.rango = rango;
        this.daño = daño;
        this.cadenciaDisparo = cadenciaDisparo; // Disparo cada x cantidad de segundos
        this.cantidadMuniciones = cantidadMuniciones;
        // this.origenX = origenX;
        // this.origenY = origenY;
    }

    dibujarRangoAtaque1(escena, cursorMira, x, y) {
        this.rangoAtaque1 = escena.add.circle(
            x,
            y,
            this.rango,
            0x00ff00,
            0.2
        ).setStrokeStyle(2, 0x00ff00).setOrigin(0.5, 0.5); // .setOrigin(this.origenX, this.origenY);

        const circulo = new Phaser.Geom.Circle(x, y, this.rango);

        if (circulo.contains(escena.input.activePointer.worldX, escena.input.activePointer.worldY)) {
            cursorMira.setVisible(true);

            this.lineaAtaque1 = escena.add.line(0, 0, x, y, cursorMira.x, cursorMira.y,  0xffffff).setOrigin(0);
        } else {
            cursorMira.setVisible(false);
        }
    }
    dibujarRangoAtaque2(escena, cursorMira, x, y) {
        this.rangoAtaque2 = escena.add.circle(
            x,
            y,
            this.rango,
            0x00ff00,
            0.2
        ).setStrokeStyle(2, 0x00ff00).setOrigin(0.5, 0.5); // .setOrigin(this.origenX, this.origenY);

        const circulo = new Phaser.Geom.Circle(x, y, this.rango);

        if (circulo.contains(escena.input.activePointer.worldX, escena.input.activePointer.worldY)) {
            cursorMira.setVisible(true);

            this.lineaAtaque2 = escena.add.line(0, 0, x, y, cursorMira.x, cursorMira.y,  0xffffff).setOrigin(0);
        } else {
            cursorMira.setVisible(false);
        }
    }
}

export default Arma;
