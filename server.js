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

app.get("/", (req, res) => {
    res.send("Servidor de Batalla Naval en Railway funcionando 🚢🔥");
});

// Manejar conexiones de jugadores
io.on("connection", (socket) => {
    console.log("Jugador conectado:", socket.id);

    // Recibir disparos y enviarlos a todos los jugadores
    socket.on("shoot", (data) => {
        console.log(`Disparo en fila ${data.row}, columna ${data.col}`);
        io.emit("shotFired", data);
    });

    // Manejar desconexión
    socket.on("disconnect", () => {
        console.log("Jugador desconectado:", socket.id);
    });
});

// Usar el puerto que proporciona Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
