const Entidad = require('./entidad');

class Avion extends Entidad {
    constructor({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, rangoVision, piloto, observador, operador, salud }) {
        super({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, rangoVision });

        this.piloto = piloto;
        this.observador = observador;
        this.operador = operador;
        this.salud = salud;
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

    getSalud() {
        return this.salud;
    }

    setSalud(salud) {
        this.salud = salud;

        return this
    }
}

module.exports = Avion;
