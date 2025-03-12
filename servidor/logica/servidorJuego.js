const EstadoJuego = require('./estadoJuego');
const Jugador = require('./jugador');
const Sala = require('./sala');
const Puerto = require('./puerto');
const Bismarck = require('./entidades/bismarck');
const Portaaviones = require('./entidades/portaaviones');
const Avion = require('./entidades/avion');

class ServidorJuego {
    constructor(io, query) {
        this.io = io;
        this.query = query;
        // Almacenar información de las salas y jugadores
        this.salas = {};
    }

    establecerConexion() {
        this.io.on("connection", (socket) => {
            console.log("🟢 Nuevo jugador conectado:", socket.id);

            socket.on("unirseSala", this.unirseSala.bind(this, socket));

            socket.on("moverEntidad", this.moverEntidad.bind(this, socket));

            socket.on("disparar", this.disparar.bind(this, socket));

            socket.on("victoria", this.victoria.bind(this, socket));

            socket.on("hundirAvion", this.hundirAvion.bind(this, socket));

            socket.on("actualizarCombustible", this.actualizarCombustible.bind(this, socket));

            //socket.on("actualizarDatosEntidad", this.actualizarDatosEntidad.bind(this, socket))

            socket.on("recuperarPartida", this.recuperarPartida.bind(this, socket));

            socket.on("guardarPartida", this.guardarPartida.bind(this, socket));

            // Desconexión del jugador
            socket.on("disconnect", this.desconectar.bind(this, socket));
        });
    }

    unirseSala(socket, { nombreUsuario, sala, rol }) {
        //Si no existe la sala, la inicializo con estado "iniciando". 
        if (!this.salas[sala]) {
            this.salas[sala] = new Sala([], new EstadoJuego(), "iniciando")
        } // Si existe sala pero ya hay dos jugadores jugando, salgo.
        else if (this.salas[sala].cantidadJugadores() === 2) {
            socket.emit("errorUnirse", { mensaje: `El juego ya esta iniciado en ${sala}. Por favor elige otra sala.` });
            return;
        } // Si existe sala, hay 1 jugador esperando pero esta recuperando partida, salgo.
        else if (this.salas[sala].getEstadoPartida() === "recuperando") {
            socket.emit("errorUnirse", { mensaje: `Un jugador esta recuperando la partida de la ${sala}. Por favor elige otra sala o ingrese en la opcion de recuperar partida.` });
            return;
        }

        // Verificar si el rol ya está ocupado
        const rolOcupado = this.salas[sala].getJugadores().some(jugador => jugador.getRol() === rol);
        if (rolOcupado) {
            socket.emit("errorUnirse", { mensaje: `El rol ${rol} ya está ocupado. Elige otro.` });
            return; // No permite que el jugador se una si el rol ya está ocupado
        }

        // Agregar jugador a la sala

        this.salas[sala].agregarJugador(new Jugador(socket.id, nombreUsuario, rol));
        socket.join(sala);

        console.log(`📌 ${nombreUsuario} se unió a ${sala} como ${rol}`);
        console.log("Detalles del jugador:", {
            socketId: socket.id,
            nombreUsuario,
            rol,
            sala,
        });

        // Notificar a todos en la sala
        this.io.to(sala).emit("jugadorConectado", {
            mensaje: `${nombreUsuario} se unió como ${rol}`,
            jugadores: this.salas[sala].getJugadores().map(j => ({ nombreUsuario: j.nombreUsuario, rol: j.rol }))
        });

        // Si solo hay un jugador, enviar evento de espera
        if (this.salas[sala].cantidadJugadores() === 1) {
            this.io.to(sala).emit("esperandoJugadores");
        }

        // Iniciar juego cuando hay dos jugadores
        if (this.salas[sala].cantidadJugadores() === 2) {
            // Inicializar el estado del juego

            const puerto = this.crearPuerto();
            const posicionBismarck = this.generarPosicionBismarck(puerto);
            const posicionPortaaviones = this.generarPosicionPortaaviones(posicionBismarck, puerto);

            const estadoJuego = this.salas[sala].getEstadoJuego();

            estadoJuego.setPuerto(puerto);

            estadoJuego.agregarEntidad("bismarck", new Bismarck({
                idEntidad: "bismarck",
                x: posicionBismarck.x,
                y: posicionBismarck.y,
                velocidad: 0,
                velocidadMaxima: 100,
                angulo: 0,
                aceleracion: 1,
                salud: 3,
                combustible: 10000
            }));

            estadoJuego.agregarEntidad("portaaviones", new Portaaviones({
                idEntidad: "portaaviones",
                x: posicionPortaaviones.x,
                y: posicionPortaaviones.y,
                velocidad: 0,
                velocidadMaxima: 100,
                angulo: 0,
                aceleracion: 1,
                combustible: 5000,
                seleccionado: false
            }));

            for (let i = 1; i < 11; i++) {
                estadoJuego.agregarEntidad(`avion_${i}`, new Avion({
                    idEntidad: `avion_${i}`,
                    x: posicionPortaaviones.x,
                    y: posicionPortaaviones.y,
                    velocidad: 0,
                    velocidadMaxima: 100,
                    angulo: 0,
                    aceleracion: 2,
                    combustible: 10000,
                    piloto: false,
                    observador: false,
                    operador: false,
                    salud: 1,
                    numeroAvion: i,
                    torpedo: true,
                    multiplicadorCombustible: 1,
                    despego: false,
                    seleccionado: false
                }));
            }

            this.io.to(sala).emit("juegoIniciado", {
                mensaje: "El juego ha comenzado",
                jugadores: this.salas[sala].getJugadores(),
                estadoJuego,
            });

            console.log(`🎮 Juego iniciado en ${sala}`);
            console.log("Detalles del juego:", {
                sala,
                jugadores: this.salas[sala].getJugadores(),
                estadoJuego,
            });
        }
    }

