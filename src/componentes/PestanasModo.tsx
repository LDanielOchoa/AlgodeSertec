import React from 'react';
import type { ModoVisualizador } from '../modelos/DefinicionColor';
import { Tabs, Tab } from '@heroui/react';

interface PestanasModoProps {
  modos: ModoVisualizador[];
  modoSeleccionado: number;
  onSeleccionarModo: (idModo: number) => void;
}

/**
 * Selector de modo utilizando el componente oficial Tabs de HeroUI.
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
      <Tabs
        fullWidth
        size="md"
        radius="lg"
        color="primary"
        variant="bordered"
        selectedKey={String(modoSeleccionado)}
        onSelectionChange={key => onSeleccionarModo(Number(key))}
        classNames={{
          tabList: 'bg-zinc-100/90 border border-zinc-200 p-1',
          cursor: 'bg-white shadow-none border border-zinc-200/80',
          tab: 'h-10 text-zinc-600 font-semibold data-[selected=true]:text-[#006FEE]'
        }}
      >
        {modos.map(m => (
          <Tab
            key={String(m.id)}
            title={
              <div className="flex flex-col items-center leading-none gap-0.5">
                <span className="text-xs font-bold">{m.subtitulo}</span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {m.id === 1 ? 'Sólido' : `${m.id} Colores`}
                </span>
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  );
};
