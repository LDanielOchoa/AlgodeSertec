export interface DefinicionColor {
  id: string;
  nombre: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  categoria: 'Neutrals' | 'Earth' | 'Warm' | 'Greens' | 'Blues';
}

export interface RanuraColor {
  color: DefinicionColor | null;
  porcentaje: number;
  bloqueado: boolean;
}

export interface ModoVisualizador {
  id: number;
  titulo: string;
  subtitulo: string;
  imagenMuestra: string;
}

export interface PatronDiseno3D {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
}

export const CATALOGO_COLORES: DefinicionColor[] = [
  // Row 1
  { id: 'inferno-red', nombre: 'Inferno Red', hex: '#9E3C32', r: 158, g: 60, b: 50, categoria: 'Warm' },
  { id: 'cobalt-blue', nombre: 'Cobalt Blue', hex: '#2962B8', r: 41, g: 98, b: 184, categoria: 'Blues' },
  { id: 'sandstone-beige', nombre: 'Sandstone Beige', hex: '#BA8B5C', r: 186, g: 139, b: 92, categoria: 'Earth' },
  { id: 'shamrock-green', nombre: 'Shamrock Green', hex: '#437255', r: 67, g: 114, b: 85, categoria: 'Greens' },
  // Row 2
  { id: 'sky-blue', nombre: 'Sky Blue', hex: '#6295B8', r: 98, g: 149, b: 184, categoria: 'Blues' },
  { id: 'ash-gray', nombre: 'Ash Gray', hex: '#B8BEBA', r: 184, g: 190, b: 186, categoria: 'Neutrals' },
  { id: 'lime-green', nombre: 'Lime Green', hex: '#58A852', r: 88, g: 168, b: 82, categoria: 'Greens' },
  { id: 'chestnut-brown', nombre: 'Chestnut Brown', hex: '#8B573F', r: 139, g: 87, b: 63, categoria: 'Earth' },
  // Row 3
  { id: 'pewter-gray', nombre: 'Pewter Gray', hex: '#919296', r: 145, g: 146, b: 150, categoria: 'Neutrals' },
  { id: 'ivy-green', nombre: 'Ivy Green', hex: '#6C8F76', r: 108, g: 143, b: 118, categoria: 'Greens' },
  { id: 'teal', nombre: 'Teal', hex: '#208A8C', r: 32, g: 138, b: 140, categoria: 'Blues' },
  { id: 'yellow', nombre: 'Yellow', hex: '#E2CB32', r: 226, g: 203, b: 50, categoria: 'Warm' },
  // Row 4
  { id: 'orange', nombre: 'Orange', hex: '#DE602E', r: 222, g: 96, b: 46, categoria: 'Warm' },
  { id: 'purple', nombre: 'Purple', hex: '#584B7C', r: 88, g: 75, b: 124, categoria: 'Warm' },
  { id: 'cherry-red', nombre: 'Cherry Red', hex: '#B64647', r: 182, g: 70, b: 71, categoria: 'Warm' },
  { id: 'gold', nombre: 'Gold', hex: '#C79138', r: 199, g: 145, b: 56, categoria: 'Warm' },
  // Row 5
  { id: 'lilac', nombre: 'Lilac', hex: '#826EA3', r: 130, g: 110, b: 163, categoria: 'Warm' },
  { id: 'cream', nombre: 'Cream', hex: '#E1DFD2', r: 225, g: 223, b: 210, categoria: 'Neutrals' },
  { id: 'ivory', nombre: 'Ivory', hex: '#B3A481', r: 179, g: 164, b: 129, categoria: 'Earth' },
  { id: 'aquamarine', nombre: 'Aquamarine', hex: '#17B2C4', r: 23, g: 178, b: 196, categoria: 'Blues' },
  // Row 6
  { id: 'white', nombre: 'White', hex: '#EAEFEA', r: 234, g: 239, b: 234, categoria: 'Neutrals' },
  { id: 'raspberry-pink', nombre: 'Raspberry Pink', hex: '#8E2848', r: 142, g: 40, b: 72, categoria: 'Warm' },
  { id: 'charcoal-gray', nombre: 'Charcoal Gray', hex: '#56555A', r: 86, g: 85, b: 90, categoria: 'Neutrals' }
];

export const MODOS_DISPONIBLES: ModoVisualizador[] = [
  {
    id: 1,
    titulo: 'Solid Color',
    subtitulo: '1 Color',
    imagenMuestra: 'linear-gradient(135deg, #CBD0CC 0%, #9EA0A1 100%)'
  },
  {
    id: 2,
    titulo: '2 Color Blend',
    subtitulo: '2 Colors',
    imagenMuestra: 'linear-gradient(135deg, #CBD0CC 40%, #0E518D 100%)'
  },
  {
    id: 3,
    titulo: '3 Color Blend',
    subtitulo: '3 Colors',
    imagenMuestra: 'linear-gradient(135deg, #CBD0CC 30%, #9EA0A1 60%, #282828 100%)'
  }
];

export const PATRONES_DISENO_3D: PatronDiseno3D[] = [
  {
    id: 'uniforme',
    nombre: 'EPDM Granule Surface',
    descripcion: 'Dense, homogeneous compacted rubber granule layer.',
    icono: 'Shapes'
  },
  {
    id: 'moteado-terrazzo',
    nombre: 'Terrazzo Fleck Pattern',
    descripcion: 'Base matrix with contrasting rubber granule flecks.',
    icono: 'Sparkles'
  },
  {
    id: 'islas-parque',
    nombre: 'Park Islands & Curves',
    descripcion: 'Seamless playground safety surface with sweeping curves.',
    icono: 'Spline'
  },
  {
    id: 'geometria-rayuela',
    nombre: 'Hopscotch & Grid Tiles',
    descripcion: 'Modular rectangular safety rubber tiles.',
    icono: 'Grid3x3'
  },
  {
    id: 'bandas-deportivas',
    nombre: 'Track Lanes',
    descripcion: 'High-durability vulcanized running track stripes.',
    icono: 'Rows'
  }
];
