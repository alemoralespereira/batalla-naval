import mysql from 'mysql2';
import config from '../config.js';

class mainDB {

    constructor() {
        this.connection = mysql.createConnection({
           /* host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'proyecto'*/
            host: config.DB_HOST,
            port: config.DB_PORT,
            database: config.DB_NAME,
            user: config.DB_USER,
            password: config.DB_PASSWORD
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

export default mainDB;