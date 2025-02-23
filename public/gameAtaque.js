import socket from './socket.js';
import Bismarck from './entidades/bismarck.js';
import Portaaviones from './entidades/portaaviones.js';
import Avion from './entidades/avion.js';
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
        this.load.image("vistaAtaque", "assets/prueba.png");
    }

    create(){
        const vistaAtaque = this.add.image(0, 0, "vistaAtaque").setOrigin(0, 0);
    }

    update(){

    }   
}
export default EscenaAtaque;