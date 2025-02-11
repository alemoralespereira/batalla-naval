const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

// Lista de jugadores y turno actual
let players = [];
let turn = 0;

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, "public")));

// Asegurar que "index.html" se sirva correctamente
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log("🔹 Un jugador se ha conectado:", socket.id);

    if (players.length < 2) {
        players.push(socket.id);
        socket.emit("player", { id: socket.id, index: players.length - 1 });
    }

    if (players.length === 2) {
        console.log("🎮 El juego ha comenzado. Jugadores:", players);
        io.emit("gameStart", players);
        
        // Asignar turno al primer jugador
        io.to(players[turn]).emit("yourTurn", true);
        console.log(`✅ Turno asignado a: ${players[turn]}`);
    }

    socket.on("shoot", ({ row, col }) => {
        if (players.length === 2 && socket.id === players[turn]) {
            console.log(`🎯 Disparo en fila ${row}, columna ${col} por ${socket.id}`);
            io.emit("shotFired", { row, col });

            // Cambiar turno
            turn = (turn + 1) % 2;
            io.to(players[turn]).emit("yourTurn", true);
            io.to(players[(turn + 1) % 2]).emit("yourTurn", false);
            console.log(`🔄 Turno cambiado a: ${players[turn]}`);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ Un jugador se ha desconectado:", socket.id);
        players = players.filter((player) => player !== socket.id);
        
        if (players.length < 2) {
            io.emit("playerDisconnected");
            turn = 0;
        }
    });
});

// Escuchar en el puerto correcto de Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
