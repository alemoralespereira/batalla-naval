const Barco = require('./barco');

class Portaaviones extends Barco {
    constructor({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible }) {
        super({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible});
    }
}

module.exports = Portaaviones;
