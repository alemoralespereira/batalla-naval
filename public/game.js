// Conexión con el servidor
const socket = io();

// Variables globales del juego
let username;
let room;
let role;  // 'battleship' o 'carrier'
let game;
let isMyTurn = false; // Control del turno
let entity; // La entidad del jugador

// Función para unirse al juego
function joinGame() {
    username = document.getElementById("username").value;
    room = document.getElementById("room").value;
    role = document.getElementById("role").value;

    if (!username || !room || !role) {
        alert("Debes ingresar un nombre, seleccionar una sala y un rol.");
        return;
    }

    // Emitir evento para unirse a la sala con el rol seleccionado
    socket.emit("joinRoom", { username, room, role });
}

// Evento cuando un jugador se une a la sala
socket.on("playerJoined", (data) => {
    console.log(`${data.username} se unió a la sala ${room}`);

// Mostrar pantalla de juego con mensaje de espera si aún falta un jugador
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    document.getElementById("turn-indicator").innerText = "Esperando jugadores...";
});


// Evento cuando el servidor indica que aún falta un jugador
socket.on("waitingForPlayers", () => {
    document.getElementById("turn-indicator").innerText = "Esperando jugadores...";
});


// Evento cuando el juego inicia
socket.on("gameStart", (data) => {
    document.getElementById("login-screen").style.display = "none"; // Ocultar login
    document.getElementById("game-container").style.display = "block"; // Mostrar juego

    isMyTurn = socket.id === data.turn; // 🔹 Comparar con socket.id en lugar de username

    // Actualizar indicador de turno
    updateTurnIndicator();

    // Inicializar Phaser
    initGame();
});

// Inicializar Phaser y la escena de juego
function initGame() {
    game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 1280,
        height: 720,
        parent: "game-container",
        scene: {
            preload: preload,
            create: create,
        },
        physics: {
            default: "arcade",
            arcade: { debug: false }
        }
    });
}

// Cargar recursos
function preload() {
    this.load.image("water", "assets/water.png");
    this.load.image("battleship", "assets/battleship.png");
    this.load.image("carrier", "assets/carrier.png");
}

// Crear escena de juego
function create() {
    this.add.tileSprite(0, 0, this.scale.width * 2, this.scale.height * 2, "water").setOrigin(0, 0);

    // Crear la entidad correspondiente al rol del jugador
    if (role === "battleship") {
        entity = this.physics.add.sprite(600, 400, "battleship").setScale(0.5).setInteractive();
    } else {
        entity = this.physics.add.sprite(300, 200, "carrier").setScale(0.6).setInteractive();
    }

// Evento de clic para mover la entidad si es el turno del jugador
this.input.on("pointerdown", (pointer) => {
    if (isMyTurn) {
        moveEntity(entity, pointer.x, pointer.y);
        socket.emit("moveEntity", { room, entity: role, x: pointer.x, y: pointer.y });

        // 🔹 Bloquear turno hasta que el servidor confirme el cambio
        isMyTurn = false;
        updateTurnIndicator();
    }
});

// Evento de actualización de entidades (los jugadores ven reflejados los movimientos)
socket.on("updateEntity", (data) => {
    if (data.entity === role) {
        moveEntity(entity, data.x, data.y);
    }
});

// Evento de cambio de turno
socket.on("turnChange", (data) => {
    isMyTurn = socket.id === data.turn;
    updateTurnIndicator();
});
}

// Función para mover la entidad
function moveEntity(entity, x, y) {
    game.scene.scenes[0].tweens.add({
        targets: entity,
        x: x,
        y: y,
        duration: 1000,
        ease: "Power2"
    });
}

// Función para actualizar el indicador de turno en pantalla
function updateTurnIndicator() {
    document.getElementById("turn-indicator").innerText = isMyTurn ? "Tu turno" : "Turno del oponente";
}

// Deshabilitar rol ya elegido
socket.on("disableRole", (roleToDisable) => {
    let roleSelect = document.getElementById("role");
    for (let i = 0; i < roleSelect.options.length; i++) {
        if (roleSelect.options[i].value === roleToDisable) {
            roleSelect.options[i].disabled = true;
        }
    }
});
