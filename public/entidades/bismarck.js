import Barco from './barco.js';

class Bismarck extends Barco {
    constructor(bismarckData) {
        super(
            bismarckData.x, 
            bismarckData.y,
            100,      //Velocidad 
            100,     //VelocidadMaxima
            1,      //Aceleracion 
            null,   //Objetivo 
            5000,   //Combustible 
            null,   //Vision 
            200     //RangoVision
        )

    }

    init(escena) {
        this.objetivo = escena.physics.add.sprite(this.x, this.y, "bismarck").setScale(0.8).setOrigin(0.5, 0.5);
        
        super.init(escena);

    }

    update(){
        super.update();
    }

}

export default Bismarck;
