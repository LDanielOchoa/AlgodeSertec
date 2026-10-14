import type { DatosMascaraPiso } from '../modelos/DefinicionEscenaParque';

export interface IServicioMascaraPiso {
  /**
   * Carga y procesa la imagen para generar la máscara del piso y mapa de sombras.
   */
  obtenerDatosMascara(urlImagen: string): Promise<DatosMascaraPiso>;
}
