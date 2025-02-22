import Barco from './barco.js';

class Portaaviones extends Barco {
    constructor(portaavionesData) {
        super(
            portaavionesData.x,
            portaavionesData.y,
            portaavionesData.velocidad,
            portaavionesData.velocidadMaxima,
            portaavionesData.aceleracion,
            null, // Objetivo
            portaavionesData.combustible,
            // portaavionesData.rangoVision
        );
    }

    init(escena) {
        this.objetivo = escena.physics.add.sprite(this.x, this.y, "portaaviones").setScale(1.5).setOrigin(0.5, 0.5);
        super.init(escena);
    }

    update() {
        super.update();
    }
}

export default Portaaviones;
