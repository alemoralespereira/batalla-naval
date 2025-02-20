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
            5000, //COMBUSTIBLE
            null,
            200
        )

    }

    init(escena) {
        this.objetivo = escena.physics.add.sprite(900, 200, "bismarck").setScale(0.8).setOrigin(0.5, 0.5);
        super.init(escena);
    }

    update(){
        super.update();
    }

}

export default Bismarck;
