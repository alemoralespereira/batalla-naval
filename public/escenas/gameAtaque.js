import socket from '../socket.js';
import Bismarck from '../entidades/bismarck.js';
import Portaaviones from '../entidades/portaaviones.js';
import Avion from '../entidades/avion.js';
import EscenaPrincipal from './game.js';

class EscenaAtaque extends Phaser.Scene {
    constructor() {
        super({ key: 'EscenaAtaque' });
    }

    init(data) {
        this.sala = data.sala;
        this.rol = data.rol;
        this.estadoJuego = data.estadoJuego;
        this.nombreUsuario = data.nombreUsuario;
    }

    preload() {
        this.load.image("mapa", "../assets/mapa.png");
        this.load.image("bismarckLateral", "../assets/bismarckLateral.png");
    }

    create() {
        const mapa = this.add.image(0, 0, "mapa").setOrigin(0, 0);
        this.add.image(450, 330, "bismarckLateral");
        this.add.circle(450, 350, 10, 0xff0000);

        this.events.on('wake', () => {
            this.time.removeAllEvents();

            this.time.addEvent({
                delay: 10000,
                callback: () => {
                    this.desactivarModoAtaque();
                    socket.emit("actualizarModoAtaque", { modoAtaque: false, sala: this.sala });
                }
            });
        });

        socket.on("cambiarModoAtaque", (data) => {
            if (!data.modoAtaque) {
                this.desactivarModoAtaque();
            }
        });
    }

    desactivarModoAtaque() {
        this.scene.get("EscenaPrincipal").scene.wake();
        this.scene.get("EscenaAtaque").scene.sleep();
    }

    update() {

    }
}
export default EscenaAtaque;
