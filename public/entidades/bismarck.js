import Barco from './barco.js';

class Bismarck extends Barco {
    constructor(bismarckData) {
        super(
            bismarckData.x,
            bismarckData.y,
            bismarckData.velocidad,
            bismarckData.velocidadMaxima,
            bismarckData.angulo,
            bismarckData.aceleracion,
            bismarckData.objetivo,
            bismarckData.combustible,
        );
    }

    init(escena) {
        this.objetivo = escena.physics.add.sprite(this.x, this.y, "bismarck").setScale(0.8).setOrigin(0.5, 0.5);

        this.rangoVision = escena.add.zone(this.x, this.y, 500, 500).setOrigin(0.5, 0.5);
        this.objetivo.rangoVision = this.rangoVision;
      //  this.graphics = escena.add.graphics();
       // this.dibujarRangoVision();
    }
    
    dibujarRangoVision() {
        // Limpiar el dibujo anterior
        this.graphics.clear();

        // Estilo del rectángulo (color y grosor del borde)
        this.graphics.lineStyle(2, 0xff0000); // Borde rojo de 2px de grosor

        // Dibujar el rectángulo de la Zone
        const bounds = this.rangoVision.getBounds();
        this.graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    update() {
        super.update();
        this.rangoVision.setPosition(this.objetivo.x, this.objetivo.y);
       // this.dibujarRangoVision();
    }

}

export default Bismarck;
