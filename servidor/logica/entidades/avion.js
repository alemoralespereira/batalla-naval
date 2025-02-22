const Entidad = require('./entidad');

class Avion extends Entidad {
    constructor({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, rangoVision, piloto, observador, operador }) {
        super({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, rangoVision });

        this.piloto = piloto;
        this.observador = observador;
        this.operador = operador;
    }

    getPiloto() {
        return this.piloto;
    }

    getObservador() {
        return this.observador;
    }

    getOperador() {
        return this.operador;
    }
}

module.exports = Avion;
