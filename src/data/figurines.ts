export interface Figurine {
  id: string;
  name: string;
  series: string;
  edition: string;
  price: string;
  rawPrice: number;
  description: string;
  src: string;
  bg: string;
  panel: string;
  material: string;
  height: string;
  weight: string;
  designer: string;
  releaseDate: string;
  status: 'In Stock' | 'Pre-order' | 'Low Stock' | 'Exclusive';
  features: string[];
}

export const IMAGES: Figurine[] = [
  {
    id: '01',
    name: 'CYBER BUNNY',
    series: 'SERIES 01 // TOON-BOT',
    edition: 'LIMITED 500 PCS',
    price: '$240',
    rawPrice: 240,
    description: 'High-density vinyl collectible with signature gloss finish, magnetic accessories, and precision-engineered 3D contours.',
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png',
    bg: '#F4845F',
    panel: '#F79B7F',
    material: 'Premium Vinyl + Metallic Acrylic Accents',
    height: '24.5 cm / 9.6"',
    weight: '820 g',
    designer: 'ToonHub Studio × M. Endo',
    releaseDate: 'Autumn 2026',
    status: 'In Stock',
    features: ['Articulated joints', 'Removable visor', 'Serialized baseplate', 'Display case included']
  },
  {
    id: '02',
    name: 'NEO KAIJU',
    series: 'SERIES 01 // ACID DINO',
    edition: 'LIMITED 350 PCS',
    price: '$280',
    rawPrice: 280,
    description: 'Bioluminescent matte green resin sculpted with futuristic spines, cybernetic armor, and dual mechanical tail segments.',
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png',
    bg: '#6BBF7A',
    panel: '#85CC92',
    material: 'Matte Cast Polyresin + Glow Pigments',
    height: '28.0 cm / 11.0"',
    weight: '1,150 g',
    designer: 'ToonHub Lab × K. Sato',
    releaseDate: 'Autumn 2026',
    status: 'Low Stock',
    features: ['UV-Reactive glow', 'Magnetic dorsal fins', 'Weighted bronze base', 'Certificate of Authenticity']
  },
  {
    id: '03',
    name: 'BUBBLE MECHA',
    series: 'SERIES 02 // CHERRY CRUSH',
    edition: 'LIMITED 250 PCS',
    price: '$310',
    rawPrice: 310,
    description: 'Soft-touch bubblegum pink chassis complemented by polished mirror-chrome parts and optical crystal visor dome.',
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png',
    bg: '#E882B4',
    panel: '#ED9DC4',
    material: 'Frosted Crystal Polycarbonate + Chrome Die-Cast',
    height: '22.0 cm / 8.7"',
    weight: '760 g',
    designer: 'ToonHub Workshop × Y. Lin',
    releaseDate: 'Winter 2026',
    status: 'Pre-order',
    features: ['Chrome electroplated finish', 'LED core lighting', 'Interchangeable faceplates', 'Collector tin box']
  },
  {
    id: '04',
    name: 'AERO DRIFTER',
    series: 'SERIES 02 // SKY SHIFT',
    edition: 'LIMITED 400 PCS',
    price: '$260',
    rawPrice: 260,
    description: 'Aerodynamic sky blue casing inspired by retro-futuristic supersonic racers and cloud speedster subcultures.',
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png',
    bg: '#6EB5FF',
    panel: '#8DC4FF',
    material: 'High-Impact Polystyrene + Matte Coating',
    height: '26.2 cm / 10.3"',
    weight: '940 g',
    designer: 'ToonHub Works × D. Vance',
    releaseDate: 'Winter 2026',
    status: 'Exclusive',
    features: ['Hover display stand', 'Custom racing decals', 'Rotatable booster thrusters', 'Numbered NFC chip']
  }
];
