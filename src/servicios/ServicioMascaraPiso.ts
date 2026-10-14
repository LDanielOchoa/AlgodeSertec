import type { DatosMascaraPiso } from '../modelos/DefinicionEscenaParque';
import type { IServicioMascaraPiso } from './IServicioMascaraPiso';

/**
 * Servicio de extracción y generación de máscara de alta precisión para el suelo del parque.
 * Aplica segmentación conectada (flood-fill), dilatación morfológica anti-halo y suavizado gaussiano.
 * Cumple con el principio de responsabilidad única (SRP).
 */
export class ServicioMascaraPiso implements IServicioMascaraPiso {
  private cacheDatos: Map<string, DatosMascaraPiso> = new Map();

  public async obtenerDatosMascara(urlImagen: string): Promise<DatosMascaraPiso> {
    const datosEnCache = this.cacheDatos.get(urlImagen);
    if (datosEnCache) {
      return datosEnCache;
    }

    const imagen = await this.cargarImagen(urlImagen);
    const ancho = imagen.naturalWidth || imagen.width || 768;
    const alto = imagen.naturalHeight || imagen.height || 1358;

    const lienzoMascara = this.generarMascaraPiso(imagen, ancho, alto);

    const resultado: DatosMascaraPiso = {
      imagenOriginal: imagen,
      lienzoMascara,
      ancho,
      alto
    };

    this.cacheDatos.set(urlImagen, resultado);
    return resultado;
  }

