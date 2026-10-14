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
 * Fila de control de color limpia, compacta y sin bordes.
 * Permite seleccionar el pigmento EPDM y ajustar su proporción con respuesta visual inmediata.
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
    ? 'Lock not available in 1-color mode'
    : ranura.bloqueado
    ? 'Unlock ratio'
    : 'Lock ratio';

  const colorHex = ranura.color ? ranura.color.hex : '#006FEE';
  const nombreColor = ranura.color ? ranura.color.nombre.split(' - ')[0] : 'Select';

  return (
    <div className="bg-zinc-100/70 hover:bg-zinc-100/90 p-3 sm:p-3.5 rounded-2xl transition-all duration-200 space-y-2.5">
      {/* Cabecera de la fila: Selector de color a la izquierda, candado y porcentaje a la derecha */}
      <div className="flex items-center justify-between gap-2">
        {/* Botón para cambiar color */}
        <button
          type="button"
          onClick={() => onAbrirModal(indice)}
          className="flex items-center gap-2.5 px-2 py-1 -ml-1 rounded-xl hover:bg-white/80 active:scale-[0.98] transition-all cursor-pointer group text-left max-w-[65%]"
          title="Change pigment color"
        >
          <span
            className="w-5 h-5 rounded-full flex-shrink-0 ring-2 ring-white"
            style={{ backgroundColor: colorHex }}
          />
          <span className="text-xs font-bold text-zinc-900 group-hover:text-[#006FEE] transition-colors truncate">
            {nombreColor}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#006FEE] transition-colors shrink-0" />
        </button>

        {/* Acciones a la derecha: Candado y Porcentaje */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botón de bloqueo */}
          <button
            type="button"
            disabled={deshabilitadoBloqueo}
            onClick={() => onAlternarBloqueo(indice)}
            title={tooltipTexto}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
              deshabilitadoBloqueo
                ? 'opacity-30 text-zinc-400 cursor-not-allowed'
                : ranura.bloqueado
                ? 'bg-[#006FEE] text-white cursor-pointer active:scale-95'
                : 'text-zinc-400 hover:text-zinc-700 hover:bg-white/80 cursor-pointer active:scale-95'
            }`}
            aria-label={tooltipTexto}
          >
            {ranura.bloqueado ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          {/* Badge de porcentaje */}
          <span className="inline-flex items-center justify-center bg-white text-zinc-900 font-bold font-mono text-xs px-2.5 py-1 rounded-xl min-w-[50px]">
            {ranura.porcentaje}%
          </span>
        </div>
      </div>

      {/* Control deslizante Slider con pista teñida con el color del pigmento */}
      <div className="flex items-center px-1">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={ranura.porcentaje}
          disabled={ranura.bloqueado || deshabilitadoBloqueo}
          onChange={e => onModificarPorcentaje(indice, Number(e.target.value))}
          aria-label={`Color ${indice + 1} percentage`}
          style={{
            background: `linear-gradient(to right, ${colorHex} 0%, ${colorHex} ${ranura.porcentaje}%, #E4E4E7 ${ranura.porcentaje}%, #E4E4E7 100%)`
          }}
          className={`w-full ${
            ranura.bloqueado || deshabilitadoBloqueo ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
          }`}
        />
      </div>
    </div>
  );
};


