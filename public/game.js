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
        this.nombreUsuario = data.nombreUsuario; 

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
        this.load.image("avion", "assets/avion.png");
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
        //this.equipoAzul = this.physics.add.group();
        this.equipoAzul = [];
        

        // CREAR ENTIDADES
        //********************************************************/
        // Crear Bismarck
        this.entidades.bismarck.init(this);
        this.entidades.bismarck.objetivo.setCollideWorldBounds(true);
        //this.equipoRojo.add(this.entidades.bismarck.objetivo);

        // Crear Portaaviones
        this.entidades.portaaviones.init(this);
        this.entidades.portaaviones.objetivo.setCollideWorldBounds(true);
       // this.equipoAzul.push(this.entidades.portaaviones.objetivo);

         // Crear los aviones
         for (let i = 0; i < 10; i++) {
            const avion = this.entidades[`avion_${i}`];
            avion.init(this); // Inicializar el avión
            avion.objetivo.setCollideWorldBounds(true);
            //this.equipoAzul.add(avion.objetivo); // Añadir el sprite al grupo
            this.equipoAzul.push(avion);
        }
       
              //********************************************************/

        
        //this.physics.add.collider(this.entidades.bismarck.objetivo, this.equipoAzul, this.ejecutar, null, this);
        //this.physics.add.collider(this.equipoAzul,this.entidades.bismarck.objetivo, this.ejecutar, null, this);
        

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
            
            this.entidades.bismarck.objetivo.setVisible(false);
        }

        if (this.rol === "bismarck") {
            // Configurar la cámara para seguir al Bismarck
            this.cameras.main.startFollow(this.entidades.bismarck.objetivo);
            this.entidades.portaaviones.objetivo.setVisible(false);
            this.equipoAzul.forEach((avion) => {
                console.log('Avion:', avion);
                console.log('Objetivo del avion:', avion.objetivo);
                avion.objetivo.setVisible(false);
            });
        }

        // Agregar controles de teclado
        this.controles = this.input.keyboard.addKeys({
            arriba: "W",
            izquierda: "A",
            derecha: "D",
            abajo: "S",
            atacar: "X"
        });

        this.rangoVisionBismarck = this.add.zone(this.entidades.bismarck.x, this.entidades.bismarck.y, 500, 500).setOrigin(0.5, 0.5);
       // this.graphics = this.add.graphics();
       // this.dibujarRangoVision();

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
             // Log para confirmar que la entidad se actualizó correctamente
            /*console.log(`🔄 Entidad ${data.entidad} actualizada:`, {
                x: data.x,
                y: data.y,
                angulo: data.angulo
            });*/
        });
    }

   /* ejecutar(){
        console.log("Entidad entró en rango de visión del Bismarck!");
    }*/
        dibujarRangoVision() {
            // Limpiar el dibujo anterior
            this.graphics.clear();
    
            // Estilo del rectángulo (color y grosor del borde)
            this.graphics.lineStyle(2, 0xff0000); // Borde rojo de 2px de grosor
    
            // Dibujar el rectángulo de la Zone
            const bounds = this.rangoVisionBismarck.getBounds();
            this.graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }

        estaEnRangoDeVision(objetivo) {
            // Obtener el bounding box de la entidad
            const limites = objetivo.getBounds();
    
            // Definir las coordenadas de las cuatro esquinas
            const topLeft = { x: limites.x, y: limites.y };
            const topRight = { x: limites.x + limites.width, y: limites.y };
            const bottomLeft = { x: limites.x, y: limites.y + limites.height };
            const bottomRight = { x: limites.x + limites.width, y: limites.y + limites.height };
    
            // Verificar si alguna esquina está dentro del rango de visión
            const limitesRangoVision = this.rangoVisionBismarck.getBounds();
            return (
                Phaser.Geom.Rectangle.Contains(limitesRangoVision, topLeft.x, topLeft.y) ||
                Phaser.Geom.Rectangle.Contains(limitesRangoVision, topRight.x, topRight.y) ||
                Phaser.Geom.Rectangle.Contains(limitesRangoVision, bottomLeft.x, bottomLeft.y) ||
                Phaser.Geom.Rectangle.Contains(limitesRangoVision, bottomRight.x, bottomRight.y)
            );
        }

    update() {
        this.moverEntidad();
        if (this.rol === "bismarck") {
        for (let key in this.entidades) {
            this.entidades[key].update();
        }

        this.rangoVisionBismarck.setPosition(this.entidades.bismarck.objetivo.x, this.entidades.bismarck.objetivo.y);
        //this.dibujarRangoVision();
        //console.log('Contenido de equipoAzul:', this.equipoAzul.getChildren());
        
        this.equipoAzul.forEach((avion)=>{
            if (avion.objetivo && this.estaEnRangoDeVision(avion.objetivo)) {
                console.log('DENTRO del rango de visión del BISMARCK');
                avion.objetivo.setVisible(true);
            } else {
                avion.objetivo.setVisible(false); // Ocultar si no está en el rango
            }
        });
          
 
        if (this.estaEnRangoDeVision(this.entidades.portaaviones.objetivo)) {
            this.entidades.portaaviones.objetivo.setVisible(true);
        }else
        {
            this.entidades.portaaviones.objetivo.setVisible(false);
        }
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
            // Datos que se enviarán al servidor
            const datosMovimiento = {
                idUsuario: socket.id, // ID del socket (usuario)
                nombreUsuario: this.nombreUsuario, // Nombre del usuario
                rol: this.rol, // Rol del jugador (bismarck o portaaviones)
                sala: this.sala, // Sala a la que pertenece el jugador
                nombreEntidad, // Entidad que se está moviendo (bismarck, portaaviones, avion_X)
                x: entidad.objetivo.x, // Posición X de la entidad
                y: entidad.objetivo.y, // Posición Y de la entidad
                angulo: entidad.objetivo.angle // Ángulo de la entidad
            };

            // Log para depuración: Verificar los datos antes de enviarlos
            //console.log("📤 Datos que se enviarán al servidor:", datosMovimiento);

            // Emitir el evento con todos los datos requeridos
            socket.emit("moverEntidad", datosMovimiento);

            // Log para depuración: Confirmar que los datos se enviaron
            //console.log("✅ Datos enviados correctamente al servidor.");
     
        } else {
           // console.error("No hay entidad seleccionada o no es válida.");
        }
    }
}

export default EscenaAerea;