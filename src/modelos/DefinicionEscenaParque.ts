/**
 * Definiciones y tipos para la simulación fotorrealista de pavimentos en escenas reales.
 * Cumple con principios de responsabilidad única (SRP).
 */

export type ModoVisualizacionEstudio = 'muestra_3d' | 'parque_real';

export interface AjustesRenderParque {
  /** Escala de tiling de los gránulos de caucho en la perspectiva */
  escalaTextura: number;
  /** Posición horizontal normalizada del divisor comparativo (0 = desactivado, 0..1 = posición) */
  posicionDivisor: number;
  /** Si está activo, muestra exclusivamente la fotografía original */
  modoComparativa: boolean;
  /** Altura vertical normalizada del horizonte del suelo (0..1) */
  horizontePiso: number;
  /** Intensidad de las sombras transferidas sobre el caucho (0.5..1.5) */
  intensidadSombras: number;
}

export const AJUSTES_PARQUE_POR_DEFECTO: AjustesRenderParque = {
  escalaTextura: 2.8,
  posicionDivisor: 0.0,
  modoComparativa: false,
  horizontePiso: 0.305,
  intensidadSombras: 1.05
};

export interface DatosMascaraPiso {
  imagenOriginal: HTMLImageElement;
  lienzoMascara: HTMLCanvasElement;
  ancho: number;
  alto: number;
}
