import type { RanuraColor } from '../modelos/DefinicionColor';
import type { IServicioGranulosProcedurales } from './GeneradorGranulosProcedurales';

export interface IServicioTexturaPBR {
  generarMapasTextura(
    ranuras: RanuraColor[],
    idPatron?: string,
    tamanoGranulo?: number
  ): {
    lienzoDifuso: HTMLCanvasElement;
    lienzoNormal: HTMLCanvasElement;
    lienzoDesplazamiento: HTMLCanvasElement;
  };
}

/**
 * Generador de Mapas de Textura PBR (Difuso, Normal y Desplazamiento) para pavimentos y patrones de caucho EPDM 3D.
 * Cumple con SRP.
 */
export class GeneradorTexturaPBR implements IServicioTexturaPBR {
  private generadorSprites: IServicioGranulosProcedurales;
  private anchoTextura: number = 2048;
  private altoTextura: number = 2048;

  constructor(generadorSprites: IServicioGranulosProcedurales) {
    this.generadorSprites = generadorSprites;
  }

  public generarMapasTextura(
    ranuras: RanuraColor[],
    idPatron: string = 'uniforme',
    tamanoGranulo: number = 22
  ): {
    lienzoDifuso: HTMLCanvasElement;
    lienzoNormal: HTMLCanvasElement;
    lienzoDesplazamiento: HTMLCanvasElement;
  } {
    const ranurasActivas = ranuras.filter(r => r.color !== null && r.porcentaje > 0);

    const lienzoDifuso = document.createElement('canvas');
    lienzoDifuso.width = this.anchoTextura;
    lienzoDifuso.height = this.altoTextura;
    const ctxDifuso = lienzoDifuso.getContext('2d')!;

    const lienzoDesplazamiento = document.createElement('canvas');
    lienzoDesplazamiento.width = this.anchoTextura;
    lienzoDesplazamiento.height = this.altoTextura;
    const ctxDesplazamiento = lienzoDesplazamiento.getContext('2d')!;

    if (ranurasActivas.length === 0) {
      ctxDifuso.fillStyle = '#1E293B';
      ctxDifuso.fillRect(0, 0, this.anchoTextura, this.altoTextura);
      ctxDesplazamiento.fillStyle = '#808080';
      ctxDesplazamiento.fillRect(0, 0, this.anchoTextura, this.altoTextura);
      return {
        lienzoDifuso,
        lienzoNormal: this.generarMapaNormalPlano(),
        lienzoDesplazamiento
      };
    }

    // 1. Capa base de virutas entrelazadas con granulometría EPDM ultra nítida
    this.dibujarMicroVirutasEntrelazadas(ctxDifuso, ctxDesplazamiento, ranurasActivas, tamanoGranulo);

    // 2. Aplicar figuras y patrones arquitectónicos 3D
    if (idPatron !== 'uniforme') {
      this.dibujarDisenos3D(ctxDifuso, ctxDesplazamiento, idPatron, ranurasActivas, tamanoGranulo);
    }

    // 3. Generación del mapa de normales en alta definición
    const lienzoNormal = this.generarMapaNormalDesdeAlturas(ctxDesplazamiento, this.anchoTextura, this.altoTextura);

    return { lienzoDifuso, lienzoNormal, lienzoDesplazamiento };
  }

