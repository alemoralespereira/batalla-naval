const mysql = require('mysql2');

class mainDB {

    constructor() {
        this.connection = mysql.createConnection({
           /* host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'proyecto'*/
            host: process.env.HOSTDB || 'turntable.proxy.rlwy.net',
            port: process.env.PORTDB || 28872,
            database: process.env.DB || 'proyecto',
            user: process.env.USERDB || 'root',
            password: process.env.PASSWORDDB || 'KZncjNkqiZketEzbCSKKuQbVkOUZtRNR',
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
