import socket from '../socket.js';

class EscenaBatalla extends Phaser.Scene {
    constructor() {
        super({ key: 'EscenaBatalla' });
    }

    init(data) {
        this.sala = data.sala;
        this.rol = data.rol;
    }

    preload() {
        this.load.image("mapa", "../assets/mapa.png");
        this.load.image("bismarckLateral", "../assets/bismarckLateral.png");
        this.load.image("avion", "../assets/avion.png");
    }

    create() {
        this.add.image(0, 0, "mapa").setOrigin(0, 0);

        if (this.rol === "portaaviones") {
            this.add.image(450, 350, "avion").setAngle(-90);
        }

        if (this.rol === "bismarck") {
            this.add.image(450, 150, "avion").setAngle(-90);
            this.add.image(450, 550, "bismarckLateral");
            this.add.circle(450, 150, 10, 0xff0000);
        }

        this.events.on('wake', () => {
            this.simularBatalla();
        });

        socket.on("cambiarModoBatalla", (data) => {
            if (!data.modoBatalla) {
                this.desactivarModoBatalla();
            }
        });
    }

    setEntidadAtacante(entidadAtacante) {
        this.entidadAtacante = entidadAtacante;
    }

    setEntidadDefensor(entidadDefensor) {
        this.entidadDefensor = entidadDefensor;
    }

    desactivarModoBatalla() {
        this.scene.get("EscenaPrincipal").scene.wake();
        this.scene.get("EscenaBatalla").scene.sleep();
    }

    simularBatalla() {
        this.time.removeAllEvents();

        this.time.addEvent({
            delay: 5000,
            callback: () => {
                socket.emit("actualizarModoBatalla", { modoBatalla: false, sala: this.sala });
            }
        });

        console.log(this.entidadAtacante);
        console.log(this.entidadDefensor);
    }

    update() {

    }
}
export default EscenaBatalla;
