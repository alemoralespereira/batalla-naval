import Barco from './barco.js';

class Portaaviones extends Barco {
    constructor(portaavionesData) {
        super(
            portaavionesData.x,
            portaavionesData.y,
            0,
            50,
            1,
            null,
            500, //COMBUSTIBLE
            null,
            200
        );
    }

    init(escena) {
        this.objetivo = escena.physics.add.sprite(100, 500, "portaaviones").setScale(1.5).setOrigin(0.5, 0.5);
        super.init(escena);
    }

    update(){
        super.update();
    }
}

export default Portaaviones;
