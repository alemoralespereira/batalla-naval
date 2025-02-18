import Entity from './entity.js';

class Avion extends Entity {
    constructor(avionData) {
        super(
            avionData.x,
            avionData.y,
            0,
            100,
            2,
            null
        );
    }

    init(scene) {
        this.target = scene.physics.add.sprite(this.x, this.y, "avion").setScale(0.2).setOrigin(0.5, 0.5);
    }
}

export default Avion;
