const Entidad = require('./entidad');

class Barco extends Entidad {
    constructor({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible }) {
        super({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible});
    }
}

module.exports = Barco;
