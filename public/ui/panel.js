class Panel {
  constructor(escena) {
    this.panel = escena.add.group();
    this.escena = escena;
  }

  agregarBoton(x, y, texto, colorTexto = '#ffffff') {
    return this.escena.add.text(x, y, texto, {
      fill: colorTexto,                       // Color texto (blanco por defecto)
      backgroundColor: '#808080',             // Fondo gris
      fontStyle: 'bold',
      padding: { x: 10, y: 5 }                // Espaciado interno
    })
      .setInteractive({ useHandCursor: true }) // Hacer el texto interactivo
      .setScrollFactor(0);
  }

  agregarRectangulo(x, y, ancho, alto, color = 0xFFFFFFF) {
    return this.escena.add.rectangle(x, y, ancho, alto, color).setOrigin(0,0).setScrollFactor(0);
  }

  agregarTexto(x, y, texto, tamañoFuente = '20px', color = '#000000') {
    return this.escena.add.text(x, y, texto, { fontSize: tamañoFuente, fill: color }).setScrollFactor(0);
  }

  agregarBotonAlPanel(boton) {
    this.panel.add(boton);
  }
}

export default Panel;
