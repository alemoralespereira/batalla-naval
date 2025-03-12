const mysql = require('mysql2');
const config = require('../config.js');

class BaseDeDatos {
    constructor() {
        this.conexion = mysql.createConnection({
            host: config.DB_HOST,
            port: config.DB_PORT,
            database: config.DB_NAME,
            user: config.DB_USER,
            password: config.DB_PASSWORD
        })
    }

    conectar() {
        this.conexion.connect((error) => {
            if (error) {
                console.error('Error al conectar a la base de datos:', error.stack);
                return;
            }
            console.log('Conexión a la base de datos establecida.');

        });
    }

    getConexion() {
        return this.conexion;
    }

    cerrarConexion() {
        this.conexion.end();
    }

}

module.exports = BaseDeDatos;
