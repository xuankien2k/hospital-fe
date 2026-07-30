import dayjs from 'dayjs';
import { getCriteriaCurrentLevel } from '@/utils/criteriaProgress';
import { PART_LABELS } from '@/utils/reportParts';
import { CHAPTER_EXPORT_LABELS, PART_EXPORT_LABELS } from '../constants/criteriaExportLabels';

const escapeCsvCell = (value) => {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const toCsvLine = (row) => row.map(escapeCsvCell).join(',');

const sortCriteriaForExport = (items = []) =>
  [...items].sort((a, b) => {
    const partCmp = String(a.part || '').localeCompare(String(b.part || ''), 'vi', {
      numeric: true,
      sensitivity: 'base',
    });
    if (partCmp !== 0) return partCmp;

    const chapterCmp = String(a.chapter || '').localeCompare(String(b.chapter || ''), 'vi', {
      numeric: true,
      sensitivity: 'base',
    });
    if (chapterCmp !== 0) return chapterCmp;

    return String(a.code || '').localeCompare(String(b.code || ''), 'vi', {
      numeric: true,
      sensitivity: 'base',
    });
  });

const getDepartmentName = (record) =>
  record?.departmentId?.name || record?.department || record?.assignedUser?.department || '';

const buildUnmetSubcriteria = (record) => {
  const unmet = [];

  (record.levels || []).forEach((level) => {
    (level.subCriterias || []).forEach((subItem) => {
      if (!subItem?.status && subItem?.text) {
        unmet.push(String(subItem.text).trim());
      }
    });
  });

  return unmet.join('; ');
};

const withCountSuffix = (label, count) => {
  if (!label) {
    return `(${count})`;
  }

  if (/\(\d+\)/.test(label)) {
    return label.replace(/\(\d+\)/, `(${count})`);
  }

  return `${label} (${count})`;
};

const buildPartHeader = (part, count) => {
  const base =
    PART_EXPORT_LABELS[part] || `PHẦN ${part}. ${(PART_LABELS[part] || part).toUpperCase()}`;

  return [part, withCountSuffix(base, count), '', '', '', '', ''];
};

const buildChapterHeader = (chapter, count) => {
  const base = CHAPTER_EXPORT_LABELS[chapter] || chapter;
  return [chapter, withCountSuffix(base, count), '', '', '', '', ''];
};

const normalizeChapterKey = (chapter, code) => {
  const ch = String(chapter || '').trim();
  const c = String(code || '').trim();
  const fromChapter = ch.match(/^([A-E]\d+)/i);
  if (fromChapter) return fromChapter[1].toUpperCase();
  const fromCode = c.match(/^([A-E]\d+)/i);
  if (fromCode) return fromCode[1].toUpperCase();
  return ch;
};

/** Cùng quy tắc getChapterCoefficient ở BE — C3/C5 nhân hệ số 2. */
const getChapterCoefficient = (chapter, code) => {
  const chapterKey = normalizeChapterKey(chapter, code);
  if (!chapterKey) return 1;
  if (chapterKey === 'C3' || chapterKey === 'C5') return 2;
  return 1;
};

const buildWeightedTotals = (sorted = []) => {
  let totalCurrent = 0;
  let totalExpected = 0;
  let weightUnits = 0;

  sorted.forEach((item) => {
    const coefficient = getChapterCoefficient(item.chapter, item.code);
    const currentLevel = getCriteriaCurrentLevel(item) || 0;
    const expectedLevel = Number(item.expectedLevel) || 0;

    totalCurrent += currentLevel * coefficient;
    totalExpected += expectedLevel * coefficient;
    weightUnits += coefficient;
  });

  return { totalCurrent, totalExpected, weightUnits };
};

const buildCriteriaRow = (record) => {
  const currentLevel = getCriteriaCurrentLevel(record);

  return [
    record.code || '',
    record.name || '',
    '',
    currentLevel > 0 ? String(currentLevel) : '',
    (record.expectedLevel ?? '') !== '' ? String(record.expectedLevel) : '',
    getDepartmentName(record),
    buildUnmetSubcriteria(record),
  ];
};

export function buildCriteriaExportRows(criteriaList = []) {
  const sorted = sortCriteriaForExport(criteriaList);
  const planYear = dayjs().year();
  const rows = [
    [
      'Mã số',
      'Chỉ tiêu',
      '',
      'KQ đánh giá',
      `Điểm kế hoạch năm ${planYear}`,
      'Khoa/ phòng phụ trách',
      'Tiểu mục hoặc lý do chưa đạt',
    ],
  ];

  if (!sorted.length) {
    return rows;
  }

  const partCounts = {};
  const chapterCounts = {};

  sorted.forEach((item) => {
    partCounts[item.part] = (partCounts[item.part] || 0) + 1;
    const chapterKey = `${item.part}::${item.chapter}`;
    chapterCounts[chapterKey] = (chapterCounts[chapterKey] || 0) + 1;
  });

  let lastPart = null;
  let lastChapter = null;

  sorted.forEach((item) => {
    if (item.part && item.part !== lastPart) {
      rows.push(buildPartHeader(item.part, partCounts[item.part] || 0));
      lastPart = item.part;
      lastChapter = null;
    }

    if (item.chapter && item.chapter !== lastChapter) {
      const chapterKey = `${item.part}::${item.chapter}`;
      rows.push(buildChapterHeader(item.chapter, chapterCounts[chapterKey] || 0));
      lastChapter = item.chapter;
    }

    rows.push(buildCriteriaRow(item));
  });

  const { totalCurrent, totalExpected, weightUnits } = buildWeightedTotals(sorted);

  rows.push(['', '', '', String(totalCurrent), String(totalExpected), '', '']);
  rows.push([
    '',
    '',
    '',
    weightUnits ? String(totalCurrent / weightUnits) : '0',
    weightUnits ? String(totalExpected / weightUnits) : '0',
    '',
    '',
  ]);

  return rows;
}

export function buildCriteriaExportCsv(criteriaList = []) {
  const rows = buildCriteriaExportRows(criteriaList);
  return `\uFEFF${rows.map(toCsvLine).join('\n')}`;
}

export function downloadCriteriaList(criteriaList = []) {
  const csv = buildCriteriaExportCsv(criteriaList);
  if (!criteriaList.length) {
    return false;
  }

  const filename = `Danh-sach-tieu-chi-${dayjs().format('YYYYMMDD-HHmm')}.csv`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return true;
}