  private dibujarMicroVirutasEntrelazadas(
    ctxColor: CanvasRenderingContext2D,
    ctxAltura: CanvasRenderingContext2D,
    ranurasActivas: RanuraColor[],
    tamanoGranulo: number
  ): void {
    const mapaSprites = new Map<string, HTMLCanvasElement[]>();
    ranurasActivas.forEach(r => {
      if (r.color) {
        mapaSprites.set(r.color.id, this.generadorSprites.obtenerSprites(r.color));
      }
    });

    const ranuraDominante = [...ranurasActivas].sort((a, b) => b.porcentaje - a.porcentaje)[0];
    const baseColor = ranuraDominante.color!;
    const rFondo = Math.max(0, Math.round(baseColor.r * 0.72));
    const gFondo = Math.max(0, Math.round(baseColor.g * 0.72));
    const bFondo = Math.max(0, Math.round(baseColor.b * 0.72));
    ctxColor.fillStyle = `rgb(${rFondo}, ${gFondo}, ${bFondo})`;
    ctxColor.fillRect(0, 0, this.anchoTextura, this.altoTextura);

    ctxAltura.fillStyle = '#404040';
    ctxAltura.fillRect(0, 0, this.anchoTextura, this.altoTextura);

    const pasoX = tamanoGranulo * 0.48;
    const pasoY = tamanoGranulo * 0.44;
    const columnas = Math.ceil(this.anchoTextura / pasoX) + 2;
    const filas = Math.ceil(this.altoTextura / pasoY) + 2;
    const puntos: Array<{ x: number; y: number; escala: number; rotacion: number; alturaGris: number }> = [];

    for (let f = -1; f < filas; f++) {
      const desfaseX = f % 2 === 0 ? 0 : pasoX / 2;
      for (let c = -1; c < columnas; c++) {
        puntos.push({
          x: c * pasoX + desfaseX + (Math.random() - 0.5) * (pasoX * 0.45),
          y: f * pasoY + (Math.random() - 0.5) * (pasoY * 0.45),
          escala: 0.95 + Math.random() * 0.28,
          rotacion: Math.random() * Math.PI * 2,
          alturaGris: 155 + Math.floor(Math.random() * 80)
        });
      }
    }

    for (let i = puntos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [puntos[i], puntos[j]] = [puntos[j], puntos[i]];
    }

    for (const p of puntos) {
      const colorSeleccionado = this.seleccionarColorPonderado(ranurasActivas);
      const sprites = mapaSprites.get(colorSeleccionado.id);
      if (!sprites) continue;

      const sprite = sprites[Math.floor(Math.random() * sprites.length)];
      const diam = tamanoGranulo * p.escala;

      ctxColor.save();
      ctxColor.translate(p.x, p.y);
      ctxColor.rotate(p.rotacion);
      ctxColor.drawImage(sprite, -diam / 2, -diam / 2, diam, diam);
      ctxColor.restore();

      ctxAltura.save();
      ctxAltura.translate(p.x, p.y);
      ctxAltura.rotate(p.rotacion);
      ctxAltura.fillStyle = `rgb(${p.alturaGris},${p.alturaGris},${p.alturaGris})`;
      ctxAltura.fillRect(-diam * 0.35, -diam * 0.35, diam * 0.7, diam * 0.7);
      ctxAltura.restore();
    }
  }

