import { useEffect, useRef, useState, useCallback } from 'react';
import type { RanuraColor } from '../modelos/DefinicionColor';
import type { IServicioTexturaPBR } from '../servicios/GeneradorTexturaPBR';
import type { IServicioMascaraPiso } from '../servicios/IServicioMascaraPiso';
import type { IServicioRenderizadorParque } from '../servicios/IServicioRenderizadorParque';
import {
  AJUSTES_PARQUE_POR_DEFECTO,
  type AjustesRenderParque,
  type DatosMascaraPiso
} from '../modelos/DefinicionEscenaParque';
import { Eye, Layers, Sparkles, Loader2, Split } from 'lucide-react';

interface PropiedadesVisorSimuladorParque {
  ranuras: RanuraColor[];
  generadorPBR: IServicioTexturaPBR;
  servicioMascara: IServicioMascaraPiso;
  renderizador: IServicioRenderizadorParque;
  estaMezclando?: boolean;
}

/**
 * Visor interactivo para la simulación fotorrealista de pavimentos en parque infantil.
 * Usa WebGL con perspectiva 3D, modulación de sombras y shaders fotométricos.
 * Cumple con el principio de responsabilidad única (SRP).
 */
export function VisorSimuladorParque({
  ranuras,
  generadorPBR,
  servicioMascara,
  renderizador,
  estaMezclando = false
}: PropiedadesVisorSimuladorParque) {
  const lienzoRef = useRef<HTMLCanvasElement | null>(null);
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  const [datosMascara, setDatosMascara] = useState<DatosMascaraPiso | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [ajustes, setAjustes] = useState<AjustesRenderParque>(AJUSTES_PARQUE_POR_DEFECTO);
  const [modoPresionado, setModoPresionado] = useState<boolean>(false);
  const [comparativaActiva, setComparativaActiva] = useState<boolean>(false);
  const [arrastrando, setArrastrando] = useState<boolean>(false);

  // Inicializar contexto WebGL y precargar fotografía
  useEffect(() => {
    let montado = true;

    async function inicializarEscena() {
      try {
        setCargando(true);
        const datos = await servicioMascara.obtenerDatosMascara('/parque.jpg');
        if (!montado) return;
        setDatosMascara(datos);

        if (lienzoRef.current) {
          renderizador.inicializar(lienzoRef.current);
        }
      } catch (error) {
        console.error('Error al inicializar la simulación fotorrealista:', error);
      } finally {
        if (montado) setCargando(false);
      }
    }

    inicializarEscena();

    return () => {
      montado = false;
      renderizador.destruir();
    };
  }, [servicioMascara, renderizador]);

  // Ejecución del pase de renderizado WebGL
  const ejecutarRenderizado = useCallback(() => {
    if (!datosMascara || !lienzoRef.current) return;

    // Generar textura difusa de alta resolución con la mezcla de gránulos actual
    const { lienzoDifuso } = generadorPBR.generarMapasTextura(ranuras, 'uniforme', 22);

    const ajustesActuales: AjustesRenderParque = {
      ...ajustes,
      modoComparativa: modoPresionado,
      posicionDivisor: comparativaActiva ? ajustes.posicionDivisor : 0.0
    };

    renderizador.renderizar(datosMascara, lienzoDifuso, ajustesActuales);
  }, [datosMascara, generadorPBR, ranuras, ajustes, modoPresionado, comparativaActiva, renderizador]);

  useEffect(() => {
    ejecutarRenderizado();
  }, [ejecutarRenderizado]);

  // Actualización de la posición del divisor al arrastrar
  const actualizarDivisorDesdePosicion = useCallback((clientX: number) => {
    if (!lienzoRef.current) return;
    const rect = lienzoRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const posicionNormalizada = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width));
    setAjustes(prev => ({ ...prev, posicionDivisor: posicionNormalizada }));
  }, []);

  const iniciarArrastre = (e: React.MouseEvent) => {
    if (!comparativaActiva) return;
    setArrastrando(true);
    actualizarDivisorDesdePosicion(e.clientX);
  };

  const moverArrastre = (e: React.MouseEvent) => {
    if (arrastrando) {
      actualizarDivisorDesdePosicion(e.clientX);
    }
  };

  const detenerArrastre = () => {
    setArrastrando(false);
  };

  const alternarComparativa = () => {
    const nuevoEstado = !comparativaActiva;
    setComparativaActiva(nuevoEstado);
    setAjustes(prev => ({
      ...prev,
      posicionDivisor: nuevoEstado ? 0.50 : 0.0
    }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm relative flex-1 flex flex-col min-h-[460px] lg:min-h-0">

        <div
          ref={contenedorRef}
          onMouseMove={moverArrastre}
          onMouseUp={detenerArrastre}
          onMouseLeave={detenerArrastre}
          className="relative flex-1 w-full rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center min-h-[400px] lg:min-h-0 select-none"
        >
          {cargando && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xs z-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#006FEE] animate-spin" />
              <span className="text-xs font-semibold text-zinc-600">
                Cargando simulación fotorrealista WebGL...
              </span>
            </div>
          )}

          {/* Lienzo WebGL principal */}
          <canvas
            ref={lienzoRef}
            onMouseDown={iniciarArrastre}
            className={`max-w-full max-h-full object-contain rounded-xl transition-all duration-300 ${
              estaMezclando ? 'opacity-80 scale-[0.99]' : 'opacity-100 scale-100'
            } ${comparativaActiva ? 'cursor-ew-resize' : 'cursor-default'}`}
          />

          {/* Indicador de estado superior */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl z-10 shadow-xs pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-[#006FEE]" />
            <span>Simulación Fotorrealista In Situ (WebGL)</span>
          </div>

          {/* Etiquetas flotantes en modo comparador */}
          {comparativaActiva && (
            <>
              <div className="absolute top-12 left-3.5 bg-zinc-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg z-10 pointer-events-none border border-white/10 shadow-xs">
                ORIGINAL
              </div>
              <div className="absolute top-12 right-3.5 bg-[#006FEE]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg z-10 pointer-events-none shadow-xs">
                NUEVO DISEÑO
              </div>
            </>
          )}

          {/* Barra de controles inferior */}
          <div className="absolute bottom-3.5 inset-x-3.5 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">

            {/* Botones de visualización y comparativa */}
            <div className="pointer-events-auto flex items-center gap-1.5">
              <button
                type="button"
                onMouseDown={() => setModoPresionado(true)}
                onMouseUp={() => setModoPresionado(false)}
                onMouseLeave={() => setModoPresionado(false)}
                onTouchStart={() => setModoPresionado(true)}
                onTouchEnd={() => setModoPresionado(false)}
                className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-zinc-800 text-xs font-bold px-3.5 py-2 rounded-2xl shadow-sm transition-all cursor-pointer select-none active:scale-95 border border-zinc-200/60"
                title="Mantén pulsado para comparar con la foto original"
              >
                <Eye className="w-3.5 h-3.5 text-[#006FEE]" />
                <span className="hidden sm:inline">
                  {modoPresionado ? 'Mostrando Original' : 'Mantén: Original'}
                </span>
              </button>

              <button
                type="button"
                onClick={alternarComparativa}
                className={`flex items-center gap-1.5 backdrop-blur-md text-xs font-bold px-3.5 py-2 rounded-2xl shadow-sm transition-all cursor-pointer select-none active:scale-95 border ${
                  comparativaActiva
                    ? 'bg-[#006FEE] text-white border-[#006FEE]'
                    : 'bg-white/95 hover:bg-white text-zinc-800 border-zinc-200/60'
                }`}
                title="Desliza para ver la comparativa antes y después"
              >
                <Split className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {comparativaActiva ? 'Arrastra la línea' : 'Antes / Después'}
                </span>
              </button>
            </div>

            {/* Selector de escala de granulometría */}
            <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-sm border border-zinc-200/60">
              <span className="text-[11px] font-semibold text-zinc-500 px-2 flex items-center gap-1">
                <Layers className="w-3 h-3 text-zinc-400" />
                Grano:
              </span>

              {[
                { etiqueta: 'Fino', valor: 3.8 },
                { etiqueta: 'Normal', valor: 2.8 },
                { etiqueta: 'Grueso', valor: 1.8 }
              ].map(opcion => {
                const seleccionado = Math.abs(ajustes.escalaTextura - opcion.valor) < 0.2;
                return (
                  <button
                    key={opcion.etiqueta}
                    type="button"
                    onClick={() => setAjustes(prev => ({ ...prev, escalaTextura: opcion.valor }))}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                      seleccionado
                        ? 'bg-[#006FEE] text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {opcion.etiqueta}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
