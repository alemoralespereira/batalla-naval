const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const Bismarck = require('./logica/entidades/bismarck');
const Portaaviones = require('./logica/entidades/portaaviones');
const Avion = require('./logica/entidades/avion');

const app = express();
const servidor = http.createServer(app);
const io = socketIo(servidor);

const PUERTO = process.env.PORT || 8080;

const mainDB = require('./persistencia/mainDB');
const consultas = require('./persistencia/consultas');

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "../public")));

// Almacenar información de las salas y jugadores
let salas = {};

//const db = new mainDB();
//db.connect();
//const conexion = db.getConnection();
//const query = new consultas(conexion);



io.on("connection", (socket) => {
    console.log("🟢 Nuevo jugador conectado:", socket.id);

    socket.on("unirseSala", ({ nombreUsuario, sala, rol }) => {
        if (!salas[sala]) {
            salas[sala] = { jugadores: [], estadoJuego: { entidades: {} } };
        }

        // Verificar si el rol ya está ocupado
        const rolOcupado = salas[sala].jugadores.some(jugador => jugador.rol === rol);
        if (rolOcupado) {
            socket.emit("errorUnirse", { mensaje: `El rol ${rol} ya está ocupado. Elige otro.` });
            return; // No permite que el jugador se una si el rol ya está ocupado
        }

       // const fecha = new Date();
        /*query.insertarDatosSala(sala, socket.id, nombreUsuario, rol, fecha, (error, resultados) => {
            if (error) {
                console.error('Error al insertar datos:', error);
                return;
            }
            console.log('Datos insertados:', resultados);
        });*/
       

        // Agregar jugador a la sala
        salas[sala].jugadores.push({ id: socket.id, nombreUsuario, rol });
        socket.join(sala);
        

        console.log(`📌 ${nombreUsuario} se unió a la sala ${sala} como ${rol}`);
        console.log("Detalles del jugador:", {
            socketId: socket.id,
            nombreUsuario,
            rol,
            sala,
        });

        // Notificar a todos en la sala
        io.to(sala).emit("jugadorConectado", {
            mensaje: `${nombreUsuario} se unió como ${rol}`,
            jugadores: salas[sala].jugadores.map(j => ({ nombreUsuario: j.nombreUsuario, rol: j.rol }))
        });

        // Si solo hay un jugador, enviar evento de espera
        if (salas[sala].jugadores.length === 1) {
            io.to(sala).emit("esperandoJugadores");
        }

        // Iniciar juego cuando hay dos jugadores
        if (salas[sala].jugadores.length === 2) {
            const entidades = {};

            entidades.bismarck = new Bismarck({
                x: 1500,
                y: 200,
                velocidad: 0,
                velocidadMaxima: 100,
                angulo: 0,
                aceleracion: 1,
                objetivo: null,
                combustible: 50000,
                salud: 3
            });
            entidades.portaaviones = new Portaaviones({
                x: 50,
                y: 500,
                velocidad: 0,
                velocidadMaxima: 100,
                angulo: 0,
                aceleracion: 1,
                objetivo: null,
                combustible: 5000
            });

            for (let i = 1; i < 11; i++) {
                entidades[`avion_${i}`] = new Avion({
                    x: 50,
                    y: 500,
                    velocidad: 0,
                    velocidadMaxima: 100,
                    angulo: 0,
                    aceleracion: 2,
                    objetivo: null,
                    combustible: 100000,
                    piloto: false,
                    observador: false,
                    operador: false,
                    salud: 1
                });
            }

            salas[sala].estadoJuego.entidades = entidades;

            io.to(sala).emit("juegoIniciado", {
                mensaje: "El juego ha comenzado",
                jugadores: salas[sala].jugadores,
                estadoJuego: salas[sala].estadoJuego,
            });

            console.log(`🎮 Juego iniciado en la sala ${sala}`);
            console.log("Detalles del juego:", {
                sala,
                jugadores: salas[sala].jugadores,
                estadoJuego: salas[sala].estadoJuego,
            });
        }
    });

    /*socket.on("moverEntidad", ({ sala, entidad, x, y, angulo }) => {
        if (!salas[sala]) return;

        // Actualizar la posición de la entidad
        salas[sala].estadoJuego.entidades[entidad] = { x, y, angulo };

        // Emitir la actualización a todos los jugadores en la sala
        socket.to(sala).emit("actualizarPosicionEntidad", { entidad, x, y, angulo });
    });*/

    socket.on("moverEntidad", (data) => {
        console.log("📥 Datos recibidos del cliente:", data);
    
        // Verificar si la sala existe
        if (!salas[data.sala]) {
            console.error(`❌ Sala ${data.sala} no encontrada.`);
            return;
        }

        // Verificar si la entidad existe
        const entidad = salas[data.sala].estadoJuego.entidades[data.nombreEntidad];
        if (!entidad) {
            console.error(`❌ Entidad ${data.nombreEntidad} no encontrada en sala ${data.sala}`);
            //console.log("Entidades actuales:", salas[data.sala].estadoJuego.entidades);
            return;
        }

       // Actualizar la posición de la entidad
        salas[data.sala].estadoJuego.entidades[data.nombreEntidad].setX(data.x).setY(data.y).setAngulo(data.angulo);

         // Emitir la actualización a todos los jugadores en la sala
        socket.to(data.sala).emit("actualizarPosicionEntidad", {
            nombreEntidad: data.nombreEntidad, 
            x: data.x,             
            y: data.y,             
            angulo: data.angulo    
        });
    });

    // Desconexión del jugador
    socket.on("disconnect", () => {
        for (const sala in salas) {
            salas[sala].jugadores = salas[sala].jugadores.filter(j => j.id !== socket.id);
            if (salas[sala].jugadores.length === 0) {
                delete salas[sala]; // Eliminar sala si no quedan jugadores
            } else {
                io.to(sala).emit("jugadorDesconectado", { mensaje: "Un jugador ha salido." });
            }
        }
        console.log("🔴 Jugador desconectado:", socket.id);
    });
});

// Iniciar servidor en el puerto 3000
servidor.listen(PUERTO, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PUERTO}`);
});