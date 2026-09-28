import React from 'react';
import { Layers } from 'lucide-react';

interface SelectorModoProps {
  modoActual: number;
  onCambiarModo: (modo: number) => void;
}

export const SelectorModo: React.FC<SelectorModoProps> = ({ modoActual, onCambiarModo }) => {
  const modos = [1, 2, 3, 4];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Tonos de Caucho en Mezcla
        </span>
        <span className="text-[10px] text-slate-500 font-mono">1 - 4 colores</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {modos.map(m => {
          const esActivo = modoActual === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onCambiarModo(m)}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                esActivo
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}
            >
              {m} {m === 1 ? 'Tono' : 'Tonos'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
