const Barco = require('./barco');

class Bismarck extends Barco {
    constructor({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, salud }) {
        super({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible});

        this.salud = salud;
    }

    getSalud() {
        return this.salud;
    }

    setSalud(salud) {
        this.salud = salud;

        return this
    }
}

module.exports = Bismarck;
