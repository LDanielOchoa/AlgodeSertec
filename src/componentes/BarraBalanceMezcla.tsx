import React from 'react';
import type { RanuraColor } from '../modelos/DefinicionColor';

interface BarraBalanceMezclaProps {
  ranuras: RanuraColor[];
}

/**
 * Barra de balance visual con desglose proporcional de cada color.
 * Cumple con SRP.
 */
export const BarraBalanceMezcla: React.FC<BarraBalanceMezclaProps> = ({ ranuras }) => {
  const ranurasActivas = ranuras.filter(r => r.color !== null && r.porcentaje > 0);

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-zinc-100/70">
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
        <span>Balance de Mezcla</span>
        <span className="text-[11px] font-mono text-zinc-400">Total: 100%</span>
      </div>

      {/* Barra segmentada de colores con bordes suaves */}
      <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-zinc-200/80 p-0.5 gap-1">
        {ranurasActivas.map((r, i) => (
          <div
            key={i}
            style={{
              width: `${r.porcentaje}%`,
              backgroundColor: r.color?.hex || '#006FEE'
            }}
            className="h-full rounded-full transition-all duration-300 relative"
            title={`${r.color?.nombre}: ${r.porcentaje}%`}
          />
        ))}
      </div>

      {/* Etiquetas de desglose limpias sin bordes */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {ranurasActivas.map((r, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-1.5 bg-white text-zinc-800 text-[11px] px-2.5 py-1 rounded-xl shadow-xs"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/5"
              style={{ backgroundColor: r.color?.hex }}
            />
            <span className="font-medium">{r.color?.nombre.split(' - ')[0]}</span>
            <span className="font-bold font-mono text-[#006FEE]">{r.porcentaje}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};


