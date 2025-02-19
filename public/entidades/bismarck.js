import Barco from './barco.js';

class Bismarck extends Barco {
    constructor(bismarckData) {
        super(
            bismarckData.x,
            bismarckData.y,
            1,
            50,
            1,
            null,
            500, //COMBUSTIBLE
            null,
            200
        )
        //this.vision = null;
        //this.visionRange = 200;
    }

    init(scene) {
        this.target = scene.physics.add.sprite(this.x, this.y, "bismarck").setScale(0.8).setOrigin(0.5, 0.5);
        super.init(scene);
    }

    update(){
        super.update();
    }

}

export default Bismarck;
