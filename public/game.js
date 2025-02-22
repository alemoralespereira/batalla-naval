import socket from './socket.js';
import Bismarck from './entidades/bismarck.js';
import Portaaviones from './entidades/portaaviones.js';
import Avion from './entidades/avion.js';

class EscenaAerea extends Phaser.Scene {
    constructor() {
        super({ key: 'EscenaAerea' });
    }

    init(data) {
        this.sala = data.sala;
        this.rol = data.rol;
        this.estadoJuego = data.estadoJuego;

        // Inicializar bismarck y portaaviones
        this.entidades = {
            bismarck: new Bismarck(data.estadoJuego.entidades.bismarck),
            portaaviones: new Portaaviones(data.estadoJuego.entidades.portaaviones)
        };

        // Inicializar los aviones
        for (let i = 0; i < 10; i++) {
            const nombreAvion = `avion_${i}`;
            this.entidades[nombreAvion] = new Avion(data.estadoJuego.entidades[nombreAvion]);
        }
    }

    preload() {
        this.load.image("mapa", "assets/mapa.png");
        this.load.image("bismarck", "assets/bismarck.png");
        this.load.image("portaaviones", "assets/carrier.png");
        // this.load.image("avion", "assets/avion.png");
    }

    create() {
        // Mostrar el mapa para ambos roles
        const mapa = this.add.image(0, 0, "mapa").setOrigin(0, 0);

        this.physics.world.setBounds(0, 0, 1800, 1800);
        this.physics.world.setBoundsCollision(true, true, true, true);

        // Ajustar los límites de la cámara principal al tamaño del mapa
        this.cameras.main.setBounds(0, 0, mapa.width, mapa.height);
        // Crear una segunda cámara para el minimapa
        this.camaraMinimapa = this.cameras.add(1100, 550, 200, 200) // (x, y, width, height)
            .setZoom(0.1)
            .setBackgroundColor('#00008B')
            .setName('minimapa');

        this.camaraMinimapa.ignore(mapa); // Ignorar el mapa en la cámara del minimapa

        // CREAR EQUIPOS
        //********************************************************/
        //this.equipoRojo = this.physics.add.group();
        this.equipoAzul = this.physics.add.group();

        // CREAR ENTIDADES
        //********************************************************/
        // Crear Bismarck
        this.entidades.bismarck.init(this);
        this.entidades.bismarck.objetivo.setCollideWorldBounds(true);
        //this.equipoRojo.add(this.entidades.bismarck.objetivo);

        // Crear Portaaviones
        this.entidades.portaaviones.init(this);
        this.entidades.portaaviones.objetivo.setCollideWorldBounds(true);
        this.equipoAzul.add(this.entidades.portaaviones.objetivo);

        // Crear los aviones
        for (let i = 0; i < 10; i++) {
            const nombreAvion = `avion_${i}`;
            this.entidades[nombreAvion].init(this);
            this.entidades[nombreAvion].objetivo.setCollideWorldBounds(true);
            this.equipoAzul.add(this.entidades[nombreAvion].objetivo)
        }
        //********************************************************/


        // this.physics.add.collider(this.entidades.bismarck.objetivo, this.equipoAzul, this.ejecutar, null, this);
        // this.physics.add.collider(this.equipoAzul, this.entidades.bismarck.objetivo, this.ejecutar, null, this);


        // Crear el panel de selección solo si el rol es "portaaviones"
        if (this.rol === "portaaviones") {
            this.nombreEntidadSeleccionada = "portaaviones";
            this.panelEntidades = this.add.group(); // Panel para los botones de selección

            // Botón para seleccionar el portaaviones
            const botonPortaaviones = this.add.text(20, 50, 'Portaaviones', {
                fill: '#ffffff',                        // Texto blanco
                backgroundColor: '#000000',             // Fondo negro
                padding: { x: 10, y: 5 }                // Espaciado interno
            })
                .setInteractive({ useHandCursor: true })    // Hacer el texto interactivo
                .on('pointerdown', () => {
                    this.seleccionarEntidad('portaaviones');
                });
            botonPortaaviones.setScrollFactor(0);      // Fijar botón en la pantalla
            this.panelEntidades.add(botonPortaaviones);   // Agregar botón al panel.

            // Botones para seleccionar los aviones
            for (let i = 0; i < 10; i++) {
                const botonAviones = this.add.text(20, 80 + i * 30, `Avión ${i + 1}`, {
                    fill: '#ffffff',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                })
                    .setInteractive({ useHandCursor: true }) // Hacer el texto interactivo
                    .on('pointerdown', () => {
                        this.seleccionarEntidad(`avion_${i}`);
                    });
                botonAviones.setScrollFactor(0);          // Fijar botón en la pantalla
                this.panelEntidades.add(botonAviones);       // Agregar botón al panel.
            }
        }

        if (this.rol === "bismarck") {
            // Configurar la cámara para seguir al Bismarck
            this.cameras.main.startFollow(this.entidades.bismarck.objetivo);
        }

        // Agregar controles de teclado
        this.controles = this.input.keyboard.addKeys({
            arriba: "W",
            izquierda: "A",
            derecha: "D",
            abajo: "S",
            atacar: "X"
        });

        // Evento de actualización de entidades
        socket.on("actualizarPosicionEntidad", (data) => {
            if (!this.entidades[data.nombreEntidad]) {
                console.error(`Entidad ${data.nombreEntidad} no encontrada.`);
                return;
            }

            const entidad = this.entidades[data.nombreEntidad];
            if (entidad.objetivo) {
                entidad.objetivo.setPosition(data.x, data.y);
                if (typeof data.angulo === "number") {
                    entidad.objetivo.setAngle(data.angulo);
                }
            }
        });
    }

