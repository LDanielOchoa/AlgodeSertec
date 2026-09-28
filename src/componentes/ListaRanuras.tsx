import React from 'react';
import { Sliders, CheckCircle, Lock, Unlock, ChevronDown } from 'lucide-react';
import type { RanuraColor } from '../modelos/DefinicionColor';

interface ListaRanurasProps {
  ranuras: RanuraColor[];
  modoActual: number;
  onAbrirModalColor: (indice: number) => void;
  onAlternarBloqueo: (indice: number) => void;
  onModificarPorcentaje: (indice: number, nuevoValor: number) => void;
}

export const ListaRanuras: React.FC<ListaRanurasProps> = ({
  ranuras,
  modoActual,
  onAbrirModalColor,
  onAlternarBloqueo,
  onModificarPorcentaje
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl backdrop-blur-md space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          Proporciones de Virutas EPDM
        </span>
        <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" />
          100%
        </span>
      </div>

      <div className="space-y-2">
        {ranuras.map((ranura, indice) => (
          <div
            key={indice}
            className="bg-slate-850 border border-slate-750 rounded-xl p-2.5 transition-all hover:border-slate-600"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <button
                type="button"
                onClick={() => onAbrirModalColor(indice)}
                className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-left flex-1 transition-all group"
              >
                <span
                  className="w-5 h-5 rounded-md shadow-inner flex-shrink-0 border border-white/20 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: ranura.color ? ranura.color.hex : '#475569' }}
                />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Caucho {indice + 1}
                  </span>
                  <span className="block text-xs font-semibold text-slate-100 truncate">
                    {ranura.color ? ranura.color.nombre : 'Seleccionar...'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
              </button>

              <button
                type="button"
                onClick={() => onAlternarBloqueo(indice)}
                disabled={modoActual === 1}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                  ranura.bloqueado
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-slate-900 border-slate-750 text-slate-500 hover:text-slate-300'
                }`}
                title={ranura.bloqueado ? 'Desbloquear proporción' : 'Bloquear proporción'}
              >
                {ranura.bloqueado ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-medium">Proporción</span>
                <span className="text-indigo-400 font-bold">{ranura.porcentaje}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ranura.porcentaje}
                disabled={ranura.bloqueado || modoActual === 1}
                onChange={e => onModificarPorcentaje(indice, parseInt(e.target.value))}
                className={`w-full ${ranura.bloqueado ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
