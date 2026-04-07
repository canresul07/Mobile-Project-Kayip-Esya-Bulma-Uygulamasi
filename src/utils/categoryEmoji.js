export const getCategoryEmoji = (category) => {
  if (!category) return '🎒';
  if (category.includes('Çanta') || category.includes('Cüzdan')) return '💼';
  if (category.includes('Anahtar')) return '🔑';
  if (category.includes('Gözlük')) return '👓';
  if (category.includes('Telefon') || category.includes('Elektronik')) return '📱';
  if (category.includes('Kitap') || category.includes('Kırtasiye')) return '📚';
  if (category.includes('Kıyafet') || category.includes('Aksesuar')) return '👕';
  if (category.includes('Kimlik') || category.includes('Kart')) return '🃏';
  return '🎒';
};

export const CATEGORIES = [
  '💼 Çanta & Cüzdan',
  '🔑 Anahtar',
  '👓 Gözlük',
  '📱 Telefon & Elektronik',
  '📚 Kitap & Kırtasiye',
  '👕 Kıyafet & Aksesuar',
  '🃏 Kimlik & Kart',
  '🎒 Diğer',
];
