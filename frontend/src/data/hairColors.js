export const skinTones = [
  { id: 1, name: 'Muy Claro', color: '#FDBBAE', description: 'Piel muy clara, casi blanca' },
  { id: 2, name: 'Claro', color: '#F4C2A1', description: 'Piel clara' },
  { id: 3, name: 'Claro-Medio', color: '#E6B89C', description: 'Piel clara a media' },
  { id: 4, name: 'Medio', color: '#D4A574', description: 'Piel media' },
  { id: 5, name: 'Medio-Oscuro', color: '#B8956A', description: 'Piel media a oscura' },
  { id: 6, name: 'Oscuro', color: '#8B6F47', description: 'Piel oscura' },
  { id: 7, name: 'Muy Oscuro', color: '#5C4A37', description: 'Piel muy oscura' },
];

export const hairColorRecommendations = {
  1: [
    { name: 'Rubio platino', color: '#F8E9D0', hex: '#F8E9D0', price: 70 },
    { name: 'Rubio nórdico', color: '#F4E0C0', hex: '#F4E0C0', price: 70 },
    { name: 'Castaño chocolate', color: '#70462D', hex: '#70462D', price: 65 },
    { name: 'Rubio perlado', color: '#EEDCC6', hex: '#EEDCC6', price: 70 },
    { name: 'Rubio dorado suave', color: '#E2C58F', hex: '#E2C58F', price: 70 },
  ],
  2: [
    { name: 'Rubio dorado', color: '#E0C074', hex: '#E0C074', price: 70 },
    { name: 'Rubio arena', color: '#D9B384', hex: '#D9B384', price: 70 },
    { name: 'Rubio beige', color: '#D6B69B', hex: '#D6B69B', price: 70 },
    { name: 'Castaño claro', color: '#B98A63', hex: '#B98A63', price: 65 },
    { name: 'Castaño dorado', color: '#B07A4D', hex: '#B07A4D', price: 65 },
  ],
  3: [
    { name: 'Rubio oscuro', color: '#CFA06B', hex: '#CFA06B', price: 70 },
    { name: 'Castaño claro', color: '#B98A63', hex: '#B98A63', price: 65 },
    { name: 'Castaño dorado', color: '#B07A4D', hex: '#B07A4D', price: 65 },
    { name: 'Castaño cobrizo', color: '#A35F32', hex: '#A35F32', price: 65 },
    { name: 'Castaño medio', color: '#8D6744', hex: '#8D6744', price: 65 },
  ],
  4: [
    { name: 'Castaño claro', color: '#B98A63', hex: '#B98A63', price: 65 },
    { name: 'Castaño medio', color: '#8D6744', hex: '#8D6744', price: 65 },
    { name: 'Castaño chocolate', color: '#70462D', hex: '#70462D', price: 65 },
    { name: 'Caoba cálido', color: '#8A3F2C', hex: '#8A3F2C', price: 65 },
    { name: 'Marrón profundo', color: '#5A3624', hex: '#5A3624', price: 65 },
  ],
  5: [
    { name: 'Castaño medio', color: '#8D6744', hex: '#8D6744', price: 65 },
    { name: 'Castaño oscuro', color: '#5F3A24', hex: '#5F3A24', price: 65 },
    { name: 'Chocolate intenso', color: '#4B2A1A', hex: '#4B2A1A', price: 65 },
    { name: 'Caoba oscuro', color: '#592A1F', hex: '#592A1F', price: 65 },
    { name: 'Negro suave', color: '#2A1C18', hex: '#2A1C18', price: 65 },
  ],
  6: [
    { name: 'Castaño oscuro', color: '#5F3A24', hex: '#5F3A24', price: 65 },
    { name: 'Chocolate intenso', color: '#4B2A1A', hex: '#4B2A1A', price: 65 },
    { name: 'Caoba oscuro', color: '#592A1F', hex: '#592A1F', price: 65 },
    { name: 'Negro azulado', color: '#1F1A2E', hex: '#1F1A2E', price: 70 },
    { name: 'Negro intenso', color: '#141414', hex: '#141414', price: 65 },
  ],
  7: [
    { name: 'Chocolate oscuro', color: '#3B2014', hex: '#3B2014', price: 65 },
    { name: 'Caoba profundo', color: '#451B15', hex: '#451B15', price: 65 },
    { name: 'Negro azulado', color: '#1F1A2E', hex: '#1F1A2E', price: 70 },
    { name: 'Negro intenso', color: '#141414', hex: '#141414', price: 65 },
    { name: 'Negro ébano', color: '#090909', hex: '#090909', price: 65 },
  ],
};

const allColorsCache = Object.values(hairColorRecommendations)
  .flat()
  .reduce((unique, color) => {
    if (!unique.find((item) => item.name === color.name)) {
      unique.push(color);
    }
    return unique;
  }, []);

export const getAllHairColors = () => [...allColorsCache];

