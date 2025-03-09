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
        //this.nombreUsuario = data.nombreUsuario;
        console.log("Datos crudos recibidos:", JSON.stringify(data.estadoJuego.entidades.avion_1, null, 2));

        //********************************************************/
        // CREAR ENTIDADES
        this.entidades = {
            bismarck: new Bismarck(data.estadoJuego.entidades.bismarck),
            portaaviones: new Portaaviones(data.estadoJuego.entidades.portaaviones)
        };

        for (let i = 1; i < 11; i++) {
            const nombreAvion = `avion_${i}`;
            if(data.estadoJuego.entidades[nombreAvion].salud != 0) {
                this.entidades[nombreAvion] = new Avion(data.estadoJuego.entidades[nombreAvion], i);
            }
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
        this.load.image('splash', '/assets/splash.png');
        this.load.image('torpedo', '/assets/torpedo.png');
    }

    create() {
        //*********************************************************************************/
        // MAPA PRINCIPAL, CAMARA Y LIMITES DEL MUNDO
        this.mapa = this.add.image(0, 0, "mapa").setOrigin(0, 0);
        this.puerto = this.add.image(this.estadoJuego.puerto.x, this.estadoJuego.puerto.y, "puerto").setOrigin(0, 0);
        this.puerto = this.physics.add.sprite(this.estadoJuego.puerto.x, this.estadoJuego.puerto.y, "puerto").setOrigin(0, 0);
        console.log("Mapa añadido a la escena");
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
            if(this.entidades[nombreAvion]) {
                this.puntosAviones[nombreAvion] = this.add.circle(0,0,50,0x0000ff);
                this.puntosEntidades.add(this.puntosAviones[nombreAvion]);
                this.cameras.main.ignore(this.puntosAviones[nombreAvion]);
            }
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
            if(this.entidades[`avion_${i}`]){
                const avion = this.entidades[`avion_${i}`];
                avion.init(this); // Inicializar el avión
                avion.objeto.setCollideWorldBounds(true);
                this.equipoAzul.push(avion);
                if(!avion.piloto)
                    avion.objeto.setVisible(false);        
                this.camaraMinimapa.ignore(avion.objeto);   
            }
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
            disparo: Phaser.Input.Keyboard.KeyCodes.SPACE,
            //pausa: Phaser.Input.Keyboard.KeyCodes.ESC,
            guardar: Phaser.Input.Keyboard.KeyCodes.G
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

        socket.on("finJuego", (data) => {
            this.mensaje = this.add.text(
                this.cameras.main.centerX,
                200, 
                `${data.mensaje}`,
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
                
               this.scene.pause();

               //AGREGAR TRANSICION A OTRA ESCENA O MENU PRINCIPAL
        });

        socket.on("partidaGuardada", (data) => {
            const mensaje = this.add.text(
                this.cameras.main.centerX,
                200, 
                `¡¡¡${data.mensaje}!!!`,
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
            
            this.time.delayedCall(2000, () => {
                mensaje.destroy();
            });
        });

        socket.on("hundirAvionCliente", (data) => {
            const entidad = this.entidades[data.nombreEntidad];
            entidad.hundirAvion();
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
                    (proyectil) => this.impactoEntidad(avion, proyectil), 
                    (proyectil) => this.autorizarImpactoAvion(proyectil),
                    this
                );
            }
        });

        //Overlap entre proyectiles avion y Bismarck
        this.physics.add.overlap(
            this.proyectiles,
            this.entidades.bismarck.puntosDeColision, 
            (proyectil) => this.impactoEntidad(this.entidades.bismarck, proyectil), 
            (proyectil) => this.autorizarImpactoBismarck(proyectil),
            this
        );


        //Overlap entre puerto y Bismarck
        this.physics.add.overlap(
            this.puerto,
            this.entidades.bismarck.objeto,
            ()=>this.victoriaBismarck("Bismarck ha llegado al puerto"),
            null,
            this
        );

        //Overlap entre torpedo y helice de Bismarck
        this.physics.add.overlap(
            this.proyectiles,
            this.entidades.bismarck.helices,
            (proyectil) => this.inmovilizarBismarck(this.entidades.bismarck, proyectil),
            (proyectil) => this.autorizarImpactoBismarck(proyectil),
            this
        );

        //Colision entre bismarck y portaaviones
        this.physics.add.collider(
            this.entidades.bismarck.puntosDeColision, 
            this.entidades.portaaviones.objeto
        );
        
        // Evento para guardar partida.
        this.controles.guardar.on('down', () => {
            // Actualizar this.estadoJuego con el estado actual de las entidades
            this.estadoJuego.entidades.bismarck = {
                x: this.entidades.bismarck.objeto.x,
                y: this.entidades.bismarck.objeto.y,
                angulo: this.entidades.bismarck.objeto.angle,
                velocidad: this.entidades.bismarck.velocidad,
                velocidadMaxima: this.entidades.bismarck.velocidadMaxima,
                aceleracion: this.entidades.bismarck.aceleracion,
                salud: this.entidades.bismarck.salud,
                combustible: this.entidades.bismarck.combustible,

            };

            this.estadoJuego.entidades.portaaviones = {
                x: this.entidades.portaaviones.objeto.x,
                y: this.entidades.portaaviones.objeto.y,
                angulo: this.entidades.portaaviones.objeto.angle,
                velocidad: this.entidades.portaaviones.velocidad,
                velocidadMaxima: this.entidades.portaaviones.velocidadMaxima,
                aceleracion: this.entidades.portaaviones.aceleracion,
                combustible: this.entidades.portaaviones.combustible,
                seleccionado: this.entidades.portaaviones.seleccionado
            };

            for (let i = 1; i < 11; i++) {
                const nombreAvion = `avion_${i}`;
                if(this.entidades[nombreAvion]){
                    this.estadoJuego.entidades[nombreAvion] = {
                        x: this.entidades[nombreAvion].objeto.x,
                        y: this.entidades[nombreAvion].objeto.y,
                        angulo: this.entidades[nombreAvion].objeto.angle,
                        velocidad: this.entidades[nombreAvion].velocidad,
                        velocidadMaxima: this.entidades[nombreAvion].velocidadMaxima,
                        aceleracion: this.entidades[nombreAvion].aceleracion,
                        combustible: this.entidades[nombreAvion].combustible,
                        piloto: this.entidades[nombreAvion].piloto,
                        observador: this.entidades[nombreAvion].observador,
                        operador: this.entidades[nombreAvion].operador,
                        salud: this.entidades[nombreAvion].salud,
                        seleccionado: this.entidades[nombreAvion].seleccionado,
                        numeroAvion: this.entidades[nombreAvion].numeroAvion,
                        torpedo: this.entidades[nombreAvion].torpedo,
                        multiplicadorCombustible: this.entidades[nombreAvion].multiplicadorCombustible,
                        despego: this.entidades[nombreAvion].despego
                    };
                } else {
                    this.estadoJuego.entidades[nombreAvion] = {
                        salud: 0
                    };
                }
                
            }

            this.estadoJuego.puerto = {
                x: this.puerto.x,
                y: this.puerto.y
            };

            const datosGuardar = {
                //idUsuario: socket.id,
                //nombreUsuario: this.nombreUsuario,
                //rol: this.rol,
                sala: this.sala,
                jugadores: this.sala.jugadores,
                estadoJuego: this.estadoJuego
            };

            socket.emit("guardarPartida", datosGuardar);
        });
    }

    getCoordenadasMouse() {
        this.input.activePointer.updateWorldPoint(this.cameras.main);

        return {
          x: this.input.activePointer.worldX,
          y: this.input.activePointer.worldY,
        }
      }

    inmovilizarBismarck() {
        this.entidades.bismarck.objeto.setVelocity(0, 0);
        this.victoriaEquipoAzul();
    }

    victoriaBismarck(mensaje) {
        this.entidades.bismarck.objeto.setVisible(false);                
        socket.emit("victoria", { 
                sala: this.sala, 
                mensaje: mensaje + "\n¡¡¡VICTORIA DEL EQUIPO ROJO!!!"
            });
        this.scene.pause("EscenaPrincipal");
    }

    victoriaEquipoAzul(mensaje) {
        socket.emit("victoria", {
            sala: this.sala,
            mensaje: mensaje + "\n¡¡¡VICTORIA DEL EQUIPO AZUL!!!"
        });
        this.scene.pause("EscenaPrincipal");
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
        if (this.rol === "bismarck" && this.entidades.bismarck) {
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
                        if(!this.entidades.bismarck){
                            console.warn("Intento actualizar visibilidad de bismarck destruido.");
                            return;
                        }
                        this.entidades.bismarck.objeto.setVisible(false);
                    
                }
                i++;
            }
        }
        
        if (this.equipoAzul.length === 1) {
            mensaje = "El equipo azul no tiene aviones disponibles."
            this.victoriaBismarck(mensaje);
        }
    }

    aterrizar(avion) {
        //console.log(`Avion: ${avion.numeroAvion} volando: ${avion.piloto} despego: ${avion.despego}`);
        console.log(`Avion ${avion.numeroAvion} aterrizando en portaaviones`);

        this.entidades[`avion_${avion.numeroAvion}`].piloto = false;
        this.entidades[`avion_${avion.numeroAvion}`].despego = false;
        this.entidades[`avion_${avion.numeroAvion}`].torpedo = true;
        this.entidades[`avion_${avion.numeroAvion}`].seleccionado = false;
        this.entidades[`avion_${avion.numeroAvion}`].velocidad = 0;
        this.entidades[`avion_${avion.numeroAvion}`].combustible = this.estadoJuego.entidades[`avion_${avion.numeroAvion}`].combustible;
        this.entidades[`avion_${avion.numeroAvion}`].multiplicadorCombustible = 1;
        this.entidades[`avion_${avion.numeroAvion}`].indicadorCombustible.setVisible(false);
        avion.objeto.setVisible(false); 

        if (this.rol === "portaaviones") {
            let botonAmodificar = this.botonesAviones[`${avion.numeroAvion}`-1];
            botonAmodificar.setBackgroundColor('#808080');
        }
    }

    //Autoriza la superposicion, si el avion esta volando (tiene piloto) y ya despego(La ubicacion del avion esta fuera del portaaviones)
    autorizarAterrizaje(avion){
        //console.log(`Avion: ${avion.numeroAvion} volando: ${avion.piloto} despego: ${avion.despego}`);
        return (avion.piloto === true && avion.despego === true);
    }   

    //Funcion para determinar si entidad2 esta dentro del rango de vision de entidad1
    estaEnRangoDeVision(entidad1, entidad2) {
        if (!entidad1 || !entidad2) {
            //console.warn("Intento de calcular rango de vision en entidades destruidas.");
            return false;
        }

        const limitesRangoVision = entidad1.objeto.rangoVision.getBounds();
        const rectanguloRangoVision = new Phaser.Geom.Rectangle(limitesRangoVision.x, limitesRangoVision.y, limitesRangoVision.width, limitesRangoVision.height);

        const limites = entidad2.objeto.getBounds();
        const rectanguloLimites = new Phaser.Geom.Rectangle(limites.x, limites.y, limites.width, limites.height);

        return Phaser.Geom.Rectangle.Overlaps(rectanguloRangoVision, rectanguloLimites);
    }

    //Función para cambiar la cámara a la entidad seleccionada.
    cambiarObjetivoCamara(nombreEntidad) {
        if (this.entidades[nombreEntidad] && this.entidades[nombreEntidad].objeto) {
            console.log(this.entidades[nombreEntidad].objeto);
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
