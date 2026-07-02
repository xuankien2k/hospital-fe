import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useModel } from '@umijs/max';
import { Table, Card, message, Tag, Progress, Typography, Row, Col, Tooltip, Button } from 'antd';
import { InfoCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import axiosInstance from '../../utils/axiosInstance';
import dayjs from 'dayjs';
import {
  getCriteriaProgressPercent,
  getCriteriaProgressStatus,
  getCriteriaCurrentLevel,
  getCriteriaExpectedLevel,
  isCriteriaBelowExpectedLevel,
  countCriteriaByGoalStatus,
} from '../../utils/criteriaProgress';
import { canFilterByDepartment } from '../../utils/departments';
import { isContentAdmin } from '../../utils/roles';
import { getLevelColorStyle } from '../../utils/criteriaLevelColors';
import { BRAND_COLOR, BRAND_COLOR_LIGHT_BG } from '../../utils/brandColors';
import { getCurrentUser as getStoredUser } from '../../utils/authStorage';

const { Title, Text } = Typography;

const SHOW_SECTION_I_II_TABLES = false;
const SHOW_SECTION_III_TABLE = false;

const attachGroupRowSpan = (rows) =>
  rows.map((row, index, arr) => {
    const isFirst = index === 0 || arr[index - 1].criteriaId !== row.criteriaId;
    const groupSize = isFirst ? arr.filter((item) => item.criteriaId === row.criteriaId).length : 0;
    return {
      ...row,
      _rowSpan: isFirst ? groupSize : 0,
    };
  });

const PART_LEVELS = [1, 2, 3, 4, 5];
const DEPT_SCORE_MAX = 5;
const DEPT_ROW_HEIGHT = 28;

const DepartmentRankingChart = ({ data }) => {
  const rows = useMemo(
    () =>
      [...(data || [])]
        .map((item) => ({
          name: item.name,
          rank: Number(item.rank) || 0,
          avgScore: Number(Number(item.avgScore).toFixed(2)),
          count: Number(item.count) || 0,
        }))
        .sort((a, b) => a.rank - b.rank),
    [data],
  );

  const getBarColor = (rank, total) => {
    if (total <= 1) return BRAND_COLOR;
    const opacity = Math.max(0.35, 1 - ((rank - 1) / (total - 1)) * 0.65);
    return `rgba(58, 74, 255, ${opacity.toFixed(2)})`;
  };

  const renderRowTooltip = (row) => (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{row.name}</div>
      <div>Xếp hạng: {row.rank}</div>
      <div>Điểm trung bình: {row.avgScore.toFixed(2)}</div>
      <div style={{ marginTop: 4, color: '#8c8c8c' }}>Số tiêu chí phụ trách: {row.count}</div>
    </div>
  );

  if (!rows.length) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: '#8c8c8c',
          background: '#fafafa',
          borderRadius: 8,
        }}
      >
        Chưa có dữ liệu theo khoa/phòng
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 8 }}>
      {rows.map((row) => (
        <div
          key={`${row.rank}-${row.name}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 28,
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: row.rank <= 3 ? BRAND_COLOR : BRAND_COLOR_LIGHT_BG,
                color: row.rank <= 3 ? '#ffffff' : BRAND_COLOR,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {row.rank}
            </div>
          </div>
          <div
            style={{
              width: 120,
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 600,
              color: '#434343',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={row.name}
          >
            {row.name}
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                height: DEPT_ROW_HEIGHT,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Tooltip title={renderRowTooltip(row)} styles={{ root: { width: '100%' } }}>
                <div
                  style={{
                    width: `${(row.avgScore / DEPT_SCORE_MAX) * 100}%`,
                    minWidth: row.avgScore > 0 ? 20 : 0,
                    height: '100%',
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: getBarColor(row.rank, rows.length),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 6,
                    cursor: 'pointer',
                  }}
                >
                  {(row.avgScore / DEPT_SCORE_MAX) * 100 >= 12 ? (
                    <span style={{ color: '#ffffff', fontSize: 11, fontWeight: 700 }}>
                      {row.avgScore.toFixed(2)}
                    </span>
                  ) : null}
                </div>
              </Tooltip>
            </div>
            <div
              style={{
                width: 44,
                flexShrink: 0,
                textAlign: 'right',
                fontWeight: 700,
                fontSize: 12,
                color: BRAND_COLOR,
              }}
            >
              {row.avgScore.toFixed(2)}
            </div>
            <div
              style={{
                width: 56,
                flexShrink: 0,
                textAlign: 'right',
                fontSize: 11,
                color: '#8c8c8c',
              }}
            >
              {row.count} TC
            </div>
          </div>
        </div>
      ))}
      <div
        style={{
          marginLeft: 156,
          marginTop: 2,
          paddingTop: 6,
          borderTop: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: '#8c8c8c',
        }}
      >
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginTop: 10,
          fontSize: 12,
          color: '#595959',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 14,
              height: 8,
              backgroundColor: BRAND_COLOR,
              borderRadius: 2,
              display: 'inline-block',
            }}
          />
          Điểm trung bình (0–5)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>3 TC</span>
          Số tiêu chí phụ trách
        </span>
      </div>
    </div>
  );
};

const LevelLegend = () => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px 20px',
      marginTop: 16,
      paddingTop: 12,
      borderTop: '1px solid #f0f0f0',
    }}
  >
    {PART_LEVELS.map((level) => {
      const levelStyle = getLevelColorStyle(level);
      return (
        <div
          key={level}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#595959' }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              backgroundColor: levelStyle.bg,
              flexShrink: 0,
            }}
          />
          <span>{`Mức ${level}`}</span>
        </div>
      );
    })}
  </div>
);

const PartGroupLevelStackedChart = ({ data }) => {
  const rows = useMemo(
    () =>
      (data || []).map((item) => ({
        ...item,
        displayLabel: `${item.part}. ${item.label}`,
        count: Number(item.count) || 0,
        avgScore: Number(item.avgScore) || 0,
        levelCounts: PART_LEVELS.map((level) => ({
          level,
          levelLabel: `Mức ${level}`,
          count: Number(item.byLevel?.[`level${level}`]) || 0,
          ...getLevelColorStyle(level),
        })),
      })),
    [data],
  );

  const maxCount = useMemo(() => Math.max(1, ...rows.map((row) => row.count)), [rows]);

  const renderRowTooltip = (row) => (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{row.displayLabel}</div>
      {row.levelCounts
        .filter((segment) => segment.count > 0)
        .map((segment) => (
          <div key={segment.level}>
            {segment.levelLabel}: {segment.count} tiêu chí
          </div>
        ))}
      <div style={{ marginTop: 8, fontWeight: 600 }}>
        Điểm trung bình: {row.avgScore.toFixed(2)}
      </div>
    </div>
  );

  if (!rows.length) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: '#8c8c8c',
          background: '#fafafa',
          borderRadius: 8,
        }}
      >
        Chưa có dữ liệu theo nhóm tiêu chí
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 8 }}>
      {rows.map((row) => (
        <div
          key={row.part}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 220,
              flexShrink: 0,
              fontSize: 13,
              color: '#434343',
              lineHeight: 1.35,
            }}
          >
            {row.displayLabel}
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{ flex: 1, minWidth: 0, height: 50, display: 'flex', alignItems: 'center' }}
            >
              {row.count > 0 ? (
                <Tooltip title={renderRowTooltip(row)} styles={{ root: { width: '100%' } }}>
                  <div
                    style={{
                      display: 'flex',
                      width: `${(row.count / maxCount) * 100}%`,
                      minWidth: 28,
                      height: '100%',
                      borderRadius: '0 4px 4px 0',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    {row.levelCounts.map((segment) => {
                      if (!segment.count) return null;
                      const widthPercent = (segment.count / row.count) * 100;
                      return (
                        <div
                          key={segment.level}
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: segment.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: widthPercent >= 4 ? undefined : 2,
                            height: '100%',
                          }}
                        >
                          {widthPercent >= 14 ? (
                            <span style={{ color: segment.color, fontSize: 12, fontWeight: 600 }}>
                              {segment.count}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </Tooltip>
              ) : (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Không có tiêu chí
                </Text>
              )}
            </div>
            <div
              style={{
                width: 40,
                flexShrink: 0,
                textAlign: 'right',
                fontWeight: 600,
                fontSize: 13,
                color: '#141414',
              }}
            >
              {row.count}
            </div>
          </div>
        </div>
      ))}
      <div
        style={{
          marginLeft: 232,
          marginTop: 4,
          paddingTop: 8,
          borderTop: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: '#8c8c8c',
        }}
      >
        <span>0</span>
        <span>{Math.round(maxCount / 2)}</span>
        <span>{maxCount}</span>
      </div>
      <LevelLegend />
    </div>
  );
};

const LEVEL_COLOR_RANGE = PART_LEVELS.map((level) => getLevelColorStyle(level).bg);
const LEVEL_LABELS = PART_LEVELS.map((level) => `Mức ${level}`);

const LevelDistributionDonutChart = ({ data, total }) => {
  const totalApplied = Number(total) || 0;

  const chartData = useMemo(() => {
    const safeTotal = totalApplied || 0;
    return (data || [])
      .map((item) => {
        const count = Number(item.count) || 0;
        const percent = safeTotal ? (count / safeTotal) * 100 : 0;
        return {
          level: item.level,
          count,
          percent,
        };
      })
      .filter((item) => item.count > 0);
  }, [data, totalApplied]);

  const legendItems = useMemo(
    () =>
      PART_LEVELS.map((levelNum) => {
        const levelLabel = `Mức ${levelNum}`;
        const found = (data || []).find((item) => item.level === levelLabel);
        const count = Number(found?.count) || 0;
        const percent = totalApplied ? (count / totalApplied) * 100 : 0;
        return {
          level: levelLabel,
          count,
          percent,
          ...getLevelColorStyle(levelNum),
        };
      }),
    [data, totalApplied],
  );

  const pieConfig = useMemo(
    () => ({
      data: chartData,
      angleField: 'count',
      colorField: 'level',
      innerRadius: 0.62,
      radius: 0.88,
      height: 320,
      legend: false,
      scale: {
        color: {
          domain: LEVEL_LABELS,
          range: LEVEL_COLOR_RANGE,
        },
      },
      label: {
        position: 'outside',
        text: (datum) => `${Math.round(datum.percent)}%`,
        style: {
          fontSize: 12,
          fontWeight: 500,
          fill: '#595959',
        },
      },
      tooltip: {
        title: (datum) => datum.level,
        items: [
          (datum) => ({
            name: 'Số tiêu chí đang đạt',
            value: datum.count,
          }),
          (datum) => ({
            name: 'Tỷ lệ',
            value: `${Math.round(datum.percent)}%`,
          }),
        ],
      },
      annotations: [
        {
          type: 'text',
          style: {
            text: String(totalApplied),
            x: '50%',
            y: '46%',
            textAlign: 'center',
            fontSize: 28,
            fontWeight: 700,
            fill: '#141414',
          },
        },
        {
          type: 'text',
          style: {
            text: 'Tiêu chí áp dụng',
            x: '50%',
            y: '56%',
            textAlign: 'center',
            fontSize: 12,
            fill: '#8c8c8c',
          },
        },
      ],
    }),
    [chartData, totalApplied],
  );

  if (!chartData.length) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: '#8c8c8c',
          background: '#fafafa',
          borderRadius: 8,
        }}
      >
        Chưa có dữ liệu phân bố theo mức
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 96,
        flexWrap: 'wrap',
        padding: '8px 16px',
      }}
    >
      <div style={{ width: 320, flexShrink: 0 }}>
        <Pie {...pieConfig} />
      </div>
      <div style={{ flex: '0 1 360px', minWidth: 260 }}>
        {legendItems.map((item) => (
          <div
            key={item.level}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                backgroundColor: item.bg,
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#141414', lineHeight: 1.3 }}>
                {item.level}
              </div>
              <div style={{ fontSize: 14, color: '#8c8c8c', marginTop: 4, lineHeight: 1.4 }}>
                {item.count} tiêu chí · {Math.round(item.percent)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SECTION_GAP = 32;
const SECTION_TITLE_STYLE = {
  margin: 0,
  marginBottom: 24,
  fontSize: 18,
  fontWeight: 600,
  color: '#141414',
  lineHeight: 1.4,
};
const CHART_PANEL_STYLE = {
  marginBottom: 24,
  padding: '20px 24px 24px',
  background: '#fff',
  border: '1px solid #e8e8e8',
  borderRadius: 12,
};

const ReportChartPanel = ({ title, description, children }) => (
  <div style={CHART_PANEL_STYLE}>
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#141414', lineHeight: 1.4 }}>
        {title}
      </div>
      {description ? (
        <Text
          type="secondary"
          style={{ display: 'block', marginTop: 6, fontSize: 13, lineHeight: 1.5 }}
        >
          {description}
        </Text>
      ) : null}
    </div>
    {children}
  </div>
);

const REPORT_CARD_STYLE = {
  marginBottom: SECTION_GAP,
  borderRadius: 12,
  border: '1px solid #e8e8e8',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
};
const REPORT_TABLE_CLASS = 'report-quality-table';

const ReportSectionTitle = ({ children }) => (
  <Title level={4} style={SECTION_TITLE_STYLE}>
    {children}
  </Title>
);

const SUMMARY_STAT_THEME = {
  accent: BRAND_COLOR,
  bg: BRAND_COLOR_LIGHT_BG,
};

const GOAL_STATUS_THEMES = {
  achieved: { accent: '#16a34a', bg: '#f0fdf4' },
  improving: { accent: '#ca8a04', bg: '#fffbeb' },
  failed: { accent: '#E61515', bg: '#fef2f2' },
};

const SummaryStatBlock = ({ label, value, tooltip, accent, background }) => (
  <div
    style={{
      background: background || '#fff',
      border: `1px solid ${accent}33`,
      borderRadius: 12,
      padding: '20px 22px',
      minHeight: 118,
      height: '100%',
      boxShadow: `0 6px 20px ${accent}1f`,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
    onMouseEnter={(event) => {
      event.currentTarget.style.transform = 'translateY(-2px)';
      event.currentTarget.style.boxShadow = `0 10px 24px ${accent}2e`;
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.transform = 'translateY(0)';
      event.currentTarget.style.boxShadow = `0 6px 20px ${accent}1f`;
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
      <Text style={{ fontSize: 13, fontWeight: 600, color: '#595959', lineHeight: 1.4 }}>
        {label}
      </Text>
      <Tooltip title={tooltip}>
        <InfoCircleOutlined style={{ color: accent, fontSize: 14, cursor: 'help' }} />
      </Tooltip>
    </div>
    <div
      style={{
        fontSize: 34,
        fontWeight: 700,
        color: accent,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
      }}
    >
      {value}
    </div>
  </div>
);

const Report = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser || getStoredUser();

  const canFilterByAssignee = useMemo(() => {
    return isContentAdmin(currentUser?.role) || currentUser?.role === 'director';
  }, [currentUser?.role]);

  const showDepartmentFilter = useMemo(() => {
    return canFilterByDepartment(currentUser?.role);
  }, [currentUser?.role]);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  // const [loadingOptions, setLoadingOptions] = useState(false);
  const [partFilter, setPartFilter] = useState(undefined);
  const [chapterFilter, setChapterFilter] = useState(undefined);
  const [assignedUserFilter, setAssignedUserFilter] = useState(undefined);
  const [departmentFilter, setDepartmentFilter] = useState(undefined);
  const [notAchievedFilter, setNotAchievedFilter] = useState(undefined);
  // const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  // const [partOptions, setPartOptions] = useState([]);
  // const [chapterOptions, setChapterOptions] = useState([]);
  // const [userOptions, setUserOptions] = useState([]);
  // const [departmentOptions, setDepartmentOptions] = useState([]);

  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState([]);
  const [belowLevel4, setBelowLevel4] = useState([]);
  const [notAchievedSubcriteria, setNotAchievedSubcriteria] = useState([]);
  const [matrix, setMatrix] = useState([]);

  /*
  useEffect(() => {
    const t = setTimeout(() => setKeyword(keywordInput.trim()), 400);
    return () => clearTimeout(t);
  }, [keywordInput]);

  const loadFilterOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const [listRes, usersRes, deptRes] = await Promise.all([
        axiosInstance.post('/api/criteria/list', { page: 1, limit: 500 }),
        axiosInstance.post('/api/users/list', { page: 1, limit: 200 }),
        axiosInstance.get('/api/departments/list'),
      ]);
      const criteria = listRes.data?.data || [];
      setPartOptions([...new Set(criteria.map((c) => c.part).filter(Boolean))].sort());
      setChapterOptions([...new Set(criteria.map((c) => c.chapter).filter(Boolean))].sort());
      setUserOptions(usersRes.data?.data || []);
      setDepartmentOptions(deptRes.data?.data || []);
    } catch {
      // bỏ qua
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);
  */

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        part: partFilter || undefined,
        chapter: chapterFilter || undefined,
        keyword: keyword || undefined,
        assignedUser: canFilterByAssignee ? assignedUserFilter || undefined : undefined,
        departmentId: departmentFilter || undefined,
        notAchieved: notAchievedFilter === 'not_achieved' ? true : undefined,
      };
      const response = await axiosInstance.post('/api/report/quality', params);
      const report = response.data.report;

      setSummary(report.summary || null);
      setDetails(report.details || []);
      setBelowLevel4(report.belowLevel4 || []);
      setNotAchievedSubcriteria(report.notAchievedSubcriteria || []);
      setMatrix(report.matrix || report.details || []);
    } catch (err) {
      message.error(err.message || 'Không tải được báo cáo');
    } finally {
      setLoading(false);
    }
  }, [
    partFilter,
    chapterFilter,
    assignedUserFilter,
    departmentFilter,
    keyword,
    notAchievedFilter,
    canFilterByAssignee,
  ]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportReport = async () => {
    try {
      setExporting(true);
      const response = await axiosInstance.post(
        '/api/report/quality/export',
        {},
        { responseType: 'blob', timeout: 60000 },
      );
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        const text = await response.data.text();
        const err = JSON.parse(text);
        throw new Error(err.message || 'Không xuất được báo cáo');
      }
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bao-cao-CTCL-${dayjs().format('YYYYMMDD')}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Đã xuất báo cáo Word');
    } catch (err) {
      const data = err.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          message.error(parsed.message || 'Không xuất được báo cáo');
          return;
        } catch {
          /* fall through */
        }
      }
      message.error(err.message || 'Không xuất được báo cáo');
    } finally {
      setExporting(false);
    }
  };

  /*
  const handleClearFilters = () => {
    setPartFilter(undefined);
    setChapterFilter(undefined);
    setAssignedUserFilter(undefined);
    setDepartmentFilter(undefined);
    setNotAchievedFilter(undefined);
    setKeywordInput('');
    setKeyword('');
  };
  */

  const byLevel = summary?.byLevel || {
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
    level5: 0,
  };
  const totalApplied = summary?.totalApplied || 0;
  const totalStandard = summary?.totalStandard || 83;

  const levelChartData = [
    { level: 'Mức 1', count: byLevel.level1 },
    { level: 'Mức 2', count: byLevel.level2 },
    { level: 'Mức 3', count: byLevel.level3 },
    { level: 'Mức 4', count: byLevel.level4 },
    { level: 'Mức 5', count: byLevel.level5 },
  ];

  const partStackedChartData = useMemo(() => {
    const byPart = summary?.byPart || [];
    if (!byPart.length) return [];

    const levelByPart = {};
    details.forEach((criteria) => {
      const part = String(criteria.part || '')
        .trim()
        .charAt(0)
        .toUpperCase();
      if (!part) return;
      if (!levelByPart[part]) {
        levelByPart[part] = { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 };
      }
      const currentLevel = getCriteriaCurrentLevel(criteria);
      if (currentLevel >= 1 && currentLevel <= 5) {
        levelByPart[part][`level${currentLevel}`] += 1;
      }
    });

    return byPart.map((partRow) => ({
      ...partRow,
      byLevel: partRow.byLevel ||
        levelByPart[partRow.part] || {
          level1: 0,
          level2: 0,
          level3: 0,
          level4: 0,
          level5: 0,
        },
    }));
  }, [summary?.byPart, details]);

  const departmentChartData = useMemo(() => summary?.byDepartment || [], [summary?.byDepartment]);

  const goalStatusCounts = useMemo(() => countCriteriaByGoalStatus(details), [details]);

  const notAchievedSubcriteriaRows = useMemo(
    () => attachGroupRowSpan(notAchievedSubcriteria),
    [notAchievedSubcriteria],
  );

  const excludedCodesText = summary?.excludedCodes?.length
    ? summary.excludedCodes.join(', ')
    : 'C4.5, C4.6, C5.1';

  const summaryStatBlocks = [
    {
      label: 'Tiêu chí áp dụng',
      value: `${totalApplied}/${totalStandard}`,
      tooltip: `Tổng số tiêu chí được áp dụng đánh giá trên bộ chuẩn ${totalStandard} tiêu chí. Không đánh giá ${excludedCodesText}.`,
      ...SUMMARY_STAT_THEME,
    },
    {
      label: 'Tỷ lệ áp dụng',
      value: `${summary?.appliedPercent?.toFixed(0) || 0}%`,
      tooltip: `Tỷ lệ tiêu chí áp dụng = ${totalApplied}/${totalStandard} tiêu chí chuẩn.`,
      ...SUMMARY_STAT_THEME,
    },
    {
      label: 'Tổng điểm',
      value: summary?.totalWeightedScore || 0,
      tooltip: `Tổng điểm có hệ số chương (C3/C5 nhân 2). Hệ số: ${summary?.totalWeight || 0}.`,
      ...SUMMARY_STAT_THEME,
    },
    {
      label: 'Điểm trung bình',
      value: summary?.overallScore?.toFixed(2) || '0.00',
      tooltip: 'Điểm trung bình chung các tiêu chí được áp dụng đánh giá.',
      ...SUMMARY_STAT_THEME,
    },
  ];

  const goalStatusStatBlocks = [
    {
      label: 'Đạt',
      value: goalStatusCounts.achieved,
      tooltip: 'Tiêu chí đã đạt mức dự kiến (mức hiện tại ≥ mức dự kiến).',
      ...GOAL_STATUS_THEMES.achieved,
    },
    {
      label: 'Đang cải thiện',
      value: goalStatusCounts.improving,
      tooltip: 'Tiêu chí chưa đạt mức dự kiến nhưng vẫn còn trong thời hạn hoàn thành.',
      ...GOAL_STATUS_THEMES.improving,
    },
    {
      label: 'Chưa đạt mục tiêu',
      value: goalStatusCounts.failed,
      tooltip: 'Tiêu chí chưa đạt mức dự kiến và đã quá hạn hoàn thành.',
      ...GOAL_STATUS_THEMES.failed,
    },
  ];

  const percentageByLevel = {
    level1: totalApplied ? ((byLevel.level1 / totalApplied) * 100).toFixed(2) : '0',
    level2: totalApplied ? ((byLevel.level2 / totalApplied) * 100).toFixed(2) : '0',
    level3: totalApplied ? ((byLevel.level3 / totalApplied) * 100).toFixed(2) : '0',
    level4: totalApplied ? ((byLevel.level4 / totalApplied) * 100).toFixed(2) : '0',
    level5: totalApplied ? ((byLevel.level5 / totalApplied) * 100).toFixed(2) : '0',
  };

  const summaryLevelColumns = [
    { title: 'KẾT QUẢ CHUNG CHIA THEO MỨC', dataIndex: 'label', key: 'label', width: 280 },
    { title: 'Mức 1', dataIndex: 'level1', key: 'level1', width: 90 },
    { title: 'Mức 2', dataIndex: 'level2', key: 'level2', width: 90 },
    { title: 'Mức 3', dataIndex: 'level3', key: 'level3', width: 90 },
    { title: 'Mức 4', dataIndex: 'level4', key: 'level4', width: 90 },
    { title: 'Mức 5', dataIndex: 'level5', key: 'level5', width: 90 },
    { title: 'Tổng số tiêu chí', dataIndex: 'total', key: 'total', width: 140 },
  ];

  const summaryLevelData = [
    {
      key: 'count',
      label: '5. SỐ LƯỢNG TIÊU CHÍ ĐẠT:',
      level1: byLevel.level1,
      level2: byLevel.level2,
      level3: byLevel.level3,
      level4: byLevel.level4,
      level5: byLevel.level5,
      total: totalApplied,
    },
    {
      key: 'percent',
      label: '6. % TIÊU CHÍ ĐẠT:',
      level1: percentageByLevel.level1,
      level2: percentageByLevel.level2,
      level3: percentageByLevel.level3,
      level4: percentageByLevel.level4,
      level5: percentageByLevel.level5,
      total: totalApplied,
    },
  ];

  const partColumns = [
    { title: 'Nhóm tiêu chí', dataIndex: 'label', key: 'label' },
    { title: 'Phần', dataIndex: 'part', key: 'part', width: 80 },
    { title: 'Số tiêu chí', dataIndex: 'count', key: 'count', width: 100 },
    {
      title: 'Điểm trung bình',
      dataIndex: 'avgScore',
      key: 'avgScore',
      width: 120,
      render: (v) => Number(v).toFixed(2),
    },
  ];

  const departmentColumns = [
    { title: 'STT', dataIndex: 'rank', key: 'rank', width: 60 },
    { title: 'Khoa/Phòng', dataIndex: 'name', key: 'name' },
    { title: 'Số tiêu chí phụ trách', dataIndex: 'count', key: 'count', width: 140 },
    {
      title: 'Điểm trung bình',
      dataIndex: 'avgScore',
      key: 'avgScore',
      width: 120,
      render: (v) => Number(v).toFixed(2),
    },
    { title: 'Xếp hạng', dataIndex: 'rank', key: 'rankCol', width: 90 },
  ];

  const belowLevel4Columns = [
    { title: 'STT', key: 'stt', width: 60, render: (_, __, i) => i + 1 },
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Tên tiêu chí', dataIndex: 'name', key: 'name' },
    { title: 'Mức đạt', dataIndex: 'currentLevel', key: 'currentLevel', width: 90 },
    { title: 'Mức dự kiến', dataIndex: 'expectedLevel', key: 'expectedLevel', width: 100 },
    { title: 'Khoa/Phòng', dataIndex: 'departmentName', key: 'departmentName', width: 160 },
  ];

  const groupRowSpanCell = (record) => ({
    rowSpan: record._rowSpan ?? 1,
  });

  const notAchievedSubcriteriaColumns = [
    {
      title: 'Mã TC',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      onCell: groupRowSpanCell,
      render: (code, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{code}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.criteriaName}</div>
        </div>
      ),
    },
    {
      title: 'Mức đạt hiện tại',
      dataIndex: 'currentLevel',
      key: 'currentLevel',
      width: 120,
      onCell: groupRowSpanCell,
    },
    {
      title: 'Mức dự kiến',
      dataIndex: 'expectedLevel',
      key: 'expectedLevel',
      width: 110,
      onCell: groupRowSpanCell,
    },
    {
      title: 'Tiểu mục chưa đạt',
      dataIndex: 'subcriteriaText',
      key: 'subcriteriaText',
      render: (text, record) => {
        const label = record.levelNumber ? `Mức ${record.levelNumber}: ${text}` : text;
        const content = record.isDone ? `${label} (đã đạt)` : label;
        if (record.highlightRed) {
          return <span style={{ color: '#cf1322', fontWeight: 600 }}>{content}</span>;
        }
        return content;
      },
    },
    {
      title: 'Thời gian hoàn thành',
      dataIndex: 'expectedLevelCompletionDate',
      key: 'expectedLevelCompletionDate',
      width: 140,
      onCell: groupRowSpanCell,
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Trách nhiệm',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 160,
      onCell: groupRowSpanCell,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 140,
      render: () => null,
    },
  ];

  const matrixColumns = [
    { title: 'Mã số', dataIndex: 'code', key: 'code', width: 90 },
    { title: 'Chỉ tiêu', dataIndex: 'name', key: 'name' },
    {
      title: 'Điểm đánh giá hiện tại',
      dataIndex: 'currentLevel',
      key: 'currentLevel',
      width: 120,
      render: (_, record) => getCriteriaCurrentLevel(record),
    },
    {
      title: 'Kế hoạch',
      dataIndex: 'expectedLevel',
      key: 'expectedLevel',
      width: 90,
      render: (_, record) => getCriteriaExpectedLevel(record),
    },
    {
      title: 'Khoa/Phòng phụ trách',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 160,
    },
  ];

  const detailColumns = [
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    { title: 'Tên tiêu chí', dataIndex: 'name', key: 'name' },
    {
      title: 'Mức hiện tại',
      dataIndex: 'currentLevel',
      key: 'currentLevel',
      render: (val) => (val === undefined || val === null || val === 0 ? 1 : val),
    },
    { title: 'Mức dự kiến', dataIndex: 'expectedLevel', key: 'expectedLevel' },
    {
      title: 'Trạng thái / Tiến độ',
      key: 'progress',
      width: 220,
      render: (_, record) => {
        const inactive = record.status === false;
        const p = getCriteriaProgressPercent(record);
        const { label, tagColor } = getCriteriaProgressStatus(p);
        return (
          <div style={{ minWidth: 180 }}>
            <Tag color={inactive ? 'default' : tagColor}>{inactive ? 'Vô hiệu' : label}</Tag>
            {!inactive && (
              <Progress percent={p} size="small" style={{ marginTop: 8 }} format={(n) => `${n}%`} />
            )}
          </div>
        );
      },
    },
    {
      title: 'Ngày hạn chót',
      dataIndex: 'expectedLevelCompletionDate',
      key: 'expectedLevelCompletionDate',
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    { title: 'Khoa/Phòng', dataIndex: 'departmentName', key: 'departmentName' },
  ];

  const reportTableProps = {
    className: REPORT_TABLE_CLASS,
    bordered: true,
    size: 'middle',
  };

  return (
    <div className="report-quality-page">
      <style>
        {`
          .report-quality-page .${REPORT_TABLE_CLASS} .ant-table-thead > tr > th {
            background: #f3f4f5 !important;
            color: #141414 !important;
            font-weight: 600 !important;
            border-color: #e8e8e8 !important;
          }
          .report-quality-page .${REPORT_TABLE_CLASS} .ant-table-tbody > tr > td {
            border-color: #f0f0f0;
          }
          .report-quality-page .${REPORT_TABLE_CLASS} .ant-table-tbody > tr:nth-child(even) > td {
            background: #fafcff;
          }
          .report-quality-page .${REPORT_TABLE_CLASS} .ant-table-tbody > tr.report-matrix-below-plan > td {
            background: #fff1f0 !important;
            color: #cf1322;
          }
          .report-quality-page .${REPORT_TABLE_CLASS} .ant-table-tbody > tr.report-matrix-below-plan:hover > td {
            background: #ffccc7 !important;
          }
        `}
      </style>
      {/*
      <Card title="Bộ lọc báo cáo" style={{ marginBottom: 16 }} loading={loadingOptions}>
        <Space wrap align="start" size="middle">
          <Input
            placeholder="Tìm kiếm theo mã / tên tiêu chí"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            style={{ width: 260 }}
            allowClear
            suffix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          />
          <Select
            placeholder="Phần"
            value={partFilter}
            onChange={setPartFilter}
            style={{ width: 120 }}
            allowClear
          >
            {partOptions.map((part) => (
              <Option key={part} value={part}>
                {part}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Chương"
            value={chapterFilter}
            onChange={setChapterFilter}
            style={{ width: 140 }}
            allowClear
          >
            {chapterOptions.map((chapter) => (
              <Option key={chapter} value={chapter}>
                {chapter}
              </Option>
            ))}
          </Select>
          {showDepartmentFilter && (
            <Select
              placeholder="Khoa/Phòng"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: 200 }}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {departmentOptions.map((dept) => (
                <Option key={dept._id} value={dept._id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          )}
          {canFilterByAssignee && (
            <Select
              placeholder="Người phụ trách"
              value={assignedUserFilter}
              onChange={setAssignedUserFilter}
              style={{ width: 200 }}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {userOptions.map((u) => (
                <Option key={u._id} value={u._id}>
                  {u.username}
                </Option>
              ))}
            </Select>
          )}
          <Select
            placeholder="Tiêu đạt"
            value={notAchievedFilter}
            onChange={setNotAchievedFilter}
            style={{ width: 220 }}
            allowClear
          >
            <Option value="not_achieved">Chưa đạt mức dự kiến</Option>
          </Select>
          <Button onClick={() => fetchReport()} loading={loading}>
            Làm mới dữ liệu
          </Button>
          <Button onClick={handleClearFilters}>Xóa bộ lọc</Button>
        </Space>
      </Card>
      */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={exporting}
          onClick={handleExportReport}
        >
          Xuất báo cáo Word
        </Button>
      </div>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>I. TÓM TẮT KẾT QUẢ BỘ TIÊU CHÍ CHẤT LƯỢNG BỆNH VIỆN</ReportSectionTitle>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {summaryStatBlocks.map((block) => (
            <Col key={block.label} xs={24} sm={12} md={6}>
              <SummaryStatBlock
                label={block.label}
                value={block.value}
                tooltip={block.tooltip}
                accent={block.accent}
                background={block.bg}
              />
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
          {goalStatusStatBlocks.map((block) => (
            <Col key={block.label} xs={24} sm={8}>
              <SummaryStatBlock
                label={block.label}
                value={block.value}
                tooltip={block.tooltip}
                accent={block.accent}
                background={block.bg}
              />
            </Col>
          ))}
        </Row>

        {SHOW_SECTION_I_II_TABLES && (
          <Table
            {...reportTableProps}
            columns={summaryLevelColumns}
            dataSource={summaryLevelData}
            pagination={false}
            rowKey="key"
            style={{ marginBottom: 28 }}
          />
        )}

        <ReportChartPanel
          title="Biểu đồ 1. Phân bố tiêu chí theo mức"
          description="Tỷ lệ và số lượng tiêu chí đạt từng mức trên tổng tiêu chí đang áp dụng"
        >
          <LevelDistributionDonutChart data={levelChartData} total={totalApplied} />
        </ReportChartPanel>
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>II. KẾT QUẢ THEO NHÓM TIÊU CHÍ</ReportSectionTitle>
        {SHOW_SECTION_I_II_TABLES && (
          <Table
            {...reportTableProps}
            columns={partColumns}
            dataSource={summary?.byPart || []}
            rowKey="part"
            pagination={false}
            style={{ marginBottom: 28 }}
          />
        )}
        <ReportChartPanel
          title="Biểu đồ 2. Điểm trung bình theo nhóm tiêu chí"
          description="Số tiêu chí theo từng mức và điểm trung bình của mỗi nhóm tiêu chí"
        >
          <PartGroupLevelStackedChart data={partStackedChartData} />
        </ReportChartPanel>
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>III. KẾT QUẢ THEO KHOA/PHÒNG PHỤ TRÁCH</ReportSectionTitle>
        {SHOW_SECTION_III_TABLE && (
          <Table
            {...reportTableProps}
            columns={departmentColumns}
            dataSource={summary?.byDepartment || []}
            rowKey={(r) => r.departmentId || r.name}
            pagination={false}
            style={{ marginBottom: 28 }}
          />
        )}
        <ReportChartPanel
          title="Biểu đồ 3. Xếp hạng và điểm trung bình theo khoa/phòng"
          description="Thứ tự xếp hạng và điểm trung bình là thông tin chính; số tiêu chí phụ trách hiển thị phụ bên phải"
        >
          <DepartmentRankingChart data={departmentChartData} />
        </ReportChartPanel>
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>IV. DANH SÁCH CÁC TIÊU CHÍ DƯỚI MỨC 4</ReportSectionTitle>
        <Table
          {...reportTableProps}
          columns={belowLevel4Columns}
          dataSource={belowLevel4}
          rowKey="_id"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>V. CÁC TIÊU CHÍ CHƯA ĐẠT KẾ HOẠCH</ReportSectionTitle>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Chi tiết các tiểu mục chưa hoàn thành. Cột Ghi chú để trống — người dùng tự nhập khi in
          hoặc bổ sung ngoài hệ thống.
        </Text>
        <Table
          {...reportTableProps}
          columns={notAchievedSubcriteriaColumns}
          dataSource={notAchievedSubcriteriaRows}
          rowKey={(record) =>
            `${record.criteriaId}-${record.levelNumber}-${record.groupIndex}-${record.stt}`
          }
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>VI. KẾT QUẢ ĐÁNH GIÁ THEO BỘ TIÊU CHÍ</ReportSectionTitle>
        <Table
          {...reportTableProps}
          columns={matrixColumns}
          dataSource={matrix}
          rowKey="_id"
          pagination={{ pageSize: 50 }}
          rowClassName={(record) =>
            isCriteriaBelowExpectedLevel(record) ? 'report-matrix-below-plan' : ''
          }
        />
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>Báo cáo chi tiết</ReportSectionTitle>
        <Table
          {...reportTableProps}
          columns={detailColumns}
          dataSource={details}
          rowKey={(r) => r._id || r.code}
          pagination={{ pageSize: 50 }}
        />
      </Card>
    </div>
  );
};

export default Report;
