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

        socket.join(room);

        io.to(room).emit("waitingForPlayers", rooms[room]);

        if (rooms[room].length === 2) {
            io.to(room).emit("gameStart", rooms[room]);
            io.to(rooms[room][0]).emit("yourTurn");
        }
    });

    socket.on("shoot", ({ row, col, room }) => {
        if (!room || !rooms[room] || rooms[room].length < 2) return;

        io.to(room).emit("shotFired", { row, col }); // Emitir a ambos jugadores

        // Alternar turnos
        io.to(rooms[room][0]).emit("opponentTurn");
        io.to(rooms[room][1]).emit("yourTurn");

        // Intercambiar posiciones en el array
        rooms[room].push(rooms[room].shift());
    });

    socket.on("disconnect", () => {
        const room = socket.room;
        if (room && rooms[room]) {
            rooms[room] = rooms[room].filter(id => id !== socket.id);
            io.to(room).emit("playerDisconnected");
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
