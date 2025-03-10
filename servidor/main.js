const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const Bismarck = require('./logica/entidades/bismarck');
const Portaaviones = require('./logica/entidades/portaaviones');
const Avion = require('./logica/entidades/avion');

const app = express();
const servidor = http.createServer(app);
const io = socketIo(servidor);

const config = require('./config.js');
const mainDB = require('./persistencia/mainDB');
const consultas = require('./persistencia/consultas');

const PUERTO = config.PUERTO;// || 8080;

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "../public")));

// Almacenar información de las salas y jugadores
let salas = {};

const db = new mainDB();
let query;

// Loguear las variables de la base de datos
/*console.log('DB variables:', {
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    user: config.DB_USER,
    password: config.DB_PASSWORD
});*/

try {
    // Loguear las variables de configuración antes de conectar
    console.log('Variables DB antes de conectar:', {
        host: config.DB_HOST || 'mysql-aba0.railway.internal',
        port: config.DB_PORT || 3306,
        database: config.DB_NAME || 'railway',
        user: config.DB_USER || 'root',
        password: config.DB_PASSWORD || 'aIrDMWaeYaHFpVaQwxrkhWgGqSoITrcn'
    });

    db.connect();
    const conexion = db.getConnection();
    conexion.connect((err) => {
        if (err) {
            console.error('❌ ERROR CONECCION BASE DE DATOS:', err.message);
        } else {
            console.log('✅ BASE DE DATOS CONECTADA', );
            query = new consultas(conexion);
        }
    });
    
} catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
}



function posicionRandomPuerto() {
    const esquinas = [
        { x: 0, y: 0 },
        { x: 2800, y: 0 }, 
        { x: 0, y: 2800 },
        { x: 2800, y: 2800 }
    ];

    return esquinas[Math.floor(Math.random() * 4)];
}

function posicionRandomBismarck(posicionPuerto){    
    const distanciaMinPuerto = 2000;
    let posicionBismarck;
    let distancia;

    do {
        posicionBismarck = {
            x: Math.floor(Math.random() * 3200),
            y: Math.floor(Math.random() * 3200)
        };
        
        distancia = Math.sqrt(
            Math.pow(posicionBismarck.x - posicionPuerto.x, 2) + 
            Math.pow(posicionBismarck.y - posicionPuerto.y, 2)
        );

    } while (distancia < distanciaMinPuerto);

    return posicionBismarck;
}

function posicionRandomPortaaviones(posicionBismarck, posicionPuerto){
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
            Math.pow(posicionPortaaviones.x - posicionPuerto.x, 2) + 
            Math.pow(posicionPortaaviones.y - posicionPuerto.y, 2)
        );
    } while (distanciaDeBismarck < distanciaMinBismarck || distanciaDePuerto < distanciaMinPuerto);

    return posicionPortaaviones;
}   

