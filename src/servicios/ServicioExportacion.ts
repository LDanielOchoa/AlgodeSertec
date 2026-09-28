import type { RanuraColor } from '../modelos/DefinicionColor';

export interface IServicioExportacion {
  exportarMuestra(lienzoOrigen: HTMLCanvasElement, ranuras: RanuraColor[], nombreArchivo?: string): void;
}

/**
 * Servicio de exportación de muestras y fichas técnicas en alta resolución estilo HeroUI (grises y azules).
 * Cumple con SRP.
 */
export class ServicioExportacion implements IServicioExportacion {
  public exportarMuestra(
    lienzoOrigen: HTMLCanvasElement,
    ranuras: RanuraColor[],
    nombreArchivo: string = 'muestra-mezcla-epdm-3d'
  ): void {
    const anchoExport = 1200;
    const altoExport = 900;
    const lienzoExport = document.createElement('canvas');
    lienzoExport.width = anchoExport;
    lienzoExport.height = altoExport;
    const ctx = lienzoExport.getContext('2d');
    if (!ctx) return;

    // 1. Fondo elegante en gris neutro limpio
    ctx.fillStyle = '#FAFAFC';
    ctx.fillRect(0, 0, anchoExport, altoExport);

    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, anchoExport - 48, altoExport - 48);

    // 2. Encabezado estilo HeroUI
    ctx.fillStyle = '#006FEE';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('COLOR BLEND VISUALIZER 3D', 56, 70);

    ctx.fillStyle = '#18181B';
    ctx.font = '600 28px system-ui, -apple-system, sans-serif';
    ctx.fillText('Ficha Técnica de Mezcla de Caucho EPDM', 56, 102);

    ctx.fillStyle = '#71717A';
    ctx.font = '400 14px system-ui, -apple-system, sans-serif';
    const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(`Muestra Digital 3D  |  Generado: ${fecha}`, 56, 126);

    // 3. Renderizado de la muestra central
    const anchoMuestra = 680;
    const altoMuestra = 510;
    const muestraX = 56;
    const muestraY = 155;

    // Sombra del contenedor
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(muestraX - 8, muestraY - 8, anchoMuestra + 16, altoMuestra + 16, 16);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(muestraX, muestraY, anchoMuestra, altoMuestra, 12);
    ctx.clip();
    ctx.drawImage(lienzoOrigen, muestraX, muestraY, anchoMuestra, altoMuestra);
    ctx.restore();

    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 1;
    ctx.strokeRect(muestraX, muestraY, anchoMuestra, altoMuestra);

    // 4. Panel lateral con la composición de colores
    const panelX = 776;
    let panelY = 165;

    ctx.fillStyle = '#006FEE';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('COMPOSICIÓN DE LA MEZCLA', panelX, panelY);
    panelY += 28;

    const ranurasActivas = ranuras.filter(r => r.color !== null && r.porcentaje > 0);

    ranurasActivas.forEach(r => {
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#E4E4E7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, 368, 64, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = r.color!.hex;
      ctx.beginPath();
      ctx.roundRect(panelX + 12, panelY + 12, 40, 40, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.stroke();

      ctx.fillStyle = '#18181B';
      ctx.font = '600 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(r.color!.nombre, panelX + 64, panelY + 30);

      ctx.fillStyle = '#006FEE';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${r.porcentaje}%`, panelX + 300, panelY + 37);

      ctx.fillStyle = '#71717A';
      ctx.font = '400 12px system-ui, -apple-system, sans-serif';
      ctx.fillText(r.color!.hex, panelX + 64, panelY + 48);

      panelY += 76;
    });

    // 5. Especificaciones
    panelY += 15;
    ctx.fillStyle = '#27272A';
    ctx.font = '600 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('ESPECIFICACIONES DEL SISTEMA', panelX, panelY);
    panelY += 24;

    const especificaciones = [
      '• Granulometría: 1.0 - 3.5 mm (EPDM Virgen)',
      '• Ligante: Resina de Poliuretano Alifática 100%',
      '• Aplicación: Pavimentos continuos de seguridad',
      '• Resistencia UV: Máxima estabilidad cromática'
    ];

    ctx.fillStyle = '#71717A';
    ctx.font = '400 13px system-ui, -apple-system, sans-serif';
    especificaciones.forEach(linea => {
      ctx.fillText(linea, panelX, panelY);
      panelY += 22;
    });

    // 6. Pie de página
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '400 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      'Nota: Esta muestra digital 3D es una representación visual fidedigna. La superficie in situ puede tener ligeras variaciones de tonalidad.',
      56,
      845
    );

    // 7. Descargar
    const enlace = document.createElement('a');
    enlace.download = `${nombreArchivo}.png`;
    enlace.href = lienzoExport.toDataURL('image/png');
    enlace.click();
  }
}
