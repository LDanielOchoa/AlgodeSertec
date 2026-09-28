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
import { Button, Chip } from '@heroui/react';
import { Dices, Download, Sparkles, SlidersHorizontal, ShieldCheck } from 'lucide-react';

/**
 * Aplicación principal integrada con los componentes oficiales de HeroUI (@heroui/react).
 * Estructura "Studio Workspace" sin sombras, modularizada bajo principios SOLID.
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
    { color: CATALOGO_COLORES[0], porcentaje: 56, bloqueado: false }, // Dark Blue
    { color: CATALOGO_COLORES[1], porcentaje: 44, bloqueado: false }  // Light Gray
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
        { color: ranuras[0]?.color || CATALOGO_COLORES[0], porcentaje: 56, bloqueado: false },
        { color: ranuras[1]?.color || CATALOGO_COLORES[1], porcentaje: 44, bloqueado: false }
      ];
    } else {
      nuevasRanuras = [
        { color: ranuras[0]?.color || CATALOGO_COLORES[0], porcentaje: 34, bloqueado: false },
        { color: ranuras[1]?.color || CATALOGO_COLORES[1], porcentaje: 33, bloqueado: false },
        { color: CATALOGO_COLORES[3], porcentaje: 33, bloqueado: false }
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
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-[#006FEE]/15 selection:text-[#006FEE]">
      
      {/* Barra de navegación superior con componentes HeroUI */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#006FEE] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-zinc-900 leading-tight">
              Color Blend Studio 3D
            </h1>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Visualizador Oficial de Mezclas EPDM con HeroUI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Chip
            variant="flat"
            size="sm"
            radius="full"
            className="hidden md:flex bg-zinc-100 border border-zinc-200 text-zinc-600 font-medium"
            startContent={<ShieldCheck className="w-3.5 h-3.5 text-[#006FEE] mx-1" />}
          >
            EPDM Virgen • 1.0 - 3.5 mm
          </Chip>

          <Button
            size="sm"
            radius="lg"
            color="primary"
            className="bg-[#006FEE] hover:bg-[#005BC4] text-white font-semibold"
            startContent={<Download className="w-3.5 h-3.5" />}
            onPress={guardarImagen}
          >
            <span className="hidden sm:inline">Exportar Ficha 3D</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>
      </header>

      {/* Espacio de trabajo dividido Studio Workspace */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Panel Izquierdo: Dock de Control (5 columnas) */}
          <aside className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200 space-y-5">
            
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
              <div className="flex items-center gap-2 text-zinc-800 font-bold text-sm">
                <SlidersHorizontal className="w-4 h-4 text-[#006FEE]" />
                <span>Panel de Mezcla</span>
              </div>
              
              <Chip size="sm" variant="flat" color="primary" radius="full" className="font-semibold bg-blue-50 text-[#006FEE] border border-blue-100">
                {modoSeleccionado} {modoSeleccionado === 1 ? 'Color' : 'Colores'}
              </Chip>
            </div>

            {/* 1. Selector de Modo con Tabs de HeroUI */}
            <PestanasModo
              modos={MODOS_DISPONIBLES}
              modoSeleccionado={modoSeleccionado}
              onSeleccionarModo={cambiarModo}
            />

            {/* 2. Lista de Colores de la Mezcla con HeroUI Slider/Buttons */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-zinc-600">
                Composición de Colores
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

            {/* 3. Barra de Balance Visual 100% con Chips de HeroUI */}
            <BarraBalanceMezcla ranuras={ranuras} />

            {/* 4. Botón Mezclar Colores con Button de HeroUI */}
            <Button
              fullWidth
              size="lg"
              radius="xl"
              className="bg-zinc-900 hover:bg-black text-white font-semibold text-xs sm:text-sm h-12"
              startContent={<Dices className={`w-4 h-4 text-[#006FEE] ${estaMezclando ? 'animate-spin' : ''}`} />}
              onPress={mezclarColores}
            >
              Remezclar Dispersión 3D
            </Button>

          </aside>

          {/* Panel Derecho: Escenario 3D Central (7 columnas) */}
          <section className="lg:col-span-7 space-y-4">
            
            {/* Viewport 3D Three.js con componentes HeroUI */}
            <VisorEscena3D motor3D={motor3D} estaMezclando={estaMezclando} />

            {/* Tarjeta inferior con ficha técnica plana */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Renderizado PBR en Tiempo Real</span>
                </div>
                
                <Chip size="sm" variant="flat" radius="sm" className="bg-zinc-100 text-zinc-500 text-[11px]">
                  Cámara Cenital Fija (2x Default)
                </Chip>
              </div>
              
              <p className="text-[11px] sm:text-xs text-zinc-500 leading-relaxed">
                Este visualizador 3D representa la mezcla homogénea de gránulos de caucho EPDM virgen prensados con ligante alifático. Los gránulos se muestran optimizados a escala digital para apreciar el relieve y el entrecruzamiento de las partículas.
              </p>
            </div>

          </section>

        </div>
      </main>

      {/* Modal oficial de HeroUI para Catálogo de Colores */}
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
