class Entity {
    constructor(x, y, velocidad, velocidadMaxima, aceleracion, objetivo, combustible/*, vision, rangoVision*/) {
        this.x = x;
        this.y = y;
        this.velocidad = velocidad;
        this.velocidadMaxima = velocidadMaxima;
        this.aceleracion = aceleracion;
        this.objetivo = objetivo;
        this.combustible = combustible;
       // this.vision = vision;
       // this.rangoVision = rangoVision;
    }

    init(escena) {
        /*this.vision = escena.add.circle(
            this.objetivo.x,
            this.objetivo.y,
            this.rangoVision,
            0x00ff00,                 // Color del círculo
            0.2                       // Opacidad
        ).setStrokeStyle(2, 0x00ff00) // Borde del círculo*/
        
       
    }

    update() {
        this.calcularCombustible();
        // Actualizar la posición del círculo de visión.
        /*if (this.vision && this.objetivo) {
            this.vision.x = this.objetivo.x;
            this.vision.y = this.objetivo.y;
        }*/
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
        //
    }
}

export default Entity;
