import React, { useMemo } from 'react';
import { FilterOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { PART_FILTER_OPTIONS } from '../../../utils/reportParts';

const PERIOD_OPTIONS = [
  { label: '1 tháng', value: '1m' },
  { label: '1 quý', value: '1q' },
  { label: '6 tháng', value: '6m' },
  { label: '1 năm', value: '1y' },
];

const TrendsFilterBar = ({
  periodFilter,
  onPeriodChange,
  partFilter,
  onPartChange,
  departmentFilter,
  onDepartmentChange,
  showDepartmentFilter,
  departmentOptions = [],
  compact = false,
}) => {
  const activeSummary = useMemo(() => {
    const periodLabel = PERIOD_OPTIONS.find((item) => item.value === periodFilter)?.label;
    const partLabel =
      PART_FILTER_OPTIONS.find((item) => item.value === partFilter)?.label || 'Tất cả nhóm';
    const deptLabel =
      departmentOptions.find((item) => item._id === departmentFilter)?.name || 'Tất cả khoa/phòng';

    return [periodLabel, partLabel, showDepartmentFilter ? deptLabel : null].filter(Boolean);
  }, [periodFilter, partFilter, departmentFilter, departmentOptions, showDepartmentFilter]);

  return (
    <section className={`trends-filter${compact ? ' trends-filter--mobile' : ''}`}>
      <div className="trends-filter__header">
        <div className="trends-filter__title-wrap">
          <span className="trends-filter__icon">
            <FilterOutlined />
          </span>
          <div>
            <div className="trends-filter__title">Bộ lọc báo cáo</div>
            <div className="trends-filter__summary">
              {activeSummary.map((item) => (
                <span key={item} className="trends-filter__chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="trends-filter__body">
        <div className="trends-filter__group trends-filter__group--period">
          <div className="trends-filter__label">Mốc thời gian</div>
          <div className="trends-filter__period-grid">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`trends-filter__period-btn${
                  periodFilter === option.value ? ' trends-filter__period-btn--active' : ''
                }`}
                onClick={() => onPeriodChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="trends-filter__group">
          <div className="trends-filter__label">Nhóm tiêu chí</div>
          <Select
            value={partFilter}
            options={PART_FILTER_OPTIONS}
            onChange={onPartChange}
            size={compact ? 'large' : 'middle'}
            className="trends-filter__select"
          />
        </div>

        {showDepartmentFilter ? (
          <div className="trends-filter__group">
            <div className="trends-filter__label">Khoa/phòng</div>
            <Select
              allowClear
              placeholder="Tất cả khoa/phòng"
              value={departmentFilter}
              options={departmentOptions.map((item) => ({
                label: item.name,
                value: item._id,
              }))}
              onChange={onDepartmentChange}
              size={compact ? 'large' : 'middle'}
              className="trends-filter__select"
              showSearch
              optionFilterProp="label"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default TrendsFilterBar;
