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
  private tamanoSprite: number = 38;

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
   * Genera un gránulo de caucho EPDM con granulometría realista (1.0 - 3.5 mm), acabado mate y bordes naturales.
   */
  private crearGranuloCaucho3D(color: DefinicionColor, semilla: number): HTMLCanvasElement {
    const lienzo = document.createElement('canvas');
    lienzo.width = this.tamanoSprite;
    lienzo.height = this.tamanoSprite;
    const ctx = lienzo.getContext('2d');
    if (!ctx) return lienzo;

    const centroX = this.tamanoSprite / 2;
    const centroY = this.tamanoSprite / 2;

    // Generador pseudoaleatorio determinista
    let rnd = (semilla * 16807 + 789221) % 2147483647;
    const siguienteRnd = () => {
      rnd = (rnd * 16807 + 789221) % 2147483647;
      return (rnd % 10000) / 10000;
    };

    // Proporciones naturales de gránulo de caucho triturado
    const radioBase = 8.5 + siguienteRnd() * 3.2;
    const numeroVertices = 6 + Math.floor(siguienteRnd() * 3); // 6 a 8 vértices
    const vertices: Array<{ x: number; y: number }> = [];
    const pasoAngulo = (Math.PI * 2) / numeroVertices;

    const factorTono = 0.94 + siguienteRnd() * 0.12;
    const rBase = Math.min(255, Math.max(0, Math.round(color.r * factorTono)));
    const gBase = Math.min(255, Math.max(0, Math.round(color.g * factorTono)));
    const bBase = Math.min(255, Math.max(0, Math.round(color.b * factorTono)));

    for (let i = 0; i < numeroVertices; i++) {
      const ang = i * pasoAngulo + (siguienteRnd() - 0.5) * (pasoAngulo * 0.35);
      const dist = radioBase * (0.85 + siguienteRnd() * 0.30);
      vertices.push({
        x: centroX + Math.cos(ang) * dist,
        y: centroY + Math.sin(ang) * dist
      });
    }

    // 1. Sombra de contacto oclusión ambiental
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
    ctx.shadowBlur = 2.0;
    ctx.shadowOffsetX = 0.6;
    ctx.shadowOffsetY = 1.4;

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fill();
    ctx.restore();

    // 2. Base difusa mate de caucho EPDM
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
    const colorLuz = `rgb(${Math.min(255, rBase + 3)}, ${Math.min(255, gBase + 3)}, ${Math.min(255, bBase + 3)})`;
    const colorMedio = `rgb(${rBase}, ${gBase}, ${bBase})`;
    const colorSombra = `rgb(${Math.max(0, rBase - 8)}, ${Math.max(0, gBase - 8)}, ${Math.max(0, bBase - 8)})`;

    degradadoLuz.addColorStop(0, colorLuz);
    degradadoLuz.addColorStop(0.5, colorMedio);
    degradadoLuz.addColorStop(1, colorSombra);
    ctx.fillStyle = degradadoLuz;
    ctx.fill();

    // 3. Facetas angulares con sombreado sutil
    const puntoCima = {
      x: centroX + (siguienteRnd() - 0.5) * 2.5,
      y: centroY + (siguienteRnd() - 0.5) * 2.5
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
      const iluminacionFaceta = (dx * -0.6 + dy * -0.8) / (Math.hypot(dx, dy) || 1);

      if (iluminacionFaceta > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.02, iluminacionFaceta * 0.02)})`;
      } else {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.09, Math.abs(iluminacionFaceta) * 0.09)})`;
      }
      ctx.fill();
    }

    // 4. Micro-porosidad
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let k = 0; k < 6; k++) {
      const px = centroX + (siguienteRnd() - 0.5) * radioBase * 1.2;
      const py = centroY + (siguienteRnd() - 0.5) * radioBase * 1.2;
      ctx.fillRect(px, py, 1.2, 1.2);
    }

    // 5. Contorno de definición suave
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 0.5;
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
