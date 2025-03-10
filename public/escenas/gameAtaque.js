// Minimo
// Destruir sprite explosion

// Plus
// Determinar velocidad y distancia proyectil
// Representar más de un avión

class EscenaAtaque extends Phaser.Scene {
    constructor() {
        super({ key: 'EscenaAtaque' });
    }

    init(data) {
        this.origenX = data.origenX;
        this.origenY = data.origenY;
        this.destX = data.destX;
        this.destY = data.destY;
    }

    preload() {
        this.load.image("mapaLateral", "../assets/mapaLateralv2.png");
        this.load.image("bismarckLateral", "../assets/bismarckLateral.png");
        this.load.image("avionLateral", "../assets/avionLateral.png");
        this.load.image("bismarckFrente", "../assets/bismarckFrente.png");
    }

    create() {
        this.tiempoDeVista = 3000;
        this.mapaLateral = this.add.image(0, 500, "mapaLateral").setDisplaySize(700, 200).setOrigin(0, 0);

        this.proyectiles = this.add.group();
        this.avion = this.physics.add.sprite(50, 520, "avionLateral").setScale(0.2).setVelocityX(10);

        this.groupoBismarck = this.add.group();

        this.impactoAvion = false;
        this.impactoBismarck = false;

        this.physics.add.overlap(
            this.proyectiles,
            this.avion,
            (proyectil) => this.impacto(this.avion, proyectil),
            (proyectil) => this.autorizarImpactoAvion(proyectil),
            this
        );
        this.physics.add.overlap(
            this.proyectiles,
            this.groupoBismarck,
            (proyectil, bismarck) => this.impacto(bismarck, proyectil),
            (proyectil) => this.autorizarImpactoBismarck(proyectil),
            this
        );
    }

    impacto(entidad, proyectil) {
        const explosion = this.add.image(entidad.x, entidad.y, "hit").setScale(0.5);
        this.time.delayedCall(350, () => {
            explosion.destroy();
            proyectil.destroy();
        });
    }

    autorizarImpactoBismarck(proyectil) {
        return proyectil.nombre === "proyectilAvion" && this.impactoBismarck;
    }

    autorizarImpactoAvion(proyectil) {
        return proyectil.nombre === "proyectilBismarck" && this.impactoAvion;
    }

    inicializar() {
        // Asegurar que esta escena esté encima de EscenaPrincipal
        this.scene.bringToTop();
        this.avion.x = 50;

        this.escenaIniciada = true;

        // determinar direccion bismarck (lateral vs frente)
        if (this.anguloDisparo <= -45 && this.anguloDisparo > -135) {
            this.bismarck = this.physics.add.sprite(600, 600, "bismarckFrente").setOrigin(0.5, 0.5);
        } else if (this.anguloDisparo <= -135 && this.anguloDisparo > -180) {
            this.bismarck = this.physics.add.sprite(600, 600, "bismarckLateral").setOrigin(0.5, 0.5);
        } else if (this.anguloDisparo <= 180 && this.anguloDisparo > 135) {
            this.bismarck = this.physics.add.sprite(600, 600, "bismarckLateral").setOrigin(0.5, 0.5);
        } else if (this.anguloDisparo <= 135 && this.anguloDisparo > 45) {
            this.bismarck = this.physics.add.sprite(600, 600, "bismarckFrente").setOrigin(0.5, 0.5);
        } else if (this.anguloDisparo <= 45 && this.anguloDisparo > 0) {
            this.bismarck = this.physics.add.sprite(600, 600, "bismarckLateral").setOrigin(0.5, 0.5);
        } else /*if (this.anguloDisparo <= 0 && this.anguloDisparo >= -45)*/ {
            this.bismarck = this.physics.add.sprite(600, 600, "bismarckLateral").setOrigin(0.5, 0.5);
        } 

        this.groupoBismarck.add(this.bismarck);
    }

    desinicializar() {
        this.escenaIniciada = false;
        this.impactoBismarck = false;
        this.impactoAvion = false;

        if (this.bismarck) {
            this.bismarck.destroy();
        }
    }

    iniciarEscena({ nombreArma, anguloDisparo }) {
        this.nombreArma = nombreArma;
        this.anguloDisparo = anguloDisparo;

        this.time.removeAllEvents();

        if (!this.escenaIniciada) {
            this.scene.wake();
            this.inicializar();
        }

        this.time.delayedCall(this.tiempoDeVista, () => {
            this.scene.sleep();
            this.desinicializar();
        });

        this.dispararArma();
    }

    calcularAngulo(origenX, origenY, destX, destY) {
        return Phaser.Math.RadToDeg(Math.atan2(destY - origenY, destX - origenX));
    }

    dispararArma() {
        let entidadDefensora = null;
        let proyectil = null;

        if (this.nombreArma === 'Torpedo avion') {
            entidadDefensora = this.bismarck;
            proyectil = this.physics.add.sprite(this.avion.x, this.avion.y, "torpedo");
            proyectil.nombre = "proyectilAvion";
            proyectil.angle = this.calcularAngulo(this.avion.x, this.avion.y, this.bismarck.x, this.bismarck.y);
        }

        if (this.nombreArma === 'Antiaereo pesado 1' || this.nombreArma === 'Antiaereo pesado 2') {
            entidadDefensora = this.avion;
            proyectil = this.physics.add.sprite(this.bismarck.x, this.bismarck.y, "proyectilPesado")
            proyectil.nombre = "proyectilBismarck";
            proyectil.angle = this.calcularAngulo(this.bismarck.x, this.bismarck.y, this.avion.x, this.avion.y);
        }

        if (this.nombreArma === 'Antiaereo ligero') {
            entidadDefensora = this.avion;
            proyectil = this.physics.add.sprite(this.bismarck.x, this.bismarck.y, "proyectilLigero").setScale(2.0);
            proyectil.nombre = "proyectilBismarck";
            proyectil.angle = this.calcularAngulo(this.bismarck.x, this.bismarck.y, this.avion.x, this.avion.y);
        }

        this.proyectiles.add(proyectil);
        this.physics.moveTo(proyectil, entidadDefensora.x, entidadDefensora.y, 200);

        this.time.delayedCall(this.tiempoDeVista, () => {
            proyectil.destroy();
        });
    }

    update() {
    }
}
export default EscenaAtaque;
