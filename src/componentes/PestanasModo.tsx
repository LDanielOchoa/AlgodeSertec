import React from 'react';
import type { ModoVisualizador } from '../modelos/DefinicionColor';
import { motion } from 'framer-motion';

interface PestanasModoProps {
  modos: ModoVisualizador[];
  modoSeleccionado: number;
  onSeleccionarModo: (idModo: number) => void;
}

/**
 * Selector de modo con indicador animado suave (spring layout animation).
 * Cumple con SRP.
 */
export const PestanasModo: React.FC<PestanasModoProps> = ({
  modos,
  modoSeleccionado,
  onSeleccionarModo
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-zinc-600">
        Modo de Mezcla
      </label>
      <div className="grid grid-cols-3 gap-1 bg-zinc-100/80 p-1 rounded-2xl relative">
        {modos.map(m => {
          const esActivo = modoSeleccionado === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSeleccionarModo(m.id)}
              className="relative flex flex-col items-center justify-center py-2 px-1 rounded-xl cursor-pointer select-none transition-colors"
            >
              {esActivo && (
                <motion.div
                  layoutId="indicador-modo-activo"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs"
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 35
                  }}
                />
              )}
              <span
                className={`relative z-10 text-xs leading-tight transition-colors duration-150 ${
                  esActivo ? 'font-bold text-[#006FEE]' : 'font-medium text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {m.subtitulo}
              </span>
              <span
                className={`relative z-10 text-[10px] leading-tight transition-colors duration-150 ${
                  esActivo ? 'text-[#006FEE]/75 font-medium' : 'text-zinc-400'
                }`}
              >
                {m.id === 1 ? 'Sólido' : `${m.id} Colores`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};



