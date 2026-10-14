import type { AjustesRenderParque, DatosMascaraPiso } from '../modelos/DefinicionEscenaParque';
import type { IServicioRenderizadorParque } from './IServicioRenderizadorParque';

const CODIGO_VERTEX_SHADER = `
attribute vec2 aPos;
varying vec2 vUV;

void main() {
  vUV = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const CODIGO_FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUV;

uniform sampler2D uFoto;
uniform sampler2D uCaucho;
uniform sampler2D uMascara;

uniform float uEscala;
uniform float uHorizonte;
uniform float uIntensidadSombras;
uniform float uDivisor;
uniform float uModoComparativa;
uniform vec2  uResolucion;

void main() {
  vec4 foto = texture2D(uFoto, vUV);

  // 1. Modo original
  if (uModoComparativa > 0.5) {
    gl_FragColor = foto;
    return;
  }

  // 2. Linea divisoria y comparativa Antes / Despues
  if (uDivisor > 0.001) {
    float distDivisor = abs(vUV.x - uDivisor);
    if (distDivisor < 0.0022) {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      return;
    }
    if (vUV.x < uDivisor) {
      gl_FragColor = foto;
      return;
    }
  }

  // 3. Mascara de suelo de alta precision con antialiasing subpixel
  float mascara = texture2D(uMascara, vUV).r;

  if (mascara < 0.005) {
    gl_FragColor = foto;
    return;
  }

  // 4. Proyeccion analitica en perspectiva 3D del suelo
  float relacionAspecto = uResolucion.x / uResolucion.y;
  float dy = max(vUV.y - uHorizonte, 0.001);
  float profZ = 1.0 / dy;
  float posX = (vUV.x - 0.50) * profZ * relacionAspecto;

  vec2 uvCaucho = vec2(posX * uEscala * 0.42, profZ * uEscala * 0.26);
  vec4 colorCaucho = texture2D(uCaucho, uvCaucho);

  // 5. Iluminacion fotometrica y sombras reales transferidas
  float lum = dot(foto.rgb, vec3(0.299, 0.587, 0.114));
  float factorSombra = lum / 0.89;
  factorSombra = clamp(pow(factorSombra, uIntensidadSombras) * 1.02, 0.12, 1.25);
  vec3 cauchoIluminado = colorCaucho.rgb * factorSombra;

  // 6. Descontaminacion cromatica de bordes (Eliminacion total de halos blancos)
  vec3 tinteCaucho = foto.rgb * (colorCaucho.rgb / 0.89);
  vec3 fondoSinHalo = mix(foto.rgb, tinteCaucho, smoothstep(0.01, 0.52, mascara));

  // 7. Composicion final fotorrealista continua
  vec3 colorFinal = mix(fondoSinHalo, cauchoIluminado, smoothstep(0.12, 0.85, mascara));

  gl_FragColor = vec4(colorFinal, 1.0);
}
`;

/**
 * Servicio de renderizado fotorrealista en WebGL para pavimentos de caucho in-situ.
 * Combina fotografía real, máscara de alta precisión, perspectiva 3D y modulación de sombras.
 * Cumple con el principio de responsabilidad única (SRP).
 */
export class ServicioRenderizadorParque implements IServicioRenderizadorParque {
  private gl: WebGLRenderingContext | null = null;
  private lienzo: HTMLCanvasElement | null = null;
  private programa: WebGLProgram | null = null;

  private texturaFoto: WebGLTexture | null = null;
  private texturaCaucho: WebGLTexture | null = null;
  private texturaMascara: WebGLTexture | null = null;
  private bufferVertices: WebGLBuffer | null = null;

  private ubicaciones: Record<string, WebGLUniformLocation | null> = {};

  private extAnisotropia: { TEXTURE_MAX_ANISOTROPY_EXT: number; MAX_TEXTURE_MAX_ANISOTROPY_EXT: number } | null = null;
  private maxAnisotropia: number = 1;

  public inicializar(lienzo: HTMLCanvasElement): void {
    this.destruir();
    this.lienzo = lienzo;

    const gl = lienzo.getContext('webgl', {
      preserveDrawingBuffer: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      console.error('[ServicioRenderizadorParque] Contexto WebGL no disponible.');
      return;
    }

    this.gl = gl;

    const ext = (
      gl.getExtension('EXT_texture_filter_anisotropic') ||
      gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
      gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
    ) as typeof this.extAnisotropia;

    if (ext) {
      this.extAnisotropia = ext;
      this.maxAnisotropia = Math.min(gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT), 16);
    }

    this.compilarPrograma();
    if (this.programa) {
      this.configurarGeometria();
    }
  }

