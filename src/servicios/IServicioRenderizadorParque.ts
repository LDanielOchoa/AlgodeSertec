import type { AjustesRenderParque, DatosMascaraPiso } from '../modelos/DefinicionEscenaParque';

/**
 * Interfaz del motor de renderizado WebGL para la simulación de parque.
 * Cumple con el principio de segregación de interfaces (ISP).
 */
export interface IServicioRenderizadorParque {
  /** Inicializa el contexto de renderizado WebGL sobre un elemento canvas */
  inicializar(lienzo: HTMLCanvasElement): void;

  /** Ejecuta el pase de renderizado con WebGL combinando foto, perspectiva, textura y sombras */
  renderizar(
    datos: DatosMascaraPiso,
    lienzoTexturaCaucho: HTMLCanvasElement,
    ajustes: AjustesRenderParque
  ): void;

  /** Retorna el lienzo actual para capturas o descargas en alta resolución */
  obtenerCapturaLienzo(): HTMLCanvasElement | null;

  /** Libera texturas, búferes y programas de GPU */
  destruir(): void;
}
