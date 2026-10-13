/**
 * Compositor de Vista Real.
 * Detecta automáticamente el suelo de caucho (verde) en una fotografía real y lo reemplaza
 * por la textura de gránulos de la mezcla actual, proyectada en perspectiva sobre el plano
 * del suelo y conservando la iluminación y sombras originales de la foto.
 * Cumple con SRP.
 */

export interface ConfiguracionEscenaReal {
  /** Línea de horizonte como fracción de la altura de la imagen (0 = arriba). */
  horizonte: number;
  /** Distancia focal aproximada como fracción de la altura de la imagen. */
  focal: number;
  /** Texeles de textura por píxel de imagen en la fila inferior (controla el tamaño aparente del gránulo). */
  texelesPorPixelInferior: number;
  /** Fracción superior de la imagen donde nunca se busca suelo. */
  limiteSuperiorSuelo: number;
  /** Distancia máxima (px) que el crecimiento tolerante puede avanzar desde el suelo seguro. */
  distanciaCrecimiento: number;
  /** Fracción de altura desde la que se aceptan fragmentos de suelo desconectados. */
  limiteFragmentos: number;
  /** Rectángulos (fracciones 0-1) que nunca son suelo, p. ej. el césped de otro parque al fondo. */
  zonasExcluidas: Array<{ x0: number; y0: number; x1: number; y1: number }>;
}

export interface ICompositorVistaReal {
  preparar(urlImagen: string): Promise<void>;
  componer(destino: HTMLCanvasElement, texturaDifusa: HTMLCanvasElement): void;
  estaListo(): boolean;
}

const CONFIG_POR_DEFECTO: ConfiguracionEscenaReal = {
  horizonte: 0.24,
  focal: 0.72,
  texelesPorPixelInferior: 3.5,
  limiteSuperiorSuelo: 0.3,
  distanciaCrecimiento: 45,
  limiteFragmentos: 0.34,
  // Césped verde del parque vecino, detrás de la reja (esquina superior izquierda del suelo)
  zonasExcluidas: [{ x0: 0, y0: 0, x1: 0.25, y1: 0.392 }]
};

export class CompositorVistaReal implements ICompositorVistaReal {
  private config: ConfiguracionEscenaReal;
  private urlPreparada: string | null = null;
  private promesaPreparacion: Promise<void> | null = null;

  private ancho = 0;
  private alto = 0;
  private pixelesOriginales: Uint8ClampedArray | null = null;
  private mascara: Float32Array | null = null;
  private factorLuz: Float32Array | null = null;

  constructor(config: Partial<ConfiguracionEscenaReal> = {}) {
    this.config = { ...CONFIG_POR_DEFECTO, ...config };
  }

  public estaListo(): boolean {
    return this.pixelesOriginales !== null && this.mascara !== null && this.factorLuz !== null;
  }

  public preparar(urlImagen: string): Promise<void> {
    if (this.urlPreparada === urlImagen && this.promesaPreparacion) {
      return this.promesaPreparacion;
    }
    this.urlPreparada = urlImagen;
    this.promesaPreparacion = this.cargarImagen(urlImagen).then(img => this.analizarImagen(img));
    return this.promesaPreparacion;
  }

