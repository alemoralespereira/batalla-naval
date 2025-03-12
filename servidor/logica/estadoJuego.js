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

    setPuerto(puerto) {
        this.puerto = puerto;

        return this;
    }
}

module.exports = EstadoJuego;
