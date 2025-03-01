class Entity {
    constructor(x, y, velocidad, velocidadMaxima, angulo, aceleracion, objetivo, combustible) {
        this.xInicial = x;
        this.yInicial = y;
        this.velocidad = velocidad;
        this.velocidadMaxima = velocidadMaxima;
        this.anguloInicial = angulo;
        this.aceleracion = aceleracion;
        this.objetivo = objetivo;
        this.combustible = combustible;
    }

    init(escena) {      
       
    }
    
    update() {
        this.calcularCombustible();
    }

    calcularCombustible() {
        // Calcular la distancia recorrida usando las velocidades
        const deltaX = this.objetivo.body.velocity.x * 0.016; // Ajuste para frame rate
        const deltaY = this.objetivo.body.velocity.y * 0.016;

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

export default Entity;
