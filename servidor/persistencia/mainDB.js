const mysql = require('mysql2');

class mainDB {

    constructor() {
        this.connection = mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'proyecto'
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