  private dibujarDisenos3D(
    ctxColor: CanvasRenderingContext2D,
    ctxAltura: CanvasRenderingContext2D,
    idPatron: string,
    ranurasActivas: RanuraColor[],
    tamanoGranulo: number
  ): void {
    const centroX = this.anchoTextura / 2;
    const centroY = this.altoTextura / 2;
    const col2 = ranurasActivas[1]?.color?.hex || '#F8FAFC';
    const col3 = ranurasActivas[2]?.color?.hex || '#F59E0B';

    ctxColor.save();
    ctxAltura.save();

    if (idPatron === 'moteado-terrazzo') {
      const cantidadPuntosFleck = 320;
      for (let i = 0; i < cantidadPuntosFleck; i++) {
        const x = Math.random() * this.anchoTextura;
        const y = Math.random() * this.altoTextura;
        const colFleck = i % 2 === 0 ? col2 : col3;
        const radioFleck = tamanoGranulo * 0.6;

        ctxColor.save();
        ctxColor.translate(x, y);
        ctxColor.rotate(Math.random() * Math.PI * 2);
        ctxColor.fillStyle = colFleck;
        ctxColor.beginPath();
        ctxColor.moveTo(-radioFleck, -radioFleck * 0.6);
        ctxColor.lineTo(radioFleck, -radioFleck * 0.4);
        ctxColor.lineTo(radioFleck * 0.5, radioFleck);
        ctxColor.lineTo(-radioFleck * 0.7, radioFleck * 0.8);
        ctxColor.closePath();
        ctxColor.fill();
        ctxColor.strokeStyle = 'rgba(0,0,0,0.3)';
        ctxColor.lineWidth = 0.8;
        ctxColor.stroke();
        ctxColor.restore();

        ctxAltura.fillStyle = '#E2E8F0';
        ctxAltura.fillRect(x - radioFleck, y - radioFleck, radioFleck * 2, radioFleck * 2);
      }
    } else if (idPatron === 'islas-parque') {
      const radioCirculo = 280;

      ctxColor.strokeStyle = col2;
      ctxColor.lineWidth = 12;
      ctxColor.beginPath();
      ctxColor.arc(centroX - 60, centroY - 60, radioCirculo, -0.3, Math.PI * 1.1);
      ctxColor.stroke();

      ctxAltura.strokeStyle = '#D5D5D5';
      ctxAltura.lineWidth = 12;
      ctxAltura.beginPath();
      ctxAltura.arc(centroX - 60, centroY - 60, radioCirculo, -0.3, Math.PI * 1.1);
      ctxAltura.stroke();

      ctxColor.strokeStyle = col3;
      ctxColor.lineWidth = 8;
      ctxColor.beginPath();
      ctxColor.arc(centroX + 70, centroY + 70, radioCirculo * 0.75, Math.PI * 0.7, Math.PI * 2.1);
      ctxColor.stroke();

      ctxAltura.strokeStyle = '#E2E8F0';
      ctxAltura.lineWidth = 8;
      ctxAltura.beginPath();
      ctxAltura.arc(centroX + 70, centroY + 70, radioCirculo * 0.75, Math.PI * 0.7, Math.PI * 2.1);
      ctxAltura.stroke();
    } else if (idPatron === 'geometria-rayuela') {
      const pasoCuadricula = 90;
      ctxColor.strokeStyle = col2;
      ctxColor.lineWidth = 3.5;
      ctxAltura.strokeStyle = '#E5E5E5';
      ctxAltura.lineWidth = 3.5;

      for (let x = pasoCuadricula; x < this.anchoTextura; x += pasoCuadricula) {
        ctxColor.beginPath();
        ctxColor.moveTo(x, 0);
        ctxColor.lineTo(x, this.altoTextura);
        ctxColor.stroke();

        ctxAltura.beginPath();
        ctxAltura.moveTo(x, 0);
        ctxAltura.lineTo(x, this.altoTextura);
        ctxAltura.stroke();
      }

      for (let y = pasoCuadricula; y < this.altoTextura; y += pasoCuadricula) {
        ctxColor.beginPath();
        ctxColor.moveTo(0, y);
        ctxColor.lineTo(this.anchoTextura, y);
        ctxColor.stroke();

        ctxAltura.beginPath();
        ctxAltura.moveTo(0, y);
        ctxAltura.lineTo(this.anchoTextura, y);
        ctxAltura.stroke();
      }

      const radioRombo = 120;
      ctxColor.strokeStyle = col3;
      ctxColor.lineWidth = 5;
      ctxColor.beginPath();
      ctxColor.moveTo(centroX, centroY - radioRombo);
      ctxColor.lineTo(centroX + radioRombo, centroY);
      ctxColor.lineTo(centroX, centroY + radioRombo);
      ctxColor.lineTo(centroX - radioRombo, centroY);
      ctxColor.closePath();
      ctxColor.stroke();

      ctxAltura.strokeStyle = '#F0F0F0';
      ctxAltura.lineWidth = 5;
      ctxAltura.beginPath();
      ctxAltura.moveTo(centroX, centroY - radioRombo);
      ctxAltura.lineTo(centroX + radioRombo, centroY);
      ctxAltura.lineTo(centroX, centroY + radioRombo);
      ctxAltura.lineTo(centroX - radioRombo, centroY);
      ctxAltura.closePath();
      ctxAltura.stroke();
    } else if (idPatron === 'bandas-deportivas') {
      const pasoFranja = 140;
      const grosorLinea = 9;

      for (let y = 60; y < this.altoTextura; y += pasoFranja) {
        const colLinea = (y / pasoFranja) % 2 === 0 ? col2 : col3;

        ctxColor.fillStyle = colLinea;
        ctxColor.fillRect(0, y, this.anchoTextura, grosorLinea);

        ctxAltura.fillStyle = '#D5D5D5';
        ctxAltura.fillRect(0, y, this.anchoTextura, grosorLinea);

        ctxColor.fillStyle = 'rgba(255,255,255,0.45)';
        ctxColor.fillRect(0, y + grosorLinea + 4, this.anchoTextura, 2);

        ctxAltura.fillStyle = '#B0B0B0';
        ctxAltura.fillRect(0, y + grosorLinea + 4, this.anchoTextura, 2);
      }
    }

    ctxColor.restore();
    ctxAltura.restore();
  }

