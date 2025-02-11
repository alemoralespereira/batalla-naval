<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Batalla Naval</title>
    <script src="/socket.io/socket.io.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.55.2/phaser.min.js"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Batalla Naval</h1>

    <!-- Pantalla de inicio -->
    <div id="setup-screen">
        <label for="username">Nombre de usuario:</label>
        <input type="text" id="username" placeholder="Escribe tu nombre">
        
        <label for="room">Elige una sala:</label>
        <select id="room">
            <option value="sala1">Sala 1</option>
            <option value="sala2">Sala 2</option>
            <option value="sala3">Sala 3</option>
        </select>

        <button onclick="joinGame()">Unirse</button>
    </div>

    <div id="game-container" style="display: none;">
        <h2 id="turnIndicator">Esperando jugadores...</h2>
        <div id="game-screen"></div>
    </div>

    <script>
        const socket = io();
        window.room = "";

        function joinGame() {
            const username = document.getElementById("username").value.trim();
            window.room = document.getElementById("room").value;

            if (!username) {
                alert("Por favor, ingresa un nombre.");
                return;
            }

            document.getElementById("setup-screen").style.display = "none";
            document.getElementById("game-container").style.display = "block";

            socket.emit("joinRoom", { username, room: window.room });
        }

        socket.on("roomFull", () => {
            alert("Esta sala ya está llena. Elige otra.");
            document.getElementById("setup-screen").style.display = "block";
            document.getElementById("game-container").style.display = "none";
        });

        socket.on("gameStart", () => {
            document.getElementById("turnIndicator").innerText = "¡Juego iniciado!";
            startGame();
        });

        socket.on("yourTurn", () => {
            document.getElementById("turnIndicator").innerText = "🔥 Es tu turno!";
        });

        socket.on("opponentTu
