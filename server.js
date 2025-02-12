const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = {
    sala1: [],
    sala2: [],
    sala3: [],
};

app.use(express.static("public"));

io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
        if (rooms[room].length >= 2) {
            socket.emit("roomFull");
            return;
        }

        socket.username = username;
        socket.room = room;
        rooms[room].push(socket);

        io.to(socket.id).emit("roomJoined", { room, username });

        if (rooms[room].length === 2) {
            startGame(room);
        }
    });

    socket.on("shoot", ({ row, col, room }) => {
        const otherPlayer = rooms[room].find((s) => s.id !== socket.id);
        if (otherPlayer) {
            otherPlayer.emit("shotFired", { row, col });
            socket.emit("opponentTurn");
            otherPlayer.emit("yourTurn");
        }
    });

    socket.on("disconnect", () => {
        if (socket.room && rooms[socket.room]) {
            rooms[socket.room] = rooms[socket.room].filter((s) => s !== socket);
        }
    });
});

function startGame(room) {
    rooms[room].forEach((player, index) => {
        player.emit("gameStart", index === 0);
        player.emit(index === 0 ? "yourTurn" : "opponentTurn");
    });
}

server.listen(3000, () => {
    console.log("Servidor corriendo en el puerto 3000");
});