    validarSala(sala) {
        if (!this.salas[sala]) {
            console.error(`❌ ${sala} no encontrada.`);
            return false;
        }

        return true;
    }

    validarEntidad(sala, nombreEntidad) {
        const entidad = this.salas[sala].getEstadoJuego().getEntidad(nombreEntidad);
        if (!entidad) {
            console.error(`❌ Entidad ${nombreEntidad} no encontrada en sala ${sala}`);
            return false;
        }

        return true;
    }

    moverEntidad(socket, data) {
        // Verificar si la sala existe
        if (!this.validarSala(data.sala)) {
            return;
        }

        // Verificar si la entidad existe
        if (!this.validarEntidad(data.sala, data.nombreEntidad)) {
            return;
        }

        // Actualizar la posición de la entidad
        const entidad = this.salas[data.sala].getEstadoJuego().getEntidad(data.nombreEntidad);
        entidad.setX(data.x).setY(data.y).setAngulo(data.angulo);

        // Emitir la actualización a todos los jugadores en la sala
        socket.to(data.sala).emit("actualizarPosicionEntidad", {
            nombreEntidad: data.nombreEntidad,
            x: data.x,
            y: data.y,
            angulo: data.angulo
        });
    }

    disparar(socket, data) {
        // Verificar si la sala existe
        if (!this.validarSala(data.sala)) {
            return;
        }

        // Verificar si la entidad existe
        if (!this.validarEntidad(data.sala, data.nombreEntidad)) {
            return;
        }

        socket.to(data.sala).emit("ejecutarDisparo", {
            nombreEntidad: data.nombreEntidad,
            nombreArma: data.nombreArma,
            origenX: data.origenX,
            origenY: data.origenY,
            destX: data.destX,
            destY: data.destY,
            angulo: data.angulo
        });
    }

    victoria(socket, data) {
        // Verificar si la sala existe
        if (!this.validarSala(data.sala)) {
            return;
        }

        this.io.to(data.sala).emit("finJuego", {
            mensaje: data.mensaje
        });

         // Eliminar la sala del objeto salas
         delete this.salas[data.sala];
         console.log(`🗑️ Sala ${data.sala} eliminada tras finalizar el juego.`);
    }

    hundirAvion(socket, data) {
        // Verificar si la sala existe
        if (!this.validarSala(data.sala)) {
            return;
        }

        socket.to(data.sala).emit("hundirAvionCliente", {
            sala: data.sala,
            nombreEntidad: data.nombreEntidad,
        });
    }

