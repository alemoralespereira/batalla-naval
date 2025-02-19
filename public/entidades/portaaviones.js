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

    init(scene) {
        this.target = scene.physics.add.sprite(this.x, this.y, "portaaviones").setScale(1.1).setOrigin(0.5, 0.5);
        super.init(scene);
    }

    update(){
        super.update();
    }
}

export default Portaaviones;
