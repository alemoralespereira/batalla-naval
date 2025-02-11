const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];
let turn = 0;

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Un jugador se ha conectado", socket.id);
    
    if (players.length < 2) {
        players.push(socket.id);
        socket.emit("player", { id: socket.id, index: players.length - 1 });
    }
    
    if (players.length === 2) {
        io.emit("gameStart", players);
        io.to(players[turn]).emit("yourTurn");
    }

    socket.on("shoot", ({ row, col }) => {
        if (socket.id === players[turn]) {
            io.emit("shotFired", { row, col });
            turn = (turn + 1) % 2;
            io.to(players[turn]).emit("yourTurn");
        }
    });

    socket.on("disconnect", () => {
        console.log("Un jugador se ha desconectado", socket.id);
        players = players.filter((player) => player !== socket.id);
        io.emit("playerDisconnected");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});


