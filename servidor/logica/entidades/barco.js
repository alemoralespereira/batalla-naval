const Entidad = require('./entidad');

class Barco extends Entidad {
    constructor({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, rangoVision }) {
        super({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, rangoVision });
    }
}

module.exports = Barco;
