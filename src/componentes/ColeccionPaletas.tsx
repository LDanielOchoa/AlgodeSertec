import React from 'react';
import { Wand2 } from 'lucide-react';
import { PALETAS_PREDEFINIDAS, CATALOGO_COLORES, type PaletaPredefinida } from '../modelos/DefinicionColor';

interface ColeccionPaletasProps {
  onAplicarPaleta: (paleta: PaletaPredefinida) => void;
}

export const ColeccionPaletas: React.FC<ColeccionPaletasProps> = ({ onAplicarPaleta }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
          Colección de Paletas EPDM
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PALETAS_PREDEFINIDAS.map(paleta => (
          <div
            key={paleta.nombre}
            onClick={() => onAplicarPaleta(paleta)}
            className="group bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-indigo-500/80 rounded-xl p-2.5 transition-all cursor-pointer hover:shadow-lg"
          >
            <div className="h-8 w-full rounded-md overflow-hidden flex shadow-inner mb-2 border border-white/10 group-hover:scale-[1.02] transition-transform">
              {paleta.mezcla.map((m, idx) => {
                const color = CATALOGO_COLORES.find(c => c.id === m.idColor);
                return (
                  <div
                    key={idx}
                    className="h-full"
                    style={{
                      width: `${m.porcentaje}%`,
                      backgroundColor: color ? color.hex : '#333'
                    }}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 truncate">
                {paleta.nombre}
              </h4>
              <span className="text-[9px] font-semibold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-750">
                {paleta.modo}C
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
