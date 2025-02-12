const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

let rooms = {
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
        if (!rooms[room]) return;

        if (rooms[room].length >= 2) {
            socket.emit("roomFull");
            return;
        }

        rooms[room].push({ id: socket.id, username });
        socket.join(room);
        socket.emit("player", { username, room });

        if (rooms[room].length === 2) {
            io.to(room).emit("gameStart", rooms[room]);
            io.to(rooms[room][0].id).emit("yourTurn", true);
            io.to(rooms[room][1].id).emit("yourTurn", false);
        }
    });

    socket.on("disconnect", () => {
        Object.keys(rooms).forEach((room) => {
            rooms[room] = rooms[room].filter(player => player.id !== socket.id);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
