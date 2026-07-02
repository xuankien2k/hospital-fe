export const LEVEL_COLORS = {
  0: { bg: '#f0f0f0', color: '#595959' },
  1: { bg: '#2A2A2A', color: '#ffffff' },
  2: { bg: '#9E0003', color: '#ffffff' },
  3: { bg: '#E61515', color: '#ffffff' },
  4: { bg: '#FF6600', color: '#ffffff' },
  5: { bg: '#FFD000', color: '#141414' },
};

export const getLevelColorStyle = (level) => {
  const lvl = Math.min(5, Math.max(0, Number(level) || 0));
  return LEVEL_COLORS[lvl] || LEVEL_COLORS[0];
};

export const getLevelNumberFromLabel = (label) => {
  const match = String(label || '').match(/(\d+)/);
  return match ? Number(match[1]) : 1;
};
