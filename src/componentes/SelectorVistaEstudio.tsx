import type { ModoVisualizacionEstudio } from '../modelos/DefinicionEscenaParque';
import { Box, Trees } from 'lucide-react';

interface PropiedadesSelectorVistaEstudio {
  modoActivo: ModoVisualizacionEstudio;
  onCambiarModo: (modo: ModoVisualizacionEstudio) => void;
}

/**
 * Selector de vistas del estudio de renderizado (Muestra 3D vs Simulación en Parque Real).
 * Cumple con SRP.
 */
export function SelectorVistaEstudio({
  modoActivo,
  onCambiarModo
}: PropiedadesSelectorVistaEstudio) {
  const opciones: Array<{ id: ModoVisualizacionEstudio; etiqueta: string; icono: typeof Box }> = [
    { id: 'muestra_3d', etiqueta: 'Muestra 3D (Cenital)', icono: Box },
    { id: 'parque_real', etiqueta: 'Simulación Parque Real', icono: Trees }
  ];

  return (
    <div className="flex items-center gap-1.5 bg-zinc-100/90 p-1 rounded-2xl w-fit">
      {opciones.map(opcion => {
        const Icono = opcion.icono;
        const esActivo = modoActivo === opcion.id;

        return (
          <button
            key={opcion.id}
            type="button"
            onClick={() => onCambiarModo(opcion.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              esActivo
                ? 'bg-white text-[#006FEE] shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
            }`}
          >
            <Icono className={`w-3.5 h-3.5 ${esActivo ? 'text-[#006FEE]' : 'text-zinc-500'}`} />
            <span>{opcion.etiqueta}</span>
          </button>
        );
      })}
    </div>
  );
}
