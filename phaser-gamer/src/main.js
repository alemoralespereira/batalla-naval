import BattleScene from "./scenes/BattleScene.js";

window.addEventListener('load', function () {
    var game = new Phaser.Game({
        width: 1280,
        height: 720,
        type: Phaser.AUTO,
        backgroundColor: "#242424",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    });

    game.scene.add("BattleScene", BattleScene);
    game.scene.start("BattleScene");
});
