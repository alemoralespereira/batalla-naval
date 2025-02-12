const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

// Estructura para almacenar las salas y los jugadores en cada una
let rooms = {
    sala1: [],
    sala2: [],
    sala3: []
};

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, "public")));

// Asegurar que "index.html" se sirva correctamente
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log(`🔹 Un jugador se ha conectado: ${socket.id}`);

    socket.on("joinRoom", ({ playerName, room }) => {
        if (!rooms[room]) {
            socket.emit("roomError", "Sala no válida.");
            return;
        }

        if (rooms[room].length >= 2) {
            socket.emit("roomFull", "Esta sala ya está llena. Por favor, elige otra.");
            return;
        }

        rooms[room].push({ id: socket.id, name: playerName });
        socket.join(room);

        console.log(`🟢 Jugador ${playerName} se unió a la sala ${room}. Total: ${rooms[room].length}`);

        // Confirmar la asignación de la sala
        socket.emit("playerAssigned", { playerName, room });

        if (rooms[room].length === 2) {
            io.to(room).emit("gameStart", rooms[room]);
            io.to(rooms[room][0].id).emit("turn", true);
            io.to(rooms[room][1].id).emit("turn", false);
        }
    });

    socket.on("shoot", ({ row, col, room }) => {
        const roomPlayers = rooms[room];
        if (!roomPlayers || roomPlayers.length < 2) return;

        const playerIndex = roomPlayers.findIndex(player => player.id === socket.id);
        if (playerIndex === -1 || playerIndex !== 0) return; // Solo el jugador activo puede disparar

        io.to(room).emit("shotFired", { row, col });

        // Cambiar turno
        io.to(roomPlayers[0].id).emit("turn", false);
        io.to(roomPlayers[1].id).emit("turn", true);

        // Intercambiar posiciones en el array
        rooms[room].push(rooms[room].shift());
    });

    socket.on("disconnect", () => {
        console.log(`❌ Jugador ${socket.id} desconectado`);

        for (const room in rooms) {
            rooms[room] = rooms[room].filter(player => player.id !== socket.id);
            if (rooms[room].length < 2) {
                io.to(room).emit("playerDisconnected");
            }
        }
    });
});

// Escuchar en el puerto correcto de Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
