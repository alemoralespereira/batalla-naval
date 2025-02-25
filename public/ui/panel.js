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

  agregarBotonAlPanel(boton) {
    this.panel.add(boton);
  }
}

export default Panel;
