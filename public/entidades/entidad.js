import socket from '../socket.js';
class Entidad {
    constructor(idEntidad, x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible) {
        this.idEntidad = idEntidad;
        this.xInicial = x;
        this.yInicial = y;
        this.velocidad = velocidad;
        this.velocidadMaxima = velocidadMaxima;
        this.anguloInicial = angulo;
        this.aceleracion = aceleracion;
        this.combustible = combustible;
    }

    init(escena) {   
        this.escena = escena;      
    }
    
    update() {
        this.calcularCombustible();

       /* socket.emit("actualizarDatosEntidad", {
            sala: this.escena.sala,
            entidad: this.getDatos()
        })    */  
    }

   /* getDatos() {
        return {
            idEntidad: this.idEntidad,
            xInicial: this.xInicial,
            yInicial: this.yInicial,
            velocidad: this.velocidad,
            velocidadMaxima: this.velocidadMaxima,
            anguloInicial: this.anguloInicial,
            aceleracion: this.aceleracion,
            combustible: this.combustible
        };
    }*/

    calcularCombustible() {
        // Calcular la distancia recorrida usando las velocidades
        if (!this.objeto || !this.objeto.body) {
            console.warn("Intento de calcular combustible en una entidad destruida.");
            return; //Evita calcular combustible si el objeto ya no existe
        }
   
        const deltaX = this.objeto.body.velocity.x * 0.016; // Ajuste para frame rate      
        const deltaY = this.objeto.body.velocity.y * 0.016;

        let distancia = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        distancia = Math.round(distancia);
        
        if (distancia > 0) {
            // Disminuir combustible en función de la distancia recorrida
            this.combustible -= distancia;
            
            socket.emit("actualizarCombustible", {
                sala: this.escena.sala,
                idEntidad: this.idEntidad,       
                combustible: this.combustible
            })
        }        
    }

    mover() {

    }
}

export default Entidad;
