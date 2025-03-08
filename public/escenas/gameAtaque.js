// Minimo
// Determinar angulo bismarck
// Actualizar rotación Bismarck según movimiento avión
// Destruir en vista lateral

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
        this.tiempoDeVista = 2000;
        this.mapaLateral = this.add.image(0, 500, "mapaLateral").setDisplaySize(700, 200).setOrigin(0, 0);

        this.proyectiles = this.add.group();
        this.avion = this.physics.add.sprite(50, 520, "avionLateral").setScale(0.2).setVelocityX(10);

        const direccionBismarck = "bismarckFrente";
        this.bismarck = this.physics.add.sprite(600, 600, direccionBismarck).setOrigin(0.5, 0.5);
        
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
            this.bismarck,
            (proyectil) => this.impacto(this.bismarck, proyectil),
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
        // ...        
    }

    desinicializar() {
        this.escenaIniciada = false;
        this.impactoBismarck = false;
        this.impactoAvion = false;
    }

    iniciarEscena({ entidadAtacante }) {
        this.entidadAtacante = entidadAtacante;

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

    dispararArma() {
        let entidadAtacante = null;
        let entidadDefensora = null;
        let nombreProyectil = '';

        if (this.entidadAtacante === "bismarck") {
            entidadAtacante = this.bismarck;
            entidadDefensora = this.avion;
            nombreProyectil = "proyectilBismarck";
        } else {
            entidadAtacante = this.avion;
            entidadDefensora = this.bismarck;
            nombreProyectil = "proyectilAvion";
        }
        
        const proyectil = this.physics.add.sprite(entidadAtacante.x, entidadAtacante.y, "proyectil");
        proyectil.nombre = nombreProyectil;
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