    ejecutar() {
        console.log("Entidad entró en rango de visión del Bismarck!");
    }

    update() {
        this.moverEntidad();

        for (let nombreEntidad in this.entidades) {
            this.entidades[nombreEntidad].update();
        }
    }

    // Función para cambiar la cámara a la entidad seleccionada.
    cambiarObjetivoCamara(nombreEntidad) {
        if (this.entidades[nombreEntidad] && this.entidades[nombreEntidad].objetivo) {
            this.cameras.main.startFollow(this.entidades[nombreEntidad].objetivo);
            console.log(`Cámara siguiendo a ${nombreEntidad}`);
        } else {
            console.error(`Entidad ${nombreEntidad} no encontrada.`);
        }
    }

    // Función para seleccionar entidad y cambiar de cámara.
    seleccionarEntidad(nombreEntidad) {
        if (this.rol === "portaaviones" && this.entidades[nombreEntidad]) {
            this.nombreEntidadSeleccionada = nombreEntidad;       // Guardar el nombre de la entidad seleccionada
            this.cambiarObjetivoCamara(nombreEntidad);    // Cambiar la cámara para seguir la entidad seleccionada
            console.log(`Entidad seleccionada: ${nombreEntidad}`);
        } else {
            console.error(`Entidad ${nombreEntidad} no encontrada o rol incorrecto.`);
        }
    }

    moverEntidad() {
        let entidad = null;
        let nombreEntidad = "";

        // Mover el Bismarck
        if (this.rol === "bismarck") {
            entidad = this.entidades.bismarck;
            nombreEntidad = "bismarck";
        } else if (this.nombreEntidadSeleccionada && this.entidades[this.nombreEntidadSeleccionada]) {
            // Mover la entidad seleccionada (portaaviones o avión)
            entidad = this.entidades[this.nombreEntidadSeleccionada];
            nombreEntidad = this.nombreEntidadSeleccionada;
        }

        if (entidad) {
            entidad.mover(this.controles);
            socket.emit("moverEntidad", {
                sala: this.sala,
                nombreEntidad,
                x: entidad.objetivo.x,
                y: entidad.objetivo.y,
                angulo: entidad.objetivo.angle
            });
        } else {
            console.error("No hay entidad seleccionada o no es válida.");
        }
    }
}

export default EscenaAerea;