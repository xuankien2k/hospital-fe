/**
 * % hoàn thành so với mức dự kiến: min(100, round(currentLevel / expectedLevel * 100)).
 * Dùng record.progress từ BE nếu có; bản ghi cũ thì suy từ currentLevel / expectedLevel.
 */
export function normalizeCriteriaLevel(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 1;
  return Math.min(5, Math.max(1, Math.round(num)));
}

/** Cùng quy tắc deriveCurrentLevelFromLevels / Criteria.calculateCurrentLevel (BE). */
export function deriveCurrentLevelFromLevels(lvls) {
  if (!lvls || !Array.isArray(lvls) || lvls.length === 0) return 1;
  const sorted = [...lvls].sort((a, b) => a.levelNumber - b.levelNumber);
  const level1 = sorted.find((l) => l.levelNumber === 1);
  const hasAnyLevel1Checked =
    level1?.subCriterias?.length > 0 &&
    level1.subCriterias.some((sc) => sc.status === true || sc.status === 'true');

  if (hasAnyLevel1Checked) {
    return 1;
  }

  let current = 0;
  for (const level of sorted) {
    if (level.levelNumber === 1) continue;
    if (!level.subCriterias?.length) break;
    const allDone = level.subCriterias.every((sc) => sc.status === true || sc.status === 'true');
    if (allDone) {
      current = level.levelNumber;
    } else {
      break;
    }
  }
  return current > 0 ? current : 1;
}

export function getCriteriaExpectedLevel(record) {
  return normalizeCriteriaLevel(record?.expectedLevel);
}

export function getCriteriaCurrentLevel(record) {
  if (record?.levels?.length) {
    return deriveCurrentLevelFromLevels(record.levels);
  }
  return normalizeCriteriaLevel(record?.currentLevel);
}

export function isCriteriaBelowExpectedLevel(record) {
  return getCriteriaCurrentLevel(record) < getCriteriaExpectedLevel(record);
}

export function getCriteriaProgressPercent(record) {
  if (record === null || record === undefined) return 0;
  if (
    record.progress !== undefined &&
    record.progress !== null &&
    Number.isFinite(Number(record.progress))
  ) {
    return Math.min(100, Math.max(0, Math.round(Number(record.progress))));
  }
  const exp = Math.max(1, getCriteriaExpectedLevel(record));
  let cur = getCriteriaCurrentLevel(record);
  if (cur >= exp) return 100;
  return Math.min(100, Math.round((cur / exp) * 100));
}

export function getCriteriaProgressStatus(percent) {
  const p = Math.min(100, Math.max(0, percent));
  if (p >= 100) return { label: 'Đã hoàn thành', tagColor: 'success' };
  if (p <= 0) return { label: 'Chưa hoàn thành', tagColor: 'default' };
  return { label: 'Đang thực hiện', tagColor: 'processing' };
}
