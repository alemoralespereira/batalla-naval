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
        this.load.audio("motor_avion","../assets/sonidos/motoravion.mp3")
        this.load.audio("motor_barco","../assets/sonidos/barco.mp3")
    }

    create() {
        //*********************************************************************************/
        // MAPA PRINCIPAL, CAMARA Y LIMITES DEL MUNDO
        this.mapa = this.add.image(0, 0, "mapa").setOrigin(0, 0);
        const puerto = this.add.image(2800, 0, "puerto").setOrigin(0, 0);

        this.physics.world.setBounds(0, 0, 3200, 3200);
        this.physics.world.setBoundsCollision(true, true, true, true);

        this.cameras.main.setBounds(0, 0, this.mapa.width, this.mapa.height);
        this.cameras.main.setZoom(0.8);
        this.cameras.main.scrollX = 0;
        this.cameras.main.scrollY = 0;

        //*********************************************************************************/
      //*********************************************************************************/
        // MINI MAPA 
        this.camaraMinimapa = this.cameras.add(700, 500, 200, 200) // (x, y, width, height)
            .setZoom(0.0625)
            .setBackgroundColor('rgba(135, 206, 235, 0.5)')
            .setName('minimapa');
        
        this.camaraMinimapa.setBounds(0, 0, 3200, 3200);
        this.camaraMinimapa.scrollX = 0;
        this.camaraMinimapa.scrollY = 0;

        this.camaraMinimapa.ignore(this.mapa);
        this.puntosEntidades = this.add.group();
        this.puntoBismarck = this.add.circle(0,0,50,0xff0000);
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

        //********************************************************/
        // INICIALIZAR ENTIDADES
        // Bismarck
        this.entidades.bismarck.init(this);
        this.entidades.bismarck.objetivo.setCollideWorldBounds(true);
        this.camaraMinimapa.ignore(this.entidades.bismarck.objetivo);

        // Portaaviones
        this.entidades.portaaviones.init(this);
        this.entidades.portaaviones.objetivo.setCollideWorldBounds(true);
        this.camaraMinimapa.ignore(this.entidades.portaaviones.objetivo);
        this.equipoAzul.push(this.entidades.portaaviones);

        // Aviones
        for (let i = 1; i < 11; i++) {
            const avion = this.entidades[`avion_${i}`];
            avion.init(this); // Inicializar el avión
            avion.objetivo.setCollideWorldBounds(true);
            this.equipoAzul.push(avion);
            avion.objetivo.setVisible(false);        
        }

        //********************************************************/
        // PANEL INTERACTIVO DEL EQUIPO AZUL
        if (this.rol === "portaaviones") {
            const panel = new Panel(this);

            // Botón para seleccionar el portaaviones
            const botonPortaaviones = panel.agregarBoton(-100, 460, 'Portaaviones')
                .on('pointerdown', () => {
                    this.seleccionarEntidad('portaaviones');
                    this.cambiarObjetivoCamara('portaaviones');
                });
            panel.agregarBotonAlPanel(botonPortaaviones);
            

            //Array para los botones
            this.botonesAviones = [];
            // Botones para seleccionar los aviones
            for (let i = 1; i < 11; i++) {
                let botonAvion = panel.agregarBoton(-100, 460 + i * 30, `Avión ${i}`);
                botonAvion.numero = i;
                this.botonesAviones.push(botonAvion);
                botonAvion.on('pointerdown', () => {
                        
                        this.seleccionarEntidad(`avion_${i}`);
                        if(this.entidades[`avion_${i}`].piloto)
                            this.cambiarObjetivoCamara(`avion_${i}`);

                        if(!this.entidades[`avion_${i}`].piloto) {
                            this.botonObservador = panel.agregarBoton(40, 460, 'Observador')
                            .on('pointerdown', () => {
                                this.entidades[`avion_${i}`].observador = true;
                                this.botonObservador.setBackgroundColor('#00ff00');
                            });
                            

                            this.botonOperador = panel.agregarBoton(160, 460, 'Operador')
                            .on('pointerdown', () => {
                                this.entidades[`avion_${i}`].operador = true;
                                this.botonOperador.setBackgroundColor('#00ff00');
                            });
                            
                            
                            this.botonDespegar = panel.agregarBoton(260, 460, 'Despegar', '#00ff00')
                            .on('pointerdown', () => {
                                botonAvion.setBackgroundColor('#00ff00');
                                const avion = this.entidades[`avion_${i}`];
                                avion.piloto = true;
                                avion.calcularRangoVision();
                                avion.calcularAlcanceVuelo();
                                avion.init(this);
                                avion.objetivo.setVisible(true);                                                        
                                this.botonDespegar.setVisible(false);
                                this.botonOperador.setVisible(false);
                                this.botonObservador.setVisible(false);// Ignorar botones individuales cuando se crean
                                                    this.camaraMinimapa.ignore([this.botonObservador, this.botonOperador, this.botonDespegar]);
                                this.cambiarObjetivoCamara(`avion_${i}`);
                                
                                this.physics.add.overlap(
                                    this.entidades.portaaviones.objetivo, 
                                    avion.objetivo, 
                                    this.superposicion, 
                                    this.autorizarSuperposicion, 
                                    this);
                                
                                //botonPiloto.setVisible(false);
                            });
                        // Ignorar botones individuales cuando se crean
                        this.camaraMinimapa.ignore([this.botonObservador, this.botonOperador, this.botonDespegar]);
                        }
                    });
                panel.agregarBotonAlPanel(botonAvion);
                //this.camaraMinimapa.ignore(this.botonesAviones);
            }
            
            this.camaraMinimapa.ignore(this.botonesAviones);
           

            //BISMARCK NO VISIBLE PARA EL EQUIPO AZUL.
            this.entidades.bismarck.objetivo.setVisible(false);
        }

        if (this.rol === "bismarck") {
            // Configurar la cámara para seguir al Bismarck
            this.cameras.main.startFollow(this.entidades.bismarck.objetivo);
            this.entidades.portaaviones.objetivo.setVisible(false);
            this.equipoAzul.forEach((avion) => {
                //console.log('Avion:', avion);
                //console.log('Objetivo del avion:', avion.objetivo);
                avion.objetivo.setVisible(false);
            });
        }

        // CONTROLES
        this.controles = this.input.keyboard.addKeys({
            arriba: "W",
            izquierda: "A",
            derecha: "D",
            abajo: "S",
            atacar: "X"
        });

        //********************************************************/
        // EVENTO PARA ESCUCHAR AL SERVIDOR
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

    update() {
        // Actualizar posiciones de los puntos en el minimapa
        if (this.entidades.bismarck) {
            this.puntoBismarck.setPosition(this.entidades.bismarck.objetivo.x, this.entidades.bismarck.objetivo.y);
        }
        if (this.entidades.portaaviones) {
            this.puntoPortaaviones.setPosition(this.entidades.portaaviones.objetivo.x, this.entidades.portaaviones.objetivo.y);
        }
        for (let i = 1; i < 11; i++) {
            const nombreAvion = `avion_${i}`;
            if (this.entidades[nombreAvion]) {
                this.puntosAviones[nombreAvion].setPosition(this.entidades[nombreAvion].objetivo.x, this.entidades[nombreAvion].objetivo.y);
            }
        }

        this.moverEntidad();

        for (let key in this.entidades) {
            this.entidades[key].update();
        }

        //RANGOS DE VISION DE LAS ENTIDADES
        if (this.rol === "bismarck") {
            this.equipoAzul.forEach((entidad) => {
                if (this.estaEnRangoDeVision(this.entidades.bismarck, entidad)) {
                    entidad.objetivo.setVisible(true);
                } else {
                    entidad.objetivo.setVisible(false);
                }
            });
        } else {
            let i = 0;
            while (i < this.equipoAzul.length) {
                const entidad = this.equipoAzul[i];
                if (this.estaEnRangoDeVision(entidad, this.entidades.bismarck)) {
                    this.entidades.bismarck.objetivo.setVisible(true);

                    if(entidad instanceof Avion) {
                        if(entidad.operador) {
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

                                this.time.delayedCall(2000,() => {
                                    mensaje.destroy();
                                })
                        }
                    }

                    break;
                } else {
                    this.entidades.bismarck.objetivo.setVisible(false);
                }
                i++;
            }
        }
    }

    superposicion(portaaviones, avion) {
        console.log(`Avion ${avion.numeroAvion} aterrizando en portaaviones`);

        //console.log(`Avion nro: ${avion.numeroAvion} Avion X: ${avion.x} PortaAviones X: ${portaaviones.x} Despego: ${avion.despego}`)
        //console.log(`Avion Pilot: ${avion.piloto}`)
        this.entidades[`avion_${avion.numeroAvion}`].piloto = false;
        this.entidades[`avion_${avion.numeroAvion}`].despego = false;
        this.entidades[`avion_${avion.numeroAvion}`].torpedo = true;
        this.entidades[`avion_${avion.numeroAvion}`].seleccionado = false;
        this.entidades[`avion_${avion.numeroAvion}`].combustible = this.estadoJuego.entidades[`avion_${avion.numeroAvion}`].combustible;
        this.entidades[`avion_${avion.numeroAvion}`].multiplicadorCombustible = 1;
        this.entidades[`avion_${avion.numeroAvion}`].indicadorCombustible.setVisible(false);
        avion.setVisible(false); 
        let botonAmodificar = this.botonesAviones[`${avion.numeroAvion}`-1];
        botonAmodificar.setBackgroundColor('#808080');
    }

    //Autoriza la superposicion, si el avion esta volando (tiene piloto) y ya despego(La ubicacion del avion esta fuera del portaaviones)
    autorizarSuperposicion(portaaviones, avion){
        //console.log(`Avion: ${avion.numeroAvion} volando: ${avion.piloto}.`);
        //console.log(`Avion: ${this.entidades[`avion_${avion.numeroAvion}`]} Piloto: ${this.entidades[`avion_${avion.numeroAvion}`].piloto}`);
        //console.log("Piloto Objetivo: " , avion.piloto);
        //this.entidades[`avion_${i}`].piloto
        //console.log(`Avion X: ${avion.x} PortaAviones X: ${portaaviones.x} Avion Y: ${avion.y} PortaAviones Y: ${portaaviones.y}`)

        return (avion.piloto && avion.despego);
    }   

    //Funcion para determinar si entidad2 esta dentro del rango de vision de entidad1
    estaEnRangoDeVision(entidad1, entidad2) {
        const limites = entidad2.objetivo.getBounds();

        const topLeft = { x: limites.x, y: limites.y };
        const topRight = { x: limites.x + limites.width, y: limites.y };
        const bottomLeft = { x: limites.x, y: limites.y + limites.height };
        const bottomRight = { x: limites.x + limites.width, y: limites.y + limites.height };

        const limitesRangoVision = entidad1.objetivo.rangoVision.getBounds();
        return (
            Phaser.Geom.Rectangle.Contains(limitesRangoVision, topLeft.x, topLeft.y) ||
            Phaser.Geom.Rectangle.Contains(limitesRangoVision, topRight.x, topRight.y) ||
            Phaser.Geom.Rectangle.Contains(limitesRangoVision, bottomLeft.x, bottomLeft.y) ||
            Phaser.Geom.Rectangle.Contains(limitesRangoVision, bottomRight.x, bottomRight.y)
        );
    }

    //Función para cambiar la cámara a la entidad seleccionada.
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

        if (this.controles.atacar.isDown) {
            this.scene.pause("EscenaPrincipal");
            this.scene.start('EscenaAtaque');//,{estadoJuego: this.estadoJuego, rol: this.rol, sala: this.sala, nombreUsuario: this.nombreUsuario });
        }

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

export default EscenaPrincipal;
