const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);
const rooms = {}; // Estructura: { sala1: [socket1, socket2], sala2: [...] }

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log("🔹 Un jugador se ha conectado:", socket.id);

    socket.on("joinRoom", ({ username, room }) => {
        if (!rooms[room]) rooms[room] = [];
        
        if (rooms[room].length >= 2) {
            socket.emit("roomFull");
            return;
        }

        rooms[room].push(socket.id);
        socket.join(room);
        console.log(`📌 ${username} asignado a la sala ${room}`);

        if (rooms[room].length === 2) {
            io.to(room).emit("gameStart");
            io.to(rooms[room][0]).emit("yourTurn"); // El primer jugador empieza
        }
    });

    socket.on("shoot", ({ row, col, room }) => {
        if (!rooms[room]) return;

        io.to(room).emit("shotFired", { row, col });

        let currentTurn = rooms[room].indexOf(socket.id);
        let nextTurn = (currentTurn + 1) % 2;

        io.to(rooms[room][nextTurn]).emit("yourTurn");
        io.to(rooms[room][currentTurn]).emit("opponentTurn");
    });

    socket.on("disconnect", () => {
        for (let room in rooms) {
            rooms[room] = rooms[room].filter(id => id !== socket.id);
            if (rooms[room].length < 2) io.to(room).emit("playerDisconnected");
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
