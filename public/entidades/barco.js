import Entity from './entity.js';
import socket from '../socket.js';

class Barco extends Entity {
    constructor(x, y, velocidad, velocidadMaxima, angulo, aceleracion, objetivo, combustible, salud) {
        super(x, y, velocidad, velocidadMaxima, angulo, aceleracion, objetivo, combustible, salud);
    }

    init(escena){
        super.init(escena);
    }
    
    update(){
        super.update();

        
    }

    mover(controles) {
    }
}

export default Barco;
