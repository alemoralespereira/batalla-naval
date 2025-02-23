import Menu from './menu.js';
import EscenaAerea from './game.js';

export const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 900,
    height: 700,
    parent: "contenedor-juego",
    scene: [Menu, EscenaAerea],
    physics: {
        default: "arcade",
        arcade: { debug: false }
    }
});