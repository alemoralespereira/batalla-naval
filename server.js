const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

let players = [];
let currentTurn = 0; // 0 = Jugador 1, 1 = Jugador 2

app.get("/", (req, res) => {
    res.send("Servidor de Batalla Naval en Railway funcionando 🚢🔥");
});

io.on("connection", (socket) => {
    if (players.length < 2) {
        players.push(socket.id);
        console.log(`Jugador ${players.length} conectado: ${socket.id}`);

        // Avisar al jugador su número
        socket.emit("playerNumber", players.length);

        // Si hay 2 jugadores, iniciar turnos
        if (players.length === 2) {
            io.emit("turn", players[currentTurn]); // Enviar turno al primer jugador
        }
    } else {
        socket.emit("full", "La sala ya está llena.");
        socket.disconnect();
    }

    // Recibir disparos y validar turnos
    socket.on("shoot", (data) => {
        if (socket.id === players[currentTurn]) {
            console.log(`Jugador ${currentTurn + 1} disparó en fila ${data.row}, columna ${data.col}`);
            io.emit("shotFired", data);

            // Cambiar turno
            currentTurn = (currentTurn + 1) % 2;
            io.emit("turn", players[currentTurn]);
        } else {
            console.log("Disparo inválido: No es el turno del jugador");
        }
    });

    socket.on("disconnect", () => {
        console.log("Jugador desconectado:", socket.id);
        players = players.filter(id => id !== socket.id);
        currentTurn = 0;
        io.emit("gameReset"); // Reiniciar el juego si un jugador se va
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
