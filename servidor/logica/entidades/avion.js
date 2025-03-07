const Entidad = require('./entidad');

class Avion extends Entidad {
    constructor({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, piloto, observador, operador, salud, numeroAvion, torpedo, multiplicadorCombustible, despego, seleccionado}) {
        super({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, });

        this.piloto = piloto;
        this.observador = observador;
        this.operador = operador;
        this.salud = salud;
        this.numeroAvion = numeroAvion;
        this.torpedo = torpedo;
        this.multiplicadorCombustible = multiplicadorCombustible;
        this.despego = despego;
        this.seleccionado = seleccionado;
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
