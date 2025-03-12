import socket from '../socket.js';

class Menu extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });
        window.unirseSala = this.unirseSala.bind(this);
        window.recuperarPartida = this.recuperarPartida.bind(this);
        window.reiniciarJuego = this.reiniciarJuego.bind(this);
    }
       create() {
        // Evento cuando un jugador se une a la sala
        socket.on("jugadorConectado", (data) => {
            console.log(`${this.nombreUsuario} se unió a la sala ${this.sala}`);
            document.getElementById("pantalla-login").classList.remove("activa");
            document.getElementById("pantalla-recuperar").classList.remove("activa");
            document.getElementById("contenedor-juego").style.display = "block"; // Este sigue usando display porque no tiene clase activa
            document.getElementById("indicador-turno").innerText = "Esperando jugadores...";
        });

        // Evento cuando el servidor indica que aún falta un jugador
        socket.on("esperandoJugadores", () => {
            document.getElementById("indicador-turno").innerText = "Esperando jugadores...";
        });

        // Evento cuando el servidor indica que el rol ya está asignado
        socket.on("errorUnirse", (data) => {
            alert(data.mensaje);
        });

        // Evento cuando el juego inicia
        socket.on("juegoIniciado", (data) => {
            document.getElementById("pantalla-login").classList.remove("activa");
            document.getElementById("pantalla-recuperar").classList.remove("activa");
            document.getElementById("contenedor-juego").style.display = "block";
            document.getElementById("indicador-turno").innerText = "";
            this.scene.start('EscenaPrincipal', { estadoJuego: data.estadoJuego, rol: this.rol, sala: this.sala, nombreUsuario: this.nombreUsuario });
        });

        // Establecer estado inicial
        this.reiniciarJuego();
    }

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
        socket.emit("unirseSala", { nombreUsuario, sala, rol });
    }

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
    }

    reiniciarJuego() {
        // Restablecer al estado inicial: mostrar solo el menú principal
        document.getElementById("pantalla-menu").classList.add("activa");
        document.getElementById("pantalla-login").classList.remove("activa");
        document.getElementById("pantalla-recuperar").classList.remove("activa");
        document.getElementById("contenedor-juego").style.display = "none";
        document.getElementById("indicador-turno").innerText = "";

        // Limpiar los campos de entrada
        document.getElementById("nombreUsuario").value = "";
        document.getElementById("sala").value = "";
        document.getElementById("rol").value = "";
        document.getElementById("sala-recuperar").value = "";
        document.getElementById("rol-recuperar").value = "";
    }
}

export default Menu;