io.on("connection", (socket) => {
    console.log("🟢 Nuevo jugador conectado:", socket.id);

    socket.on("unirseSala", ({ nombreUsuario, sala, rol }) => {

        //Si no existe la sala, la inicializo con estado "iniciando". 
        if (!salas[sala]) {
            salas[sala] = { jugadores: [], estadoJuego: { entidades: {} }, estadoPartida: "iniciando" };
        } // Si existe sala pero ya hay dos jugadores jugando, salgo.
            else if (salas[sala].jugadores.length === 2) { 
                socket.emit("errorUnirse", { mensaje: `El juego ya esta iniciado en ${sala}. Por favor elige otra sala.` });
                return;
            } // Si existe sala, hay 1 jugador esperando pero esta recuperando partida, salgo.
                else if (salas[sala].estadoPartida === "recuperando") {
                    socket.emit("errorUnirse", { mensaje: `Un jugador esta recuperando la partida de la ${sala}. Por favor elige otra sala o ingrese en la opcion de recuperar partida.`});
                    return;
                }

        // Verificar si el rol ya está ocupado
        const rolOcupado = salas[sala].jugadores.some(jugador => jugador.rol === rol);
        if (rolOcupado) {
            socket.emit("errorUnirse", { mensaje: `El rol ${rol} ya está ocupado. Elige otro.` });
            return; // No permite que el jugador se una si el rol ya está ocupado
        }

        // Agregar jugador a la sala
        salas[sala].jugadores.push({ id: socket.id, nombreUsuario, rol });
        socket.join(sala);
        
        console.log(`📌 ${nombreUsuario} se unió a ${sala} como ${rol}`);
        console.log("Detalles del jugador:", {
            socketId: socket.id,
            nombreUsuario,
            rol,
            sala,
        });

        // Notificar a todos en la sala
        io.to(sala).emit("jugadorConectado", {
            mensaje: `${nombreUsuario} se unió como ${rol}`,
            jugadores: salas[sala].jugadores.map(j => ({ nombreUsuario: j.nombreUsuario, rol: j.rol }))
        });

        // Si solo hay un jugador, enviar evento de espera
        if (salas[sala].jugadores.length === 1) {
            io.to(sala).emit("esperandoJugadores");
        }

        // Iniciar juego cuando hay dos jugadores
        if (salas[sala].jugadores.length === 2) {
            // Inicializar el estado del juego
           
            const puerto = posicionRandomPuerto();
            const posicionBismarck = posicionRandomBismarck(puerto);
            const posicionPortaaviones = posicionRandomPortaaviones(posicionBismarck, puerto);

            const entidades = {};

            entidades.bismarck = new Bismarck({
                x: posicionBismarck.x,
                y: posicionBismarck.y,
                velocidad: 0,
                velocidadMaxima: 100,
                angulo: 0,
                aceleracion: 1,
                salud: 3,
                objeto: null,
                combustible: 10000
            });

            entidades.portaaviones = new Portaaviones({
                x: posicionPortaaviones.x,
                y: posicionPortaaviones.y,
                velocidad: 0,
                velocidadMaxima: 100,
                angulo: 0,
                aceleracion: 1,
                objeto: null,
                combustible: 5000,
                seleccionado: false
            });

            for (let i = 1; i < 11; i++) {
                entidades[`avion_${i}`] = new Avion({
                    x: posicionPortaaviones.x,
                    y: posicionPortaaviones.y,
                    velocidad: 0,
                    velocidadMaxima: 100,
                    angulo: 0,
                    aceleracion: 2,
                    objeto: null,
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
                });
            }

            salas[sala].estadoJuego.entidades = entidades;
            salas[sala].estadoJuego.puerto = puerto;

            io.to(sala).emit("juegoIniciado", {
                mensaje: "El juego ha comenzado",
                jugadores: salas[sala].jugadores,
                estadoJuego: salas[sala].estadoJuego,
            });

            console.log(`🎮 Juego iniciado en ${sala}`);
            console.log("Detalles del juego:", {
                sala,
                jugadores: salas[sala].jugadores,
                estadoJuego: salas[sala].estadoJuego,
            });
        }
    });

    socket.on("moverEntidad", (data) => {
        // console.log("📥 Datos recibidos del cliente:", data);
    
        // Verificar si la sala existe
        if (!salas[data.sala]) {
            console.error(`❌ ${data.sala} no encontrada.`);
            return;
        }

        // Verificar si la entidad existe
        const entidad = salas[data.sala].estadoJuego.entidades[data.nombreEntidad];
        if (!entidad) {
            console.error(`❌ Entidad ${data.nombreEntidad} no encontrada en sala ${data.sala}`);
            //console.log("Entidades actuales:", salas[data.sala].estadoJuego.entidades);
            return;
        }

       // Actualizar la posición de la entidad
        salas[data.sala].estadoJuego.entidades[data.nombreEntidad].setX(data.x).setY(data.y).setAngulo(data.angulo);

         // Emitir la actualización a todos los jugadores en la sala
        socket.to(data.sala).emit("actualizarPosicionEntidad", {
            nombreEntidad: data.nombreEntidad, 
            x: data.x,             
            y: data.y,             
            angulo: data.angulo    
        });
    });
    
    socket.on("disparar", (data) => {
        // Verificar si la sala existe
        if (!salas[data.sala]) {
            console.error(`❌ Sala ${data.sala} no encontrada.`);
            return;
        }

        // Verificar si la entidad existe
        const entidad = salas[data.sala].estadoJuego.entidades[data.nombreEntidad];
        if (!entidad) {
            console.error(`❌ Entidad ${data.nombreEntidad} no encontrada en sala ${data.sala}`);
            //console.log("Entidades actuales:", salas[data.sala].estadoJuego.entidades);
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
    });

    socket.on("victoria", (data) => {
        // Verificar si la sala existe
        if (!salas[data.sala]) {
            console.error(`❌ Sala ${data.sala} no encontrada.`);
            return;
        }

        io.to(data.sala).emit("finJuego", {
            mensaje: data.mensaje
        });
    });

    socket.on("hundirAvion", (data) => {
        // Verificar si la sala existe
        if (!salas[data.sala]) {
            console.error(`❌ Sala ${data.sala} no encontrada.`);
            return;
        }

        socket.to(data.sala).emit("hundirAvionCliente", {
            sala: data.sala,
            nombreEntidad: data.nombreEntidad,
        });
    })

    socket.on("recuperarPartida", ({ sala, rol }) => {
        query.obtenerDatosDeSala(sala, (error, resultados) => {
            if(error) {
                console.error('Error al recuperar datos sala:', error);
                return;
            }
            let nombreUsuario = null;
            resultados.forEach(resultado => {
                if(resultado.idSala === sala && resultado.rol === rol)
                {
                    console.log("Nombre Usuario BD:", resultado.nombreJugador);
                    nombreUsuario = resultado.nombreJugador;
                }
            })

            //Si no existe la sala, la inicializo con estado "recuperando". 
            if (!salas[sala]) {
                salas[sala] = { jugadores: [], estadoJuego: { entidades: {} }, estadoPartida: "recuperando" };
            } // Si existe sala pero ya hay dos jugadores jugando, salgo.
                else if (salas[sala].jugadores.length === 2) {
                    socket.emit("errorUnirse", { mensaje: `El juego ya esta iniciado en ${sala}. Por favor elige otra sala.` });
                    return;
                } // Si existe sala, hay 1 jugador esperando pero esta iniciando partida, salgo.
                    else if (salas[sala].estadoPartida === "iniciando") {
                        socket.emit("errorUnirse", { mensaje: `Un jugador esta iniciando nueva partida en ${sala}. Por favor intente mas tarde o ingrese en la opcion de iniciar partida.`});
                        return;
                    }
            
            // Verificar si el rol ya está ocupado
            const rolOcupado = salas[sala].jugadores.some(jugador => jugador.rol === rol);
            if (rolOcupado) {
                socket.emit("errorUnirse", { mensaje: `El rol ${rol} ya está ocupado. Elige otro.` });
                return; // No permite que el jugador se una si el rol ya está ocupado
            }

             // Agregar jugador a la sala
            salas[sala].jugadores.push({ id: socket.id, nombreUsuario, rol });
            socket.join(sala);

            console.log(`📌 ${nombreUsuario} se unió a la sala ${sala} como ${rol}`);
            console.log("Detalles del jugador:", {
                socketId: socket.id,
                nombreUsuario,
                rol,
                sala,
            });

            // Notificar a todos en la sala
            io.to(sala).emit("jugadorConectado", {
                mensaje: `${nombreUsuario} se unió como ${rol}`,
                jugadores: salas[sala].jugadores.map(j => ({ nombreUsuario: j.nombreUsuario, rol: j.rol }))
            });

            // Si solo hay un jugador, enviar evento de espera
            if (salas[sala].jugadores.length === 1) {
                io.to(sala).emit("esperandoJugadores");
            }

            // Recuperar juego cuando hay dos jugadores
            if (salas[sala].jugadores.length === 2) {
                // Inicializar el estado del juego con el ultimo estado guardado
            
              
                query.obtenerDatosEntidades(sala, (error, resultados) => {
                    if(error) {
                        console.error('Error al recuperar datos entidades:', error);
                        return;
                    }
                    //try - catch
                
            
                    const entidades = {};
                    let puerto = null;
                    
                    resultados.forEach(resultado => {
                        //console.log(`Entidad ${resultado.idEntidad}: x=${resultado.posX}, y=${resultado.posY}`);
                        console.log("Entidad", resultado);
                        if(resultado.idEntidad === "bismarck") {
                            entidades.bismarck = new Bismarck({
                                x: resultado.posX,
                                y: resultado.posY,
                                velocidad: resultado.velocidad,
                                velocidadMaxima: resultado.velocidadMaxima,
                                angulo: resultado.angulo,
                                aceleracion: resultado.aceleracion,
                                salud: resultado.salud,
                                objeto: null,
                                combustible: resultado.combustible
                            });
                        } else if(resultado.idEntidad === "portaaviones") {
                                entidades.portaaviones = new Portaaviones({
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
                                });
                            } else if (resultado.idEntidad === "puerto"){
                                puerto = {
                                    x: resultado.posX,
                                    y: resultado.posY
                                }
                            } else {
                                entidades[resultado.idEntidad] = new Avion({
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
                                });
                            }
                    })

                    salas[sala].estadoJuego.entidades = entidades;
                    salas[sala].estadoJuego.puerto = puerto;

                    io.to(sala).emit("juegoIniciado", {
                        mensaje: "El juego se ha restaurado",
                        jugadores: salas[sala].jugadores,
                        estadoJuego: salas[sala].estadoJuego,
                    });

                    console.log(`🎮 Juego recuperado en ${sala}`);
                    console.log("Detalles del juego:", {
                        sala,
                        jugadores: salas[sala].jugadores,
                        estadoJuego: salas[sala].estadoJuego,
                    });
                });
            }
        });
    });

    socket.on("guardarPartida", (data) => {
        // Verificar si la sala existe
        if (!salas[data.sala]) {
            console.error(`❌ ${data.sala} no encontrada.`);
            return;
        }
        const fecha = new Date();
        const jugadores = salas[data.sala].jugadores;
        const entidades = data.estadoJuego.entidades;
                
        //console.log("📥 Datos recibidos del cliente:", data.sala, jugadores, data.estadoJuego);
        
       
        query.existeSala(data.sala, (error, resultados) => {
            if(error) {
                console.log('Error:', error);
                return;
            }
            //console.log("Resu", resultados.length);    
     
            if(resultados.length > 0) {
                jugadores.forEach(jugador => {
                    query.actualizarDatosSala(data.sala, jugador.nombreUsuario, jugador.rol, fecha, (error, resultados) => {
                        if(error) {
                            console.log('Error al sobreescribir datos:', error);
                            return;
                        }
                    })
                })
                for (let key in entidades) {
                    const entidad = entidades[key];
                    console.log("Actualizando datos para entidad:", entidad);
                    query.actualizarDatosEntidades(data.sala, key, entidad.x, entidad.y, entidad.angulo, entidad.velocidad, entidad.velocidadMaxima, entidad.aceleracion, entidad.combustible, entidad.piloto, entidad.observador, entidad.operador, entidad.salud, entidad.numeroAvion, entidad.torpedo, entidad.multiplicadorCombustible, entidad.despego, (error, resultados) => {
                        if(error) {
                            console.error('Error al insertar entidad:', error);
                            return;
                        }
                    });
                }
                query.actualizarDatosEntidades(data.sala, 'puerto', data.estadoJuego.puerto.x, data.estadoJuego.puerto.y, null, null, null, null, null, null, null, null, null, null, null, null, null, (error, resultados) => {
                    if(error) {
                        console.error('Error al insertar entidad:', error);
                        return;
                    }
                    console.log("Resultados Actualizar:", resultados);
                });
            } else {
                jugadores.forEach(jugador => {
                    query.insertarDatosSala(data.sala, jugador.nombreUsuario, jugador.rol, fecha, (error, resultados) => {
                        if (error) {
                            console.error('Error al insertar datos:', error);
                            return;
                        }
                        console.log('Datos insertados:', resultados);
                    });
                });
                for (let key in entidades) {
                    const entidad = entidades[key];
                    query.insertarDatosEntidades(data.sala, key, entidad.x, entidad.y, entidad.angulo, entidad.velocidad, entidad.velocidadMaxima, entidad.aceleracion, entidad.combustible, entidad.piloto, entidad.observador, entidad.operador, entidad.salud, entidad.numeroAvion, entidad.torpedo, entidad.multiplicadorCombustible, entidad.despego, (error, resultados) => {
                        if(error) {
                            console.error('Error al insertar entidad:', error);
                            return;
                        }
                    });
                }
                query.insertarDatosEntidades(data.sala, 'puerto', data.estadoJuego.puerto.x, data.estadoJuego.puerto.y, null, null, null, null, null, null, null, null, null, null, null, null, null, (error, resultados) => {
                    if(error) {
                        console.error('Error al insertar entidad:', error);
                        return;
                    }
                    console.log("Resultados Insertar:", resultados);
                });
            }
        })
        
        // Emitir evento de confirmación
        io.to(data.sala).emit("partidaGuardada", { 
            mensaje: "Partida guardada correctamente."
        });
    });

    // Desconexión del jugador
    socket.on("disconnect", () => {
        for (const sala in salas) {
            salas[sala].jugadores = salas[sala].jugadores.filter(j => j.id !== socket.id);
            if (salas[sala].jugadores.length === 0) {
                delete salas[sala]; // Eliminar sala si no quedan jugadores
            } else {
                io.to(sala).emit("jugadorDesconectado", { mensaje: "Un jugador ha salido." });
            }
        }
        console.log("🔴 Jugador desconectado:", socket.id);
    });
});

// Iniciar servidor en el puerto
servidor.listen(PUERTO, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PUERTO}`);
});
