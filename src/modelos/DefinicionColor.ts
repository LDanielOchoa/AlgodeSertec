export interface DefinicionColor {
  id: string;
  nombre: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  categoria: 'Neutrales' | 'Tierra' | 'Cálidos' | 'Verdes' | 'Azules';
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
  // Fila 1
  { id: 'inferno-red', nombre: 'Inferno Red', hex: '#9E3C32', r: 158, g: 60, b: 50, categoria: 'Cálidos' },
  { id: 'cobalt-blue', nombre: 'Cobalt Blue', hex: '#2962B8', r: 41, g: 98, b: 184, categoria: 'Azules' },
  { id: 'sandstone-beige', nombre: 'Sandstone Beige', hex: '#BA8B5C', r: 186, g: 139, b: 92, categoria: 'Tierra' },
  { id: 'shamrock-green', nombre: 'Shamrock Green', hex: '#437255', r: 67, g: 114, b: 85, categoria: 'Verdes' },
  // Fila 2
  { id: 'sky-blue', nombre: 'Sky Blue', hex: '#6295B8', r: 98, g: 149, b: 184, categoria: 'Azules' },
  { id: 'ash-gray', nombre: 'Ash Gray', hex: '#B8BEBA', r: 184, g: 190, b: 186, categoria: 'Neutrales' },
  { id: 'lime-green', nombre: 'Lime Green', hex: '#58A852', r: 88, g: 168, b: 82, categoria: 'Verdes' },
  { id: 'chestnut-brown', nombre: 'Chestnut Brown', hex: '#8B573F', r: 139, g: 87, b: 63, categoria: 'Tierra' },
  // Fila 3
  { id: 'pewter-gray', nombre: 'Pewter Gray', hex: '#919296', r: 145, g: 146, b: 150, categoria: 'Neutrales' },
  { id: 'ivy-green', nombre: 'Ivy Green', hex: '#6C8F76', r: 108, g: 143, b: 118, categoria: 'Verdes' },
  { id: 'teal', nombre: 'Teal', hex: '#208A8C', r: 32, g: 138, b: 140, categoria: 'Azules' },
  { id: 'yellow', nombre: 'Yellow', hex: '#E2CB32', r: 226, g: 203, b: 50, categoria: 'Cálidos' },
  // Fila 4
  { id: 'orange', nombre: 'Orange', hex: '#DE602E', r: 222, g: 96, b: 46, categoria: 'Cálidos' },
  { id: 'purple', nombre: 'Purple', hex: '#584B7C', r: 88, g: 75, b: 124, categoria: 'Cálidos' },
  { id: 'cherry-red', nombre: 'Cherry Red', hex: '#B64647', r: 182, g: 70, b: 71, categoria: 'Cálidos' },
  { id: 'gold', nombre: 'Gold', hex: '#C79138', r: 199, g: 145, b: 56, categoria: 'Cálidos' },
  // Fila 5
  { id: 'lilac', nombre: 'Lilac', hex: '#826EA3', r: 130, g: 110, b: 163, categoria: 'Cálidos' },
  { id: 'cream', nombre: 'Cream', hex: '#E1DFD2', r: 225, g: 223, b: 210, categoria: 'Neutrales' },
  { id: 'ivory', nombre: 'Ivory', hex: '#B3A481', r: 179, g: 164, b: 129, categoria: 'Tierra' },
  { id: 'aquamarine', nombre: 'Aquamarine', hex: '#17B2C4', r: 23, g: 178, b: 196, categoria: 'Azules' },
  // Fila 6
  { id: 'white', nombre: 'White', hex: '#EAEFEA', r: 234, g: 239, b: 234, categoria: 'Neutrales' },
  { id: 'raspberry-pink', nombre: 'Raspberry Pink', hex: '#8E2848', r: 142, g: 40, b: 72, categoria: 'Cálidos' },
  { id: 'charcoal-gray', nombre: 'Charcoal Gray', hex: '#56555A', r: 86, g: 85, b: 90, categoria: 'Neutrales' }
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
    subtitulo: '2 Color',
    imagenMuestra: 'linear-gradient(135deg, #CBD0CC 40%, #0E518D 100%)'
  },
  {
    id: 3,
    titulo: '3 Color Blend',
    subtitulo: '3 Color',
    imagenMuestra: 'linear-gradient(135deg, #CBD0CC 30%, #9EA0A1 60%, #282828 100%)'
  }
];

export const PATRONES_DISENO_3D: PatronDiseno3D[] = [
  {
    id: 'uniforme',
    nombre: 'Superficie de Virutas EPDM',
    descripcion: 'Empaquetado denso y prensado de fragmentos de caucho homogéneo.',
    icono: 'Shapes'
  },
  {
    id: 'moteado-terrazzo',
    nombre: 'Moteado Terrazzo Fleck',
    descripcion: 'Matriz base con incrustaciones angulares contrastantes de caucho.',
    icono: 'Sparkles'
  },
  {
    id: 'islas-parque',
    nombre: 'Islas y Curvas de Parque',
    descripcion: 'Diseño continuo de áreas de juego amortiguantes con curvas.',
    icono: 'Spline'
  },
  {
    id: 'geometria-rayuela',
    nombre: 'Celdas y Losetas de Salto',
    descripcion: 'Bloques de caucho modulares y rectangulares en relieve.',
    icono: 'Grid3x3'
  },
  {
    id: 'bandas-deportivas',
    nombre: 'Bandas de Pista Deportiva',
    descripcion: 'Franjas vulcanizadas de caucho amortiguante de alta resistencia.',
    icono: 'Rows'
  }
];
