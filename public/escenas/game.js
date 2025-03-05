import socket from '../socket.js';
import Bismarck from '../entidades/bismarck.js';
import Portaaviones from '../entidades/portaaviones.js';
import Avion from '../entidades/avion.js';
import Panel from '../ui/panel.js';

class EscenaPrincipal extends Phaser.Scene {
    constructor() {
        super({ key: 'EscenaPrincipal' });
    }

    init(data) {
        this.sala = data.sala;
        this.rol = data.rol;
        this.estadoJuego = data.estadoJuego;
        this.nombreUsuario = data.nombreUsuario;

        //********************************************************/
        // CREAR ENTIDADES
        this.entidades = {
            bismarck: new Bismarck(data.estadoJuego.entidades.bismarck),
            portaaviones: new Portaaviones(data.estadoJuego.entidades.portaaviones)
        };

        for (let i = 1; i < 11; i++) {
            const nombreAvion = `avion_${i}`;
            this.entidades[nombreAvion] = new Avion(data.estadoJuego.entidades[nombreAvion], i);
        }
    }

    preload() {
        this.load.image("mapa", "../assets/mapa.png");
        this.load.image("bismarck", "../assets/bismarck.png");
        this.load.image("portaaviones", "../assets/carrier.png");
        this.load.image("avion", "../assets/avion.png");
        this.load.image("puerto", "../assets/puerto.png");
        this.load.image("hit", "../assets/hit.png");
        this.load.image("mira", "../assets/mira.png");
        this.load.audio('motoravion', 'assets/sonidos/motoravion.mp3');
        this.load.audio('disparoAvion', 'assets/sonidos/disparoAvion.mp3');
        this.load.audio('disparoBismarck', 'assets/sonidos/disparoBismarck.mp3');
        this.load.audio('barco', 'assets/sonidos/barco.mp3');
        this.load.audio('explosion', 'assets/sonidos/explosion.mp3');
    }

