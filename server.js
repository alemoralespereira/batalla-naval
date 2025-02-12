const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

// Lista de salas disponibles
const rooms = {
    sala1: [],
    sala2: [],
    sala3: []
};

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log("🔹 Un jugador se ha conectado:", socket.id);

    socket.on("joinRoom", ({ username, room }) => {
        if (!rooms[room]) {
            socket.emit("error", "Sala no válida.");
            return;
        }

        if (rooms[room].length >= 2) {
            socket.emit("error", "La sala está llena.");
            return;
        }

        socket.username = username;
        socket.room = room;
        rooms[room].push(socket.id);

        console.log(`👤 ${username} se unió a ${room}:`, rooms[room]);

        socket.join(room);

        // Informar a todos en la sala sobre los jugadores conectados
        io.to(room).emit("waitingForPlayers", rooms[room]);

        if (rooms[room].length === 2) {
            io.to(room).emit("gameStart", rooms[room]);
            io.to(rooms[room][0]).emit("yourTurn"); // El primer jugador comienza
        }
    });

    socket.on("shoot", ({ row, col }) => {
        const room = socket.room;
        if (!room || !rooms[room] || rooms[room].length < 2) return;

        if (socket.id === rooms[room][0]) {
            io.to(rooms[room][1]).emit("shotFired", { row, col });
            io.to(rooms[room][0]).emit("opponentTurn");
            io.to(rooms[room][1]).emit("yourTurn");
        } else if (socket.id === rooms[room][1]) {
            io.to(rooms[room][0]).emit("shotFired", { row, col });
            io.to(rooms[room][1]).emit("opponentTurn");
            io.to(rooms[room][0]).emit("yourTurn");
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ Un jugador se ha desconectado:", socket.id);
        const room = socket.room;

        if (room && rooms[room]) {
            rooms[room] = rooms[room].filter(playerId => playerId !== socket.id);
            io.to(room).emit("playerDisconnected", socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
