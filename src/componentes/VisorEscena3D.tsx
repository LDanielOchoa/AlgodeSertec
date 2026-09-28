import { useEffect, useRef, useState } from 'react';
import {
  NIVELES_ZOOM,
  type IMotorEscena3D,
  type NivelZoomPreset
} from '../servicios/MotorEscena3D';
import { Button, ButtonGroup, Chip, Tooltip } from '@heroui/react';
import { ZoomIn, ZoomOut, Sparkles } from 'lucide-react';

interface PropiedadesVisorEscena3D {
  motor3D: IMotorEscena3D;
  estaMezclando?: boolean;
}

const PRESETS: NivelZoomPreset[] = ['1x', '1.5x', '2x', '3.5x'];

/**
 * Componente visor de muestra 3D cenital con componentes HeroUI (Button, ButtonGroup, Chip, Tooltip).
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
    <div className="w-full">
      <div className="bg-white rounded-3xl border border-zinc-200 p-4 sm:p-6 relative group">
        
        {/* Contenedor del lienzo 3D Three.js */}
        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-zinc-200 bg-[#FAFAFC] flex items-center justify-center">
          
          {/* Viewport Three.js */}
          <div
            ref={contenedorRef}
            className={`w-full h-full transition-opacity duration-300 ${
              estaMezclando ? 'opacity-70 scale-[0.99]' : 'opacity-100 scale-100'
            }`}
          />

          {/* Insignia de estado estilo HeroUI Chip */}
          <div className="absolute top-3.5 left-3.5 pointer-events-none">
            <Chip
              variant="flat"
              size="sm"
              radius="full"
              className="bg-white/95 backdrop-blur-md border border-zinc-200 text-zinc-800 font-semibold"
              startContent={
                <span className="relative flex h-2 w-2 mx-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006FEE]" />
                </span>
              }
            >
              <span className="flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3 h-3 text-[#006FEE]" /> Vista 3D Digital
              </span>
            </Chip>
          </div>

          {/* Widget flotante de Zoom usando ButtonGroup de HeroUI */}
          <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-zinc-200 rounded-2xl p-1.5">
            
            <Tooltip content="Alejar zoom" size="sm" radius="md">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                radius="lg"
                className="text-zinc-600 hover:text-[#006FEE] min-w-7 w-7 h-7"
                onPress={manejarZoomOut}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
            </Tooltip>

            <div className="w-[1px] h-4 bg-zinc-200" />

            {/* 4 Niveles de Zoom con ButtonGroup de HeroUI */}
            <ButtonGroup size="sm" variant="flat" radius="lg" className="bg-zinc-100 p-0.5 border border-zinc-200">
              {PRESETS.map(preset => {
                const esSeleccionado = zoomActivo === preset;
                const info = NIVELES_ZOOM[preset];

                return (
                  <Tooltip key={preset} content={info.descripcion} size="sm" radius="md">
                    <Button
                      size="sm"
                      radius="md"
                      variant={esSeleccionado ? 'solid' : 'light'}
                      color={esSeleccionado ? 'primary' : 'default'}
                      className={`min-w-8 h-7 text-[11px] font-bold ${
                        esSeleccionado ? 'bg-[#006FEE] text-white shadow-none' : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                      onPress={() => seleccionarPresetZoom(preset)}
                    >
                      {preset}
                    </Button>
                  </Tooltip>
                );
              })}
            </ButtonGroup>

            <div className="w-[1px] h-4 bg-zinc-200" />

            <Tooltip content="Acercar zoom" size="sm" radius="md">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                radius="lg"
                className="text-zinc-600 hover:text-[#006FEE] min-w-7 w-7 h-7"
                onPress={manejarZoomIn}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </Tooltip>
          </div>

          {/* Pista de interacción */}
          <div className="absolute bottom-3.5 left-3.5 bg-zinc-900/70 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Scroll o botones para zoom
          </div>

        </div>
      </div>
    </div>
  );
}
