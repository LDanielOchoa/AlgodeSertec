import React from 'react';
import type { ModoVisualizador } from '../modelos/DefinicionColor';
import { Check } from 'lucide-react';

interface TarjetaModoProps {
  modo: ModoVisualizador;
  esSeleccionado: boolean;
  onSeleccionar: () => void;
}

/**
 * Tarjeta de selección de modo estilo HeroUI (grises y azules).
 * Cumple con SRP.
 */
export const TarjetaModo: React.FC<TarjetaModoProps> = ({
  modo,
  esSeleccionado,
  onSeleccionar
}) => {
  return (
    <div className="flex flex-col items-center text-center group">
      {/* Muestra visual de modo */}
      <div
        onClick={onSeleccionar}
        style={{ background: modo.imagenMuestra }}
        className={`w-full aspect-square rounded-2xl relative overflow-hidden cursor-pointer mb-3.5 transition-all duration-300 ease-out border-2 ${
          esSeleccionado
            ? 'border-[#006FEE] shadow-lg shadow-[#006FEE]/15 scale-[1.03] ring-4 ring-[#006FEE]/10'
            : 'border-zinc-200/80 shadow-xs hover:shadow-md hover:border-zinc-300 hover:-translate-y-1 opacity-90 hover:opacity-100'
        }`}
      >
        {/* Insignia inferior */}
        <div className="absolute inset-x-0 bottom-3.5 flex justify-center pointer-events-none px-3">
          <span
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full transition-all duration-300 ${
              esSeleccionado
                ? 'bg-white text-zinc-900 shadow-md scale-105'
                : 'bg-white/90 backdrop-blur-xs text-zinc-700 shadow-xs'
            }`}
          >
            {esSeleccionado && <Check className="w-3.5 h-3.5 text-[#006FEE]" />}
            {modo.titulo}
          </span>
        </div>
      </div>

      {/* Botón estilo HeroUI */}
      <button
        type="button"
        onClick={onSeleccionar}
        className={`w-4/5 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer active:scale-95 ${
          esSeleccionado
            ? 'bg-[#006FEE] text-white hover:bg-[#005BC4] shadow-md shadow-blue-500/25 -translate-y-0.5'
            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900'
        }`}
      >
        {esSeleccionado ? 'Seleccionado' : 'Seleccionar'}
      </button>
    </div>
  );
};
