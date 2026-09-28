import React from 'react';
import type { RanuraColor } from '../modelos/DefinicionColor';
import { Lock, Unlock, ChevronDown } from 'lucide-react';

interface SelectorColorColumnaProps {
  ranura: RanuraColor;
  indice: number;
  onAbrirModal: (indice: number) => void;
  onAlternarBloqueo: (indice: number) => void;
  onModificarPorcentaje: (indice: number, nuevoValor: number) => void;
  deshabilitadoBloqueo: boolean;
}

/**
 * Columna de selección interactiva de color estilo HeroUI con tonos grises y azules.
 * Cumple con SRP.
 */
export const SelectorColorColumna: React.FC<SelectorColorColumnaProps> = ({
  ranura,
  indice,
  onAbrirModal,
  onAlternarBloqueo,
  onModificarPorcentaje,
  deshabilitadoBloqueo
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md hover:border-zinc-300 transition-all duration-300 space-y-4 w-full group">
      {/* Botón selector de color estilo HeroUI Select */}
      <button
        type="button"
        onClick={() => onAbrirModal(indice)}
        className="w-full p-3 border border-zinc-200 rounded-xl bg-zinc-50/60 hover:bg-white text-left flex items-center justify-between hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#006FEE]/20 transition-all duration-200 shadow-2xs cursor-pointer"
      >
        <div className="flex items-center gap-3 truncate">
          <span
            className="w-5 h-5 rounded-full border border-black/10 flex-shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-110"
            style={{ backgroundColor: ranura.color ? ranura.color.hex : '#006FEE' }}
          />
          <div className="truncate">
            <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Color {indice + 1}
            </span>
            <span className="block text-xs sm:text-sm font-semibold text-zinc-900 truncate">
              {ranura.color ? ranura.color.nombre.split(' - ')[0] : 'Seleccionar Color'}
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-transform duration-200" />
      </button>

      {/* Control de porcentaje y candado */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-600">Proporción</span>
          
          <button
            type="button"
            onClick={() => onAlternarBloqueo(indice)}
            disabled={deshabilitadoBloqueo}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              deshabilitadoBloqueo
                ? 'opacity-40 cursor-not-allowed bg-zinc-100 text-zinc-400'
                : ranura.bloqueado
                ? 'bg-[#006FEE] text-white shadow-xs scale-105 shadow-blue-500/20'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 active:scale-95'
            }`}
            title={ranura.bloqueado ? 'Desbloquear proporción' : 'Bloquear proporción'}
          >
            {ranura.bloqueado ? (
              <>
                <Lock className="w-3 h-3" /> Bloqueado
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 text-zinc-400" /> Bloquear
              </>
            )}
          </button>
        </div>

        {/* Deslizador con indicador numérico */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={ranura.porcentaje}
            disabled={ranura.bloqueado || deshabilitadoBloqueo}
            onChange={e => onModificarPorcentaje(indice, parseInt(e.target.value))}
            className={`flex-1 ${
              ranura.bloqueado || deshabilitadoBloqueo
                ? 'opacity-40 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          />
          <span className="inline-flex items-center justify-center text-xs font-bold text-zinc-900 bg-zinc-100/80 border border-zinc-200 rounded-lg px-2.5 py-1 min-w-[52px] shadow-2xs">
            {ranura.porcentaje}%
          </span>
        </div>
      </div>
    </div>
  );
};
