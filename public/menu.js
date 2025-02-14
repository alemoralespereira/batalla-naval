import socket from './socket.js';

class Menu extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });

        // Exponemos la funcion "joinGame" para que pueda ser llamada desde "index.html"
        window.joinGame = this.joinGame.bind(this);
    }

    create() {
        // Evento cuando un jugador se une a la sala
        socket.on("playerJoined", (data) => {
            console.log(`${this.username} se unió a la sala ${this.room}`);

            // Mostrar pantalla de juego con mensaje de espera si aún falta un jugador
            document.getElementById("login-screen").style.display = "none";
            document.getElementById("game-container").style.display = "block";
            document.getElementById("turn-indicator").innerText = "Esperando jugadores...";
        });

        // Evento cuando el servidor indica que aún falta un jugador
        socket.on("waitingForPlayers", () => {
            document.getElementById("turn-indicator").innerText = "Esperando jugadores...";
        });

        // // Deshabilitar rol ya elegido
        // socket.on("disableRole", (roleToDisable) => {
        //     let roleSelect = document.getElementById("role");
        //     for (let i = 0; i < roleSelect.options.length; i++) {
        //         if (roleSelect.options[i].value === roleToDisable) {
        //             roleSelect.options[i].disabled = true;
        //         }
        //     }
        // });

        // Evento cuando el juego inicia
        socket.on("gameStart", (data) => {
            document.getElementById("login-screen").style.display = "none"; // Ocultar login
            document.getElementById("game-container").style.display = "block"; // Mostrar juego

            // Inicializar el Juego
            this.scene.start('Game', { gameState: data.gameState, role: this.role, room: this.room });
        });
    }

    // Función para unirse al juego
    joinGame() {
        const username = document.getElementById("username").value;
        const room = document.getElementById("room").value;
        const role = document.getElementById("role").value;

        if (!username || !room || !role) {
            alert("Debes ingresar un nombre, seleccionar una sala y un rol.");
            return;
        }

        this.username = username;
        this.room = room;
        this.role = role;

        // Emitir evento para unirse a la sala con el rol seleccionado
        socket.emit("joinRoom", { username, room, role });
    }
}

export default Menu;
