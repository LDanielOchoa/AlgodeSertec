import React from 'react';
import type { RanuraColor } from '../modelos/DefinicionColor';
import { Button, Slider, Chip, Tooltip } from '@heroui/react';
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
 * Fila de control de color utilizando componentes oficiales de HeroUI (Button, Slider, Chip, Tooltip).
 * Cumple con SRP.
 */
export const FilaColorStudio: React.FC<FilaColorStudioProps> = ({
  ranura,
  indice,
  onAbrirModal,
  onAlternarBloqueo,
  onModificarPorcentaje,
  deshabilitadoBloqueo
}) => {
  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-colors duration-200 space-y-3">
      {/* Selector de color y candado */}
      <div className="flex items-center gap-2">
        <Button
          variant="flat"
          size="md"
          radius="lg"
          className="flex-1 justify-between bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-3 h-11"
          onPress={() => onAbrirModal(indice)}
        >
          <div className="flex items-center gap-2.5 truncate">
            <span
              className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
              style={{ backgroundColor: ranura.color ? ranura.color.hex : '#006FEE' }}
            />
            <span className="text-xs font-semibold text-zinc-900 truncate">
              {ranura.color ? ranura.color.nombre.split(' - ')[0] : 'Seleccionar'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        </Button>

        {/* Botón de bloqueo con Tooltip de HeroUI */}
        <Tooltip
          content={
            deshabilitadoBloqueo
              ? 'Bloqueo no disponible en modo 1 color'
              : ranura.bloqueado
              ? 'Desbloquear proporción'
              : 'Bloquear proporción'
          }
          color={ranura.bloqueado ? 'primary' : 'default'}
          size="sm"
          radius="md"
        >
          <Button
            isIconOnly
            size="md"
            radius="lg"
            variant={ranura.bloqueado ? 'solid' : 'flat'}
            color={ranura.bloqueado ? 'primary' : 'default'}
            isDisabled={deshabilitadoBloqueo}
            className={`border border-zinc-200 h-11 w-11 ${
              ranura.bloqueado ? 'bg-[#006FEE] text-white border-transparent' : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600'
            }`}
            onPress={() => onAlternarBloqueo(indice)}
          >
            {ranura.bloqueado ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </Button>
        </Tooltip>
      </div>

      {/* Control deslizante Slider de HeroUI */}
      <div className="flex items-center gap-3 pt-0.5">
        <Slider
          size="sm"
          color="primary"
          step={1}
          minValue={0}
          maxValue={100}
          value={ranura.porcentaje}
          isDisabled={ranura.bloqueado || deshabilitadoBloqueo}
          onChange={val => onModificarPorcentaje(indice, Array.isArray(val) ? val[0] : val)}
          aria-label={`Porcentaje Color ${indice + 1}`}
          classNames={{
            base: 'flex-1',
            track: 'bg-zinc-200 border-none h-1.5',
            filler: 'bg-[#006FEE]',
            thumb: 'bg-[#006FEE] border-2 border-white w-4 h-4 shadow-none'
          }}
        />

        <Chip
          size="sm"
          variant="flat"
          radius="md"
          className="bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold font-mono min-w-[50px] justify-center"
        >
          {ranura.porcentaje}%
        </Chip>
      </div>
    </div>
  );
};
