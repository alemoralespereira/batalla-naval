const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const app = express();
const servidor = http.createServer(app);
const io = socketIo(servidor);

const config = require('./config.js');
const BaseDeDatos = require('./persistencia/baseDeDatos');
const Consultas = require('./persistencia/consultas');
const ServidorJuego = require("./logica/servidorJuego.js");

const PUERTO = config.PUERTO || 8080;

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "../public")));

const db = new BaseDeDatos();
let query;

try {
    console.log('Variables DB:', {
        host: config.DB_HOST,
        port: config.DB_PORT,
        database: config.DB_NAME,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
    });

    db.conectar();
    const conexion = db.getConexion();
    conexion.connect((err) => {
        if (err) {
            console.error('❌ ERROR CONECCION BASE DE DATOS:', err.message);
        } else {
            console.log('✅ BASE DE DATOS CONECTADA',);
            query = new Consultas(conexion);
        }
    });
} catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
}

new ServidorJuego(io, query).establecerConexion();

// Iniciar servidor en el puerto
servidor.listen(PUERTO, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PUERTO}`);
});
