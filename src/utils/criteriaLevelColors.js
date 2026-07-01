export const LEVEL_COLORS = {
  1: { bg: '#2A2A2A', color: '#ffffff' },
  2: { bg: '#9E0003', color: '#ffffff' },
  3: { bg: '#E61515', color: '#ffffff' },
  4: { bg: '#FF6600', color: '#ffffff' },
  5: { bg: '#FFD000', color: '#141414' },
};

export const getLevelColorStyle = (level) => {
  const lvl = Math.min(5, Math.max(1, Number(level) || 1));
  return LEVEL_COLORS[lvl] || LEVEL_COLORS[1];
};

export const getLevelNumberFromLabel = (label) => {
  const match = String(label || '').match(/(\d+)/);
  return match ? Number(match[1]) : 1;
};
