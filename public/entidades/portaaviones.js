import Barco from './barco.js';

class Portaaviones extends Barco {
    constructor(portaavionesData) {
        super(
            portaavionesData.x,
            portaavionesData.y,
            10,      //Velocidad 
            10,     //VelocidadMaxima
            1,      //Aceleracion 
            null,   //Objetivo 
            5000,   //Combustible 
            null,   //Vision 
            200     //RangoVision
        );
    }

    init(escena) {
        this.objetivo = escena.physics.add.sprite(this.x, this.y, "portaaviones").setScale(1.5).setOrigin(0.5, 0.5);
        super.init(escena);
    }

    update(){
        super.update();
    }
}

export default Portaaviones;