    // actualizarDatosEntidades(socket, data) {
    //     // Verificar si la sala existe
    //     if (!this.salas[data.sala]) {
    //         console.error(`❌ Sala ${data.sala} no encontrada.`);
    //         return;
    //     }

    //     // Obtener el idEntidad desde data.entidad
    //     const entidadData = data.entidad;
    //     if (!entidadData) {
    //         console.error(`❌ No se encontró información de la entidad en los datos recibidos para la sala ${data.sala}`);
    //         return;
    //     }

    //     const idEntidad = entidadData.datosBase?.idEntidad || entidadData.idEntidad;
    //     if (!idEntidad) {
    //         console.error(`❌ No se encontró idEntidad en los datos de la entidad para la sala ${data.sala}`);
    //         return;
    //     }

    //     // Acceder al objeto de entidades de la sala
    //     const entidades = this.salas[data.sala].estadoJuego.entidades;

    //     // Obtener la entidad específica usando el idEntidad
    //     const entidad = entidades[idEntidad];

    //     if (entidad) {
    //         // Actualizar atributos básicos de la entidad
    //         if (entidadData.xInicial !== undefined) entidad.setX(entidadData.xInicial);
    //         if (entidadData.yInicial !== undefined) entidad.setY(entidadData.yInicial);
    //         if (entidadData.velocidad !== undefined) entidad.setVelocidad(entidadData.velocidad);
    //         if (entidadData.velocidadMaxima !== undefined) entidad.setVelocidadMaxima(entidadData.velocidadMaxima);
    //         if (entidadData.anguloInicial !== undefined) entidad.setAngulo(entidadData.anguloInicial);
    //         if (entidadData.aceleracion !== undefined) entidad.setAceleracion(entidadData.aceleracion);
    //         if (entidadData.combustible !== undefined) entidad.setCombustible(entidadData.combustible);
    //         console.log("Entidad", entidad, "combustible", entidadData.combustible);

    //         // Actualizar atributos específicos de las clases hijas
    //         if (entidadData.salud !== undefined && typeof entidad.setSalud === 'function') {
    //             entidad.setSalud(entidadData.salud);
    //         }
    //         if (entidadData.piloto !== undefined && typeof entidad.setPiloto === 'function') {
    //             entidad.setPiloto(entidadData.piloto);
    //         }
    //         if (entidadData.observador !== undefined && typeof entidad.setObservador === 'function') {
    //             entidad.setObservador(entidadData.observador);
    //         }
    //         if (entidadData.operador !== undefined && typeof entidad.setOperador === 'function') {
    //             entidad.setOperador(entidadData.operador);
    //         }
    //         if (entidadData.numeroAvion !== undefined && typeof entidad.setNumeroAvion === 'function') {
    //             entidad.setNumeroAvion(entidadData.numeroAvion);
    //         }
    //         if (entidadData.torpedo !== undefined && typeof entidad.setTorpedo === 'function') {
    //             entidad.setTorpedo(entidadData.torpedo);
    //         }
    //         if (entidadData.multiplicadorCombustible !== undefined && typeof entidad.setMultiplicadorCombustible === 'function') {
    //             entidad.setMultiplicadorCombustible(entidadData.multiplicadorCombustible);
    //         }
    //         if (entidadData.despego !== undefined && typeof entidad.setDespego === 'function') {
    //             entidad.setDespego(entidadData.despego);
    //         }
    //         if (entidadData.seleccionado !== undefined && typeof entidad.setSeleccionado === 'function') {
    //             entidad.setSeleccionado(entidadData.seleccionado);
    //         }
    //     } else {
    //         console.error(`❌ Entidad ${idEntidad} no encontrada en sala ${data.sala}`);
    //     }
    // }

    actualizarCombustible(socket, data) {
        // Verificar si la sala existe
        if (!this.validarSala(data.sala)) {
            return;
        }

        // Verificar si la entidad existe
        if (!this.validarEntidad(data.sala, data.idEntidad)) {
            return;
        }

        const entidad = this.salas[data.sala].getEstadoJuego().getEntidad(data.idEntidad);
        entidad.setCombustible(data.combustible);
    }

