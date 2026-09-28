import type { RanuraColor } from '../modelos/DefinicionColor';

export interface ICalculadorProporciones {
  recalcular(ranuras: RanuraColor[], indiceModificado: number, nuevoValor: number): RanuraColor[];
  obtenerDistribucionEquitativa(cantidad: number): number[];
}

/**
 * Servicio encargado del cálculo y balanceo matemático de porcentajes con candados.
 * Cumple con SRP.
 */
export class CalculadorProporciones implements ICalculadorProporciones {
  public recalcular(ranuras: RanuraColor[], indiceModificado: number, nuevoValor: number): RanuraColor[] {
    const copia = ranuras.map(r => ({ ...r }));
    
    if (copia[indiceModificado].bloqueado || copia.length <= 1) {
      return copia;
    }

    const otrosIndices = copia.map((_, i) => i).filter(i => i !== indiceModificado);

    // Suma de ranuras con candado activado
    const sumaBloqueados = otrosIndices
      .filter(i => copia[i].bloqueado)
      .reduce((acumulado, i) => acumulado + copia[i].porcentaje, 0);

    const maximoPermitido = Math.max(0, 100 - sumaBloqueados);
    const porcentajeAjustado = Math.max(0, Math.min(nuevoValor, maximoPermitido));
    copia[indiceModificado].porcentaje = porcentajeAjustado;

    // Distribuir el residuo entre los desbloqueados
    const desbloqueados = otrosIndices.filter(i => !copia[i].bloqueado);
    const residuo = 100 - porcentajeAjustado - sumaBloqueados;

    if (desbloqueados.length > 0) {
      const fraccion = Math.floor(residuo / desbloqueados.length);
      const resto = residuo % desbloqueados.length;

      desbloqueados.forEach((idx, posicion) => {
        copia[idx].porcentaje = fraccion + (posicion < resto ? 1 : 0);
      });
    }

    return copia;
  }

  public obtenerDistribucionEquitativa(cantidad: number): number[] {
    if (cantidad <= 0) return [];
    if (cantidad === 1) return [100];
    if (cantidad === 2) return [50, 50];
    if (cantidad === 3) return [34, 33, 33];
    if (cantidad === 4) return [25, 25, 25, 25];

    const base = Math.floor(100 / cantidad);
    const resto = 100 % cantidad;
    return Array.from({ length: cantidad }, (_, i) => base + (i < resto ? 1 : 0));
  }
}
