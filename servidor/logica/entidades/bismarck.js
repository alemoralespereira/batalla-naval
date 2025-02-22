const Barco = require('./barco');

class Bismarck extends Barco {
    constructor({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, rangoVision }) {
        super({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, rangoVision });
    }
}

module.exports = Bismarck;