    recuperarPartida(socket, { sala, rol }) {
        this.query.obtenerDatosDeSala(sala, (error, resultados) => {
            if (error) {
                console.error('Error al recuperar datos sala:', error);
                return;
            }
            let nombreUsuario = null;
            resultados.forEach(resultado => {
                if (resultado.idSala === sala && resultado.rol === rol) {
                    console.log("Nombre Usuario BD:", resultado.nombreJugador);
                    nombreUsuario = resultado.nombreJugador;
                }
            })

            //Si no existe la sala, la inicializo con estado "recuperando". 
            if (!this.salas[sala]) {
                this.salas[sala] = new Sala([], new EstadoJuego(), "recuperando")
            } // Si existe sala pero ya hay dos jugadores jugando, salgo.
            else if (this.salas[sala].cantidadJugadores() === 2) {
                socket.emit("errorUnirse", { mensaje: `El juego ya esta iniciado en ${sala}. Por favor elige otra sala.` });
                return;
            } // Si existe sala, hay 1 jugador esperando pero esta iniciando partida, salgo.
            else if (this.salas[sala].getEstadoPartida() === "iniciando") {
                socket.emit("errorUnirse", { mensaje: `Un jugador esta iniciando nueva partida en ${sala}. Por favor intente mas tarde o ingrese en la opcion de iniciar partida.` });
                return;
            }

            // Verificar si el rol ya está ocupado
            const rolOcupado = this.salas[sala].getJugadores().some(jugador => jugador.rol === rol);
            if (rolOcupado) {
                socket.emit("errorUnirse", { mensaje: `El rol ${rol} ya está ocupado. Elige otro.` });
                return; // No permite que el jugador se una si el rol ya está ocupado
            }

            // Agregar jugador a la sala
            this.salas[sala].jugadores.push({ id: socket.id, nombreUsuario, rol });
            socket.join(sala);

            console.log(`📌 ${nombreUsuario} se unió a la sala ${sala} como ${rol}`);
            console.log("Detalles del jugador:", {
                socketId: socket.id,
                nombreUsuario,
                rol,
                sala,
            });

            // Notificar a todos en la sala
            this.io.to(sala).emit("jugadorConectado", {
                mensaje: `${nombreUsuario} se unió como ${rol}`,
                jugadores: this.salas[sala].getJugadores().map(j => ({ nombreUsuario: j.nombreUsuario, rol: j.rol }))
            });

            // Si solo hay un jugador, enviar evento de espera
            if (this.salas[sala].cantidadJugadores() === 1) {
                this.io.to(sala).emit("esperandoJugadores");
            }

            // Recuperar juego cuando hay dos jugadores
            if (this.salas[sala].cantidadJugadores() === 2) {
                // Inicializar el estado del juego con el ultimo estado guardado


                this.query.obtenerDatosEntidades(sala, (error, resultados) => {
                    if (error) {
                        console.error('Error al recuperar datos entidades:', error);
                        return;
                    }
                    //try - catch


                    const estadoJuego = this.salas[sala].getEstadoJuego();

                    resultados.forEach(resultado => {
                        //console.log(`Entidad ${resultado.idEntidad}: x=${resultado.posX}, y=${resultado.posY}`);
                        console.log("Entidad", resultado);
                        if (resultado.idEntidad === "bismarck") {
                            estadoJuego.agregarEntidad("bismarck", new Bismarck({
                                idEntidad: resultado.idEntidad,
                                x: resultado.posX,
                                y: resultado.posY,
                                velocidad: resultado.velocidad,
                                velocidadMaxima: resultado.velocidadMaxima,
                                angulo: resultado.angulo,
                                aceleracion: resultado.aceleracion,
                                salud: resultado.salud,
                                objeto: null,
                                combustible: resultado.combustible
                            }));
                        } else if (resultado.idEntidad === "portaaviones") {
                            estadoJuego.agregarEntidad("portaaviones", new Portaaviones({
                                idEntidad: resultado.idEntidad,
                                x: resultado.posX,
                                y: resultado.posY,
                                velocidad: resultado.velocidad,
                                velocidadMaxima: resultado.velocidadMaxima,
                                angulo: resultado.angulo,
                                aceleracion: resultado.aceleracion,
                                salud: resultado.salud,
                                objeto: null,
                                combustible: resultado.combustible,
                                seleccionado: false
                            }));
                        } else if (resultado.idEntidad === "puerto") {
                            estadoJuego.setPuerto(new Puerto(resultado.posX, resultado.posY));
                        } else {
                            estadoJuego.agregarEntidad(`avion_${i}`, new Avion({
                                idEntidad: resultado.idEntidad,
                                x: resultado.posX,
                                y: resultado.posY,
                                velocidad: resultado.velocidad,
                                velocidadMaxima: resultado.velocidadMaxima,
                                angulo: resultado.angulo,
                                aceleracion: resultado.aceleracion,
                                objeto: null,
                                combustible: resultado.combustible,
                                piloto: resultado.piloto,
                                observador: resultado.observador,
                                operador: resultado.operador,
                                salud: resultado.salud,
                                numeroAvion: resultado.numeroAvion,
                                torpedo: resultado.torpedo,
                                multiplicadorCombustible: resultado.multiplicadorCombustible,
                                despego: resultado.despego,
                                seleccionado: false
                            }));
                        }
                    })

                    this.io.to(sala).emit("juegoIniciado", {
                        mensaje: "El juego se ha restaurado",
                        jugadores: this.salas[sala].getJugadores(),
                        estadoJuego,
                    });

                    console.log(`🎮 Juego recuperado en ${sala}`);
                    console.log("Detalles del juego:", {
                        sala,
                        jugadores: this.salas[sala].getJugadores(),
                        estadoJuego,
                    });
                });
            }
        });
    }

