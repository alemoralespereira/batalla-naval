import Entity from './entity.js';

class Portaaviones extends Entity {
    constructor(portaavionesData) {
        super(
            portaavionesData.x,
            portaavionesData.y,
            0,
            50,
            1,
            null
        );
    }

    init(scene) {
        this.target = scene.physics.add.sprite(this.x, this.y, "portaaviones").setScale(1.1).setOrigin(0.5, 0.5);
    }
}

export default Portaaviones;
