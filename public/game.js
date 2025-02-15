import socket from './socket.js';

class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    init(data) {
        this.room = data.room;
        this.role = data.role;
        this.gameState = data.gameState;
        this.entities = {
            bismarck: { 
                target: null, 
                speed: 0, 
                maxSpeed: 50, 
                acceleration: 1,
            },

            portaaviones: { 
                target: null, 
                speed: 0, 
                maxSpeed: 50, 
                acceleration: 1 },
        };
    }

    preload() {
        //this.load.image("water", "assets/water.png");
        this.load.image("mapa", "assets/mapa.png");
        this.load.image("bismarck", "assets/bismarck.png");
        this.load.image("portaaviones", "assets/carrier.png");
    }

    create() {
        // Init mapa
        //this.add.tileSprite(0, 0, this.scale.width * 2, this.scale.height * 2, "water").setOrigin(0, 0);
        this.add.image(0, 0, "mapa").setOrigin(0, 0);

        const { bismarck, portaaviones } = this.gameState.entities;

        // Init acorazado
        this.entities.bismarck.target = this.physics.add.sprite(bismarck.x, bismarck.y, "bismarck").setScale(0.5).setOrigin(1, 0.5);
        this.entities.bismarck.speed = bismarck.speed;

        // Init portaviones
        this.entities.portaaviones.target = this.physics.add.sprite(portaaviones.x, portaaviones.y, "portaaviones").setScale(0.6).setOrigin(1, 0.5);;
        this.entities.portaaviones.speed = portaaviones.speed;

         // Hacer que la cámara siga la entidad del jugador
        //this.cameras.main.startFollow(this.entities[this.role].target, true, 0.05, 0.05);

        // Agregar controles de teclado
        this.cursors = this.input.keyboard.addKeys({
            up: "W",
            left: "A",
            right: "D"
        });

        // Actualizar física en cada frame
        this.events.on("update", () => this.moverEntidad());

       // Evento de actualización de entidades (los jugadores ven reflejados los movimientos)
       socket.on("updateEntityPosition", (data) => {
        if (this.entities[data.entity]) {
            const entity = this.entities[data.entity];
            // Actualizar la posición directamente
            entity.target.setPosition(data.x, data.y);
        }
        });
    }

   moverEntidad() {
        const entity = this.entities[this.role];
        const sprite = entity.target;

        if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown ) {
            
            // Control de rotación: solo girar cuando se presionan las teclas A o D
            if (this.cursors.left.isDown) {
                sprite.setAngularVelocity(-25); // Gira a la izquierda
            } else if (this.cursors.right.isDown) {
                sprite.setAngularVelocity(25); // Gira a la derecha
            } else {
                sprite.setAngularVelocity(0); // No gira si no se presiona ninguna tecla
            }

             // Control de aceleración: acelerar cuando se presionan W 
             if (this.cursors.up.isDown) {
                // Acelera el barco
                entity.speed = Math.min(entity.speed + entity.acceleration, entity.maxSpeed);
            }

            // Calcular nueva velocidad
            const angle = Phaser.Math.DegToRad(sprite.angle);
            sprite.setVelocityX(Math.cos(angle) * entity.speed);
            sprite.setVelocityY(Math.sin(angle) * entity.speed);
        } else {
            // Si no se presionan teclas, la velocidad y la rotación se detienen
            sprite.setVelocityX(0);
            sprite.setVelocityY(0);
            sprite.setAngularVelocity(0);
        }
    }
}

export default Game;
