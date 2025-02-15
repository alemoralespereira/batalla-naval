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
            avion:{
                target: null, 
                speed: 0, 
                maxSpeed: 100, 
                acceleration: 2,
            }
        };
    }

    preload() {
        this.load.image("mapa", "assets/mapa.png");
        this.load.image("bismarck", "assets/bismarck.png");
        this.load.image("portaaviones", "assets/carrier.png");
        this.load.image("avion", "assets/avion.png");
    }

    create() {
        // Init mapa
        this.add.image(0, 0, "mapa").setOrigin(0, 0);
    
        // Desestructurar entidades del estado del juego
        const { bismarck, portaaviones, avion } = this.gameState.entities;
        
        // Verificar que las entidades estén definidas
        if (!bismarck || !portaaviones || !avion) {
        console.error("Error: Entidades no definidas en gameState.");
        return;
        }
    
        // Init acorazado
        this.entities.bismarck.target = this.physics.add.sprite(bismarck.x, bismarck.y, "bismarck")
            .setScale(0.5)
            .setOrigin(1, 0.5);
        this.entities.bismarck.speed = bismarck.speed;
    
        // Init portaviones
        this.entities.portaaviones.target = this.physics.add.sprite(portaaviones.x, portaaviones.y, "portaaviones")
            .setScale(0.6)
            .setOrigin(1, 0.5);
        this.entities.portaaviones.speed = portaaviones.speed;
    
        // Init avión
        this.entities.avion.target = this.physics.add.sprite(avion.x, avion.y, "avion")
            .setScale(0.6)
            .setOrigin(1, 0.5);
        this.entities.avion.speed = avion.speed;
    
        // Agregar controles de teclado
        this.cursors = this.input.keyboard.addKeys({
            up: "W",
            left: "A",
            right: "D"
        });
    
        // Actualizar física en cada frame
        this.events.on("update", () => this.moveEntity());
    
        // Evento de actualización de entidades
        socket.on("updateEntityPosition", (data) => {
            console.log("Received position update from server:", data);
    
            if (!this.entities[data.entity]) {
                console.error(`Entity ${data.entity} not found.`);
                return;
            }
    
            const entity = this.entities[data.entity];
            if (entity.target) {
                entity.target.setPosition(data.x, data.y);
                if (typeof data.angle === "number") {
                    entity.target.setAngle(data.angle);
                }
            }
        });
    }

    moveEntity() {
        const entity = this.entities[this.role];
        const sprite = entity.target;

        if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown) {
            // Control de rotación
            if (this.cursors.left.isDown) {
                sprite.setAngularVelocity(-25);
            } else if (this.cursors.right.isDown) {
                sprite.setAngularVelocity(25);
            } else {
                sprite.setAngularVelocity(0);
            }

            // Control de aceleración
            if (this.cursors.up.isDown) {
                entity.speed = Math.min(entity.speed + entity.acceleration, entity.maxSpeed);
            }

            // Calcular nueva velocidad
            const angle = Phaser.Math.DegToRad(sprite.angle);
            sprite.setVelocityX(Math.cos(angle) * entity.speed);
            sprite.setVelocityY(Math.sin(angle) * entity.speed);
        } else {
            // Detener movimiento
            sprite.setVelocityX(0);
            sprite.setVelocityY(0);
            sprite.setAngularVelocity(0);
        }

        // Enviar la nueva posición y rotación al servidor
        socket.emit("moveEntity", {
            room: this.room,
            entity: this.role,
            x: sprite.x,
            y: sprite.y,
            angle: sprite.angle
        });
    }
}

export default Game;