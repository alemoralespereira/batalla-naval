import socket from './socket.js';

class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    init(data) {
        this.room = data.room;
        this.role = data.role;
        this.gameState = data.gameState;
        // Inicializar bismarck y portaaviones
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
                acceleration: 1 }
        };
        
        // Inicializar los aviones
        for (let i = 0; i < 10; i++) {
            this.entities[`avion_${i}`] = {
                target: null,
                speed: 0,
                maxSpeed: 100,
                acceleration: 2
            };
        }
        console.log(`Rol del jugador: ${this.role}`); // Verificar el rol en la consola

        // Mostrar el panel de selección solo para el jugador con rol "portaaviones"
        if (this.role === "portaaviones") {
            this.showEntityPanel = true; // Bandera para mostrar el panel
        } else {
            this.showEntityPanel = false; // Ocultar el panel para otros roles
        }
    }

    preload() {
        this.load.image("mapa", "assets/mapa.png");
        this.load.image("bismarck", "assets/bismarck.png");
        this.load.image("portaaviones", "assets/carrier.png");
        this.load.image("avion", "assets/avion.png");
    }

    create() {
        // Mostrar el mapa (esto debe hacerse para ambos roles)
        const mapa = this.add.image(0, 0, "mapa").setOrigin(0, 0);
        console.log("Mapa creado:", mapa);
    
        // Crear el panel de selección solo si el rol es "portaaviones"
        if (this.role === "portaaviones") {
            this.entityPanel = this.add.group(); // Grupo para los botones de selección
    
            // Botón para seleccionar el portaaviones
            const portaavionesButton = this.add.text(20, 50, 'Portaaviones', { 
                fill: '#ffffff', // Texto blanco
                backgroundColor: '#000000', // Fondo negro
                padding: { x: 10, y: 5 } // Espaciado interno
            })
            .setInteractive({ useHandCursor: true }) // Hacer el texto interactivo
            .on('pointerdown', () => {
                console.log("Botón portaaviones clickeado"); // Verificar en la consola
                this.selectEntity('portaaviones');
            });
    
            portaavionesButton.setDepth(1000); // Colocar el botón en una capa superior
            this.entityPanel.add(portaavionesButton);
    
            // Botones para seleccionar los aviones
            for (let i = 0; i < 10; i++) {
                const button = this.add.text(20, 80 + i * 30, `Avión ${i + 1}`, { 
                    fill: '#ffffff', 
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                })
                .setInteractive({ useHandCursor: true }) // Hacer el texto interactivo
                .on('pointerdown', () => {
                    console.log(`Botón avión ${i + 1} clickeado`); // Verificar en la consola
                    this.selectEntity(`avion_${i}`);
                });
    
                this.entityPanel.add(button);
            }
    
            console.log("Panel de selección creado para el portaaviones");
        }
    
        // Verificar que las entidades estén definidas
        if (!this.gameState.entities.bismarck || !this.gameState.entities.portaaviones || !this.gameState.entities.avion) {
            console.error("Error: Entidades no definidas en gameState.");
            return;
        }
    
        // Crear entidades según el rol del jugador
        if (this.role === "bismarck") {
            // Crear el Bismarck
            this.entities.bismarck.target = this.physics.add.sprite(
                this.gameState.entities.bismarck.x,
                this.gameState.entities.bismarck.y,
                "bismarck"
            )
            .setScale(0.8)
            .setOrigin(0.5, 0.5);
    
            console.log("Bismarck creado:", this.entities.bismarck.target);
    
            // Configurar la cámara para seguir al Bismarck
            this.cameras.main.startFollow(this.entities.bismarck.target);
            console.log("Cámara siguiendo al Bismarck");
        } else if (this.role === "portaaviones") {
            // Crear el portaaviones
            this.entities.portaaviones.target = this.physics.add.sprite(
                this.gameState.entities.portaaviones.x,
                this.gameState.entities.portaaviones.y,
                "portaaviones"
            )
            .setScale(1.1)
            .setOrigin(0.5, 0.5);
    
            console.log("Portaaviones creado:", this.entities.portaaviones.target);
    
            // Crear los aviones (solo para el portaaviones)
            for (let i = 0; i < 10; i++) {
                this.entities[`avion_${i}`].target = this.physics.add.sprite(
                    this.gameState.entities.avion.x, // Ajusta las coordenadas según sea necesario
                    this.gameState.entities.avion.y,
                    "avion"
                )
                .setScale(0.2)
                .setOrigin(0.5, 0.5);
    
                console.log(`Avión ${i} creado:`, this.entities[`avion_${i}`].target);
            }
    
            // Configurar la cámara para seguir al portaaviones
            this.cameras.main.startFollow(this.entities.portaaviones.target);
            console.log("Cámara siguiendo al portaaviones");
        }
    
        // Ajustar los límites de la cámara al tamaño del mapa
        this.cameras.main.setBounds(0, 0, mapa.width, mapa.height);
        console.log("Límites de la cámara configurados:", mapa.width, mapa.height);
    
        // Agregar controles de teclado
        this.cursors = this.input.keyboard.addKeys({
            up: "W",
            left: "A",
            right: "D",
            down: "S"
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

    selectEntity(entity) {
        if (this.role === "portaaviones" && this.entities[entity]) {
            this.selectedEntity = entity; // Guardar la entidad seleccionada
            console.log(`Entidad seleccionada: ${entity}`);
        } else {
            console.error(`Entidad ${entity} no encontrada o rol incorrecto.`);
        }
    }

    moveEntity() {
        if (this.role === "bismarck") {
            // Mover el Bismarck
            const bismarck = this.entities.bismarck;
            const sprite = bismarck.target;
    
            if (!sprite) {
                console.error("Sprite del Bismarck no encontrado.");
                return;
            }
    
            // Movimiento con las teclas W, A, S, D
            if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) {
                // Rotación (A y D)
                if (this.cursors.left.isDown) {
                    sprite.setAngularVelocity(-25);
                } else if (this.cursors.right.isDown) {
                    sprite.setAngularVelocity(25);
                } else {
                    sprite.setAngularVelocity(0);
                }
    
                // Aceleración (W y S)
                if (this.cursors.up.isDown) {
                    bismarck.speed = Math.min(bismarck.speed + bismarck.acceleration, bismarck.maxSpeed);
                } else if (this.cursors.down.isDown) {
                    bismarck.speed = Math.max(bismarck.speed - bismarck.acceleration, -bismarck.maxSpeed);
                }
    
                // Calcular nueva velocidad
                const angle = Phaser.Math.DegToRad(sprite.angle);
                sprite.setVelocityX(Math.cos(angle) * bismarck.speed);
                sprite.setVelocityY(Math.sin(angle) * bismarck.speed);
            } else {
                // Detener movimiento
                sprite.setVelocityX(0);
                sprite.setVelocityY(0);
                sprite.setAngularVelocity(0);
            }
    
            // Enviar la posición del Bismarck al servidor
            socket.emit("moveEntity", {
                room: this.room,
                entity: "bismarck",
                x: sprite.x,
                y: sprite.y,
                angle: sprite.angle
            });
        } else if (this.selectedEntity && this.entities[this.selectedEntity]) {
            // Mover la entidad seleccionada (portaaviones o avión)
            const entity = this.entities[this.selectedEntity];
            const sprite = entity.target;
    
            if (!sprite) {
                console.error(`Sprite no encontrado para la entidad ${this.selectedEntity}`);
                return;
            }
    
            // Movimiento con las teclas W, A, S, D
            if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) {
                // Rotación (A y D)
                if (this.cursors.left.isDown) {
                    sprite.setAngularVelocity(-25);
                } else if (this.cursors.right.isDown) {
                    sprite.setAngularVelocity(25);
                } else {
                    sprite.setAngularVelocity(0);
                }
    
                // Aceleración (W y S)
                if (this.cursors.up.isDown) {
                    entity.speed = Math.min(entity.speed + entity.acceleration, entity.maxSpeed);
                } else if (this.cursors.down.isDown) {
                    entity.speed = Math.max(entity.speed - entity.acceleration, -entity.maxSpeed);
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
    
            // Enviar la posición de la entidad al servidor
            socket.emit("moveEntity", {
                room: this.room,
                entity: this.selectedEntity,
                x: sprite.x,
                y: sprite.y,
                angle: sprite.angle
            });
        } else {
            console.error("No hay entidad seleccionada o no es válida.");
        }
    }
}

export default Game;