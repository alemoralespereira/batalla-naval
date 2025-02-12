const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

const rooms = {
    sala1: [],
    sala2: [],
    sala3: []
};

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, "public")));

// Servir index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log(`Jugador conectado: ${socket.id}`);

    socket.on("joinRoom", ({ username, room }) => {
        if (!rooms[room] || rooms[room].length >= 2) {
            socket.emit("roomFull");
            return;
        }

        socket.username = username;
        socket.room = room;
        rooms[room].push(socket.id);

        console.log(`Jugador ${username} asignado a la sala ${room}`);

        socket.emit("playerAssigned", { username, room });
        io.to(room).emit("playerJoined", rooms[room]);

        if (rooms[room].length === 2) {
            io.to(room).emit("gameStart", rooms[room]);
            io.to(rooms[room][0]).emit("yourTurn");
        }
    });

    socket.on("shoot", ({ row, col }) => {
        const room = socket.room;
        if (!room || rooms[room].length < 2) return;

        const opponent = rooms[room].find(id => id !== socket.id);
        if (!opponent) return;

        io.to(opponent).emit("shotFired", { row, col });

        // Cambiar turno
        io.to(opponent).emit("yourTurn");
        io.to(socket.id).emit("opponentTurn");
    });

    socket.on("disconnect", () => {
        const room = socket.room;
        if (room) {
            rooms[room] = rooms[room].filter(id => id !== socket.id);
            io.to(room).emit("playerDisconnected");
        }
        console.log(`Jugador desconectado: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
