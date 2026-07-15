import React, { useMemo } from 'react';
import { Button, Typography } from 'antd';
import { DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { getPeriodOption, PERIOD_OPTIONS } from '../constants/periodFilters';

const { Text } = Typography;

const TrendsFilterBar = ({
  periodFilter,
  onPeriodChange,
  onDownload,
  downloading = false,
  downloadDisabled = false,
  snapshotCount = 0,
  compact = false,
}) => {
  const activePeriod = useMemo(() => getPeriodOption(periodFilter), [periodFilter]);

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
              <span className="trends-filter__chip">{activePeriod.label}</span>
              <span className="trends-filter__chip trends-filter__chip--muted">
                {snapshotCount} mốc theo {activePeriod.unitLabel}
              </span>
            </div>
          </div>
        </div>
        {onDownload ? (
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloading}
            disabled={downloadDisabled}
            onClick={onDownload}
            className="trends-filter__download-btn"
            size={compact ? 'middle' : 'middle'}
          >
            {compact ? 'Tải CSV' : 'Tải dữ liệu snapshot'}
          </Button>
        ) : null}
      </div>

      <div className="trends-filter__body trends-filter__body--period-only">
        <div className="trends-filter__group trends-filter__group--period">
          <div className="trends-filter__label">Mốc thời gian</div>
          <Text className="trends-filter__help">
            Chọn đơn vị gom snapshot trên biểu đồ. Dữ liệu gốc vẫn được chụp hàng tháng; mỗi mốc lấy
            snapshot tháng cuối cùng trong kỳ.
          </Text>
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
                <span className="trends-filter__period-btn-label">{option.label}</span>
                <span className="trends-filter__period-btn-hint">{option.hint}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendsFilterBar;
