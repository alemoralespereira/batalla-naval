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
        this.origenX = data.origenX;
        this.origenY = data.origenY;
        this.destX = data.destX;
        this.destY = data.destY;
    }

    preload() {
               
        this.load.image("mapaLateral", "../assets/mapaLateralv2.png");
        this.load.image("bismarckLateral", "../assets/bismarckLateral.png");
        this.load.image("avionLateral", "../assets/avionLateral.png");
        this.load.image("bismarckFrente", "../assets/bismarckFrente.png");  
    }

    create(){
        
        this.mapaLateral = this.add.image(0, 0, "mapaLateral")
            .setDisplaySize(500, 500) 
            .setOrigin(0, 0);     

        // Asegurar que esta escena esté encima de EscenaPrincipal
        this.scene.bringToTop();
       
        this.time.delayedCall(5000, () => {
            this.scene.stop();
        });

        this.avion = this.physics.add.sprite(125, 125, "avionLateral")
            .setOrigin(0, 0);
        

        this.bismarckFrente = this.physics.add.sprite(300, 300, "bismarckFrente")
            .setOrigin(0, 0);
        
    }
    update(){

    }   
}
export default EscenaAtaque;