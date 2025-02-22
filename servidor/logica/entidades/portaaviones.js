const Barco = require('./barco');

class Portaaviones extends Barco {
    constructor({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, rangoVision }) {
        super({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, rangoVision });
    }
}

module.exports = Portaaviones;
