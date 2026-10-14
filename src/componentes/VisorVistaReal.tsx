import { useEffect, useRef, useState } from 'react';
import type { RanuraColor } from '../modelos/DefinicionColor';
import type { IServicioTexturaPBR } from '../servicios/GeneradorTexturaPBR';
import { CompositorVistaReal } from '../servicios/CompositorVistaReal';
import { Loader2 } from 'lucide-react';

/** Fotografía real base cuyo suelo verde se re-colorea con la mezcla. */
const IMAGEN_ESCENA_REAL = `${import.meta.env.BASE_URL}${encodeURIComponent('Parque infantil colorido sobre suelo verde.png')}`;

interface PropiedadesVisorVistaReal {
  ranuras: RanuraColor[];
  generadorPBR: IServicioTexturaPBR;
  activo: boolean;
  tamanoGranulo?: number;
  /** Cambia al pulsar "Remezclar" para regenerar la distribución de gránulos. */
  versionMezcla?: number;
}

/** Instancia compartida: el análisis de la foto (máscara del suelo e iluminación) se calcula una sola vez. */
const compositorCompartido = new CompositorVistaReal();

/**
 * Visor de vista real: muestra la fotografía del parque con el suelo
 * re-texturizado con la mezcla de colores EPDM actual.
 * Cumple con SRP.
 */
export function VisorVistaReal({
  ranuras,
  generadorPBR,
  activo,
  tamanoGranulo = 16,
  versionMezcla = 0
}: PropiedadesVisorVistaReal) {
  const compositor = compositorCompartido;
  const lienzoRef = useRef<HTMLCanvasElement | null>(null);
  const [procesando, setProcesando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verOriginal, setVerOriginal] = useState(false);
  const [modoLlenar, setModoLlenar] = useState(true);

  useEffect(() => {
    if (!activo) return;
    let cancelado = false;

    const temporizador = setTimeout(async () => {
      setProcesando(true);
      try {
        await compositor.preparar(IMAGEN_ESCENA_REAL);
        if (cancelado || !lienzoRef.current) return;

        const textura = await generadorPBR.generarMapaDifusoAsync(ranuras, tamanoGranulo, () => cancelado);
        if (cancelado || !textura || !lienzoRef.current) return;

        const exito = await compositor.componerAsync(lienzoRef.current, textura, () => cancelado);
        if (cancelado || !exito) return;

        setError(null);
      } catch (e) {
        if (!cancelado) setError(e instanceof Error ? e.message : 'Error generating real view');
      } finally {
        if (!cancelado) setProcesando(false);
      }
    }, 90);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [activo, ranuras, generadorPBR, compositor, tamanoGranulo, versionMezcla]);

  const claseAjuste = `absolute inset-0 w-full h-full ${modoLlenar ? 'object-cover' : 'object-contain'}`;
  const estiloPosicion = { objectPosition: '50% 30%' };

  return (
    <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-zinc-100 min-h-[400px] lg:min-h-0">
      <canvas
        ref={lienzoRef}
        className={`${claseAjuste} transition-opacity duration-300 ${verOriginal ? 'opacity-0' : 'opacity-100'}`}
        style={estiloPosicion}
      />

      <img
        src={IMAGEN_ESCENA_REAL}
        alt="Original playground photo"
        className={`${claseAjuste} transition-opacity duration-300 pointer-events-none ${
          verOriginal ? 'opacity-100' : 'opacity-0'
        }`}
        style={estiloPosicion}
      />

      {procesando && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] z-10">
          <div className="flex items-center gap-2 bg-white/95 text-zinc-700 text-xs font-semibold px-3 py-2 rounded-full border border-zinc-200/80">
            <Loader2 className="w-4 h-4 animate-spin text-[#006FEE]" />
            Applying blend to surface…
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="bg-white/95 text-red-600 text-xs font-semibold px-3 py-2 rounded-full border border-red-200">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
