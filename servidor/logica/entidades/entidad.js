class Entidad {
    constructor({idEntidad, x, y, velocidad, velocidadMaxima, angulo, aceleracion, combustible }) {
        this.idEntidad = idEntidad;
        this.x = x;
        this.y = y;
        this.velocidad = velocidad;
        this.velocidadMaxima = velocidadMaxima;
        this.angulo = angulo;
        this.aceleracion = aceleracion;
        this.combustible = combustible;
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
        this.x = Number(x);
        return this; 
    }
    
    setY(y) {
        this.y = Number(y);
        return this;
    }

    setVelocidad(velocidad) {
        this.velocidad = Number(velocidad);
        return this;
    }

    setVelocidadMaxima(velocidadMaxima) {
        this.velocidadMaxima = Number(velocidadMaxima);
        return this;
    }

    setAngulo(angulo) {
        this.angulo = Number(angulo);
        return this;
    }

    setAceleracion(aceleracion) {
        this.aceleracion = Number(aceleracion);
        return this;
    }

    setCombustible(combustible) {
        this.combustible = combustible
        return this;
    }
}

module.exports = Entidad;
