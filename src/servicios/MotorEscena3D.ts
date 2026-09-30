import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { RanuraColor } from '../modelos/DefinicionColor';
import type { IServicioTexturaPBR } from './GeneradorTexturaPBR';

export type NivelZoomPreset = '1x' | '1.5x' | '2x' | '3.5x';

export const NIVELES_ZOOM: Record<NivelZoomPreset, { altura: number; etiqueta: string; descripcion: string }> = {
  '1x': { altura: 5.6, etiqueta: '1x', descripcion: 'Vista General' },
  '1.5x': { altura: 4.0, etiqueta: '1.5x', descripcion: 'Media Superficie' },
  '2x': { altura: 2.8, etiqueta: '2x', descripcion: 'Detalle de Mezcla' },
  '3.5x': { altura: 1.8, etiqueta: '3.5x', descripcion: 'Macro Gránulos 3D' }
};

export interface IMotorEscena3D {
  inicializar(contenedor: HTMLElement): void;
  actualizarTextura(ranuras: RanuraColor[], tamanoGranulo?: number): void;
  establecerZoomPreset(preset: NivelZoomPreset): void;
  acercarZoom(): void;
  alejarZoom(): void;
  restablecerZoom(): void;
  obtenerCapturaLienzo(): HTMLCanvasElement | null;
  destruir(): void;
}

/**
 * Motor de Escena 3D WebGL con Three.js.
 * Vista cenital fija superior con 4 niveles de zoom predefinidos (2x por defecto) y zoom vertical continuo.
 * Cumple con SRP.
 */
export class MotorEscena3D implements IMotorEscena3D {
  private generadorPBR: IServicioTexturaPBR;
  private contenedor: HTMLElement | null = null;
  private escena: THREE.Scene | null = null;
  private camara: THREE.PerspectiveCamera | null = null;
  private renderizador: THREE.WebGLRenderer | null = null;
  private controles: OrbitControls | null = null;

  private mallaMuestra: THREE.Mesh | null = null;
  private materialPavimento: THREE.MeshStandardMaterial | null = null;
  private grupoLuces: THREE.Group | null = null;

  private texturaDifusa: THREE.CanvasTexture | null = null;
  private texturaNormal: THREE.CanvasTexture | null = null;
  private texturaDesplazamiento: THREE.CanvasTexture | null = null;

  private alturaObjetivoZoom: number | null = null;
  private repeticionTextura: number = 1.6;
  private escalaRelieve: number = 0.20;

  private idAnimacion: number | null = null;
  private manejadorResize: (() => void) | null = null;
  private observadorResize: ResizeObserver | null = null;


  constructor(generadorPBR: IServicioTexturaPBR) {
    this.generadorPBR = generadorPBR;
  }

  public inicializar(contenedor: HTMLElement): void {
    this.contenedor = contenedor;
    const ancho = contenedor.clientWidth || 600;
    const alto = contenedor.clientHeight || 450;

    this.escena = new THREE.Scene();
    this.escena.background = new THREE.Color(0xF9FAFB);

    // Cámara cenital fija superior en nivel 2x por defecto
    this.camara = new THREE.PerspectiveCamera(40, ancho / alto, 0.1, 1000);
    this.camara.position.set(0, NIVELES_ZOOM['2x'].altura, 0.0001);

    this.renderizador = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderizador.setSize(ancho, alto);
    this.renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderizador.outputColorSpace = THREE.SRGBColorSpace;
    this.renderizador.shadowMap.enabled = true;
    this.renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderizador.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderizador.toneMappingExposure = 1.0;

    contenedor.innerHTML = '';
    contenedor.appendChild(this.renderizador.domElement);

    // OrbitControls: rotación y paneo desactivados, solo zoom cenital
    this.controles = new OrbitControls(this.camara, this.renderizador.domElement);
    this.controles.enableRotate = false;
    this.controles.enablePan = false;
    this.controles.enableZoom = true;
    this.controles.zoomSpeed = 1.1;
    this.controles.enableDamping = true;
    this.controles.dampingFactor = 0.08;
    this.controles.minDistance = 1.6;
    this.controles.maxDistance = 6.5;
    this.controles.target.set(0, 0, 0);

    this.configurarIluminacion3D();
    this.construirSuperficie3D();

    this.manejadorResize = () => this.redimensionar();
    window.addEventListener('resize', this.manejadorResize);

    if (typeof ResizeObserver !== 'undefined' && this.contenedor) {
      const ro = new ResizeObserver(() => this.redimensionar());
      ro.observe(this.contenedor);
      this.observadorResize = ro;
    }

    this.iniciarBucle();
  }


