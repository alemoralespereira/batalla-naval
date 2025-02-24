const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proyecto'
});


connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
        return;
    }
    console.log('Conexión a la base de datos establecida.');

    // Consulta de prueba
    connection.query('select * from proyecto.jugadores;', (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return;
        }
        console.log('Filas obtenidas:', results); 
        connection.end(); 
    });
});

module.exports = connection;