  private generarMapaNormalDesdeAlturas(
    ctxAltura: CanvasRenderingContext2D,
    ancho: number,
    alto: number
  ): HTMLCanvasElement {
    const lienzoNormal = document.createElement('canvas');
    lienzoNormal.width = ancho;
    lienzoNormal.height = alto;
    const ctxNormal = lienzoNormal.getContext('2d')!;

    const datosImg = ctxAltura.getImageData(0, 0, ancho, alto);
    const pixeles = datosImg.data;
    const imgNormal = ctxNormal.createImageData(ancho, alto);
    const pixelesNormal = imgNormal.data;

    const factorFuerza = 3.2;

    for (let y = 0; y < alto; y++) {
      for (let x = 0; x < ancho; x++) {
        const idx = (y * ancho + x) * 4;

        const xIzq = Math.max(0, x - 1);
        const xDer = Math.min(ancho - 1, x + 1);
        const yArr = Math.max(0, y - 1);
        const yAba = Math.min(alto - 1, y + 1);

        const hIzq = pixeles[(y * ancho + xIzq) * 4] / 255.0;
        const hDer = pixeles[(y * ancho + xDer) * 4] / 255.0;
        const hArr = pixeles[(yArr * ancho + x) * 4] / 255.0;
        const hAba = pixeles[(yAba * ancho + x) * 4] / 255.0;

        const dx = (hDer - hIzq) * factorFuerza;
        const dy = (hAba - hArr) * factorFuerza;
        const dz = 1.0;

        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const nx = (dx / len) * 0.5 + 0.5;
        const ny = (-dy / len) * 0.5 + 0.5;
        const nz = (dz / len) * 0.5 + 0.5;

        pixelesNormal[idx] = Math.floor(nx * 255);
        pixelesNormal[idx + 1] = Math.floor(ny * 255);
        pixelesNormal[idx + 2] = Math.floor(nz * 255);
        pixelesNormal[idx + 3] = 255;
      }
    }

    ctxNormal.putImageData(imgNormal, 0, 0);
    return lienzoNormal;
  }

  private generarMapaNormalPlano(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 4;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#8080FF';
    ctx.fillRect(0, 0, 4, 4);
    return c;
  }

  private seleccionarColorPonderado(ranurasActivas: RanuraColor[]): { id: string; hex: string } {
    const total = ranurasActivas.reduce((acc, r) => acc + r.porcentaje, 0);
    const rnd = Math.random() * total;
    let acum = 0;

    for (const r of ranurasActivas) {
      if (r.color) {
        acum += r.porcentaje;
        if (rnd <= acum) return r.color;
      }
    }
    return ranurasActivas[0].color || { id: 'default', hex: '#333' };
  }
}
