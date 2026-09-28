import type { RanuraColor } from '../modelos/DefinicionColor';
import type { IServicioGranulosProcedurales } from './GeneradorGranulosProcedurales';

export interface IMotorRenderizadoLienzo {
  renderizar(lienzo: HTMLCanvasElement, ranuras: RanuraColor[], tamanoGranulo?: number): void;
}

/**
 * Motor de renderizado de lienzo para la mezcla y distribución homogénea de caucho EPDM.
 * Cumple con SRP.
 */
export class MotorRenderizadoLienzo implements IMotorRenderizadoLienzo {
  private generadorSprites: IServicioGranulosProcedurales;
  private idRender: number = 0;

  constructor(generadorSprites: IServicioGranulosProcedurales) {
    this.generadorSprites = generadorSprites;
  }

  public renderizar(
    lienzo: HTMLCanvasElement,
    ranuras: RanuraColor[],
    tamanoGranulo: number = 18
  ): void {
    const ctx = lienzo.getContext('2d');
    if (!ctx) return;

    const idActual = ++this.idRender;
    const ranurasActivas = ranuras.filter(r => r.color !== null && r.porcentaje > 0);

    if (ranurasActivas.length === 0) {
      ctx.fillStyle = '#F3F4F6';
      ctx.fillRect(0, 0, lienzo.width, lienzo.height);
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '500 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Selecciona los colores para previsualizar la mezcla', lienzo.width / 2, lienzo.height / 2);
      return;
    }

    // Cache local de sprites para el renderizado
    const mapaSprites = new Map<string, HTMLCanvasElement[]>();
    ranurasActivas.forEach(r => {
      if (r.color) {
        mapaSprites.set(r.color.id, this.generadorSprites.obtenerSprites(r.color));
      }
    });

    // 1. Color de fondo base denso
    const ranuraDominante = [...ranurasActivas].sort((a, b) => b.porcentaje - a.porcentaje)[0];
    ctx.fillStyle = ranuraDominante.color!.hex;
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);

    // Sombra de fondo para dar profundidad a la base de poliuretano
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);

    // 2. Malla hexagonal densa y compacta sin huecos (gránulos cercanos entre sí)
    const pasoX = tamanoGranulo * 0.58;
    const pasoY = tamanoGranulo * 0.50;
    const columnas = Math.ceil(lienzo.width / pasoX) + 3;
    const filas = Math.ceil(lienzo.height / pasoY) + 3;
    const puntos: Array<{ x: number; y: number; escala: number; rotacion: number }> = [];

    for (let f = -1; f < filas; f++) {
      const desfaseX = f % 2 === 0 ? 0 : pasoX * 0.5;
      for (let c = -1; c < columnas; c++) {
        puntos.push({
          x: c * pasoX + desfaseX + (Math.random() - 0.5) * (pasoX * 0.35),
          y: f * pasoY + (Math.random() - 0.5) * (pasoY * 0.35),
          escala: 0.85 + Math.random() * 0.3,
          rotacion: Math.random() * Math.PI * 2
        });
      }
    }

    // Barajado aleatorio para intercalar capas y mezcla homogénea
    for (let i = puntos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [puntos[i], puntos[j]] = [puntos[j], puntos[i]];
    }

    // 3. Dibujar gránulos con mezcla ponderada
    for (const p of puntos) {
      if (this.idRender !== idActual) return;

      const colorSeleccionado = this.seleccionarColorPonderado(ranurasActivas);
      const sprites = mapaSprites.get(colorSeleccionado.id);
      if (!sprites || sprites.length === 0) continue;

      const sprite = sprites[Math.floor(Math.random() * sprites.length)];
      const diam = tamanoGranulo * p.escala;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotacion);
      ctx.drawImage(sprite, -diam / 2, -diam / 2, diam, diam);
      ctx.restore();
    }
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
