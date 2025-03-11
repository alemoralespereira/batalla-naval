const Entidad = require('./entidad');

class Avion extends Entidad {
    constructor({ idEntidad, x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, piloto, observador, operador, salud, numeroAvion, torpedo, multiplicadorCombustible, despego, seleccionado}) {
        super({ idEntidad, x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, });

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
    
    getNumeroAvion() {
        return this.numeroAvion;
    }
    
    getTorpedo() {
        return this.torpedo;
    }
    
    getMultiplicadorCombustible() {
        return this.multiplicadorCombustible;
    }
    
    getDespego() {
        return this.despego;
    }
    
    getSeleccionado() {
        return this.seleccionado;
    }
    
    setPiloto(piloto) {
        this.piloto = piloto;
        return this;
    }
    
    setObservador(observador) {
        this.observador = observador;
        return this;
    }
    
    setOperador(operador) {
        this.operador = operador;
        return this;
    }
    setSalud(salud) {
        this.salud = Number(salud);
        return this;
    }
    setNumeroAvion(numeroAvion) {
        this.numeroAvion = numeroAvion;
        return this;
    }
    setTorpedo(torpedo) {
        this.torpedo = torpedo;
        return this;
    }
    setMultiplicadorCombustible(multiplicadorCombustible) {
        this.multiplicadorCombustible = multiplicadorCombustible;
        return this;
    }
    setDespego(despego) {
        this.despego = despego;
        return this;
    }

    setSeleccionado(seleccionado) {
        this.seleccionado = seleccionado;
        return this;
    }
}

module.exports = Avion;
