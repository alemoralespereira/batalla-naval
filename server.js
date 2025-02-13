const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// Almacenar información de las salas y jugadores
let rooms = {};

io.on("connection", (socket) => {
    console.log("🟢 Nuevo jugador conectado:", socket.id);

    socket.on("joinRoom", ({ username, room, role }) => {
        if (!rooms[room]) {
            rooms[room] = { players: [], gameState: { turn: null, entities: {} } };
        }

        // Verificar si la sala ya tiene el rol seleccionado
        const existingRole = rooms[room].players.find(player => player.role === role);
        if (existingRole) {
            socket.emit("roleTaken", { message: "Este rol ya ha sido seleccionado. Elige otro." });
            return;
        }

        // Agregar jugador a la sala
        rooms[room].players.push({ id: socket.id, username, role });
        socket.join(room);

        console.log(`📌 ${username} se unió a la sala ${room} como ${role}`);

        // Notificar a todos en la sala
        io.to(room).emit("playerJoined", {
            message: `${username} se unió como ${role}`,
            players: rooms[room].players.map(p => ({ username: p.username, role: p.role }))
        });


    // Si solo hay un jugador, enviar evento de espera
    if (rooms[room].players.length === 1) {
        socket.emit("waitingForPlayers");
    }

// Iniciar juego cuando hay dos jugadores
if (rooms[room].players.length === 2) {
    const firstPlayer = rooms[room].players[0];
    rooms[room].gameState.turn = firstPlayer.id;  // Primer jugador comienza
    rooms[room].gameState.entities = {
        battleship: { x: 600, y: 400, owner: rooms[room].players.find(p => p.role === "battleship").id },
        carrier: { x: 300, y: 200, owner: rooms[room].players.find(p => p.role === "carrier").id }
    };

    io.to(room).emit("gameStart", {
        message: "El juego ha comenzado",
        players: rooms[room].players,
        gameState: rooms[room].gameState,
        turn: firstPlayer.id // 🔹 Enviar ID del jugador con el turno inicial
    });

    console.log(`🎮 Juego iniciado en la sala ${room}`);
}
    });

socket.on("moveEntity", ({ room, entity, x, y }) => {
    if (!rooms[room]) return;
    if (rooms[room].gameState.turn !== socket.id) return; // Solo el jugador en turno puede mover

    rooms[room].gameState.entities[entity].x = x;
    rooms[room].gameState.entities[entity].y = y;

    // Cambiar turno al otro jugador
    const otherPlayer = rooms[room].players.find(p => p.id !== socket.id);
    if (otherPlayer) {
        rooms[room].gameState.turn = otherPlayer.id;
    }

    // Emitir actualización de la entidad a todos en la sala
    io.to(room).emit("updateEntity", { entity, x, y });

    // 🔹 Ahora aseguramos que **ambos jugadores** reciben `turnChange`
    io.to(room).emit("turnChange", { turn: rooms[room].gameState.turn });
});

    // Manejo de disparos
    socket.on("shoot", ({ room, targetX, targetY }) => {
        io.to(room).emit("shotFired", { targetX, targetY });
    });

    // Desconexión del jugador
    socket.on("disconnect", () => {
        for (const room in rooms) {
            rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id);
            if (rooms[room].players.length === 0) {
                delete rooms[room]; // Eliminar sala si no quedan jugadores
            } else {
                io.to(room).emit("playerLeft", { message: "Un jugador ha salido." });
            }
        }
        console.log("🔴 Jugador desconectado:", socket.id);
    });
});

// Iniciar servidor en el puerto 3000
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
