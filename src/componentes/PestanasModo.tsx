import React from 'react';
import { CATALOGO_COLORES, type ModoVisualizador, type DefinicionColor } from '../modelos/DefinicionColor';
import { GeneradorGranulosProcedurales } from '../servicios/GeneradorGranulosProcedurales';
import { motion } from 'framer-motion';

interface PestanasModoProps {
  modos: ModoVisualizador[];
  modoSeleccionado: number;
  onSeleccionarModo: (idModo: number) => void;
}

const generadorGranulos = new GeneradorGranulosProcedurales();
const cachePrerendersModos = new Map<number, string>();

/**
 * Genera la textura procedural EPDM en tiempo real para las referencias visuales de cada pestaña.
 */
function obtenerPrerenderModo(modoId: number): string {
  if (cachePrerendersModos.has(modoId)) {
    return cachePrerendersModos.get(modoId)!;
  }

  const ancho = 180;
  const alto = 90;
  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  let coloresConfig: { color: DefinicionColor; pct: number }[] = [];
  if (modoId === 1) {
    coloresConfig = [{ color: CATALOGO_COLORES[1], pct: 1.0 }]; // Cobalt Blue
  } else if (modoId === 2) {
    coloresConfig = [
      { color: CATALOGO_COLORES[1], pct: 0.55 }, // Cobalt Blue
      { color: CATALOGO_COLORES[5], pct: 0.45 }  // Ash Gray
    ];
  } else {
    coloresConfig = [
      { color: CATALOGO_COLORES[1], pct: 0.36 }, // Cobalt Blue
      { color: CATALOGO_COLORES[5], pct: 0.32 }, // Ash Gray
      { color: CATALOGO_COLORES[22], pct: 0.32 } // Charcoal Gray
    ];
  }

  const baseColor = coloresConfig[0].color;
  const rFondo = Math.max(0, Math.round(baseColor.r * 0.75));
  const gFondo = Math.max(0, Math.round(baseColor.g * 0.75));
  const bFondo = Math.max(0, Math.round(baseColor.b * 0.75));
  ctx.fillStyle = `rgb(${rFondo}, ${gFondo}, ${bFondo})`;
  ctx.fillRect(0, 0, ancho, alto);

  const spritesPorColor = coloresConfig.map(cfg => ({
    sprites: generadorGranulos.obtenerSprites(cfg.color),
    pct: cfg.pct
  }));

  let seed = modoId * 777 + 104729;
  const rnd = () => {
    seed = (seed * 16807 + 789221) % 2147483647;
    return (seed % 10000) / 10000;
  };

  const pasoX = 11;
  const pasoY = 11;
  for (let y = -8; y < alto + 12; y += pasoY) {
    for (let x = -8; x < ancho + 12; x += pasoX) {
      const offsetX = (rnd() - 0.5) * 9;
      const offsetY = (rnd() - 0.5) * 9;

      const rVal = rnd();
      let acumulado = 0;
      let conjuntoElegido = spritesPorColor[0].sprites;
      for (const item of spritesPorColor) {
        acumulado += item.pct;
        if (rVal <= acumulado) {
          conjuntoElegido = item.sprites;
          break;
        }
      }

      const sprite = conjuntoElegido[Math.floor(rnd() * conjuntoElegido.length)];
      const escala = 0.75 + rnd() * 0.3;
      const rotacion = rnd() * Math.PI * 2;

      ctx.save();
      ctx.translate(x + offsetX, y + offsetY);
      ctx.rotate(rotacion);
      ctx.scale(escala, escala);
      ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
      ctx.restore();
    }
  }

  const gradienteMate = ctx.createLinearGradient(0, 0, 0, alto);
  gradienteMate.addColorStop(0, 'rgba(0, 0, 0, 0.02)');
  gradienteMate.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
  ctx.fillStyle = gradienteMate;
  ctx.fillRect(0, 0, ancho, alto);

  const dataUrl = canvas.toDataURL('image/webp', 0.9);
  cachePrerendersModos.set(modoId, dataUrl);
  return dataUrl;
}

/**
 * Selector de modo con referencia visual de textura EPDM y diseño tipo estudio.
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
        Blend Mode
      </label>
      <div className="grid grid-cols-3 gap-1.5 bg-zinc-100/80 p-1.5 rounded-2xl relative">
        {modos.map(m => {
          const esActivo = modoSeleccionado === m.id;
          const prerenderUrl = obtenerPrerenderModo(m.id);

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSeleccionarModo(m.id)}
              className={`relative flex flex-col items-center p-2 rounded-xl cursor-pointer select-none transition-all duration-200 active:scale-[0.97] group ${
                !esActivo ? 'hover:bg-white/50' : ''
              }`}
            >
              {esActivo && (
                <motion.div
                  layoutId="indicador-modo-activo"
                  className="absolute inset-0 bg-white rounded-xl"
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 32
                  }}
                />
              )}

              {/* Muestra visual de textura de caucho EPDM simplificada */}
              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-zinc-200 mb-1.5 ring-1 ring-black/5 z-10">
                <img
                  src={prerenderUrl}
                  alt={`Sample ${m.subtitulo}`}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    esActivo
                      ? 'scale-100 opacity-100'
                      : 'opacity-75 group-hover:opacity-100 group-hover:scale-105'
                  }`}
                  loading="lazy"
                />
              </div>

              {/* Etiqueta del modo */}
              <div className="relative z-10 text-center flex flex-col items-center">
                <span
                  className={`text-xs font-bold leading-tight transition-colors duration-150 ${
                    esActivo ? 'text-[#006FEE]' : 'text-zinc-700 group-hover:text-zinc-900'
                  }`}
                >
                  {m.id === 1 ? '1 Color' : `${m.id} Colors`}
                </span>
                <span
                  className={`text-[10px] leading-tight transition-colors duration-150 ${
                    esActivo ? 'text-[#006FEE]/75 font-semibold' : 'text-zinc-400 group-hover:text-zinc-500'
                  }`}
                >
                  {m.id === 1 ? 'Solid' : 'Blend'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};



