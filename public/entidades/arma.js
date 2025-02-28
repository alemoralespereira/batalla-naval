class Arma {
    constructor(nombre, calibre, rango, daño, cadenciaDisparo) {
        this.nombre = nombre;
        this.calibre = calibre;
        this.rango = rango;
        this.daño = daño;
        this.cadenciaDisparo = cadenciaDisparo;
    }

    rangoContienePuntero() {
        return 
    }

    dibujarRangoAtaque(escena, x, y) {
        this.rangoAtaque = escena.add.circle(
            x,
            y,
            this.rango,
            0x00ff00,
            0.2
        ).setStrokeStyle(2, 0x00ff00);

        const circulo = new Phaser.Geom.Circle(x, y, this.rango);

        if (circulo.contains(escena.coordenadasCursor.x, escena.coordenadasCursor.y)) {
            console.log('TRUE');
        }
    }
}

export default Arma;
