export const Colors = {
  // Backgrounds — matte black scale
  background: '#080808',
  card: '#0F0F0F',
  cardElevated: '#161616',
  border: '#1E1E1E',
  borderLight: '#282828',

  // Text — silver scale
  text: '#E8E8E8',
  textSecondary: '#C8C8C8',
  textMuted: '#707070',
  textDim: '#3A3A3A',

  // Accent — deep crimson red from logo
  accent: '#C0152A',
  accentDark: '#8B0000',
  accentSubtle: '#1A0000',
  accentBorder: '#3D0000',

  // Status
  bad: '#1A0000',
  badBorder: '#8B0000',
  good: '#0A1A0A',
  goodBorder: '#1E5C1E',
  price: '#1A1400',
  priceBorder: '#4A3800',
  danger: '#C0152A',
  caution: '#8B5500',
  safe: '#1E5C1E',

  // Detection box colors
  boxPerson: '#C0152A',
  boxAnimal: '#8B5500',
  boxPlant: '#1E5C1E',
  boxFood: '#4A3800',
  boxObject: '#C8C8C8',
} as const;

export type ColorKey = keyof typeof Colors;