  private cargarImagen(url: string): Promise<HTMLImageElement> {
    return new Promise((resolver, rechazar) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolver(img);
      img.onerror = () => rechazar(new Error(`No se pudo cargar la imagen: ${url}`));
      img.src = url;
    });
  }

  /** Segmenta el suelo y calcula el mapa de iluminación de la fotografía (se ejecuta una sola vez). */
  private analizarImagen(img: HTMLImageElement): void {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const lienzo = document.createElement('canvas');
    lienzo.width = w;
    lienzo.height = h;
    const ctx = lienzo.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0);
    const px = ctx.getImageData(0, 0, w, h).data;
    const n = w * h;

    // 1. Canales suavizados para clasificar sin el ruido de los gránulos individuales
    const r = new Float32Array(n);
    const g = new Float32Array(n);
    const b = new Float32Array(n);
    const lum = new Float32Array(n);
    for (let i = 0, j = 0; i < n; i++, j += 4) {
      r[i] = px[j];
      g[i] = px[j + 1];
      b[i] = px[j + 2];
      lum[i] = 0.299 * px[j] + 0.587 * px[j + 1] + 0.114 * px[j + 2];
    }
    const rs = desenfoqueCaja(r, w, h, 2);
    const gs = desenfoqueCaja(g, w, h, 2);
    const bs = desenfoqueCaja(b, w, h, 2);

    // 2. Clasificación por tono: verde del caucho (excluye postes turquesa y follaje amarillento)
    const candidato = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const rr = rs[i], gg = gs[i], bb = bs[i];
      const max = Math.max(rr, gg, bb);
      const min = Math.min(rr, gg, bb);
      if (max < 20 || gg !== max) continue;
      const delta = max - min;
      if (delta / max < 0.1) continue;
      // Tono (en grados) cuando el verde es el canal dominante
      const tono = 60 * ((bb - rr) / delta) + 120;
      if (tono >= 112 && tono <= 168) candidato[i] = 1;
    }

    // 3. Relleno por inundación desde la fila inferior (solo la región conectada al suelo)
    const yMin = Math.floor(h * this.config.limiteSuperiorSuelo);
    const mascaraBin = new Uint8Array(n);
    const pila = new Int32Array(n);
    let tope = 0;
    for (let x = 0; x < w; x++) {
      const idx = (h - 1) * w + x;
      if (candidato[idx]) {
        mascaraBin[idx] = 1;
        pila[tope++] = idx;
      }
    }
    while (tope > 0) {
      const i = pila[--tope];
      const x = i % w;
      const y = (i / w) | 0;
      if (x > 0 && candidato[i - 1] && !mascaraBin[i - 1]) { mascaraBin[i - 1] = 1; pila[tope++] = i - 1; }
      if (x < w - 1 && candidato[i + 1] && !mascaraBin[i + 1]) { mascaraBin[i + 1] = 1; pila[tope++] = i + 1; }
      if (y > yMin && candidato[i - w] && !mascaraBin[i - w]) { mascaraBin[i - w] = 1; pila[tope++] = i - w; }
      if (y < h - 1 && candidato[i + w] && !mascaraBin[i + w]) { mascaraBin[i + w] = 1; pila[tope++] = i + w; }
    }

    // 4. Crecimiento tolerante: recupera suelo teñido por reflejos de color (p. ej. el panel amarillo
    //    tiñe el caucho de verde-amarillento) o en sombra, limitado a una distancia corta del suelo seguro
    this.crecerRegionTolerante(mascaraBin, rs, gs, bs, w, h, yMin);

    // 5. Fragmentos de suelo desconectados visibles entre/detrás de las estructuras
    this.agregarFragmentosDesconectados(mascaraBin, candidato, rs, gs, bs, w, h, pila);

    // 6. Rellenar huecos pequeños (manchas oscuras de gránulos) rodeados de suelo
    this.rellenarHuecos(mascaraBin, w, h, yMin, Math.floor(n * 0.0015), pila);

    // 7. Máscara suave: cobertura total dentro del suelo y difuminado solo hacia afuera,
    //    para que no queden halos verdes alrededor de postes y bordes
    const mascaraF = new Float32Array(n);
    for (let i = 0; i < n; i++) mascaraF[i] = mascaraBin[i];
    const mascara = desenfoqueCaja(mascaraF, w, h, 1);
    for (let i = 0; i < n; i++) if (mascaraF[i] > mascara[i]) mascara[i] = mascaraF[i];

    // 8. Iluminación multi-escala con inyección de micro-relieve fotográfico:
    //    - lumMedia / baseL: macro-sombras (sombras proyectadas del juego infantil, gradiente de cielo)
    //    - microRelieve: micro-relieve granular fotográfico nativo (evita que el fondo parezca plano/difuminado)
    //    - Modulación por profundidad: mantiene la nitidez táctil del caucho en toda la escena
    const lumMascara = new Float32Array(n);
    let sumaLum = 0;
    let sumaMasc = 0;
    for (let i = 0; i < n; i++) {
      lumMascara[i] = lum[i] * mascaraF[i];
      sumaLum += lumMascara[i];
      sumaMasc += mascaraF[i];
    }
    const lumMedia = sumaMasc > 0 ? sumaLum / sumaMasc : 128;
    const lumMid = desenfoqueCaja(lumMascara, w, h, 10);
    const mascMid = desenfoqueCaja(mascaraF, w, h, 10);

    const factorLuz = new Float32Array(n);
    for (let y = yMin; y < h; y++) {
      const distNorm = Math.min(1, Math.max(0, (y - yMin) / (h - yMin)));
      // Cerca de la cámara predomina el grano de la textura sintética.
      // Al fondo (distNorm -> 0), el micro-relieve fotográfico toma mayor peso para evitar el difuminado.
      const pesoRelieveFoto = 0.35 + (1 - distNorm) * 0.45;

      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (mascara[i] <= 0) continue;

        const baseL = mascMid[i] > 0.01 ? lumMid[i] / mascMid[i] : lumMedia;
        const macroSombra = limitar(baseL / lumMedia, 0.20, 1.8);

        // Relieve granular extraído de la foto real (relación entre luminancia de píxel y la luz media local)
        let microRelieve = baseL > 1 ? lum[i] / baseL : 1;
        microRelieve = limitar(microRelieve, 0.55, 1.6);

        const relieveCombinado = (1 - pesoRelieveFoto) * 1.0 + pesoRelieveFoto * microRelieve;
        factorLuz[i] = macroSombra * relieveCombinado;
      }
    }

    this.ancho = w;
    this.alto = h;
    this.pixelesOriginales = px;
    this.mascara = mascara;
    this.factorLuz = factorLuz;
  }

  private crecerRegionTolerante(
    mascara: Uint8Array,
    rs: Float32Array,
    gs: Float32Array,
    bs: Float32Array,
    w: number,
    h: number,
    yMin: number
  ): void {
    const n = w * h;
    const distancia = new Uint16Array(n);
    const cola = new Int32Array(n);
    let cabeza = 0;
    let fin = 0;
    for (let i = yMin * w; i < n; i++) if (mascara[i]) cola[fin++] = i;

    const distanciaMax = this.config.distanciaCrecimiento;
    const vecinos = [0, 0, 0, 0];

    while (cabeza < fin) {
      const i = cola[cabeza++];
      if (distancia[i] >= distanciaMax) continue;
      const x = i % w;
      const y = (i / w) | 0;
      vecinos[0] = x > 0 ? i - 1 : -1;
      vecinos[1] = x < w - 1 ? i + 1 : -1;
      vecinos[2] = y > yMin ? i - w : -1;
      vecinos[3] = y < h - 1 ? i + w : -1;

      for (const k of vecinos) {
        if (k < 0 || mascara[k]) continue;
        if (!esVerdeTolerante(rs[k], gs[k], bs[k])) continue;
        mascara[k] = 1;
        distancia[k] = distancia[i] + 1;
        cola[fin++] = k;
      }
    }
  }

  private agregarFragmentosDesconectados(
    mascara: Uint8Array,
    candidato: Uint8Array,
    rs: Float32Array,
    gs: Float32Array,
    bs: Float32Array,
    w: number,
    h: number,
    pila: Int32Array
  ): void {
    const n = w * h;
    const yInicio = Math.floor(h * this.config.limiteFragmentos);
    const visitado = new Uint8Array(n);
    const componente: number[] = [];
    const zonas = this.config.zonasExcluidas.map(z => ({
      x0: z.x0 * w, y0: z.y0 * h, x1: z.x1 * w, y1: z.y1 * h
    }));

    for (let inicio = yInicio * w; inicio < n; inicio++) {
      if (mascara[inicio] || !candidato[inicio] || visitado[inicio]) continue;

      componente.length = 0;
      let sumaSat = 0;
      let enZonaExcluida = false;
      let tope = 0;
      pila[tope++] = inicio;
      visitado[inicio] = 1;

      while (tope > 0) {
        const i = pila[--tope];
        componente.push(i);
        const x = i % w;
        const y = (i / w) | 0;
        const max = Math.max(rs[i], gs[i], bs[i]);
        const min = Math.min(rs[i], gs[i], bs[i]);
        sumaSat += max > 0 ? (max - min) / max : 0;
        if (!enZonaExcluida) {
          for (const z of zonas) {
            if (x >= z.x0 && x < z.x1 && y >= z.y0 && y < z.y1) { enZonaExcluida = true; break; }
          }
        }

        if (x > 0 && !mascara[i - 1] && candidato[i - 1] && !visitado[i - 1]) { visitado[i - 1] = 1; pila[tope++] = i - 1; }
        if (x < w - 1 && !mascara[i + 1] && candidato[i + 1] && !visitado[i + 1]) { visitado[i + 1] = 1; pila[tope++] = i + 1; }
        if (y > yInicio && !mascara[i - w] && candidato[i - w] && !visitado[i - w]) { visitado[i - w] = 1; pila[tope++] = i - w; }
        if (y < h - 1 && !mascara[i + w] && candidato[i + w] && !visitado[i + w]) { visitado[i + w] = 1; pila[tope++] = i + w; }
      }

      // El caucho tiene saturación moderada; el césped artificial del fondo es mucho más saturado
      const saturacionMedia = sumaSat / componente.length;
      if (!enZonaExcluida && componente.length >= 40 && saturacionMedia < 0.45) {
        for (const i of componente) mascara[i] = 1;
      }
    }
  }

  private rellenarHuecos(
    mascara: Uint8Array,
    w: number,
    h: number,
    yMin: number,
    areaMaxima: number,
    buffer: Int32Array
  ): void {
    const visitado = new Uint8Array(w * h);
    const componente: number[] = [];

    for (let inicio = yMin * w; inicio < w * h; inicio++) {
      if (mascara[inicio] || visitado[inicio]) continue;

      componente.length = 0;
      let tocaBorde = false;
      let tope = 0;
      buffer[tope++] = inicio;
      visitado[inicio] = 1;

      while (tope > 0) {
        const i = buffer[--tope];
        componente.push(i);
        const x = i % w;
        const y = (i / w) | 0;
        if (x === 0 || x === w - 1 || y === yMin || y === h - 1) tocaBorde = true;

        if (x > 0 && !mascara[i - 1] && !visitado[i - 1]) { visitado[i - 1] = 1; buffer[tope++] = i - 1; }
        if (x < w - 1 && !mascara[i + 1] && !visitado[i + 1]) { visitado[i + 1] = 1; buffer[tope++] = i + 1; }
        if (y > yMin && !mascara[i - w] && !visitado[i - w]) { visitado[i - w] = 1; buffer[tope++] = i - w; }
        if (y < h - 1 && !mascara[i + w] && !visitado[i + w]) { visitado[i + w] = 1; buffer[tope++] = i + w; }
      }

      if (!tocaBorde && componente.length <= areaMaxima) {
        for (const i of componente) mascara[i] = 1;
      }
    }
  }

  /** Compone la fotografía con el suelo re-texturizado con la mezcla actual. */
  public componer(destino: HTMLCanvasElement, texturaDifusa: HTMLCanvasElement): void {
    if (!this.estaListo()) return;
    const w = this.ancho;
    const h = this.alto;
    const original = this.pixelesOriginales!;
    const mascara = this.mascara!;
    const factorLuz = this.factorLuz!;

    if (destino.width !== w) destino.width = w;
    if (destino.height !== h) destino.height = h;
    const ctx = destino.getContext('2d')!;
    const salida = ctx.createImageData(w, h);
    const out = salida.data;
    out.set(original);

    // Muestreo directo en alta resolución: conserva la definición individual de los gránulos
    // y evita el colapso borroso que provocaban los niveles de mipmap al fondo
    const ctxTex = texturaDifusa.getContext('2d', { willReadFrequently: true })!;
    const imgTex = ctxTex.getImageData(0, 0, texturaDifusa.width, texturaDifusa.height);
    const datosTex = imgTex.data;
    const tw = texturaDifusa.width;
    const th = texturaDifusa.height;

    const yh = h * this.config.horizonte;
    const cx = w / 2;
    const f = h * this.config.focal;
    const A = this.config.texelesPorPixelInferior * (h - yh);
    const yMin = Math.floor(h * this.config.limiteSuperiorSuelo);

    for (let y = yMin; y < h; y++) {
      const d = y - yh;
      if (d <= 1) continue;

      // Coordenadas sobre el plano del suelo (proyección de cámara pinhole)
      const v = (A * f) / d;
      const escalaU = A / d;

      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const a = mascara[i];
        if (a < 0.004) continue;

        const u = (x - cx) * escalaU;

        // Muestreo bilineal rápido en la textura 2048x2048
        const uMod = ((u % tw) + tw) % tw;
        const vMod = ((v % th) + th) % th;
        const x0 = uMod | 0;
        const y0 = vMod | 0;
        const fx = uMod - x0;
        const fy = vMod - y0;
        const x1 = x0 + 1 >= tw ? 0 : x0 + 1;
        const y1 = y0 + 1 >= th ? 0 : y0 + 1;

        const i00 = (y0 * tw + x0) * 4;
        const i10 = (y0 * tw + x1) * 4;
        const i01 = (y1 * tw + x0) * 4;
        const i11 = (y1 * tw + x1) * 4;

        const w00 = (1 - fx) * (1 - fy);
        const w10 = fx * (1 - fy);
        const w01 = (1 - fx) * fy;
        const w11 = fx * fy;

        const colR = datosTex[i00] * w00 + datosTex[i10] * w10 + datosTex[i01] * w01 + datosTex[i11] * w11;
        const colG = datosTex[i00 + 1] * w00 + datosTex[i10 + 1] * w10 + datosTex[i01 + 1] * w01 + datosTex[i11 + 1] * w11;
        const colB = datosTex[i00 + 2] * w00 + datosTex[i10 + 2] * w10 + datosTex[i01 + 2] * w01 + datosTex[i11 + 2] * w11;

        const luz = factorLuz[i];
        const j = i * 4;
        out[j] = original[j] * (1 - a) + colR * luz * a;
        out[j + 1] = original[j + 1] * (1 - a) + colG * luz * a;
        out[j + 2] = original[j + 2] * (1 - a) + colB * luz * a;
      }
    }

    ctx.putImageData(salida, 0, 0);
  }
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function limitar(valor: number, min: number, max: number): number {
  return valor < min ? min : valor > max ? max : valor;
}

/** Verde amplio (incluye verde-amarillento por reflejos y verdes en sombra). */
function esVerdeTolerante(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  if (max < 12 || g !== max) return false;
  const delta = max - Math.min(r, g, b);
  if (delta / max < 0.12) return false;
  const tono = 60 * ((b - r) / delta) + 120;
  return tono >= 70 && tono <= 172;
}

/** Desenfoque de caja separable O(n) sobre un canal. */
function desenfoqueCaja(src: Float32Array, w: number, h: number, radio: number): Float32Array {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const diam = 2 * radio + 1;

  for (let y = 0; y < h; y++) {
    const fila = y * w;
    let suma = 0;
    for (let k = -radio; k <= radio; k++) suma += src[fila + limitar(k, 0, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[fila + x] = suma / diam;
      suma += src[fila + Math.min(w - 1, x + radio + 1)] - src[fila + Math.max(0, x - radio)];
    }
  }

  for (let x = 0; x < w; x++) {
    let suma = 0;
    for (let k = -radio; k <= radio; k++) suma += tmp[limitar(k, 0, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = suma / diam;
      suma += tmp[Math.min(h - 1, y + radio + 1) * w + x] - tmp[Math.max(0, y - radio) * w + x];
    }
  }
  return out;
}
