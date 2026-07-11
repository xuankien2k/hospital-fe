export const PART_LABELS = {
  A: 'Hướng đến người bệnh',
  B: 'Phát triển nguồn nhân lực',
  C: 'Hoạt động chuyên môn',
  D: 'Cải tiến chất lượng',
  E: 'Tiêu chí chuyên khoa',
};

export const PART_ORDER = ['A', 'B', 'C', 'D', 'E'];

export const getPartDisplayLabel = (part, partLabel) => {
  if (part && PART_LABELS[part]) {
    return `${part}. ${PART_LABELS[part]}`;
  }
  if (partLabel) return partLabel;
  if (part) return `Phần ${part}`;
  return 'Khác';
};

export const PART_FILTER_OPTIONS = [
  { label: 'Tất cả nhóm', value: '' },
  ...PART_ORDER.map((part) => ({
    label: getPartDisplayLabel(part),
    value: part,
  })),
];
