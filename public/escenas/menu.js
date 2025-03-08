import socket from '../socket.js';

class Menu extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });

        // Exponemos la función "unirseSala" para que pueda ser llamada desde "index.html"
        window.unirseSala = this.unirseSala.bind(this);
        window.recuperarPartida = this.recuperarPartida.bind(this);
    }

    create() {
        // Evento cuando un jugador se une a la sala
        socket.on("jugadorConectado", (data) => {
            console.log(`${this.nombreUsuario} se unió a la sala ${this.sala}`);

            // Mostrar pantalla de juego con mensaje de espera si aún falta un jugador
            document.getElementById("pantalla-login").style.display = "none";
            document.getElementById("pantalla-recuperar").style.display = "none";
            document.getElementById("contenedor-juego").style.display = "block";
            document.getElementById("indicador-turno").innerText = "Esperando jugadores...";
        });

        // Evento cuando el servidor indica que aún falta un jugador
        socket.on("esperandoJugadores", () => {
            document.getElementById("indicador-turno").innerText = "Esperando jugadores...";
        });

        // Evento cuando el servidor indica que el rol ya esta asignado
        socket.on("errorUnirse", (data) => {
            alert(data.mensaje); // Muestra el error al usuario
        });

        // Evento cuando el juego inicia
        socket.on("juegoIniciado", (data) => {
            document.getElementById("pantalla-login").style.display = "none"; // Ocultar login
            document.getElementById("pantalla-recuperar").style.display = "none";
            document.getElementById("contenedor-juego").style.display = "block"; // Mostrar juego
            document.getElementById("indicador-turno").innerText = "";

            // Inicializar el Juego
            this.scene.start('EscenaPrincipal', { estadoJuego: data.estadoJuego, rol: this.rol, sala: this.sala, nombreUsuario: this.nombreUsuario });
        });

    }

    // Función para unirse a la sala
    unirseSala() {
        const nombreUsuario = document.getElementById("nombreUsuario").value;
        const sala = document.getElementById("sala").value;
        const rol = document.getElementById("rol").value;

        if (!nombreUsuario) {
            alert("Debe ingresar un nombre de usuario para continuar.");
            return;
        } 
        if (!sala) {
            alert("Debe seleccionar una sala para continuar.");
            return;
        } 
        if (!rol) {
            alert("Debe seleccionar un rol para continuar.");
            return;
        }

        this.nombreUsuario = nombreUsuario;
        this.sala = sala;
        this.rol = rol;

        console.log("📡 Enviando solicitud para unirse:", { nombreUsuario, sala, rol });
        // Emitir evento para unirse a la sala con el rol seleccionado
        socket.emit("unirseSala", { nombreUsuario, sala, rol });
    }

    // Funcion para recuperar una partida
    recuperarPartida() {
        const sala = document.getElementById('sala-recuperar').value;
        const rol = document.getElementById('rol-recuperar').value;
        
        if (!sala) {
            alert("Debe seleccionar una sala para continuar.");
            return;
        } 
        if (!rol) {
            alert("Debe seleccionar un rol para continuar.");
            return;
        }

        this.sala = sala;
        this.rol = rol;

        console.log("📡 Enviando solicitud para recuperar partida:", { sala, rol });
        socket.emit("recuperarPartida", { sala, rol });
        /*socket.emit('recuperarPartida', { sala, rol }, (respuesta) => {
            if (respuesta.success) {
                document.getElementById('pantalla-recuperar').classList.remove('activa');
                document.getElementById('contenedor-juego').style.display = 'block';
            } else {
                alert('No se encontró una partida guardada en esta sala.');
            }
        });*/
    }
}

export default Menu;