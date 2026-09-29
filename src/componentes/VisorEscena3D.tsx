import { useEffect, useRef, useState } from 'react';
import {
  NIVELES_ZOOM,
  type IMotorEscena3D,
  type NivelZoomPreset
} from '../servicios/MotorEscena3D';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface PropiedadesVisorEscena3D {
  motor3D: IMotorEscena3D;
  estaMezclando?: boolean;
}

const PRESETS: NivelZoomPreset[] = ['1x', '1.5x', '2x', '3.5x'];

/**
 * Componente visor de muestra 3D cenital.
 * Vista superior en nivel 2x por defecto con 4 niveles predefinidos y zoom vertical continuo.
 * Cumple con SRP.
 */
export function VisorEscena3D({ motor3D, estaMezclando = false }: PropiedadesVisorEscena3D) {
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const [zoomActivo, setZoomActivo] = useState<NivelZoomPreset>('2x');

  useEffect(() => {
    if (contenedorRef.current) {
      motor3D.inicializar(contenedorRef.current);
    }
    return () => {
      motor3D.destruir();
    };
  }, [motor3D]);

  const seleccionarPresetZoom = (preset: NivelZoomPreset) => {
    setZoomActivo(preset);
    motor3D.establecerZoomPreset(preset);
  };

  const manejarZoomIn = () => {
    motor3D.acercarZoom();
  };

  const manejarZoomOut = () => {
    motor3D.alejarZoom();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm relative group flex-1 flex flex-col min-h-[460px] lg:min-h-0">
        
        {/* Contenedor del lienzo 3D Three.js que se expande a la misma altura */}
        <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-[#FAFAFC] flex items-center justify-center min-h-[400px] lg:min-h-0">
          
          {/* Viewport Three.js */}
          <div
            ref={contenedorRef}
            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
              estaMezclando ? 'opacity-70 scale-[0.99]' : 'opacity-100 scale-100'
            }`}
          />

          {/* Widget flotante de Zoom */}
          <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-sm z-10">
            
            <button
              type="button"
              onClick={manejarZoomOut}
              title="Alejar zoom"
              aria-label="Alejar zoom"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-[#006FEE] hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-zinc-200/80 mx-0.5" />

            {/* 4 Niveles de Zoom */}
            <div className="flex items-center gap-0.5 bg-zinc-100/80 p-0.5 rounded-xl">
              {PRESETS.map(preset => {
                const esSeleccionado = zoomActivo === preset;
                const info = NIVELES_ZOOM[preset];

                return (
                  <button
                    key={preset}
                    type="button"
                    title={info.descripcion}
                    onClick={() => seleccionarPresetZoom(preset)}
                    className={`min-w-8 h-7 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      esSeleccionado
                        ? 'bg-[#006FEE] text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            <div className="w-[1px] h-4 bg-zinc-200/80 mx-0.5" />

            <button
              type="button"
              onClick={manejarZoomIn}
              title="Acercar zoom"
              aria-label="Acercar zoom"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-[#006FEE] hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pista de interacción */}
          <div className="absolute bottom-3.5 left-3.5 bg-zinc-900/70 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            Scroll o botones para zoom
          </div>

        </div>
      </div>
    </div>
  );
}



