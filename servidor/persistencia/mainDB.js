const mysql = require('mysql2');
const config = require('../config.js');

class mainDB {

    constructor() {
        this.connection = mysql.createConnection({
           /* host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'proyecto'*/
            host: config.DB_HOST,// || 'hopper.proxy.rlwy.net',
            port: config.DB_PORT,// || 11871,
            database: config.DB_NAME,// ||'railway',
            user: config.DB_USER,// || 'root',
            password: config.DB_PASSWORD// || 'HTzAxCAXuJrTmsEuEUexkdjiiIchRTSG'
        })
        // Loguear las variables
        console.log('DB_HOST:', config.DB_HOST);
        console.log('DB_PORT:', config.DB_PORT);
        console.log('DB_NAME:', config.DB_NAME);
        console.log('DB_USER:', config.DB_USER);
        console.log('DB_PASSWORD:', config.DB_PASSWORD);
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