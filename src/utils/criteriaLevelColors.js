export const LEVEL_COLORS = {
  1: { bg: 'rgba(58, 74, 255, 0.1)', color: '#3A4AFF' },
  2: { bg: 'rgba(58, 74, 255, 0.3)', color: '#141414' },
  3: { bg: 'rgba(58, 74, 255, 0.5)', color: '#141414' },
  4: { bg: 'rgba(58, 74, 255, 0.7)', color: '#ffffff' },
  5: { bg: 'rgba(58, 74, 255, 1)', color: '#ffffff' },
};

export const getLevelColorStyle = (level) => {
  const lvl = Math.min(5, Math.max(1, Number(level) || 1));
  return LEVEL_COLORS[lvl] || LEVEL_COLORS[1];
};

export const getLevelNumberFromLabel = (label) => {
  const match = String(label || '').match(/(\d+)/);
  return match ? Number(match[1]) : 1;
};
