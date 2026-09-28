import React from 'react';
import { Shapes, Gem, Puzzle, LayoutGrid, Rows3 } from 'lucide-react';
import { PATRONES_DISENO_3D } from '../modelos/DefinicionColor';

interface SelectorPatronesProps {
  patronActual: string;
  onSeleccionarPatron: (idPatron: string) => void;
}

export const SelectorPatrones: React.FC<SelectorPatronesProps> = ({
  patronActual,
  onSeleccionarPatron
}) => {
  const renderIcono = (nombreIcono: string) => {
    switch (nombreIcono) {
      case 'Gem': return <Gem className="w-3.5 h-3.5" />;
      case 'Puzzle': return <Puzzle className="w-3.5 h-3.5" />;
      case 'Grid': return <LayoutGrid className="w-3.5 h-3.5" />;
      case 'Rows': return <Rows3 className="w-3.5 h-3.5" />;
      default: return <Shapes className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Shapes className="w-3.5 h-3.5 text-indigo-400" />
          Diseños de Pavimento EPDM
        </span>
        <span className="text-[10px] text-indigo-400 font-semibold">Grano Fino</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {PATRONES_DISENO_3D.map(patron => {
          const esActivo = patronActual === patron.id;
          return (
            <button
              key={patron.id}
              type="button"
              onClick={() => onSeleccionarPatron(patron.id)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl border text-left transition-all ${
                esActivo
                  ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg ${
                  esActivo ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400'
                } flex items-center justify-center flex-shrink-0 text-xs shadow-inner`}
              >
                {renderIcono(patron.icono)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold leading-tight truncate">{patron.nombre}</h4>
                <span className="text-[10px] text-slate-400 block truncate">{patron.descripcion}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
