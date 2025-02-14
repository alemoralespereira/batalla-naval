import Menu from './menu.js';
import Game from './game.js';

export const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: "game-container",
    scene: [Menu, Game],
    physics: {
        default: "arcade",
        arcade: { debug: false }
    }
});