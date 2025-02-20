import Menu from './menu.js';
import Juego from './game.js';

export const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: "contenedor-juego",
    scene: [Menu, Juego],
    physics: {
        default: "arcade",
        arcade: { debug: true }
    }
});