    create() {
        //*********************************************************************************/
        // MAPA PRINCIPAL, CAMARA Y LIMITES DEL MUNDO
        this.mapa = this.add.image(0, 0, "mapa").setOrigin(0, 0);
        this.puerto = this.add.image(this.estadoJuego.puerto.x, this.estadoJuego.puerto.y, "puerto").setOrigin(0, 0);
        this.puerto = this.physics.add.sprite(this.estadoJuego.puerto.x, this.estadoJuego.puerto.y, "puerto").setOrigin(0, 0);

        this.physics.world.setBounds(0, 0, 3200, 3200);
        this.physics.world.setBoundsCollision(true, true, true, true);

        this.cameras.main.setBounds(0, 0, this.mapa.width, this.mapa.height);
        this.cameras.main.setZoom(0.8);

        //*********************************************************************************/
        // MINI MAPA 
        this.camaraMinimapa = this.cameras.add(700, 500, 200, 200) // (x, y, width, height)
            .setZoom(0.0625)
            .setBackgroundColor('rgba(135, 206, 235, 0.5)')
            .setName('minimapa');
        
        this.camaraMinimapa.setBounds(0, 0, 3200, 3200);
  
        this.camaraMinimapa.ignore(this.mapa);

        this.puntosEntidades = this.add.group();
        this.puntoBismarck = this.add.circle(0, 0 , 50, 0xff0000);
        this.puntosEntidades.add(this.puntoBismarck);
        this.cameras.main.ignore(this.puntoBismarck);

        this.puntoPortaaviones = this.add.circle(0,0,50,0xffff00);
        this.puntosEntidades.add(this.puntoPortaaviones);
        this.cameras.main.ignore(this.puntoPortaaviones);

        this.puntosAviones = {};
        for(let i=1; i<11; i++){
            const nombreAvion = `avion_${i}`;
            this.puntosAviones[nombreAvion] = this.add.circle(0,0,50,0x0000ff);
            this.puntosEntidades.add(this.puntosAviones[nombreAvion]);
            this.cameras.main.ignore(this.puntosAviones[nombreAvion]);
        }

        //********************************************************/
        // CREAR EQUIPOS
        this.equipoAzul = [];

        this.proyectiles = this.add.group();

        //********************************************************/
        // INICIALIZAR ENTIDADES
        // Bismarck
        this.entidades.bismarck.init(this);
        this.entidades.bismarck.objeto.setCollideWorldBounds(true);
        this.camaraMinimapa.ignore(this.entidades.bismarck.objeto); 

        // Portaaviones
        this.entidades.portaaviones.init(this);
        this.entidades.portaaviones.objeto.setCollideWorldBounds(true);
        this.equipoAzul.push(this.entidades.portaaviones);
        this.camaraMinimapa.ignore(this.entidades.portaaviones.objeto);

        // Aviones
        for (let i = 1; i < 11; i++) {
            const avion = this.entidades[`avion_${i}`];
            avion.init(this); // Inicializar el avión
            avion.objeto.setCollideWorldBounds(true);
            this.equipoAzul.push(avion);
            avion.objeto.setVisible(false);        
            this.camaraMinimapa.ignore(avion.objeto);   
        }

        //********************************************************/
        // PANEL INTERACTIVO DEL EQUIPO AZUL
        if (this.rol === "portaaviones") {
            this.entidades.portaaviones.configurar();
        }
        
        // PANEL INTERACTIVO DEL EQUIPO ROJO
        if (this.rol === "bismarck") {
            this.entidades.bismarck.configurar();
        }

        // CONTROLES
        this.controles = this.input.keyboard.addKeys({
            arriba: "W",
            izquierda: "A",
            derecha: "D",
            abajo: "S",
            disparo: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        //********************************************************/
        // EVENTO PARA ESCUCHAR AL SERVIDOR
        socket.on("actualizarPosicionEntidad", (data) => {
            if (!this.entidades[data.nombreEntidad]) {
                console.error(`Entidad ${data.nombreEntidad} no encontrada.`);
                return;
            }

            const entidad = this.entidades[data.nombreEntidad];
            if (entidad.objeto) {
                entidad.objeto.setPosition(data.x, data.y);
                if (typeof data.angulo === "number") {
                    entidad.objeto.setAngle(data.angulo);
                }
            }
        });

        socket.on("ejecutarDisparo", (data) => {
            const entidad = this.entidades[data.nombreEntidad];

            if (!entidad) {
                console.error(`Entidad ${data.nombreEntidad} no encontrada.`);
                return;
            }

            entidad.disparar(data.origenX, data.origenY, data.destX, data.destY, data.nombreArma);
        });

         //********************************************************/
        // MANEJO DE OVERLAPS

        // Overlap entre portaaviones y aviones
        this.equipoAzul.forEach((avion) => {
            if (avion instanceof Avion) {
                this.physics.add.overlap(
                    this.entidades.portaaviones.objeto, 
                    avion.objeto, 
                    () => this.aterrizar(avion), 
                    () => this.autorizarAterrizaje(avion), 
                    this
                );
            }
        });

        //Overlap entre proyectiles Bismarck y aviones
        this.equipoAzul.forEach((avion) => {
            if (avion instanceof Avion) {
                this.physics.add.overlap(
                    this.proyectiles,
                    avion.objeto, 
                    (proyectil) => this.impactoEntidad(avion, proyectil, `avion_${avion.numeroAvion}`), 
                    (proyectil) => this.autorizarImpactoAvion(proyectil),
                    this
                );
            }
        });

        //Overlap entre proyectiles avion y Bismarck
        this.physics.add.overlap(
            this.proyectiles,
            this.entidades.bismarck.objeto, 
            (proyectil) => this.impactoEntidad(this.entidades.bismarck, proyectil, "bismarck"), 
            (proyectil) => this.autorizarImpactoBismarck(proyectil),
            this
        );


        //Overlap entre puerto y Bismarck
        this.physics.add.overlap(
            this.puerto,
            this.entidades.bismarck.objeto,
            () => this.victoriaBismarck(),
            null,
            this
        );

        //Overlap entre torpedo y helice de Bismarck
        this.physics.add.overlap(
            this.proyectiles,
            this.entidades.bismarck.helice,
            () => this.inmovilizarBismarck(),
            null,
            this
        );

        //Colision entre bismarck y portaaviones
        this.physics.add.collider(
            this.entidades.bismarck.objeto, 
            this.entidades.portaaviones.objeto
        );
    }

    inmovilizarBismarck() {
        this.entidades.bismarck.objeto.setVelocity(0, 0);
        const mensaje = this.add.text(
            this.cameras.main.centerX,
            200, 
            `¡¡¡BISMARCK INMOVILIZADO!!!`,
            {
                fontSize: '32px',
                fontStyle: 'bold',
                color: 'rgba(246, 248, 246, 0.87)',
                backgroundColor: 'rgba(16, 181, 21, 0.5)',
                padding: {
                    x: 15,
                    y: 15
                }
            }).setOrigin(0.5)
            .setScrollFactor(0);
    }

    victoriaBismarck() {
        this.entidades.bismarck.objeto.setVisible(false);
        const mensaje = this.add.text(
            this.cameras.main.centerX,
            200, 
            `¡¡¡VICTORIA PARA EL BISMARCK!!!`,
            {
                fontSize: '32px',
                fontStyle: 'bold',
                color: 'rgba(246, 248, 246, 0.87)',
                backgroundColor: 'rgba(16, 181, 21, 0.5)',
                padding: {
                    x: 15,
                    y: 15
                }
            }).setOrigin(0.5)
            .setScrollFactor(0);
        this.scene.pause("EscenaPrincipal");
        //this.scene.start('EscenaVictoria', { rol: this.rol });
    }

    impactoEntidad(entidad, proyectil) {
        this.explosion = this.add.image(entidad.objeto.x, entidad.objeto.y, "hit");
        proyectil.destroy();
        this.time.delayedCall(250, () => {
            this.explosion.destroy();
        });
        entidad.recibirDaño(proyectil.daño);
    }

    autorizarImpactoAvion(proyectil) {
        return proyectil.nombre !== "Torpedo avion";
    }

    autorizarImpactoBismarck(proyectil) {
        return proyectil.nombre === "Torpedo avion";
    }

    eliminarAvion(avion) {
        const nombreEntidad = `avion_${avion.numeroAvion}`;
        avion.objeto.destroy();
        this.equipoAzul = this.equipoAzul.filter((a) => a.numeroAvion !== avion.numeroAvion);

        if (this.rol === "portaaviones") {
            // Una posible mejora sería "desactivar" el boton en vez de eliminarlo
            //this.botonesAviones[avion.numeroAvion - 1].destroy();
            this.botonesAviones[avion.numeroAvion - 1].setBackgroundColor('rgba(195, 19, 19, 0.9)');
            this.botonesAviones[avion.numeroAvion - 1].disableInteractive();
            //this.avion.indicadorCombustible.setVisible(false);
        }

        delete this.entidades[nombreEntidad];

        // Condicion de victoria si se eliminan los 10 aviones
        // ...
    }

    update() {
        // Actualizar posiciones de los puntos en el minimapa
        if (this.entidades.bismarck) {
            this.puntoBismarck.setPosition(this.entidades.bismarck.objeto.x, this.entidades.bismarck.objeto.y);
        }
        if (this.entidades.portaaviones) {
            this.puntoPortaaviones.setPosition(this.entidades.portaaviones.objeto.x, this.entidades.portaaviones.objeto.y);
        }
        for (let i = 1; i < 11; i++) {
            const nombreAvion = `avion_${i}`;
            if (this.entidades[nombreAvion]) {
                this.puntosAviones[nombreAvion].setPosition(this.entidades[nombreAvion].objeto.x, this.entidades[nombreAvion].objeto.y);
            }
        }

        this.moverEntidad();

        for (let key in this.entidades) {
            this.entidades[key].update();
        }

        //RANGOS DE VISION DE LAS ENTIDADES
        if (this.rol === "bismarck") {
            /*this.equipoAzul.forEach((entidad) => {
                if (this.estaEnRangoDeVision(this.entidades.bismarck, entidad)) {
                    entidad.objeto.setVisible(true);
                } else {
                    entidad.objeto.setVisible(false);
                }
            });*/
            let i = 0;
            while (i < this.equipoAzul.length) {
                const entidad = this.equipoAzul[i];
                if (this.estaEnRangoDeVision(this.entidades.bismarck, entidad)) {
                    entidad.objeto.setVisible(true);
                    break;
                } else {
                    entidad.objeto.setVisible(false);
                }
                i++;
            }
        } else {
            let i = 0;
            while (i < this.equipoAzul.length) {
                const entidad = this.equipoAzul[i];
                if (this.estaEnRangoDeVision(entidad, this.entidades.bismarck)) {
                    this.entidades.bismarck.objeto.setVisible(true);

                    if(entidad instanceof Avion) {
                        if(entidad.operador) {
                         //Si el avion con operador ve al Bismarck, se muestra un mensaje de alerta y el punto aparece en el minimapa por 10 segundos.   
                         this.puntoBismarck.setVisible(true);
                            this.time.delayedCall(10000, () => {
                                this.puntoBismarck.setVisible(false);
                            });
                            const mensaje = this.add.text(
                                this.cameras.main.centerX,
                                10, 
                                `ALERTA: Avion ${entidad.numeroAvion} ha visualizado al Bismarck!!!`,
                                {
                                    fontSize: '24px',
                                    fontStyle: 'bold',
                                    color: '#ff0000',
                                    backgroundColor: '#000000',
                                    padding: {
                                        x: 15,
                                        y: 15
                                    }
                                }).setOrigin(0.5)
                                .setScrollFactor(0);
                                this.camaraMinimapa.ignore(mensaje);

                                this.time.delayedCall(2000,() => {
                                    mensaje.destroy();
                                })
                        }
                    }

                    break;
                } else {
                    this.entidades.bismarck.objeto.setVisible(false);
                }
                i++;
            }
        }
    }

    aterrizar(avion) {
        //console.log(`Avion: ${avion.numeroAvion} volando: ${avion.piloto} despego: ${avion.despego}`);
        console.log(`Avion ${avion.numeroAvion} aterrizando en portaaviones`);

        this.entidades[`avion_${avion.numeroAvion}`].piloto = false;
        this.entidades[`avion_${avion.numeroAvion}`].despego = false;
        this.entidades[`avion_${avion.numeroAvion}`].torpedo = true;
        this.entidades[`avion_${avion.numeroAvion}`].seleccionado = false;
        this.entidades[`avion_${avion.numeroAvion}`].combustible = this.estadoJuego.entidades[`avion_${avion.numeroAvion}`].combustible;
        this.entidades[`avion_${avion.numeroAvion}`].multiplicadorCombustible = 1;
        this.entidades[`avion_${avion.numeroAvion}`].indicadorCombustible.setVisible(false);
        avion.objeto.setVisible(false); 
        let botonAmodificar = this.botonesAviones[`${avion.numeroAvion}`-1];
        botonAmodificar.setBackgroundColor('#808080');

    }

    //Autoriza la superposicion, si el avion esta volando (tiene piloto) y ya despego(La ubicacion del avion esta fuera del portaaviones)
    autorizarAterrizaje(avion){
        //console.log(`Avion: ${avion.numeroAvion} volando: ${avion.piloto} despego: ${avion.despego}`);
        return (avion.piloto === true && avion.despego === true);
    }   

    //Funcion para determinar si entidad2 esta dentro del rango de vision de entidad1
    estaEnRangoDeVision(entidad1, entidad2) {
        const limites = entidad2.objeto.getBounds();

        const topLeft = { x: limites.x, y: limites.y };
        const topRight = { x: limites.x + limites.width, y: limites.y };
        const bottomLeft = { x: limites.x, y: limites.y + limites.height };
        const bottomRight = { x: limites.x + limites.width, y: limites.y + limites.height };

        const limitesRangoVision = entidad1.objeto.rangoVision.getBounds();
        
        return (
            Phaser.Geom.Rectangle.Contains(limitesRangoVision, topLeft.x, topLeft.y) ||
            Phaser.Geom.Rectangle.Contains(limitesRangoVision, topRight.x, topRight.y) ||
            Phaser.Geom.Rectangle.Contains(limitesRangoVision, bottomLeft.x, bottomLeft.y) ||
            Phaser.Geom.Rectangle.Contains(limitesRangoVision, bottomRight.x, bottomRight.y)
        );
    }

    //Función para cambiar la cámara a la entidad seleccionada.
    cambiarObjetivoCamara(nombreEntidad) {
        if (this.entidades[nombreEntidad] && this.entidades[nombreEntidad].objeto) {
            this.cameras.main.startFollow(this.entidades[nombreEntidad].objeto);
            console.log(`Cámara siguiendo a ${nombreEntidad}`);
        } else {
            console.error(`Entidad ${nombreEntidad} no encontrada.`);
        }
    }

    // Función para seleccionar entidad y cambiar de cámara.
    seleccionarEntidad(nombreEntidad) {
        if (this.rol === "portaaviones" && this.entidades[nombreEntidad]) {
            for (let key in this.entidades) {
                if (this.entidades[key] instanceof Avion) {
                    this.entidades[key].seleccionado = false;  // Desmarcar todos los aviones
                }
            }
            this.nombreEntidadSeleccionada = nombreEntidad;       // Guardar el nombre de la entidad seleccionada
            this.entidades[nombreEntidad].seleccionado = true;
            //this.cambiarObjetivoCamara(nombreEntidad);    // Cambiar la cámara para seguir la entidad seleccionada
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
                x: entidad.objeto.x, // Posición X de la entidad
                y: entidad.objeto.y, // Posición Y de la entidad
                angulo: entidad.objeto.angle // Ángulo de la entidad
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

export default EscenaPrincipal;