    guardarPartida(socket, data) {
        // Verificar si la sala existe
        if (!this.validarSala(data.sala)) {
            return;
        }

        const fecha = new Date();
        const jugadores = this.salas[data.sala].getJugadores();
        const entidades = data.estadoJuego.entidades;

        //console.log("📥 Datos recibidos del cliente:", data.sala, jugadores, data.estadoJuego);

        this.query.existeSala(data.sala, (error, resultados) => {
            if (error) {
                console.log('Error:', error);
                return;
            }

            if (resultados.length > 0) {
                jugadores.forEach(jugador => {
                    this.query.actualizarDatosSala(data.sala, jugador.nombreUsuario, jugador.rol, fecha, (error, resultados) => {
                        if (error) {
                            console.log('Error al sobreescribir datos:', error);
                            return;
                        }
                    })
                })
                for (let key in entidades) {
                    const entidad = entidades[key];
                    //console.log("Actualizando datos para entidad:", entidad);
                    let combustibleActualizado = entidad.combustible;
                    const ent = this.salas[data.sala].getEstadoJuego().getEntidad(key);
                    //console.log("Entidad: ", ent);

                    if (ent) {
                        combustibleActualizado = ent.getCombustible();
                        //console.log("Combustible: ", combustibleActualizado)
                    }

                    this.query.actualizarDatosEntidades(data.sala, key, entidad.x, entidad.y, entidad.angulo, entidad.velocidad, entidad.velocidadMaxima, entidad.aceleracion,
                        //entidad.combustible
                        combustibleActualizado, entidad.piloto, entidad.observador, entidad.operador, entidad.salud, entidad.numeroAvion, entidad.torpedo, entidad.multiplicadorCombustible, entidad.despego, (error, resultados) => {
                            if (error) {
                                console.error('Error al insertar entidad:', error);
                                return;
                            }
                        });
                }
                /*for(let key in this.salas[data.sala].estadoJuego.entidades) {
                     const entidadServidor = this.salas[data.sala].estadoJuego.entidades[key];
                     this.query.actualizarDatosEntidades(
                         data.sala,
                         entidadServidor.idEntidad, 
                         entidadServidor.x, 
                         entidadServidor.y, 
                         entidadServidor.angulo, 
                         entidadServidor.velocidad, 
                         entidadServidor.velocidadMaxima, 
                         entidadServidor.aceleracion, 
                         entidadServidor.combustible, 
                         entidadServidor.piloto, 
                         entidadServidor.observador, 
                         entidadServidor.operador, 
                         entidadServidor.salud, 
                         entidadServidor.numeroAvion, 
                         entidadServidor.torpedo, 
                         entidadServidor.multiplicadorCombustible, 
                         entidadServidor.despego, (error, resultados) => {
                         
                             if(error) {
                             console.error('Error al insertar entidad:', error);
                             return;
                         }
                     });
                }*/
                this.query.actualizarDatosEntidades(data.sala, 'puerto', data.estadoJuego.puerto.x, data.estadoJuego.puerto.y, null, null, null, null, null, null, null, null, null, null, null, null, null, (error, resultados) => {
                    if (error) {
                        console.error('Error al insertar entidad:', error);
                        return;
                    }
                    console.log("Resultados Actualizar:", resultados);
                });
            } else {
                jugadores.forEach(jugador => {
                    this.query.insertarDatosSala(data.sala, jugador.nombreUsuario, jugador.rol, fecha, (error, resultados) => {
                        if (error) {
                            console.error('Error al insertar datos:', error);
                            return;
                        }
                        console.log('Datos insertados:', resultados);
                    });
                });
                for (let key in entidades) {
                    const entidad = entidades[key];
                    this.query.insertarDatosEntidades(data.sala, key, entidad.x, entidad.y, entidad.angulo, entidad.velocidad, entidad.velocidadMaxima, entidad.aceleracion, entidad.combustible, entidad.piloto, entidad.observador, entidad.operador, entidad.salud, entidad.numeroAvion, entidad.torpedo, entidad.multiplicadorCombustible, entidad.despego, (error, resultados) => {
                        if (error) {
                            console.error('Error al insertar entidad:', error);
                            return;
                        }
                    });
                }
                this.query.insertarDatosEntidades(data.sala, 'puerto', data.estadoJuego.puerto.x, data.estadoJuego.puerto.y, null, null, null, null, null, null, null, null, null, null, null, null, null, (error, resultados) => {
                    if (error) {
                        console.error('Error al insertar entidad:', error);
                        return;
                    }
                    console.log("Resultados Insertar:", resultados);
                });
            }
        })

        // Emitir evento de confirmación
        this.io.to(data.sala).emit("partidaGuardada", {
            mensaje: "Partida guardada correctamente."
        });
    }

