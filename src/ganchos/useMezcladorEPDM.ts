import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  CATALOGO_COLORES,
  type RanuraColor,
  type DefinicionColor,
  type PaletaPredefinida
} from '../modelos/DefinicionColor';
import { CalculadorProporciones } from '../servicios/CalculadorProporciones';
import { GeneradorGranulosProcedurales } from '../servicios/GeneradorGranulosProcedurales';
import { GeneradorTexturaPBR } from '../servicios/GeneradorTexturaPBR';
import {
  MotorEscena3D,
  type TipoEscenario,
  type ModoIluminacion,
  type AcabadoBrillo,
  type VistaCamara
} from '../servicios/MotorEscena3D';
import { ServicioExportacion } from '../servicios/ServicioExportacion';

export function useMezcladorEPDM() {
  const calculador = useMemo(() => new CalculadorProporciones(), []);
  const generadorSprites = useMemo(() => new GeneradorGranulosProcedurales(), []);
  const generadorPBR = useMemo(() => new GeneradorTexturaPBR(generadorSprites), [generadorSprites]);
  const exportador = useMemo(() => new ServicioExportacion(), []);

  const [modoActual, setModoActual] = useState<number>(3);
  const [ranuras, setRanuras] = useState<RanuraColor[]>(() => {
    const porcentajes = calculador.obtenerDistribucionEquitativa(3);
    return [
      { color: CATALOGO_COLORES[3], porcentaje: porcentajes[0], bloqueado: false },
      { color: CATALOGO_COLORES[12], porcentaje: porcentajes[1], bloqueado: false },
      { color: CATALOGO_COLORES[0], porcentaje: porcentajes[2], bloqueado: false }
    ];
  });

  const [patronActual, setPatronActual] = useState<string>('moteado-terrazzo');
  const [tamanoGranulo, setTamanoGranulo] = useState<number>(11);
  const [escalaRelieve, setEscalaRelieve] = useState<number>(0.18);
  const [tipoEscenario, setTipoEscenario] = useState<TipoEscenario>('placa');
  const [modoIluminacion, setModoIluminacion] = useState<ModoIluminacion>('estudio');
  const [acabadoBrillo, setAcabadoBrillo] = useState<AcabadoBrillo>('satinado');
  const [nombreProyecto, setNombreProyecto] = useState<string>('Piscina Residencial Sunset Club');
  const [copiadoExito, setCopiadoExito] = useState<boolean>(false);
  const [indiceModalSeleccion, setIndiceModalSeleccion] = useState<number | null>(null);

  const motor3DRef = useRef<MotorEscena3D | null>(null);
  const contenedor3DRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inicializar Motor 3D
  const registrarContenedor3D = useCallback((nodo: HTMLDivElement | null) => {
    if (nodo && !motor3DRef.current) {
      contenedor3DRef.current = nodo;
      const motor = new MotorEscena3D(nodo, generadorPBR);
      motor.inicializar();
      motor3DRef.current = motor;
      motor.actualizarTextura(ranuras, patronActual, tamanoGranulo);
    }
  }, [generadorPBR, ranuras, patronActual, tamanoGranulo]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      motor3DRef.current?.destruir();
      motor3DRef.current = null;
    };
  }, []);

  // Actualizar textura 3D con debounce
  const solicitarActualizacion3D = useCallback((inmediato = false) => {
    if (inmediato) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      motor3DRef.current?.actualizarTextura(ranuras, patronActual, tamanoGranulo);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      motor3DRef.current?.actualizarTextura(ranuras, patronActual, tamanoGranulo);
    }, 100);
  }, [ranuras, patronActual, tamanoGranulo]);

  useEffect(() => {
    solicitarActualizacion3D();
  }, [solicitarActualizacion3D]);

  // Cambiar Modo (1 a 4 colores)
  const cambiarModo = (nuevoModo: number) => {
    if (modoActual === nuevoModo) return;
    setModoActual(nuevoModo);

    const porcentajes = calculador.obtenerDistribucionEquitativa(nuevoModo);
    setRanuras(prev => {
      let nuevas = [...prev];
      if (nuevas.length < nuevoModo) {
        const disponibles = CATALOGO_COLORES.filter(c => !nuevas.some(r => r.color?.id === c.id));
        while (nuevas.length < nuevoModo) {
          const col = disponibles.shift() || CATALOGO_COLORES[nuevas.length % CATALOGO_COLORES.length];
          nuevas.push({ color: col, porcentaje: 0, bloqueado: false });
        }
      } else if (nuevas.length > nuevoModo) {
        nuevas = nuevas.slice(0, nuevoModo);
      }

      return nuevas.map((r, idx) => ({
        ...r,
        porcentaje: porcentajes[idx],
        bloqueado: false
      }));
    });
  };

  // Modificar porcentaje de una ranura
  const modificarPorcentaje = (indice: number, nuevoValor: number) => {
    setRanuras(prev => calculador.recalcular(prev, indice, nuevoValor));
  };

  // Alternar bloqueo (Lock)
  const alternarBloqueo = (indice: number) => {
    if (modoActual === 1) return;
    setRanuras(prev => prev.map((r, i) => i === indice ? { ...r, bloqueado: !r.bloqueado } : r));
  };

  // Asignar color a ranura
  const asignarColor = (color: DefinicionColor) => {
    if (indiceModalSeleccion === null) return;
    setRanuras(prev => prev.map((r, i) => i === indiceModalSeleccion ? { ...r, color } : r));
    setIndiceModalSeleccion(null);
  };

  // Aplicar paleta predefinida
  const aplicarPaleta = (paleta: PaletaPredefinida) => {
    setModoActual(paleta.modo);
    const nuevas = paleta.mezcla.map(m => {
      const col = CATALOGO_COLORES.find(c => c.id === m.idColor) || CATALOGO_COLORES[0];
      return {
        color: col,
        porcentaje: m.porcentaje,
        bloqueado: false
      };
    });
    setRanuras(nuevas);
  };

  // Controles de Escenario 3D
  const cambiarEscenarioHandler = (esc: TipoEscenario) => {
    setTipoEscenario(esc);
    motor3DRef.current?.cambiarEscenario(esc);
  };

  const cambiarIluminacionHandler = (luz: ModoIluminacion) => {
    setModoIluminacion(luz);
    motor3DRef.current?.cambiarIluminacion(luz);
  };

  const cambiarAcabadoHandler = (acabado: AcabadoBrillo) => {
    setAcabadoBrillo(acabado);
    motor3DRef.current?.cambiarAcabadoBrillo(acabado);
  };

  const cambiarRelieveHandler = (val: number) => {
    setEscalaRelieve(val);
    motor3DRef.current?.establecerNivelRelieve(val);
  };

  const cambiarVistaCamara = (vista: VistaCamara) => {
    motor3DRef.current?.establecerVistaCamara(vista);
  };

  // Copiar Fórmula
  const copiarFormula = () => {
    const activas = ranuras.filter(r => r.color && r.porcentaje > 0);
    const texto = activas.map(r => `${r.porcentaje}% ${r.color!.nombre}`).join(' + ');
    navigator.clipboard.writeText(`Especificación EPDM 3D: [Patrón: ${patronActual}] - Fórmula: ${texto}`).then(() => {
      setCopiadoExito(true);
      setTimeout(() => setCopiadoExito(false), 2000);
    });
  };

  // Exportar Ficha 3D
  const exportarFicha = () => {
    if (!motor3DRef.current) return;
    const canvas = motor3DRef.current.obtenerCapturaLienzo();
    exportador.exportarFichaTecnica(canvas, ranuras, nombreProyecto);
  };

  return {
    modoActual,
    ranuras,
    patronActual,
    tamanoGranulo,
    escalaRelieve,
    tipoEscenario,
    modoIluminacion,
    acabadoBrillo,
    nombreProyecto,
    copiadoExito,
    indiceModalSeleccion,
    registrarContenedor3D,
    cambiarModo,
    setPatronActual,
    setTamanoGranulo,
    setNombreProyecto,
    setIndiceModalSeleccion,
    modificarPorcentaje,
    alternarBloqueo,
    asignarColor,
    aplicarPaleta,
    cambiarEscenario: cambiarEscenarioHandler,
    cambiarIluminacion: cambiarIluminacionHandler,
    cambiarAcabado: cambiarAcabadoHandler,
    cambiarRelieve: cambiarRelieveHandler,
    cambiarVistaCamara,
    solicitarActualizacion3D,
    copiarFormula,
    exportarFicha
  };
}
