import Barco from './barco.js';

class Bismarck extends Barco {
    constructor(bismarckData) {
        super(
            bismarckData.x,
            bismarckData.y,
            bismarckData.velocidad,
            bismarckData.velocidadMaxina,
            bismarckData.aceleracion,
            null, // Objetivo
            bismarckData.combustible,
            // bismarckData.rangoVision
        );
    }

    init(escena) {
        this.objetivo = escena.physics.add.sprite(this.x, this.y, "bismarck").setScale(0.8).setOrigin(0.5, 0.5);

        
    }

    update() {
        super.update();

       /* this.update = function(){
            rangoVision.setPosition(this.x, this.y);
        }*/
    }

}

export default Bismarck;
