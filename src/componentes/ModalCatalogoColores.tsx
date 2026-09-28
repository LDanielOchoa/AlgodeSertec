import React, { useState, useMemo } from 'react';
import { CATALOGO_COLORES, type DefinicionColor, type RanuraColor } from '../modelos/DefinicionColor';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Chip,
  Button,
  Tabs,
  Tab
} from '@heroui/react';
import { Search } from 'lucide-react';

interface ModalCatalogoColoresProps {
  indiceSeleccionando: number | null;
  ranuras: RanuraColor[];
  onSeleccionarColor: (color: DefinicionColor) => void;
  onCerrar: () => void;
}

const CATEGORIAS = ['Todos', 'Neutrales', 'Azules', 'Verdes', 'Tierra', 'Cálidos'] as const;

/**
 * Modal de selección de colores implementado con los componentes oficiales de HeroUI (Modal, Input, Tabs, Chip, Button).
 * Cumple con SRP.
 */
export const ModalCatalogoColores: React.FC<ModalCatalogoColoresProps> = ({
  indiceSeleccionando,
  ranuras,
  onSeleccionarColor,
  onCerrar
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todos');

  const idsSeleccionados = useMemo(() => {
    return ranuras
      .map((r, i) => (i !== indiceSeleccionando ? r.color?.id : null))
      .filter(Boolean);
  }, [ranuras, indiceSeleccionando]);

  const coloresFiltrados = useMemo(() => {
    return CATALOGO_COLORES.filter(color => {
      const coincideBusqueda =
        color.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        color.hex.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria =
        categoriaSeleccionada === 'Todos' || color.categoria === categoriaSeleccionada;
      return coincideBusqueda && coincideCategoria;
    });
  }, [busqueda, categoriaSeleccionada]);

  const isOpen = indiceSeleccionando !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCerrar}
      size="md"
      radius="2xl"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: 'border border-zinc-200 bg-white',
        header: 'border-b border-zinc-100 bg-zinc-50/60 pb-3',
        body: 'p-4 space-y-3',
        closeButton: 'hover:bg-zinc-200/60 text-zinc-500'
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-zinc-900">Catálogo de Colores EPDM</span>
              <span className="text-[11px] font-normal text-zinc-500">
                Selecciona el color para la posición {indiceSeleccionando !== null ? indiceSeleccionando + 1 : ''}
              </span>
            </ModalHeader>

            <ModalBody>
              {/* Buscador con Input de HeroUI */}
              <Input
                size="sm"
                radius="lg"
                variant="bordered"
                isClearable
                placeholder="Buscar por nombre o código..."
                value={busqueda}
                onValueChange={setBusqueda}
                startContent={<Search className="w-4 h-4 text-zinc-400" />}
                classNames={{
                  inputWrapper: 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 focus-within:!border-[#006FEE]'
                }}
              />

              {/* Categorías con Tabs de HeroUI */}
              <div className="overflow-x-auto no-scrollbar pb-1">
                <Tabs
                  size="sm"
                  radius="lg"
                  variant="solid"
                  color="primary"
                  selectedKey={categoriaSeleccionada}
                  onSelectionChange={key => setCategoriaSeleccionada(String(key))}
                  classNames={{
                    tabList: 'bg-zinc-100 p-1 border border-zinc-200 gap-1',
                    cursor: 'bg-[#006FEE] shadow-none text-white',
                    tab: 'text-zinc-600 font-semibold h-7 text-[11px] data-[selected=true]:text-white'
                  }}
                >
                  {CATEGORIAS.map(cat => (
                    <Tab key={cat} title={cat} />
                  ))}
                </Tabs>
              </div>

              {/* Lista de Colores con Buttons y Chips de HeroUI */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {coloresFiltrados.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-400">
                    No se encontraron colores coincidentes.
                  </div>
                ) : (
                  coloresFiltrados.map(color => {
                    const yaSeleccionado = idsSeleccionados.includes(color.id);

                    return (
                      <Button
                        key={color.id}
                        fullWidth
                        variant="light"
                        radius="xl"
                        isDisabled={yaSeleccionado}
                        className={`justify-between h-12 px-3 hover:bg-zinc-50 ${
                          yaSeleccionado ? 'opacity-40 bg-zinc-50/50' : ''
                        }`}
                        onPress={() => onSeleccionarColor(color)}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="text-left truncate">
                            <span className="block text-xs font-semibold text-zinc-900 truncate">
                              {color.nombre}
                            </span>
                            <span className="block text-[10px] text-zinc-400 font-mono">
                              {color.categoria} • {color.hex}
                            </span>
                          </div>
                        </div>

                        {yaSeleccionado ? (
                          <Chip size="sm" variant="flat" radius="md" className="bg-zinc-100 text-zinc-500 text-[10px]">
                            En uso
                          </Chip>
                        ) : (
                          <span className="text-[#006FEE] text-xs font-bold">
                            Elegir →
                          </span>
                        )}
                      </Button>
                    );
                  })
                )}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
