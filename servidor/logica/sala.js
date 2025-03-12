class Sala {
    constructor(jugadores, estadoJuego, estadoPartida) {
        this.jugadores = jugadores;
        this.estadoJuego = estadoJuego;
        this.estadoPartida = estadoPartida;
    }

    cantidadJugadores() {
        return this.jugadores.length;
    }

    getJugadores() {
        return this.jugadores;
    }

    getEstadoJuego() {
        return this.estadoJuego;
    }

    getEstadoPartida() {
        return this.estadoPartida;
    }

    agregarJugador(jugador) {
        this.jugadores.push(jugador);
    }

    eliminarJugador(idJugador) {
        this.jugadores = this.jugadores.filter(j => j.id !== idJugador);
    }
}

module.exports = Sala;
