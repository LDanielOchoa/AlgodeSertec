import React from 'react';
import type { RanuraColor } from '../modelos/DefinicionColor';
import { Chip } from '@heroui/react';

interface BarraBalanceMezclaProps {
  ranuras: RanuraColor[];
}

/**
 * Barra de balance visual que utiliza componentes Chip de HeroUI.
 * Cumple con SRP.
 */
export const BarraBalanceMezcla: React.FC<BarraBalanceMezclaProps> = ({ ranuras }) => {
  const ranurasActivas = ranuras.filter(r => r.color !== null && r.porcentaje > 0);

  return (
    <div className="space-y-2.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
        <span>Balance de Mezcla</span>
        <span className="text-[11px] font-mono text-zinc-400">Total: 100%</span>
      </div>

      {/* Barra segmentada de colores plana */}
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-zinc-200 p-0.5 gap-0.5">
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

      {/* Etiquetas usando Chips de HeroUI */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {ranurasActivas.map((r, i) => (
          <Chip
            key={i}
            size="sm"
            variant="flat"
            radius="md"
            className="bg-white border border-zinc-200/90 text-zinc-800 text-[11px]"
            startContent={
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/10 mx-0.5"
                style={{ backgroundColor: r.color?.hex }}
              />
            }
          >
            <span className="font-medium mr-1">{r.color?.nombre.split(' - ')[0]}</span>
            <span className="font-bold font-mono text-[#006FEE]">{r.porcentaje}%</span>
          </Chip>
        ))}
      </div>
    </div>
  );
};
