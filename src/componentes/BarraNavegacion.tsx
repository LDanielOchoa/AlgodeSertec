import React from 'react';
import { Shapes, Copy, Check, Camera } from 'lucide-react';

interface BarraNavegacionProps {
  copiadoExito: boolean;
  onCopiarFormula: () => void;
  onExportarFicha: () => void;
}

export const BarraNavegacion: React.FC<BarraNavegacionProps> = ({
  copiadoExito,
  onCopiarFormula,
  onExportarFicha
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Shapes className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              Estudio 3D de Pavimentos de Caucho EPDM
              <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                React 3D
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopiarFormula}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all active:scale-95"
          >
            {copiadoExito ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Copiar Fórmula</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onExportarFicha}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Capturar Ficha</span>
          </button>
        </div>
      </div>
    </header>
  );
};
