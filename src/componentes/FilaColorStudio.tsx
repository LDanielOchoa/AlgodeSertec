import React from 'react';
import type { RanuraColor } from '../modelos/DefinicionColor';
import { Lock, Unlock, ChevronDown } from 'lucide-react';

interface FilaColorStudioProps {
  ranura: RanuraColor;
  indice: number;
  onAbrirModal: (indice: number) => void;
  onAlternarBloqueo: (indice: number) => void;
  onModificarPorcentaje: (indice: number, nuevoValor: number) => void;
  deshabilitadoBloqueo: boolean;
}

/**
 * Fila de control de color limpia y sin bordes.
 */
export const FilaColorStudio: React.FC<FilaColorStudioProps> = ({
  ranura,
  indice,
  onAbrirModal,
  onAlternarBloqueo,
  onModificarPorcentaje,
  deshabilitadoBloqueo
}) => {
  const tooltipTexto = deshabilitadoBloqueo
    ? 'Bloqueo no disponible en modo 1 color'
    : ranura.bloqueado
    ? 'Desbloquear proporción'
    : 'Bloquear proporción';

  return (
    <div className="bg-zinc-100/70 hover:bg-zinc-100/90 p-3.5 sm:p-4 rounded-2xl transition-colors duration-200 space-y-3">
      {/* Selector de color y candado */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAbrirModal(indice)}
          className="flex-1 flex items-center justify-between bg-white hover:bg-white/90 rounded-xl px-3.5 h-11 transition-all cursor-pointer text-left shadow-xs"
        >
          <div className="flex items-center gap-3 truncate">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-black/5"
              style={{ backgroundColor: ranura.color ? ranura.color.hex : '#006FEE' }}
            />
            <span className="text-xs font-semibold text-zinc-900 truncate">
              {ranura.color ? ranura.color.nombre.split(' - ')[0] : 'Seleccionar'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        {/* Botón de bloqueo */}
        <button
          type="button"
          disabled={deshabilitadoBloqueo}
          onClick={() => onAlternarBloqueo(indice)}
          title={tooltipTexto}
          className={`flex items-center justify-center rounded-xl h-11 w-11 transition-all ${
            deshabilitadoBloqueo
              ? 'opacity-40 bg-zinc-200/60 text-zinc-400 cursor-not-allowed'
              : ranura.bloqueado
              ? 'bg-[#006FEE] text-white shadow-xs cursor-pointer'
              : 'bg-white hover:bg-white/90 text-zinc-600 shadow-xs cursor-pointer'
          }`}
          aria-label={tooltipTexto}
        >
          {ranura.bloqueado ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>
      </div>

      {/* Control deslizante Slider */}
      <div className="flex items-center gap-3 pt-0.5">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={ranura.porcentaje}
          disabled={ranura.bloqueado || deshabilitadoBloqueo}
          onChange={e => onModificarPorcentaje(indice, Number(e.target.value))}
          aria-label={`Porcentaje Color ${indice + 1}`}
          className={`flex-1 ${
            ranura.bloqueado || deshabilitadoBloqueo ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
          }`}
        />

        <span className="inline-flex items-center justify-center bg-white text-zinc-900 font-bold font-mono text-xs px-2.5 py-1 rounded-xl min-w-[52px] shadow-xs">
          {ranura.porcentaje}%
        </span>
      </div>
    </div>
  );
};


