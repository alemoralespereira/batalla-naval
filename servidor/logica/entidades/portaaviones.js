const Entidad = require('./entidad');

class Portaaviones extends Entidad {
    constructor({ idEntidad, x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible }) {
        super({ idEntidad, x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible});
    }
}

module.exports = Portaaviones;
