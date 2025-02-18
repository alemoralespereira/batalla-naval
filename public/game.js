import socket from './socket.js';
import Bismarck from './bismarck.js';
import Portaaviones from './portaaviones.js';
import Avion from './avion.js';

class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    //init()    -> Se ejecuta una sola vez al iniciar la escena.
    //          -> Se usa para inicializar variables y recibir parámetros.
    init(data) {
        this.room = data.room;
        this.role = data.role;
        // Inicializar bismarck y portaaviones
        this.entities = {
            bismarck: new Bismarck(data.gameState.entities.bismarck),
            portaaviones: new Portaaviones(data.gameState.entities.portaaviones)
        };

        // Inicializar los aviones
        for (let i = 0; i < 10; i++) {
            this.entities[`avion_${i}`] = new Avion(data.gameState.entities.avion);
        }
    }

    //preload() -> Se ejecuta una sola vez después de init().
    //          -> Se usa para cargar imágenes, sonidos y otros assets antes de que se cree la escena.
    preload() {
        this.load.image("mapa", "assets/mapa.png");
        this.load.image("bismarck", "assets/bismarck.png");
        this.load.image("portaaviones", "assets/carrier.png");
        this.load.image("avion", "assets/avion.png");
    }

    //create()  -> Se ejecuta una vez después de preload().
    //          -> Se usa para inicializar sprites, físicas y objetos del juego.
    create() {

        // Mostrar el mapa para ambos roles
        const mapa = this.add.image(0, 0, "mapa").setOrigin(0, 0);
        
        // Ajustar los límites de la camara principal al tamaño del mapa
        this.cameras.main.setBounds(0, 0, mapa.width, mapa.height);
        
        // Crear una segunda cámara para el minimapa
        this.minimapCamera = this.cameras.add(1100, 550, 200, 200) // (x, y, width, height)
            .setZoom(0.1) 
            .setBackgroundColor('#00008B')
            .setName('minimapa');

/*        // Agregar un borde al minimapa
        const minimapBorder = this.add.rectangule(
            this.minimapCamera.x + this.minimapCamera.width / 2,
            this.minimapCamera.y + this.minimapCamera.height / 2,
            this.minimapCamera.width,
            this.minimapCamera.height
        )
        .setStrokeStyle(2, 0xffffff) // Borde blanco de 2 píxeles
        .setScrollFactor(0); // El borde no se mueve con la cámara principal
*/        
        // Mostrar el mapa en el minimapa
        //mapa.setScrollFactor(0); // El mapa no se mueve con la cámara principal
        this.minimapCamera.ignore(mapa); // Ignorar el mapa en la cámara del minimapa

        // Crear el panel de selección solo si el rol es "portaaviones"
        if (this.role === "portaaviones") {
            this.entityPanel = this.add.group(); // Panel para los botones de selección
    
            // Boton para seleccionar el portaaviones
            const portaavionesButton = this.add.text(20, 50, 'Portaaviones', { 
                fill: '#ffffff',                        // Texto blanco
                backgroundColor: '#000000',             // Fondo negro
                padding: { x: 10, y: 5 }                //Espaciado interno
            })
            .setInteractive({ useHandCursor: true })    //Hacer el texto interactivo
            .on('pointerdown', () => {
                this.selectEntity('portaaviones');
            });
            portaavionesButton.setScrollFactor(0);      //Fijar boton en la pantalla
            this.entityPanel.add(portaavionesButton);   //Agregar boton al panel.
    
            // Botones para seleccionar los aviones
            for (let i = 0; i < 10; i++) {
                const button = this.add.text(20, 80 + i * 30, `Avión ${i + 1}`, { 
                    fill: '#ffffff', 
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                })
                .setInteractive({ useHandCursor: true }) // Hacer el texto interactivo
                .on('pointerdown', () => {
                    this.selectEntity(`avion_${i}`);
                });
                button.setScrollFactor(0);          //Fijar boton en la pantalla
                this.entityPanel.add(button);       //Agregar boton al panel.
            }

            // seleccionar portaaviones por defecto
            this.selectedEntity = "portaaviones";
        }
  
        //CREAR ENTIDADES
        //********************************************************/
        // Crear Bismarck
        this.entities.bismarck.init(this);
        
        // Configurar la cámara para seguir al Bismarck
        this.cameras.main.startFollow(this.entities.bismarck.target);
        
        // Crear Portaaviones
        this.entities.portaaviones.init(this);
              
        // Crear los aviones
        for (let i = 0; i < 10; i++) {
            this.entities[`avion_${i}`].init(this);
        }

        // Agregar controles de teclado
        this.cursors = this.input.keyboard.addKeys({
            up: "W",
            left: "A",
            right: "D",
            down: "S"
        });
    
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

    //update()  -> Se ejecuta en cada frame, después de create().
    //          -> Se usa para la lógica del juego en tiempo real (movimientos, colisiones, etc.).
    update() {
        this.moveEntity();
        
        this.entities.bismarck.update();
    }

     // Función para cambiar la camara a la entidad seleccionada.
     changeCameraTarget(entity) {
        if (this.entities[entity] && this.entities[entity].target) {
            this.cameras.main.startFollow(this.entities[entity].target);
            console.log(`Cámara siguiendo a ${entity}`);
        } else {
            console.error(`Entidad ${entity} no encontrada.`);
        }
    }

    //Funcion para seleccionar entidad y cambiar de camara.
    selectEntity(entity) {
        if (this.role === "portaaviones" && this.entities[entity]) {
            this.selectedEntity = entity;       // Guardar la entidad seleccionada
            this.changeCameraTarget(entity);    // Cambiar la cámara para seguir la entidad seleccionada
            console.log(`Entidad seleccionada: ${entity}`);
        } else {
            console.error(`Entidad ${entity} no encontrada o rol incorrecto.`);
        }
    }

    moveEntity() {
        let entity = null;
        let entityName = "";

        // Mover el Bismarck
        if (this.role === "bismarck") {
            entity = this.entities.bismarck;
            entityName = "bismarck";
        } else if (this.selectedEntity && this.entities[this.selectedEntity]) {
            // Mover la entidad seleccionada (portaaviones o avión)
            entity = this.entities[this.selectedEntity];
            entityName = this.selectedEntity;
        }

        if (entity) {
            entity.move(this.cursors);
            socket.emit("moveEntity", {
                room: this.room,
                entity: entityName,
                x: entity.x,
                y: entity.y,
                angle: entity.angle
            });
        } else {
            console.error("No hay entidad seleccionada o no es válida.");
        }
    }
}

export default Game;