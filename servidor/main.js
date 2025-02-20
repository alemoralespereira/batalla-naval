const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const app = express();
const servidor = http.createServer(app);
const io = socketIo(servidor);

const PUERTO = process.env.PORT || 8080;

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "../public")));

// Almacenar información de las salas y jugadores
let salas = {};

io.on("connection", (socket) => {
    console.log("🟢 Nuevo jugador conectado:", socket.id);

    socket.on("unirseSala", ({ nombreUsuario, sala, rol }) => {
        if (!salas[sala]) {
            salas[sala] = { jugadores: [], estadoJuego: { entidades: {} } };
        }

        // Agregar jugador a la sala
        salas[sala].jugadores.push({ id: socket.id, nombreUsuario, rol });
        socket.join(sala);

        console.log(`📌 ${nombreUsuario} se unió a la sala ${sala} como ${rol}`);

        // Notificar a todos en la sala
        io.to(sala).emit("jugadorUnido", {
            mensaje: `${nombreUsuario} se unió como ${rol}`,
            jugadores: salas[sala].jugadores.map(j => ({ nombreUsuario: j.nombreUsuario, rol: j.rol }))
        });

        // Si solo hay un jugador, enviar evento de espera
        if (salas[sala].jugadores.length === 1) {
            io.to(sala).emit("esperandoJugadores");
        }

        // Iniciar juego cuando hay dos jugadores
        if (salas[sala].jugadores.length === 2) {
            salas[sala].estadoJuego.entidades = {
                bismarck: { x: 600, y: 400, velocidad: 200 },
                portaaviones: { x: 300, y: 200, velocidad: 150 },
                avion: { x: 400, y: 250, velocidad: 150 }
            };

            io.to(sala).emit("juegoIniciado", {
                mensaje: "El juego ha comenzado",
                jugadores: salas[sala].jugadores,
                estadoJuego: salas[sala].estadoJuego,
            });

            console.log(`🎮 Juego iniciado en la sala ${sala}`);
        }
    });

    socket.on("moverEntidad", ({ sala, entidad, x, y, angulo }) => {
        if (!salas[sala]) return;

        // Actualizar la posición de la entidad
        salas[sala].estadoJuego.entidades[entidad] = { x, y, angulo };

        // Emitir la actualización a todos los jugadores en la sala
        socket.to(sala).emit("actualizarPosicionEntidad", { entidad, x, y, angulo });
    });

    // Desconexión del jugador
    socket.on("disconnect", () => {
        for (const sala in salas) {
            salas[sala].jugadores = salas[sala].jugadores.filter(j => j.id !== socket.id);
            if (salas[sala].jugadores.length === 0) {
                delete salas[sala]; // Eliminar sala si no quedan jugadores
            } else {
                io.to(sala).emit("jugadorSalio", { mensaje: "Un jugador ha salido." });
            }
        }
        console.log("🔴 Jugador desconectado:", socket.id);
    });
});

// Iniciar servidor en el puerto 3000
servidor.listen(PUERTO, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PUERTO}`);
});