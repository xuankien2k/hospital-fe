import dayjs from 'dayjs';
import { getPartDisplayLabel } from '@/utils/reportParts';

const PERIOD_LABELS = {
  '1m': '1-thang',
  '1q': '1-quy',
  '6m': '6-thang',
  '1y': '1-nam',
};

const PERIOD_TITLES = {
  '1m': '1 tháng',
  '1q': '1 quý',
  '6m': '6 tháng',
  '1y': '1 năm',
};

const escapeCsvCell = (value) => {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const toCsvLine = (row) => row.map(escapeCsvCell).join(',');

const buildOverallSection = (overallTrend = []) => {
  const rows = [
    ['=== ĐIỂM TRUNG BÌNH CHUNG ==='],
    ['Mốc', 'Điểm TB', 'Số TC áp dụng', 'Tỷ lệ áp dụng (%)'],
  ];
  overallTrend.forEach((item) => {
    rows.push([
      item.label,
      item.overallScore?.toFixed?.(2) ?? item.overallScore,
      item.totalApplied,
      item.appliedPercent?.toFixed?.(1) ?? item.appliedPercent,
    ]);
  });
  return rows;
};

const buildPartSection = (byPartTrend = {}, periodLabels = []) => {
  const rows = [['=== THEO NHÓM TIÊU CHÍ ===']];
  const header = ['Nhóm tiêu chí'];
  periodLabels.forEach((label) => {
    header.push(`${label} (Điểm TB)`, `${label} (Số TC)`);
  });
  rows.push(header);

  Object.entries(byPartTrend).forEach(([part, points]) => {
    const pointMap = new Map((points || []).map((item) => [item.label, item]));
    const row = [getPartDisplayLabel(part)];
    periodLabels.forEach((label) => {
      const point = pointMap.get(label);
      row.push(point ? point.avgScore.toFixed(2) : '', point ? point.count : '');
    });
    rows.push(row);
  });

  return rows;
};

const buildDepartmentSection = (byDepartmentTrend = [], periodLabels = []) => {
  const rows = [['=== THEO KHOA/PHÒNG ===']];
  const header = ['Khoa/phòng'];
  periodLabels.forEach((label) => {
    header.push(`${label} (Điểm TB)`, `${label} (Hạng)`, `${label} (Số TC)`);
  });
  rows.push(header);

  (byDepartmentTrend || []).forEach((dept) => {
    const pointMap = new Map((dept.points || []).map((item) => [item.label, item]));
    const row = [dept.name || 'Chưa gán'];
    periodLabels.forEach((label) => {
      const point = pointMap.get(label);
      row.push(point ? point.avgScore.toFixed(2) : '', point?.rank ?? '', point ? point.count : '');
    });
    rows.push(row);
  });

  return rows;
};

const buildCriteriaSection = (byCriteriaTrend = [], periodLabels = []) => {
  const rows = [['=== CHI TIẾT TỪNG TIÊU CHÍ ===']];
  const header = ['Mã TC', 'Tên tiêu chí', 'Nhóm tiêu chí', 'Khoa/phòng', ...periodLabels];
  rows.push(header);

  (byCriteriaTrend || []).forEach((item) => {
    const pointMap = new Map((item.points || []).map((point) => [point.label, point]));
    const row = [
      item.code,
      item.name,
      getPartDisplayLabel(item.part, item.partLabel),
      item.departmentName || 'Chưa gán',
    ];
    periodLabels.forEach((label) => {
      const point = pointMap.get(label);
      row.push(point ? point.currentLevel : '');
    });
    rows.push(row);
  });

  return rows;
};

export function buildTrendSnapshotCsv(trend, periodFilter = '1m') {
  if (!trend?.snapshotCount) {
    return null;
  }

  const periodLabels = (trend.overallTrend || []).map((item) => item.label);
  const rows = [
    ['BÁO CÁO XU HƯỚNG SNAPSHOT'],
    ['Kỳ lọc', PERIOD_TITLES[periodFilter] || periodFilter],
    ['Số mốc snapshot', trend.snapshotCount],
    ['Xuất lúc', dayjs().format('DD/MM/YYYY HH:mm')],
    [''],
    ...buildOverallSection(trend.overallTrend),
    [''],
    ...buildPartSection(trend.byPartTrend, periodLabels),
    [''],
    ...buildDepartmentSection(trend.byDepartmentTrend, periodLabels),
    [''],
    ...buildCriteriaSection(trend.byCriteriaTrend, periodLabels),
  ];

  return `\uFEFF${rows.map(toCsvLine).join('\n')}`;
}

export function downloadTrendSnapshot(trend, periodFilter = '1m') {
  const csv = buildTrendSnapshotCsv(trend, periodFilter);
  if (!csv) {
    return false;
  }

  const periodSlug = PERIOD_LABELS[periodFilter] || periodFilter;
  const filename = `Xu-huong-snapshot-${periodSlug}-${dayjs().format('YYYYMMDD-HHmm')}.csv`;
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
