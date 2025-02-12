const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);
const rooms = { sala1: [], sala2: [], sala3: [] };

app.use(express.static("public"));
app.use("/assets", express.static(__dirname + "/public/assets"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
    console.log("🔹 Un jugador se ha conectado:", socket.id);

    socket.on("joinRoom", ({ username, room }) => {
        if (!rooms[room]) return;

        if (rooms[room].length >= 2) {
            socket.emit("roomFull");
            return;
        }

        rooms[room].push(socket.id);
        socket.join(room);

        console.log(`🔹 ${username} asignado a la sala ${room}`);

        if (rooms[room].length === 2) {
            io.to(room).emit("gameStart");
            io.to(rooms[room][0]).emit("yourTurn");
        }
    });

    socket.on("shoot", ({ row, col, room }) => {
        if (!rooms[room] || rooms[room].length < 2) return;

        io.to(room).emit("shotFired", { row, col });

        const nextTurn = rooms[room][0] === socket.id ? rooms[room][1] : rooms[room][0];
        io.to(nextTurn).emit("yourTurn");
        io.to(socket.id).emit("opponentTurn");
    });

    socket.on("disconnect", () => {
        Object.keys(rooms).forEach((room) => {
            rooms[room] = rooms[room].filter(id => id !== socket.id);
            if (rooms[room].length < 2) {
                io.to(room).emit("playerDisconnected");
            }
        });
    });
});

server.listen(3000, () => {
    console.log("✅ Servidor corriendo en el puerto 3000");
});
