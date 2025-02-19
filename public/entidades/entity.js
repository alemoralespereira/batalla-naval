class Entity {
    constructor(x, y, speed, maxSpeed, acceleration, target, combustible, vision, rangoVision) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.maxSpeed = maxSpeed;
        this.acceleration = acceleration;
        this.target = target;
        this.combustible = combustible;
        this.vision = vision;
        this.rangoVision = rangoVision;
    }

    init(scene) {
        this.vision = scene.add.circle(
            this.target.x,
            this.target.y,
            this.rangoVision,
            0x00ff00,                 // Color del círculo
            0.2                       // Opacidad
        ).setStrokeStyle(2, 0x00ff00) // Borde del círculo
    }

    update() {
        this.calcularCombustible();
        // Actualizar la posición del círculo de visión.
        if (this.vision && this.target) {
            this.vision.x = this.target.x;
            this.vision.y = this.target.y;
        }
    }
    calcularCombustible() {
        // Calcular la distancia recorrida usando las velocidades
        const deltaX = this.target.body.velocity.x * 0.016; // Ajuste para frame rate
        const deltaY = this.target.body.velocity.y * 0.016;

        let distancia = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        distancia = Math.round(distancia);

        if (distancia > 0) {
            // Disminuir combustible en función de la distancia recorrida
            this.combustible -= distancia;
        }
    }

    move(cursors) {
        //
    }
}

export default Entity;
