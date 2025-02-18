import Entity from './entity.js';

class Bismarck extends Entity {
    constructor(bismarckData) {
        super(
            bismarckData.x,
            bismarckData.y,
            0,
            50,
            1,
            null
        )

        this.vision = null;
        this.visionRange = 200;
    }

    init(scene) {
        this.target = scene.physics.add.sprite(this.x, this.y, "bismarck").setScale(0.8).setOrigin(0.5, 0.5);

        this.vision = scene.add.circle(
            this.target.x,
            this.target.y,
            this.visionRange,
            0x00ff00,                 // Color del círculo
            0.2                       // Opacidad
        ).setStrokeStyle(2, 0x00ff00) // Borde del círculo
    }

    update() {
        // Actualizar la posición del círculo de visión del Bismarck.
        if (this.vision && this.target) {
            this.vision.x = this.target.x;
            this.vision.y = this.target.y;
        }
    }
}

export default Bismarck;
