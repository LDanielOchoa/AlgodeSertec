import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CATALOGO_COLORES,
  MODOS_DISPONIBLES,
  type RanuraColor,
  type DefinicionColor
} from './modelos/DefinicionColor';
import { CalculadorProporciones } from './servicios/CalculadorProporciones';
import { GeneradorGranulosProcedurales } from './servicios/GeneradorGranulosProcedurales';
import { GeneradorTexturaPBR } from './servicios/GeneradorTexturaPBR';
import { MotorEscena3D } from './servicios/MotorEscena3D';
import { ServicioExportacion } from './servicios/ServicioExportacion';
import { PestanasModo } from './componentes/PestanasModo';
import { FilaColorStudio } from './componentes/FilaColorStudio';
import { BarraBalanceMezcla } from './componentes/BarraBalanceMezcla';
import { VisorEscena3D } from './componentes/VisorEscena3D';
import { VisorVistaReal } from './componentes/VisorVistaReal';
import { ModalCatalogoColores } from './componentes/ModalCatalogoColores';
import { Box, Dices, Download, Image as ImageIcon, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';



/**
 * Aplicación principal Color Blend Studio 3D.
 * Estructura "Studio Workspace" sin sombras pesadas, modularizada bajo principios SOLID.
 */
export function App() {
  const calculador = useMemo(() => new CalculadorProporciones(), []);
  const generadorSprites = useMemo(() => new GeneradorGranulosProcedurales(), []);
  const generadorPBR = useMemo(() => new GeneradorTexturaPBR(generadorSprites), [generadorSprites]);
  const motor3D = useMemo(() => new MotorEscena3D(generadorPBR), [generadorPBR]);
  const exportador = useMemo(() => new ServicioExportacion(), []);

  const [vistaActiva, setVistaActiva] = useState<'3d' | 'real'>('3d');
  const [versionMezcla, setVersionMezcla] = useState<number>(0);
  const [modoSeleccionado, setModoSeleccionado] = useState<number>(2);
  const [estaMezclando, setEstaMezclando] = useState<boolean>(false);
  const [ranuras, setRanuras] = useState<RanuraColor[]>([
    { color: CATALOGO_COLORES[1], porcentaje: 56, bloqueado: false }, // Cobalt Blue
    { color: CATALOGO_COLORES[5], porcentaje: 44, bloqueado: false }  // Ash Gray
  ]);

  const [modalIndice, setModalIndice] = useState<number | null>(null);

  // Actualizar textura en Three.js al cambiar ranuras sin bloquear el hilo principal
  const actualizarEscena3D = useCallback(async () => {
    await motor3D.actualizarTexturaAsync(ranuras);
  }, [motor3D, ranuras]);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      actualizarEscena3D();
    }, 100);
    return () => clearTimeout(temporizador);
  }, [actualizarEscena3D]);

  // Cambiar modo de mezcla (1, 2, 3 colores)
  const cambiarModo = (nuevoModo: number) => {
    if (modoSeleccionado === nuevoModo) return;
    setModoSeleccionado(nuevoModo);

    let nuevasRanuras: RanuraColor[] = [];
    if (nuevoModo === 1) {
      nuevasRanuras = [{ color: ranuras[0]?.color || CATALOGO_COLORES[1], porcentaje: 100, bloqueado: true }];
    } else if (nuevoModo === 2) {
      nuevasRanuras = [
        { color: ranuras[0]?.color || CATALOGO_COLORES[1], porcentaje: 56, bloqueado: false },
        { color: ranuras[1]?.color || CATALOGO_COLORES[5], porcentaje: 44, bloqueado: false }
      ];
    } else {
      nuevasRanuras = [
        { color: ranuras[0]?.color || CATALOGO_COLORES[1], porcentaje: 34, bloqueado: false },
        { color: ranuras[1]?.color || CATALOGO_COLORES[5], porcentaje: 33, bloqueado: false },
        { color: CATALOGO_COLORES[22], porcentaje: 33, bloqueado: false } // Charcoal Gray
      ];
    }

    setRanuras(nuevasRanuras);
  };

  // Modificar porcentaje de una ranura
  const modificarPorcentaje = (indice: number, nuevoValor: number) => {
    setRanuras(prev => calculador.recalcular(prev, indice, nuevoValor));
  };

  // Alternar bloqueo
  const alternarBloqueo = (indice: number) => {
    if (modoSeleccionado === 1) return;
    setRanuras(prev => prev.map((r, i) => (i === indice ? { ...r, bloqueado: !r.bloqueado } : r)));
  };

  // Asignar color seleccionado
  const asignarColor = (color: DefinicionColor) => {
    if (modalIndice === null) return;
    setRanuras(prev => prev.map((r, i) => (i === modalIndice ? { ...r, color } : r)));
    setModalIndice(null);
  };

  // Re-mezclar gránulos con animación fluida sin bloquear el hilo del navegador
  const mezclarColores = async () => {
    setEstaMezclando(true);
    setVersionMezcla(v => v + 1);
    // Ceder el turno para que la animación del dado comience inmediatamente
    await new Promise(resolver => setTimeout(resolver, 20));
    await motor3D.actualizarTexturaAsync(ranuras);
    setEstaMezclando(false);
  };

  // Guardar imagen 3D con ficha técnica
  const guardarImagen = () => {
    const lienzo3D = motor3D.obtenerCapturaLienzo();
    if (lienzo3D) {
      exportador.exportarMuestra(lienzo3D, ranuras, 'muestra-mezcla-epdm-3d');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-zinc-900 font-sans selection:bg-[#006FEE]/15 selection:text-[#006FEE] flex items-center justify-center p-3 sm:p-4 lg:p-6">
      {/* Contenedor unificado tipo Studio Workspace expandido verticalmente */}
      <main className="w-full max-w-7xl bg-white rounded-3xl overflow-hidden flex flex-col lg:h-[88vh] lg:min-h-[760px] lg:max-h-[920px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch flex-1 min-h-0">

          {/* Panel Izquierdo: Dock de Control (5 columnas) */}
          <aside className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">

            <div className="space-y-5">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2 text-zinc-800 font-bold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-[#006FEE]" />
                  <span>Mix Studio</span>
                </div>

                <span className="text-xs font-semibold bg-blue-50 text-[#006FEE] px-2.5 py-1 rounded-full">
                  {modoSeleccionado} {modoSeleccionado === 1 ? 'Color' : 'Colors'}
                </span>
              </div>

              {/* 1. Selector de Modo */}
              <PestanasModo
                modos={MODOS_DISPONIBLES}
                modoSeleccionado={modoSeleccionado}
                onSeleccionarModo={cambiarModo}
              />

              {/* 2. Lista de Colores de la Mezcla */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-zinc-600">
                  Color Composition
                </label>

                <div className="space-y-2.5">
                  {ranuras.map((ranura, idx) => (
                    <FilaColorStudio
                      key={idx}
                      ranura={ranura}
                      indice={idx}
                      onAbrirModal={setModalIndice}
                      onAlternarBloqueo={alternarBloqueo}
                      onModificarPorcentaje={modificarPorcentaje}
                      deshabilitadoBloqueo={modoSeleccionado === 1}
                    />
                  ))}
                </div>
              </div>

              {/* 3. Barra de Balance Visual 100% */}
              <BarraBalanceMezcla ranuras={ranuras} />
            </div>

            {/* 4. Botones de Acción */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={mezclarColores}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black active:bg-zinc-800 text-white font-semibold text-xs sm:text-sm h-12 rounded-2xl transition-all cursor-pointer"
              >
                <Dices className={`w-4 h-4 text-[#006FEE] ${estaMezclando ? 'animate-spin' : ''}`} />
                <span>Remix</span>
              </button>
            </div>

          </aside>

          {/* Panel Derecho: Escenario de visualización (7 columnas) */}
          <section className="lg:col-span-7 p-4 sm:p-6 relative group flex flex-col gap-3 h-full min-h-[480px] lg:min-h-0">

            {/* Selector de vista: Render 3D / Vista Real centrado y sin bordes */}
            <div className="flex items-center justify-center relative py-0.5">
              <div className="inline-flex items-center p-1 bg-zinc-100 rounded-2xl relative">
                {([
                  { id: '3d', etiqueta: '3D Render', Icono: Box },
                  { id: 'real', etiqueta: 'Real View', Icono: ImageIcon }
                ] as const).map(({ id, etiqueta, Icono }) => {
                  const esActivo = vistaActiva === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setVistaActiva(id)}
                      className={`relative flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer z-10 ${
                        esActivo
                          ? 'text-[#006FEE]'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {esActivo && (
                        <motion.div
                          layoutId="tab-vista-activa"
                          className="absolute inset-0 bg-white rounded-xl"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <Icono className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{etiqueta}</span>
                    </button>
                  );
                })}
              </div>

              {/* Subtítulo discreto a la derecha sin romper el centrado */}
              <span className="absolute right-0 hidden xl:block text-[11px] font-medium text-zinc-400 pointer-events-none">
                {vistaActiva === '3d' ? '3D top view' : 'Applied to playground'}
              </span>
            </div>

            {/* Viewport 3D Three.js (se mantiene montado para conservar el contexto WebGL) */}
            <VisorEscena3D motor3D={motor3D} estaMezclando={estaMezclando} visible={vistaActiva === '3d'} />

            {/* Vista real fotográfica */}
            {vistaActiva === 'real' && (
              <VisorVistaReal ranuras={ranuras} generadorPBR={generadorPBR} activo versionMezcla={versionMezcla} />
            )}
          </section>
        </div>
      </main>

      {/* Modal para Catálogo de Colores */}
      <ModalCatalogoColores
        indiceSeleccionando={modalIndice}
        ranuras={ranuras}
        onSeleccionarColor={asignarColor}
        onCerrar={() => setModalIndice(null)}
      />
    </div>
  );
}

export default App;


