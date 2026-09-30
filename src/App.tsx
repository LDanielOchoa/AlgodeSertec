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
import { ModalCatalogoColores } from './componentes/ModalCatalogoColores';
import { Dices, Download, SlidersHorizontal } from 'lucide-react';



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

  const [modoSeleccionado, setModoSeleccionado] = useState<number>(2);
  const [estaMezclando, setEstaMezclando] = useState<boolean>(false);
  const [ranuras, setRanuras] = useState<RanuraColor[]>([
    { color: CATALOGO_COLORES[1], porcentaje: 56, bloqueado: false }, // Cobalt Blue
    { color: CATALOGO_COLORES[5], porcentaje: 44, bloqueado: false }  // Ash Gray
  ]);

  const [modalIndice, setModalIndice] = useState<number | null>(null);

  // Actualizar textura en Three.js al cambiar ranuras
  const actualizarEscena3D = useCallback(() => {
    motor3D.actualizarTextura(ranuras);
  }, [motor3D, ranuras]);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      actualizarEscena3D();
    }, 60);
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

  // Re-mezclar gránulos con microanimación
  const mezclarColores = () => {
    setEstaMezclando(true);
    actualizarEscena3D();
    setTimeout(() => setEstaMezclando(false), 250);
  };

  // Guardar imagen 3D con ficha técnica
  const guardarImagen = () => {
    const lienzo3D = motor3D.obtenerCapturaLienzo();
    if (lienzo3D) {
      exportador.exportarMuestra(lienzo3D, ranuras, 'muestra-mezcla-epdm-3d');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-zinc-900 font-sans selection:bg-[#006FEE]/15 selection:text-[#006FEE] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Espacio de trabajo centrado Studio Workspace */}
      <main className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

          {/* Panel Izquierdo: Dock de Control (5 columnas) sin bordes */}
          <aside className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between">

            <div className="space-y-5">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2 text-zinc-800 font-bold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-[#006FEE]" />
                  <span>Panel de Mezcla</span>
                </div>

                <span className="text-xs font-semibold bg-blue-50 text-[#006FEE] px-2.5 py-1 rounded-full">
                  {modoSeleccionado} {modoSeleccionado === 1 ? 'Color' : 'Colores'}
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
                  Composición de Colores
                </label>

                <div className="space-y-2.5 min-h-[350px] sm:min-h-[362px]">
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
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black active:bg-zinc-800 text-white font-semibold text-xs sm:text-sm h-12 rounded-2xl transition-all cursor-pointer shadow-xs"
              >
                <Dices className={`w-4 h-4 text-[#006FEE] ${estaMezclando ? 'animate-spin' : ''}`} />
                <span>Remezclar</span>
              </button>

              <button
                type="button"
                onClick={guardarImagen}
                title="Exportar Ficha 3D"
                className="flex items-center justify-center gap-2 bg-[#006FEE] hover:bg-[#005BC4] active:bg-[#004EA8] text-white font-semibold text-xs sm:text-sm h-12 px-4 rounded-2xl transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar Ficha</span>
              </button>
            </div>

          </aside>

          {/* Panel Derecho: Escenario 3D Central (7 columnas) */}
          <section className="lg:col-span-7 flex flex-col h-full">

            {/* Viewport 3D Three.js */}
            <VisorEscena3D motor3D={motor3D} estaMezclando={estaMezclando} />

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


