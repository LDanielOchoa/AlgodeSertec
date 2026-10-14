import React, { useState, useMemo, useEffect } from 'react';
import { CATALOGO_COLORES, type DefinicionColor, type RanuraColor } from '../modelos/DefinicionColor';
import { GeneradorGranulosProcedurales } from '../servicios/GeneradorGranulosProcedurales';
import { Search, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';


interface ModalCatalogoColoresProps {
  indiceSeleccionando: number | null;
  ranuras: RanuraColor[];
  onSeleccionarColor: (color: DefinicionColor) => void;
  onCerrar: () => void;
}

const CATEGORIAS = ['All', 'Neutrals', 'Blues', 'Greens', 'Earth', 'Warm'] as const;

// Singleton para generación y caché de prerenders de textura EPDM
const generadorGranulos = new GeneradorGranulosProcedurales();
const cachePrerenders = new Map<string, string>();

function obtenerPrerenderColor(color: DefinicionColor): string {
  if (cachePrerenders.has(color.id)) {
    return cachePrerenders.get(color.id)!;
  }

  const ancho = 260;
  const alto = 150;
  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Fondo base con tono vulcanizado
  const rFondo = Math.max(0, Math.round(color.r * 0.75));
  const gFondo = Math.max(0, Math.round(color.g * 0.75));
  const bFondo = Math.max(0, Math.round(color.b * 0.75));
  ctx.fillStyle = `rgb(${rFondo}, ${gFondo}, ${bFondo})`;
  ctx.fillRect(0, 0, ancho, alto);

  const sprites = generadorGranulos.obtenerSprites(color);

  // Semilla determinista para cada color
  let seed = color.r * 37 + color.g * 19 + color.b * 11 + 104729;
  const rnd = () => {
    seed = (seed * 16807 + 789221) % 2147483647;
    return (seed % 10000) / 10000;
  };

  // Dispersión homogénea densa de gránulos de caucho
  const pasoX = 13;
  const pasoY = 13;
  for (let y = -10; y < alto + 15; y += pasoY) {
    for (let x = -10; x < ancho + 15; x += pasoX) {
      const offsetX = (rnd() - 0.5) * 11;
      const offsetY = (rnd() - 0.5) * 11;
      const sprite = sprites[Math.floor(rnd() * sprites.length)];
      const escala = 0.85 + rnd() * 0.35;
      const rotacion = rnd() * Math.PI * 2;

      ctx.save();
      ctx.translate(x + offsetX, y + offsetY);
      ctx.rotate(rotacion);
      ctx.scale(escala, escala);
      ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
      ctx.restore();
    }
  }

  // Acabado mate uniforme sin brillos reflectantes
  const gradienteMate = ctx.createLinearGradient(0, 0, 0, alto);
  gradienteMate.addColorStop(0, 'rgba(0, 0, 0, 0.02)');
  gradienteMate.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
  ctx.fillStyle = gradienteMate;
  ctx.fillRect(0, 0, ancho, alto);

  const dataUrl = canvas.toDataURL('image/webp', 0.92);
  cachePrerenders.set(color.id, dataUrl);
  return dataUrl;
}

/**
 * Modal tipo galería visual con prerenders de textura EPDM en tiempo real.
 * Diseño amplio, moderno y sin bordes rígidos.
 */
export const ModalCatalogoColores: React.FC<ModalCatalogoColoresProps> = ({
  indiceSeleccionando,
  ranuras,
  onSeleccionarColor,
  onCerrar
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('All');

  const isOpen = indiceSeleccionando !== null;

  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCerrar]);

  const idsSeleccionados = useMemo(() => {
    return ranuras
      .map((r, i) => (i !== indiceSeleccionando ? r.color?.id : null))
      .filter(Boolean);
  }, [ranuras, indiceSeleccionando]);

  const coloresFiltrados = useMemo(() => {
    return CATALOGO_COLORES.filter(color => {
      const coincideBusqueda =
        color.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        color.hex.toLowerCase().includes(busqueda.toLowerCase()) ||
        color.categoria.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria =
        categoriaSeleccionada === 'All' || color.categoria === categoriaSeleccionada;
      return coincideBusqueda && coincideCategoria;
    });
  }, [busqueda, categoriaSeleccionada]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 animate-in fade-in duration-200"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-catalogo-titulo"
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden flex flex-col h-[85vh] max-h-[780px] min-h-[500px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-white">
          <div>
            <h2 id="modal-catalogo-titulo" className="text-base font-bold text-zinc-900 leading-tight">
              Color Catalog
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Select a color for your blend
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Close catalog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros y Buscador */}
        <div className="px-6 pb-3 space-y-3 bg-white">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Campo de Búsqueda */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by color or tone..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-xs bg-zinc-100 rounded-xl outline-none focus:bg-zinc-100 focus:ring-2 focus:ring-[#006FEE]/20 transition-all text-zinc-900 placeholder:text-zinc-400"
                autoFocus
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selector de Categorías */}
            <div className="overflow-x-auto no-scrollbar pb-0.5">
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-2xl w-max">
                {CATEGORIAS.map(cat => {
                  const esActivo = categoriaSeleccionada === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoriaSeleccionada(cat)}
                      className="relative px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer select-none"
                    >
                      {esActivo && (
                        <motion.div
                          layoutId="categoria-modal-activa"
                          className="absolute inset-0 bg-[#006FEE] rounded-xl"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className={`relative z-10 ${esActivo ? 'text-white' : 'text-zinc-600 hover:text-zinc-900'}`}>
                        {cat}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Galería de Tarjetas */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {coloresFiltrados.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 space-y-2">
              <p className="text-sm font-medium">No colors found matching "{busqueda}"</p>
              <p className="text-xs text-zinc-400">Try searching for a different term or select another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {coloresFiltrados.map(color => {
                const yaSeleccionado = idsSeleccionados.includes(color.id);
                const prerenderUrl = obtenerPrerenderColor(color);

                return (
                  <button
                    key={color.id}
                    type="button"
                    disabled={yaSeleccionado}
                    onClick={() => {
                      if (!yaSeleccionado) onSeleccionarColor(color);
                    }}
                    className={`group relative flex flex-col bg-zinc-100/70 hover:bg-zinc-100 p-2.5 rounded-2xl transition-all duration-200 text-left select-none ${yaSeleccionado
                        ? 'opacity-40 cursor-not-allowed'
                        : 'cursor-pointer active:scale-[0.98]'
                      }`}
                  >
                    {/* Caja de textura EPDM */}
                    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-zinc-200">
                      <img
                        src={prerenderUrl}
                        alt={`Granule sample ${color.nombre}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Indicador de color ya en uso en otra posición */}
                      {yaSeleccionado && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="inline-flex items-center gap-1.5 bg-white text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-full">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> In use
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Información del Color: muestra de tono, nombre y categoría */}
                    <div className="pt-2.5 pb-0.5 px-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        <h3 className="text-xs font-bold text-zinc-900 truncate group-hover:text-[#006FEE] transition-colors">
                          {color.nombre}
                        </h3>
                      </div>

                      <span className="shrink-0 text-[10px] font-medium text-zinc-400">
                        {color.categoria}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
