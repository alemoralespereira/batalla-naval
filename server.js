const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.get('/', (req, res) => {
    res.send('Servidor de Batalla Naval en Railway funcionando 🚢🔥');
});

io.on('connection', (socket) => {
    console.log(`Jugador conectado: ${socket.id}`);

    socket.on('createRoom', () => {
        let roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
        console.log(`Sala creada: ${roomCode}`);
    });

    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);
        io.to(roomCode).emit('gameStart', roomCode);
        console.log(`Jugador ${socket.id} se unió a la sala ${roomCode}`);
    });

    socket.on('shoot', (data) => {
        io.to(data.roomCode).emit('shotFired', data);
    });

    socket.on('disconnect', () => {
        console.log(`Jugador desconectado: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
