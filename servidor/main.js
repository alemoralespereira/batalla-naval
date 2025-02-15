const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 8080;

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "../public")));

// Almacenar información de las salas y jugadores
let rooms = {};

io.on("connection", (socket) => {
    console.log("🟢 Nuevo jugador conectado:", socket.id);

    socket.on("joinRoom", ({ username, room, role }) => {
        if (!rooms[room]) {
            rooms[room] = { players: [], gameState: { entities: {} } };
        }

        // Verificar si la sala ya tiene el rol seleccionado
        // const existingRole = rooms[room].players.find(player => player.role === role);
        // if (existingRole) {
        //     socket.emit("roleTaken", { message: "Este rol ya ha sido seleccionado. Elige otro." });
        //     return;
        // }

        // Agregar jugador a la sala
        rooms[room].players.push({ id: socket.id, username, role });
        socket.join(room);

        console.log(`📌 ${username} se unió a la sala ${room} como ${role}`);

        // Notificar a todos en la sala
        io.to(room).emit("playerJoined", {
            message: `${username} se unió como ${role}`,
            players: rooms[room].players.map(p => ({ username: p.username, role: p.role }))
        });


        // Si solo hay un jugador, enviar evento de espera
        if (rooms[room].players.length === 1) {
            io.to(room).emit("waitingForPlayers");
        }

        // Iniciar juego cuando hay dos jugadores
        if (rooms[room].players.length === 2) {
            rooms[room].gameState.entities = {
                bismarck: { x: 600, y: 400, speed: 200 },
                portaaviones: { x: 300, y: 200, speed: 150 }
            };

            io.to(room).emit("gameStart", {
                message: "El juego ha comenzado",
                players: rooms[room].players,
                gameState: rooms[room].gameState,
            });

            console.log(`🎮 Juego iniciado en la sala ${room}`);
        }
    });

    socket.on("moveEntity", ({ room, entity, x, y, angle }) => {
        console.log("Received position update from client:", { room, entity, x, y, angle });
    
        if (!rooms[room]) return;
    
        // Actualizar la posición y la rotación de la entidad
        rooms[room].gameState.entities[entity].x = x;
        rooms[room].gameState.entities[entity].y = y;
        rooms[room].gameState.entities[entity].angle = angle;
    
        // Emitir actualización a todos en la sala excepto al cliente que envió la actualización
        socket.to(room).emit("updateEntityPosition", { entity, x, y, angle });
    });

    // Desconexión del jugador
    socket.on("disconnect", () => {
        for (const room in rooms) {
            rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id);
            if (rooms[room].players.length === 0) {
                delete rooms[room]; // Eliminar sala si no quedan jugadores
            } else {
                io.to(room).emit("playerLeft", { message: "Un jugador ha salido." });
            }
        }
        console.log("🔴 Jugador desconectado:", socket.id);
    });
});

// Iniciar servidor en el puerto 3000
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
