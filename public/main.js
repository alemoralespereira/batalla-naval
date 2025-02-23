import Menu from './menu.js';
import EscenaAerea from './game.js';

export const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 3200,
    height: 3200,
    parent: "contenedor-juego",
    scene: [Menu, EscenaAerea],
    physics: {
        default: "arcade",
        arcade: { debug: true }
    }
});