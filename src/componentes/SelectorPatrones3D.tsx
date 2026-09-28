import { PATRONES_DISENO_3D, type PatronDiseno3D } from '../modelos/DefinicionColor';
import { Shapes, Sparkles, Spline, Grid3x3, Rows3 } from 'lucide-react';

interface PropiedadesSelectorPatrones3D {
  patronSeleccionado: string;
  onSeleccionarPatron: (idPatron: string) => void;
}

const MAPA_ICONOS: Record<string, typeof Shapes> = {
  Shapes: Shapes,
  Sparkles: Sparkles,
  Spline: Spline,
  Grid3x3: Grid3x3,
  Rows: Rows3
};

/**
 * Selector de patrones y diseños geométricos 3D para la superficie de caucho EPDM.
 * Cumple con SRP.
 */
export function SelectorPatrones3D({
  patronSeleccionado,
  onSeleccionarPatron
}: PropiedadesSelectorPatrones3D) {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-800">
          3D Surface Design Patterns
        </h3>
        <p className="text-xs text-gray-500">
          Select a 3D architectural pattern to apply to the rubber mix surface.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
        {PATRONES_DISENO_3D.map((patron: PatronDiseno3D) => {
          const esActivo = patronSeleccionado === patron.id;
          const Icono = MAPA_ICONOS[patron.icono] || Shapes;

          return (
            <button
              key={patron.id}
              type="button"
              onClick={() => onSeleccionarPatron(patron.id)}
              className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                esActivo
                  ? 'bg-amber-50/60 border-[#842B27] shadow-sm ring-1 ring-[#842B27]/30 scale-[1.02]'
                  : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 shadow-xs'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                  esActivo ? 'bg-[#842B27] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icono className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-800 leading-tight truncate w-full">
                {patron.nombre}
              </span>
              <span className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                {patron.descripcion}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
