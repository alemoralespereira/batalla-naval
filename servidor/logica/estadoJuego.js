class EstadoJuego {
    constructor() {
        this.entidades = {};
        this.puerto = null;
    }

    agregarEntidad(idEntidad, entidad) {
        this.entidades[idEntidad] = entidad;
    }

    getEntidad(idEntidad) {
        return this.entidades[idEntidad];
    }

    setEntidades(entidades) {
        this.entidades = entidades;

        return this;
    }

    setPuerto(puerto) {
        this.puerto = puerto;

        return this;
    }
}

module.exports = EstadoJuego;
