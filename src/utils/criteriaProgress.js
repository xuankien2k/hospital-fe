/**
 * % hoàn thành so với mức dự kiến: min(100, round(currentLevel / expectedLevel * 100)).
 * Dùng record.progress từ BE nếu có; bản ghi cũ thì suy từ currentLevel / expectedLevel.
 */
export function getCriteriaProgressPercent(record) {
  if (record === null || record === undefined) return 0;
  if (
    record.progress !== undefined &&
    record.progress !== null &&
    Number.isFinite(Number(record.progress))
  ) {
    return Math.min(100, Math.max(0, Math.round(Number(record.progress))));
  }
  const exp = Math.max(1, Number(record.expectedLevel) || 1);
  let cur = Number(record.currentLevel);
  if (!Number.isFinite(cur) || cur === 0) cur = 1;
  if (cur >= exp) return 100;
  return Math.min(100, Math.round((cur / exp) * 100));
}

export function getCriteriaProgressStatus(percent) {
  const p = Math.min(100, Math.max(0, percent));
  if (p >= 100) return { label: 'Đã hoàn thành', tagColor: 'success' };
  if (p <= 0) return { label: 'Chưa hoàn thành', tagColor: 'default' };
  return { label: 'Đang thực hiện', tagColor: 'processing' };
}
