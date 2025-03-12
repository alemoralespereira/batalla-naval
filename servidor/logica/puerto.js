class Puerto {
    constructor(x, y, angulo) {
        this.x = Number(x);
        this.y = Number(y);
        this.angulo = Number(angulo);
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getAngulo() {
        return this.angulo;
    }
}

module.exports = Puerto;
