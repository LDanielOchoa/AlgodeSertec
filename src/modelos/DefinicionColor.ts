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
  { id: 'dark-blue', nombre: 'Dark Blue - 247', hex: '#0E518D', r: 14, g: 81, b: 141, categoria: 'Azules' },
  { id: 'light-gray', nombre: 'Light Gray - 236', hex: '#CBD0CC', r: 203, g: 208, b: 204, categoria: 'Neutrales' },
  { id: 'medium-grey', nombre: 'Medium Grey - 207', hex: '#9EA0A1', r: 158, g: 160, b: 161, categoria: 'Neutrales' },
  { id: 'black', nombre: 'Black - 200', hex: '#282828', r: 40, g: 40, b: 40, categoria: 'Neutrales' },
  { id: 'pearl', nombre: 'White / Pearl - 211', hex: '#E2DFD2', r: 226, g: 223, b: 210, categoria: 'Neutrales' },
  { id: 'beige', nombre: 'Beige - 204', hex: '#D5C298', r: 213, g: 194, b: 152, categoria: 'Tierra' },
  { id: 'eggshell', nombre: 'Eggshell - 262', hex: '#E5E3CE', r: 229, g: 227, b: 206, categoria: 'Tierra' },
  { id: 'brown', nombre: 'Brown - 206', hex: '#A27436', r: 162, g: 116, b: 54, categoria: 'Tierra' },
  { id: 'red', nombre: 'Red - 202', hex: '#842B27', r: 132, g: 43, b: 39, categoria: 'Cálidos' },
  { id: 'light-green', nombre: 'Light Green - 231', hex: '#8EB280', r: 142, g: 178, b: 128, categoria: 'Verdes' },
  { id: 'dark-green', nombre: 'Dark Green - 205', hex: '#2D5324', r: 45, g: 83, b: 36, categoria: 'Verdes' },
  { id: 'light-blue', nombre: 'Light Blue - 203', hex: '#6A93B0', r: 106, g: 147, b: 176, categoria: 'Azules' },
  { id: 'medium-blue', nombre: 'Medium Blue - 238', hex: '#078CEB', r: 7, g: 140, b: 235, categoria: 'Azules' },
  { id: 'teal', nombre: 'Teal', hex: '#7EB1B2', r: 126, g: 177, b: 178, categoria: 'Azules' },
  { id: 'yellow', nombre: 'Mustard Yellow - 208', hex: '#D6A128', r: 214, g: 161, b: 40, categoria: 'Cálidos' }
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