    desconectar(socket) {
        for (const sala in this.salas) {
            this.salas[sala].eliminarJugador(socket.id);

            if (this.salas[sala].cantidadJugadores() === 0) {
                delete this.salas[sala]; // Eliminar sala si no quedan jugadores
            } else {
                this.io.to(sala).emit("jugadorDesconectado", { mensaje: "Un jugador ha salido." });
            }
        }
        console.log("🔴 Jugador desconectado:", socket.id);
    }

    crearPuerto() {
        const esquinas = [
            { x: 0, y: 0 },
            { x: 2800, y: 0 },
            { x: 0, y: 2800 },
            { x: 2800, y: 2800 }
        ];
        const posicion = esquinas[Math.floor(Math.random() * 4)];

        return new Puerto(posicion.x, posicion.y);
    }

    generarPosicionBismarck(puerto) {
        const distanciaMinPuerto = 2000;
        let posicionBismarck;
        let distancia;

        do {
            posicionBismarck = {
                x: Math.floor(Math.random() * 3200),
                y: Math.floor(Math.random() * 3200)
            };

            distancia = Math.sqrt(
                Math.pow(posicionBismarck.x - puerto.getX(), 2) +
                Math.pow(posicionBismarck.y - puerto.getY(), 2)
            );

        } while (distancia < distanciaMinPuerto);

        return posicionBismarck;
    }

    generarPosicionPortaaviones(posicionBismarck, puerto) {
        const distanciaMinBismarck = 2000;
        const distanciaMinPuerto = 1500;
        let posicionPortaaviones;
        let distanciaDeBismarck;
        let distanciaDePuerto;

        do {
            posicionPortaaviones = {
                x: Math.floor(Math.random() * 3200),
                y: Math.floor(Math.random() * 3200)
            };

            distanciaDeBismarck = Math.sqrt(
                Math.pow(posicionPortaaviones.x - posicionBismarck.x, 2) +
                Math.pow(posicionPortaaviones.y - posicionBismarck.y, 2)
            );

            distanciaDePuerto = Math.sqrt(
                Math.pow(posicionPortaaviones.x - puerto.getX(), 2) +
                Math.pow(posicionPortaaviones.y - puerto.getY(), 2)
            );
        } while (distanciaDeBismarck < distanciaMinBismarck || distanciaDePuerto < distanciaMinPuerto);

        return posicionPortaaviones;
    }
}

module.exports = ServidorJuego;
