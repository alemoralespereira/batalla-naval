const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

// Estructura de las salas con un máximo de 2 jugadores por sala
const rooms = {
    sala1: [],
    sala2: [],
    sala3: [],
};

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, "public")));

// Servir index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log("🔹 Un jugador se ha conectado:", socket.id);

    socket.on("joinRoom", ({ username, room }) => {
        if (!rooms[room]) return;

        if (rooms[room].length >= 2) {
            socket.emit("roomFull");
            return;
        }

        rooms[room].push({ id: socket.id, username });
        socket.join(room);
        console.log(`👤 ${username} se unió a la ${room}`);

        socket.emit("roomJoined", { room, username });
        io.to(room).emit("updatePlayers", rooms[room]);

        if (rooms[room].length === 2) {
            io.to(room).emit("gameStart", rooms[room][0].id);
            io.to(rooms[room][0].id).emit("yourTurn");
        }
    });

    socket.on("shoot", ({ row, col, room }) => {
        const playerIndex = rooms[room].findIndex((player) => player.id === socket.id);

        if (playerIndex === -1) return; // El jugador no está en la sala
        if (socket.id !== rooms[room][0].id && socket.id !== rooms[room][1].id) return; // Jugador inválido

        io.to(room).emit("shotFired", { row, col });

        const nextTurn = rooms[room][0].id === socket.id ? rooms[room][1].id : rooms[room][0].id;
        io.to(nextTurn).emit("yourTurn");
    });

    socket.on("disconnect", () => {
        console.log("❌ Un jugador se ha desconectado:", socket.id);

        Object.keys(rooms).forEach((room) => {
            rooms[room] = rooms[room].filter((player) => player.id !== socket.id);

            if (rooms[room].length < 2) {
                io.to(room).emit("playerDisconnected");
            }
        });
    });
});

// Escuchar en el puerto de Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
