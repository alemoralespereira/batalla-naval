class Entidad {
    constructor({ x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible, rangoVision }) {
        this.x = x;
        this.y = y;
        this.velocidad = velocidad;
        this.velocidadMaxima = velocidadMaxima;
        this.angulo = angulo;
        this.aceleracion = aceleracion;
        this.combustible = combustible;
        this.rangoVision = rangoVision;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getVeolcidad() {
        return this.velocidad;
    }

    getVelocidadMaxima() {
        return this.velocidadMaxima;
    }

    getAngulo() {
        return this.angulo;
    }

    getAceleracion() {
        return this.aceleracion;
    }

    getCombustible() {
        return this.combustible;
    }

    getRangoVision() {
        return this.rangoVision;
    }

    setX(x) {
        this.x = x;

        return this;
    }

    setY(y) {
        this.y = y;

        return this;
    }

    setAngulo(angulo) {
        this.angulo = angulo;

        return this;
    }
}

module.exports = Entidad;
