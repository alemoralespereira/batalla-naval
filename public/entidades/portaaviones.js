import Barco from './barco.js';

class Portaaviones extends Barco {
    constructor(portaavionesData) {
        super(
            portaavionesData.x,
            portaavionesData.y,
            portaavionesData.velocidad,
            portaavionesData.velocidadMaxima,
            portaavionesData.angulo,
            portaavionesData.aceleracion,
            portaavionesData.objetivo,
            portaavionesData.combustible,
            // portaavionesData.rangoVision
        );
        this.seleccionado = false;
    }

    init(escena) {
        this.objetivo = escena.physics.add.sprite(this.x, this.y, "portaaviones").setScale(1.5).setOrigin(0.5, 0.5);
        super.init(escena);
        this.rangoVision = escena.add.zone(this.x, this.y, 500, 500).setOrigin(0.5, 0.5);
        this.objetivo.rangoVision = this.rangoVision;
       // this.graphics = escena.add.graphics();
       // this.dibujarRangoVision();
       this.indicadorCombustible = escena.add.text(10, (460 + (this.numeroAvion * 30)), `COMBUSTIBLE:  ${this.combustible}`,{
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.indicadorCombustible.setVisible(false);
        this.indicadorCombustible.setScrollFactor(0); 
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

export default Portaaviones;
