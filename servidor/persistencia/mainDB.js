const mysql = require('mysql2');
const config = require('../config.js');

class mainDB {

    constructor() {
        this.connection = mysql.createConnection({
            host: config.DB_HOST,// || 'mysql-aba0.railway.internal',
            port: config.DB_PORT,// || 3306,
            database: config.DB_NAME,// ||'railway',
            user: config.DB_USER,// || 'root',
            password: config.DB_PASSWORD// || 'aIrDMWaeYaHFpVaQwxrkhWgGqSoITrcn'
        })
    }
    
    connect() {
        this.connection.connect((error) =>{
            if (error) {
                console.error('Error al conectar a la base de datos:', error.stack);
                return;
            }
            console.log('Conexión a la base de datos establecida.');

        });
    }

    getConnection() {
        return this.connection;
    }

    cerrarConexion() {
        this.connection.end(); 
    }

}

module.exports = mainDB;