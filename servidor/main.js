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

async function conectarBaseDatos() {
    return new Promise((resolve, reject) => {
        console.log('Variables DB:', {
            host: config.DB_HOST,
            port: config.DB_PORT,
            database: config.DB_NAME,
            user: config.DB_USER,
            password: config.DB_PASSWORD,
        });

        try {
            db.conectar();
            const conexion = db.getConexion();
            conexion.connect((err) => { //funcion asincrona, devuelve resolve(query) en caso de exito, o reject(error) en caso contrario. 
                if (err) {
                    console.error('❌ ERROR AL CONECTAR BASE DE DATOS:', err.message);
                    reject(err);
                } else {
                    console.log('✅ BASE DE DATOS CONECTADA');
                    const query = new Consultas(conexion);
                    resolve(query);
                }
            });
        } catch (error) {
            console.error('❌ ERROR AL INICIALIZAR LA BASE DE DATOS:', error.message);
            reject(error);
        }
    });
}

async function iniciarServidor() {
    try {
        const query = await conectarBaseDatos(); //Pausar ejecucion hasta que Promise de conectarBaseDatos() se resuelva o se rechace. 
        const servidorJuego = new ServidorJuego(io, query);
        servidorJuego.establecerConexion();

        servidor.listen(PUERTO, () => {
            console.log(`✅ Servidor corriendo en el puerto ${PUERTO}`);
        });
    } catch (error) {
        console.error('❌ No se pudo iniciar el servidor debido a un error en la base de datos:', error.message);
        process.exit(1);
    }
}

iniciarServidor();

/*let query;

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
            console.error('❌ ERROR AL CONECTAR BASE DE DATOS:', err.message);
        } else {
            console.log('✅ BASE DE DATOS CONECTADA',);
            query = new Consultas(conexion);
        }
    });
} catch (error) {
    console.error('❌ ERROR AL INICIALIZAR LA BASE DE DATOS:', error.message);
}

new ServidorJuego(io, query).establecerConexion();

// Iniciar servidor en el puerto
servidor.listen(PUERTO, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PUERTO}`);
});*/
