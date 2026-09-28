import type { DefinicionColor } from '../modelos/DefinicionColor';

export interface IServicioGranulosProcedurales {
  obtenerSprites(color: DefinicionColor): HTMLCanvasElement[];
}

/**
 * Generador procedural de gránulos de caucho EPDM con relieve 3D, biseles iluminados y sombras de contacto.
 * Cumple con el principio de responsabilidad única (SRP).
 */
export class GeneradorGranulosProcedurales implements IServicioGranulosProcedurales {
  private cacheSprites: Map<string, HTMLCanvasElement[]> = new Map();
  private variacionesPorColor: number = 36;
  private tamanoSprite: number = 36;

  public obtenerSprites(color: DefinicionColor): HTMLCanvasElement[] {
    if (this.cacheSprites.has(color.id)) {
      return this.cacheSprites.get(color.id)!;
    }

    const sprites: HTMLCanvasElement[] = [];
    for (let i = 0; i < this.variacionesPorColor; i++) {
      sprites.push(this.crearGranuloCaucho3D(color, i));
    }

    this.cacheSprites.set(color.id, sprites);
    return sprites;
  }

  /**
   * Genera un gránulo de caucho EPDM con geometría facetada, volumen 3D y corte angulado.
   */
  private crearGranuloCaucho3D(color: DefinicionColor, semilla: number): HTMLCanvasElement {
    const lienzo = document.createElement('canvas');
    lienzo.width = this.tamanoSprite;
    lienzo.height = this.tamanoSprite;
    const ctx = lienzo.getContext('2d');
    if (!ctx) return lienzo;

    const centroX = this.tamanoSprite / 2;
    const centroY = this.tamanoSprite / 2;

    // Generador pseudoaleatorio determinista para variedad consistente
    let rnd = (semilla * 16807 + 789221) % 2147483647;
    const siguienteRnd = () => {
      rnd = (rnd * 16807 + 789221) % 2147483647;
      return (rnd % 10000) / 10000;
    };

    // Tamaño controlado para evitar formas demasiado anchas o desproporcionadas
    const radioBase = 8.5 + siguienteRnd() * 3.5;
    const numeroVertices = 5 + Math.floor(siguienteRnd() * 3); // 5 a 7 vértices angulares
    const vertices: Array<{ x: number; y: number }> = [];
    const pasoAngulo = (Math.PI * 2) / numeroVertices;

    // Ligera variación tonal del caucho (microvariación de lote de fabricación)
    const factorTono = 0.92 + siguienteRnd() * 0.16;
    const rBase = Math.min(255, Math.max(0, Math.round(color.r * factorTono)));
    const gBase = Math.min(255, Math.max(0, Math.round(color.g * factorTono)));
    const bBase = Math.min(255, Math.max(0, Math.round(color.b * factorTono)));

    // Construir polígono angular con proporciones simétricas de viruta
    for (let i = 0; i < numeroVertices; i++) {
      const ang = i * pasoAngulo + (siguienteRnd() - 0.5) * (pasoAngulo * 0.4);
      const dist = radioBase * (0.82 + siguienteRnd() * 0.36);
      vertices.push({
        x: centroX + Math.cos(ang) * dist,
        y: centroY + Math.sin(ang) * dist
      });
    }

    // 1. Sombra de contacto oclusión ambiental inferior
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.restore();

    // 2. Base con iluminación direccional (luz superior izquierda)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.closePath();
    ctx.clip();

    const degradadoLuz = ctx.createLinearGradient(
      centroX - radioBase, centroY - radioBase,
      centroX + radioBase, centroY + radioBase
    );
    const colorLuz = `rgb(${Math.min(255, rBase + 45)}, ${Math.min(255, gBase + 45)}, ${Math.min(255, bBase + 45)})`;
    const colorMedio = `rgb(${rBase}, ${gBase}, ${bBase})`;
    const colorSombra = `rgb(${Math.max(0, rBase - 45)}, ${Math.max(0, gBase - 45)}, ${Math.max(0, bBase - 45)})`;

    degradadoLuz.addColorStop(0, colorLuz);
    degradadoLuz.addColorStop(0.5, colorMedio);
    degradadoLuz.addColorStop(1, colorSombra);
    ctx.fillStyle = degradadoLuz;
    ctx.fill();

    // 3. Facetas angulares y biseles 3D
    const puntoCima = {
      x: centroX + (siguienteRnd() - 0.5) * 3,
      y: centroY + (siguienteRnd() - 0.5) * 3
    };

    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % vertices.length];

      ctx.beginPath();
      ctx.moveTo(puntoCima.x, puntoCima.y);
      ctx.lineTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.closePath();

      const dx = v2.x - v1.x;
      const dy = v2.y - v1.y;
      // Normal simulada con dirección de luz (-0.6, -0.8)
      const iluminacionFaceta = (dx * -0.6 + dy * -0.8) / (Math.hypot(dx, dy) || 1);

      if (iluminacionFaceta > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.3, iluminacionFaceta * 0.28)})`;
      } else {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.4, Math.abs(iluminacionFaceta) * 0.38)})`;
      }
      ctx.fill();
    }

    // 4. Micro-textura porosa de caucho
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let k = 0; k < 4; k++) {
      const px = centroX + (siguienteRnd() - 0.5) * radioBase * 1.2;
      const py = centroY + (siguienteRnd() - 0.5) * radioBase * 1.2;
      ctx.fillRect(px, py, 1.2, 1.2);
    }

    // 5. Contorno de definición sutil
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();

    return lienzo;
  }
}
