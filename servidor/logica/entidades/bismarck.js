const Entidad = require('./entidad');

class Bismarck extends Entidad {
    constructor({idEntidad, x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, salud }) {
        super({ idEntidad, x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible});

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
