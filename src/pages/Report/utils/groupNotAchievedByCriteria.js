/** Gom các dòng tiểu mục Section V theo criteriaId (thay rowSpan bảng desktop). */
export function groupNotAchievedByCriteria(rows = []) {
  const map = new Map();

  rows.forEach((row) => {
    const key = row.criteriaId;
    if (!map.has(key)) {
      map.set(key, {
        criteriaId: row.criteriaId,
        code: row.code,
        criteriaName: row.criteriaName,
        currentLevel: row.currentLevel,
        expectedLevel: row.expectedLevel,
        expectedLevelCompletionDate: row.expectedLevelCompletionDate,
        departmentName: row.departmentName,
        subItems: [],
      });
    }

    map.get(key).subItems.push({
      levelNumber: row.levelNumber,
      subOrderNumber: row.subOrderNumber,
      subcriteriaText: row.subcriteriaText,
      isDone: row.isDone,
      highlightRed: row.highlightRed,
    });
  });

  return [...map.values()];
}
