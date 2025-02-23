import Menu from './menu.js';
import EscenaPrincipal from './game.js';
import EscenaAtaque from './gameAtaque.js';

export const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 900,
    height: 700,
    parent: "contenedor-juego",
    scene: [Menu, EscenaPrincipal, EscenaAtaque],
    physics: {
        default: "arcade",
        arcade: { debug: false }
    }
});