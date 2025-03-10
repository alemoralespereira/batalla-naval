class consultas {
    constructor(connection) {
        this.connection = connection;
    }

    existeSala(idSala, callback) {
        const query = 'SELECT 1 FROM proyectoDB.salas WHERE idSala = ?';
        this.connection.query(query, [idSala], (error, resultados) => {
            if(error) {
                return;
            }
            callback(null, resultados);
        })
    }

    obtenerDatosDeSala(idSala, callback) {
        const query = 'SELECT * FROM proyectoDB.salas WHERE idSala = ?';
        this.connection.query(query, [idSala], (error, resultados) => {
            if (error) {
                return;
            }
            callback(null, resultados);
        });
    }
    
    obtenerDatosEntidades(idSala, callback) {
        const query = 'SELECT * FROM proyectoDB.entidades WHERE idSala = ?';
        this.connection.query(query, [idSala], (error, resultados) => {
            if (error) {
                return;
            }
            callback(null, resultados);
        });
    }

    insertarDatosSala(idSala,  nombreUsuario, rol, fecha, callback) {
        const query = 'INSERT INTO proyectoDB.salas (idSala, nombreJugador, rol, fechaActualizacion) VALUES (?,?,?,?)';
        this.connection.query(query, [idSala, nombreUsuario, rol, fecha], (error, resultados) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, resultados);
        });
    }

    actualizarDatosSala(idSala, nombreUsuario, rol, fecha, callback) {
        const query = 'UPDATE proyectoDB.salas SET idSala = ?, nombreJugador = ?, rol = ?, fechaActualizacion = ? WHERE idSala = ? and rol = ?';
        this.connection.query(query, [idSala, nombreUsuario, rol, fecha, idSala, rol], (error, resultados) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, resultados);
        });
    }

    insertarDatosEntidades(idSala, idEntidad, posX, posY, angulo, velocidad, velocidadMaxima, aceleracion, combustible, piloto, observador, operador, salud, numeroAvion, torpedo, multiplicadorCombustible, despego, callback) {
        const query = 'INSERT INTO proyectoDB.entidades (idSala, idEntidad, posX, posY, angulo, velocidad, velocidadMaxima, aceleracion, combustible, piloto, observador, operador, salud, numeroAvion, torpedo, multiplicadorCombustible, despego) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        this.connection.query(query, [idSala, idEntidad, posX, posY, angulo, velocidad, velocidadMaxima, aceleracion, combustible, piloto, observador, operador, salud, numeroAvion, torpedo, multiplicadorCombustible, despego], (error, resultados) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, resultados);
        });
    }

    actualizarDatosEntidades(idSala, idEntidad, posX, posY, angulo, velocidad, velocidadMaxima, aceleracion, combustible, piloto, observador, operador, salud, numeroAvion, torpedo, multiplicadorCombustible, despego, callback) {
        const query = 'UPDATE proyectoDB.entidades SET idSala = ?,    idEntidad = ?,    posX = ?,     posY = ?,     angulo = ?,     velocidad = ?,     velocidadMaxima = ?,    aceleracion = ?,     combustible = ?,     piloto = ?,     observador = ?,    operador = ?,     salud = ?,     numeroAvion = ?,     torpedo = ?,    multiplicadorCombustible = ?,     despego = ? WHERE   idSala = ?    AND idEntidad = ?';
        this.connection.query(query, [idSala, idEntidad, posX, posY, angulo, velocidad, velocidadMaxima, aceleracion, combustible, piloto, observador, operador, salud, numeroAvion, torpedo, multiplicadorCombustible, despego, idSala, idEntidad], (error, resultados) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, resultados);
        });
    }

    
}

module.exports = consultas;