  private cargarImagen(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = error => reject(error);
      img.src = url;
    });
  }

  /**
   * Genera una máscara de segmentación subpíxel del suelo blanco del parque.
   * Elimina cualquier halo blanco mediante expansión de contorno y filtrado gaussiano.
   */
  private generarMascaraPiso(imagen: HTMLImageElement, ancho: number, alto: number): HTMLCanvasElement {
    const lienzoAuxiliar = document.createElement('canvas');
    lienzoAuxiliar.width = ancho;
    lienzoAuxiliar.height = alto;
    const ctxAux = lienzoAuxiliar.getContext('2d', { willReadFrequently: true });

    const lienzoMascara = document.createElement('canvas');
    lienzoMascara.width = ancho;
    lienzoMascara.height = alto;
    const ctxMascara = lienzoMascara.getContext('2d');

    if (!ctxAux || !ctxMascara) return lienzoMascara;

    ctxAux.drawImage(imagen, 0, 0, ancho, alto);
    const datosImagen = ctxAux.getImageData(0, 0, ancho, alto);
    const pixeles = datosImagen.data;

    const totalPixeles = ancho * alto;
    const mascaraBinaria = new Uint8Array(totalPixeles);

    // Límite vertical del horizonte superior del suelo
    const yHorizonteMinimo = Math.floor(alto * 0.305);

    // 1. Clasificación cromática inicial píxel a píxel
    for (let y = yHorizonteMinimo; y < alto; y++) {
      const filaOffset = y * ancho;
      for (let x = 0; x < ancho; x++) {
        const idx = filaOffset + x;
        const i4 = idx * 4;

        const r = pixeles[i4];
        const g = pixeles[i4 + 1];
        const b = pixeles[i4 + 2];

        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const sat = (maxC - minC) / (maxC + 1.0);
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Detección de juegos (tobogán morado, postes verde-turquesa, paneles cálidos y metal negro)
        const esMorado = ((r + b) * 0.5 - g > 15) && (sat > 0.09);
        const esVerde = (g - r > 14) && (sat > 0.09);
        const esCalido = (r - b > 28) && (sat > 0.13);
        const esMetalOscuro = lum < 44;

        const esObjetoJuego = esMorado || esVerde || esCalido || esMetalOscuro;

        if (!esObjetoJuego && lum > 46) {
          mascaraBinaria[idx] = 1;
        }
      }
    }

    // 2. Conectividad espacial desde la base inferior del suelo
    const mascaraConectada = new Uint8Array(totalPixeles);
    const cola = new Int32Array(totalPixeles);
    let colaInicio = 0;
    let colaFin = 0;

    // Inicializar semillas en la fila inferior
    const yBase = alto - 1;
    for (let x = 0; x < ancho; x++) {
      const idx = yBase * ancho + x;
      if (mascaraBinaria[idx] === 1) {
        mascaraConectada[idx] = 1;
        cola[colaFin++] = idx;
      }
    }

    // Propagación en 4 vecinos
    while (colaInicio < colaFin) {
      const actual = cola[colaInicio++];
      const x = actual % ancho;
      const y = Math.floor(actual / ancho);

      const vecinos = [
        x > 0 ? actual - 1 : -1,
        x < ancho - 1 ? actual + 1 : -1,
        y > yHorizonteMinimo ? actual - ancho : -1,
        y < alto - 1 ? actual + ancho : -1
      ];

      for (let v = 0; v < 4; v++) {
        const vecinoIdx = vecinos[v];
        if (vecinoIdx >= 0 && mascaraConectada[vecinoIdx] === 0 && mascaraBinaria[vecinoIdx] === 1) {
          mascaraConectada[vecinoIdx] = 1;
          cola[colaFin++] = vecinoIdx;
        }
      }
    }

    // 3. Dilatación morfológica (2 píxeles) para absorber el halo blanco de los bordes
    const mascaraDilatada = new Uint8Array(totalPixeles);
    for (let y = yHorizonteMinimo; y < alto; y++) {
      const offsetFila = y * ancho;
      for (let x = 0; x < ancho; x++) {
        const idx = offsetFila + x;
        if (mascaraConectada[idx] === 1) {
          mascaraDilatada[idx] = 255;
          continue;
        }

        // Evaluar si algún vecino dentro de un radio de 2 píxeles es suelo
        let esBorde = false;
        for (let dy = -2; dy <= 2 && !esBorde; dy++) {
          const vy = y + dy;
          if (vy < yHorizonteMinimo || vy >= alto) continue;
          const offsetV = vy * ancho;
          for (let dx = -2; dx <= 2; dx++) {
            const vx = x + dx;
            if (vx < 0 || vx >= ancho) continue;
            if (mascaraConectada[offsetV + vx] === 1) {
              esBorde = true;
              break;
            }
          }
        }

        if (esBorde) {
          mascaraDilatada[idx] = 255;
        }
      }
    }

    // 4. Suavizado gaussiano 5x5 separable para bordes subpíxel anti-aliased
    const mascaraSuave = new Uint8Array(totalPixeles);
    const kernel = [1, 4, 6, 4, 1];
    const pesoTotal = 16;

    // Pase horizontal
    const bufferIntermedio = new Uint8Array(totalPixeles);
    for (let y = yHorizonteMinimo; y < alto; y++) {
      const offsetFila = y * ancho;
      for (let x = 0; x < ancho; x++) {
        let suma = 0;
        for (let k = -2; k <= 2; k++) {
          const kx = Math.max(0, Math.min(ancho - 1, x + k));
          suma += mascaraDilatada[offsetFila + kx] * kernel[k + 2];
        }
        bufferIntermedio[offsetFila + x] = Math.round(suma / pesoTotal);
      }
    }

    // Pase vertical
    for (let y = yHorizonteMinimo; y < alto; y++) {
      const offsetFila = y * ancho;
      for (let x = 0; x < ancho; x++) {
        let suma = 0;
        for (let k = -2; k <= 2; k++) {
          const ky = Math.max(yHorizonteMinimo, Math.min(alto - 1, y + k));
          suma += bufferIntermedio[ky * ancho + x] * kernel[k + 2];
        }
        mascaraSuave[offsetFila + x] = Math.round(suma / pesoTotal);
      }
    }

    // 5. Transferir al lienzo de salida
    const datosSalida = ctxMascara.createImageData(ancho, alto);
    const pixelesSalida = datosSalida.data;

    for (let i = 0; i < totalPixeles; i++) {
      const valor = mascaraSuave[i];
      const i4 = i * 4;
      pixelesSalida[i4] = valor;     // R
      pixelesSalida[i4 + 1] = valor; // G
      pixelesSalida[i4 + 2] = valor; // B
      pixelesSalida[i4 + 3] = 255;   // A
    }

    ctxMascara.putImageData(datosSalida, 0, 0);
    return lienzoMascara;
  }
}