  private compilarPrograma(): void {
    const gl = this.gl!;

    const vs = this.crearShader(gl.VERTEX_SHADER, CODIGO_VERTEX_SHADER);
    const fs = this.crearShader(gl.FRAGMENT_SHADER, CODIGO_FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[ServicioRenderizadorParque] Error de enlace:', gl.getProgramInfoLog(prog));
      return;
    }

    this.programa = prog;
    gl.useProgram(prog);

    const nombresUniforms = [
      'uFoto',
      'uCaucho',
      'uMascara',
      'uEscala',
      'uHorizonte',
      'uIntensidadSombras',
      'uDivisor',
      'uModoComparativa',
      'uResolucion'
    ];

    for (const nombre of nombresUniforms) {
      this.ubicaciones[nombre] = gl.getUniformLocation(prog, nombre);
    }
  }

  private crearShader(tipo: number, fuente: string): WebGLShader | null {
    const gl = this.gl!;
    const shader = gl.createShader(tipo)!;
    gl.shaderSource(shader, fuente);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[ServicioRenderizadorParque] Error compilando shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private configurarGeometria(): void {
    const gl = this.gl!;
    const prog = this.programa;
    if (!prog) return;

    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    this.bufferVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPos');
    if (aPos >= 0) {
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    }
  }

  public renderizar(
    datos: DatosMascaraPiso,
    lienzoTexturaCaucho: HTMLCanvasElement,
    ajustes: AjustesRenderParque
  ): void {
    if (!this.gl || !this.programa || !this.lienzo) return;

    const gl = this.gl;
    const { imagenOriginal, lienzoMascara, ancho, alto } = datos;

    if (this.lienzo.width !== ancho || this.lienzo.height !== alto) {
      this.lienzo.width = ancho;
      this.lienzo.height = alto;
    }

    gl.viewport(0, 0, ancho, alto);
    gl.useProgram(this.programa);

    // ── Textura 0: Fotografía original del parque ──
    gl.activeTexture(gl.TEXTURE0);
    if (!this.texturaFoto) this.texturaFoto = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texturaFoto);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagenOriginal);
    gl.uniform1i(this.ubicaciones['uFoto'], 0);

    // ── Textura 1: Textura procedural de gránulos de caucho EPDM ──
    gl.activeTexture(gl.TEXTURE1);
    if (!this.texturaCaucho) this.texturaCaucho = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texturaCaucho);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    if (this.extAnisotropia) {
      gl.texParameterf(gl.TEXTURE_2D, this.extAnisotropia.TEXTURE_MAX_ANISOTROPY_EXT, this.maxAnisotropia);
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lienzoTexturaCaucho);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(this.ubicaciones['uCaucho'], 1);

    // ── Textura 2: Máscara subpíxel del suelo ──
    gl.activeTexture(gl.TEXTURE2);
    if (!this.texturaMascara) this.texturaMascara = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texturaMascara);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lienzoMascara);
    gl.uniform1i(this.ubicaciones['uMascara'], 2);

    // ── Uniforms ──
    gl.uniform1f(this.ubicaciones['uEscala'], ajustes.escalaTextura);
    gl.uniform1f(this.ubicaciones['uHorizonte'], ajustes.horizontePiso);
    gl.uniform1f(this.ubicaciones['uIntensidadSombras'], ajustes.intensidadSombras);
    gl.uniform1f(this.ubicaciones['uDivisor'], ajustes.modoComparativa ? 0.0 : ajustes.posicionDivisor);
    gl.uniform1f(this.ubicaciones['uModoComparativa'], ajustes.modoComparativa ? 1.0 : 0.0);
    gl.uniform2f(this.ubicaciones['uResolucion'], ancho, alto);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  public obtenerCapturaLienzo(): HTMLCanvasElement | null {
    return this.lienzo;
  }

  public destruir(): void {
    if (!this.gl) return;
    const gl = this.gl;

    if (this.texturaFoto) {
      gl.deleteTexture(this.texturaFoto);
      this.texturaFoto = null;
    }
    if (this.texturaCaucho) {
      gl.deleteTexture(this.texturaCaucho);
      this.texturaCaucho = null;
    }
    if (this.texturaMascara) {
      gl.deleteTexture(this.texturaMascara);
      this.texturaMascara = null;
    }
    if (this.bufferVertices) {
      gl.deleteBuffer(this.bufferVertices);
      this.bufferVertices = null;
    }
    if (this.programa) {
      gl.deleteProgram(this.programa);
      this.programa = null;
    }

    this.gl = null;
    this.lienzo = null;
  }
}
