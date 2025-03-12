class Jugador {
    constructor(id, nombreUsuario, rol) {
        this.id = id;
        this.nombreUsuario = nombreUsuario;
        this.rol = rol;
    }

    getRol() {
        return this.rol;
    }
}

module.exports = Jugador;
