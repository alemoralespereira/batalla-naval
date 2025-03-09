class Entidad {
    constructor(x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible) {
        this.xInicial = x;
        this.yInicial = y;
        this.velocidad = velocidad;
        this.velocidadMaxima = velocidadMaxima;
        this.anguloInicial = angulo;
        this.aceleracion = aceleracion;
        this.combustible = combustible;
    }

    init(escena) {      
       
    }
    
    update() {
        this.calcularCombustible();
    }

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
        }
    }

    mover(controles) {
        
    }
}

export default Entidad;
