class consultas {
    constructor(connection) {
        this.connection = connection;
    }

    obtenerDatosDeSala(idSala, callback) {
        const query = 'SELECT * FROM proyecto.saldas WHERE idSala = ?';
        this.connection.query(query, [idSala], (error, resultados) => {
            if (error) {
                
                return;
            }
            callback(null, resultados);
        });
    }
    
    insertarDatosSala(idSala, idJugador, nombreUsuario, rol, fecha, callback) {
        const query = 'INSERT INTO proyecto.salas (idSala, idJugador, nombreJugador, rol, fechaActualizacion) VALUES (?,?,?,?,?)';
        this.connection.query(query, [idSala, idJugador, nombreUsuario, rol, fecha], (error, resultados) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, resultados);
        });
    }
}

module.exports = consultas;