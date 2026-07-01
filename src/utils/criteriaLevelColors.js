export const LEVEL_COLORS = {
  1: { bg: '#D9534F', color: '#ffffff' },
  2: { bg: '#F0AD4E', color: '#000000' },
  3: { bg: '#FFEB3B', color: '#000000' },
  4: { bg: '#5CB85C', color: '#ffffff' },
  5: { bg: '#449D44', color: '#ffffff' },
};

export const getLevelColorStyle = (level) => {
  const lvl = Math.min(5, Math.max(1, Number(level) || 1));
  return LEVEL_COLORS[lvl] || LEVEL_COLORS[1];
};

export const getLevelNumberFromLabel = (label) => {
  const match = String(label || '').match(/(\d+)/);
  return match ? Number(match[1]) : 1;
};
