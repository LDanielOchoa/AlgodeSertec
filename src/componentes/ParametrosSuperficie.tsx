import React from 'react';
import { Mountain } from 'lucide-react';

interface ParametrosSuperficieProps {
  escalaRelieve: number;
  tamanoGranulo: number;
  nombreProyecto: string;
  onCambiarRelieve: (valor: number) => void;
  onCambiarTamanoGranulo: (tamano: number) => void;
  onCambiarNombreProyecto: (nombre: string) => void;
}

export const ParametrosSuperficie: React.FC<ParametrosSuperficieProps> = ({
  escalaRelieve,
  tamanoGranulo,
  nombreProyecto,
  onCambiarRelieve,
  onCambiarTamanoGranulo,
  onCambiarNombreProyecto
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl backdrop-blur-md">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
        <Mountain className="w-3.5 h-3.5 text-indigo-400" />
        Parámetros de Superficie
      </span>

      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-400">Relieve y Aspereza 3D</span>
            <span className="text-indigo-400 font-mono font-semibold">
              {Math.round(escalaRelieve * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.4"
            step="0.01"
            value={escalaRelieve}
            onChange={e => onCambiarRelieve(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-400">Tamaño de Gránulo EPDM (1-3.5mm)</span>
            <span className="text-slate-200 font-mono font-semibold">{tamanoGranulo}px</span>
          </div>
          <input
            type="range"
            min="7"
            max="20"
            value={tamanoGranulo}
            onChange={e => onCambiarTamanoGranulo(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <input
            type="text"
            value={nombreProyecto}
            onChange={e => onCambiarNombreProyecto(e.target.value)}
            placeholder="Nombre del Proyecto..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