  private configurarIluminacion3D(): void {
    if (!this.escena) return;
    if (this.grupoLuces) this.escena.remove(this.grupoLuces);

    this.grupoLuces = new THREE.Group();

    // Iluminación ambiental y direccional calibrada para fidelidad y viveza de los colores EPDM
    const luzAmbiente = new THREE.AmbientLight(0xFFFFFF, 0.75);
    this.grupoLuces.add(luzAmbiente);

    const luzPrincipal = new THREE.DirectionalLight(0xFFFFFF, 0.70);
    luzPrincipal.position.set(4, 8, 3);
    luzPrincipal.castShadow = true;
    luzPrincipal.shadow.mapSize.width = 2048;
    luzPrincipal.shadow.mapSize.height = 2048;
    luzPrincipal.shadow.bias = -0.0003;
    this.grupoLuces.add(luzPrincipal);

    const luzRelleno = new THREE.DirectionalLight(0xFFFFFF, 0.25);
    luzRelleno.position.set(-4, 7, -3);
    this.grupoLuces.add(luzRelleno);

    this.escena.add(this.grupoLuces);
  }

  private construirSuperficie3D(): void {
    if (!this.escena) return;

    this.materialPavimento = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.95, // Acabado completamente mate sin brillos reflectantes
      metalness: 0.0,
      displacementScale: this.escalaRelieve
    });

    const geometria = new THREE.PlaneGeometry(6.4, 4.8, 256, 256);
    this.mallaMuestra = new THREE.Mesh(geometria, this.materialPavimento);
    this.mallaMuestra.rotation.x = -Math.PI / 2;
    this.mallaMuestra.receiveShadow = true;
    this.mallaMuestra.castShadow = true;
    this.escena.add(this.mallaMuestra);
  }

  public actualizarTextura(ranuras: RanuraColor[], tamanoGranulo: number = 16): void {
    const { lienzoDifuso, lienzoNormal, lienzoDesplazamiento } = this.generadorPBR.generarMapasTextura(
      ranuras,
      'uniforme',
      tamanoGranulo
    );

    if (this.texturaDifusa) this.texturaDifusa.dispose();
    if (this.texturaNormal) this.texturaNormal.dispose();
    if (this.texturaDesplazamiento) this.texturaDesplazamiento.dispose();

    this.texturaDifusa = new THREE.CanvasTexture(lienzoDifuso);
    this.texturaDifusa.colorSpace = THREE.SRGBColorSpace;
    this.texturaNormal = new THREE.CanvasTexture(lienzoNormal);
    this.texturaDesplazamiento = new THREE.CanvasTexture(lienzoDesplazamiento);

    const maxAnisotropia = this.renderizador ? this.renderizador.capabilities.getMaxAnisotropy() : 8;

    [this.texturaDifusa, this.texturaNormal, this.texturaDesplazamiento].forEach(tex => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(this.repeticionTextura, this.repeticionTextura);
      tex.anisotropy = maxAnisotropia;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
    });

    if (this.materialPavimento) {
      this.materialPavimento.map = this.texturaDifusa;
      this.materialPavimento.normalMap = this.texturaNormal;
      this.materialPavimento.normalScale.set(1.2, 1.2);
      this.materialPavimento.displacementMap = this.texturaDesplazamiento;
      this.materialPavimento.displacementScale = this.escalaRelieve;
      this.materialPavimento.needsUpdate = true;
    }
  }

  public establecerZoomPreset(preset: NivelZoomPreset): void {
    const config = NIVELES_ZOOM[preset];
    if (config) {
      this.alturaObjetivoZoom = config.altura;
    }
  }

  public acercarZoom(): void {
    if (!this.camara || !this.controles) return;
    this.alturaObjetivoZoom = Math.max(this.controles.minDistance, this.camara.position.y - 0.7);
  }

  public alejarZoom(): void {
    if (!this.camara || !this.controles) return;
    this.alturaObjetivoZoom = Math.min(this.controles.maxDistance, this.camara.position.y + 0.7);
  }

  public restablecerZoom(): void {
    this.establecerZoomPreset('2x');
  }

  private redimensionar(): void {
    if (!this.contenedor || !this.renderizador || !this.camara) return;
    const ancho = this.contenedor.clientWidth;
    const alto = this.contenedor.clientHeight;
    this.camara.aspect = ancho / alto;
    this.camara.updateProjectionMatrix();
    this.renderizador.setSize(ancho, alto);
  }

  private iniciarBucle(): void {
    const animar = () => {
      this.idAnimacion = requestAnimationFrame(animar);

      if (this.camara && this.alturaObjetivoZoom !== null) {
        const diferencia = this.alturaObjetivoZoom - this.camara.position.y;
        if (Math.abs(diferencia) > 0.01) {
          this.camara.position.y += diferencia * 0.12;
          this.camara.position.z = 0.0001;
          this.camara.position.x = 0;
          this.controles?.update();
        } else {
          this.camara.position.y = this.alturaObjetivoZoom;
          this.alturaObjetivoZoom = null;
        }
      }

      this.controles?.update();
      if (this.renderizador && this.escena && this.camara) {
        this.renderizador.render(this.escena, this.camara);
      }
    };
    animar();
  }

  public obtenerCapturaLienzo(): HTMLCanvasElement | null {
    if (!this.renderizador || !this.escena || !this.camara) return null;
    this.renderizador.render(this.escena, this.camara);
    return this.renderizador.domElement;
  }

  public destruir(): void {
    if (this.idAnimacion) cancelAnimationFrame(this.idAnimacion);
    if (this.manejadorResize) window.removeEventListener('resize', this.manejadorResize);
    this.observadorResize?.disconnect();
    this.renderizador?.dispose();
  }

}
