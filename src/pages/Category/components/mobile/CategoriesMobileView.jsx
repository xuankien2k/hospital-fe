import { useMemo, useState } from 'react';
import { FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Badge, Button, Input, List, Select } from 'antd';
import CriteriaEvaluationGuide from '../../../../components/CriteriaEvaluationGuide';
import CriteriaCard from './CriteriaCard';
import '../../../../styles/mobile-pages.less';

const { Option } = Select;

const CategoriesMobileView = ({
  tableData,
  searchText,
  onSearchTextChange,
  onSearch,
  canCreateCriteria,
  onCreate,
  dateFilter,
  onDateFilterChange,
  outOfDateFilter,
  selectedLevel,
  onLevelFilterChange,
  levelFilter,
  showDepartmentFilter,
  departmentFilter,
  onDepartmentFilterChange,
  departments,
  isRestrictedCriteriaEditor,
  canAdminCriteria,
  onEdit,
  onUpdate,
  onDelete,
  onToggleStatus,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters = useMemo(
    () =>
      !!searchText || dateFilter.name !== 'Tất cả' || selectedLevel !== 'all' || !!departmentFilter,
    [searchText, dateFilter.name, selectedLevel, departmentFilter],
  );

  return (
    <div className="mobile-page">
      <div className="criteria-evaluation-guide">
        <CriteriaEvaluationGuide />
      </div>

      <div className="mobile-page-toolbar">
        <div className="mobile-page-toolbar__actions">
          {canCreateCriteria ? (
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={onCreate}
              className="mobile-page-toolbar__action-main"
            >
              Thêm tiêu chí
            </Button>
          ) : null}
          <Badge dot={hasActiveFilters && !filtersOpen} offset={[-4, 4]}>
            <Button
              size="large"
              icon={<FilterOutlined />}
              onClick={() => setFiltersOpen((open) => !open)}
              type={filtersOpen || hasActiveFilters ? 'primary' : 'default'}
              ghost={hasActiveFilters && !filtersOpen}
              className={canCreateCriteria ? undefined : 'mobile-page-toolbar__action-main'}
            >
              Lọc
            </Button>
          </Badge>
        </div>

        {filtersOpen ? (
          <div className="mobile-page-toolbar__panel">
            <div className="mobile-page-toolbar__row">
              <Input
                size="large"
                placeholder="Tìm kiếm tiêu chí"
                value={searchText}
                onChange={(e) => onSearchTextChange(e.target.value)}
                onPressEnter={onSearch}
              />
              <Button type="primary" size="large" icon={<SearchOutlined />} onClick={onSearch} />
            </div>

            <div className="mobile-page-toolbar__filters">
              <Select size="large" value={dateFilter.name} onChange={onDateFilterChange}>
                {outOfDateFilter.map((date) => (
                  <Option value={date.name} key={date.code}>
                    {date.name}
                  </Option>
                ))}
              </Select>
              <Select size="large" value={selectedLevel} onChange={onLevelFilterChange}>
                {levelFilter.map((level) => (
                  <Option value={level.value} key={level.value}>
                    {level.label}
                  </Option>
                ))}
              </Select>
              {showDepartmentFilter ? (
                <Select
                  className="mobile-page-toolbar__filters--full"
                  size="large"
                  placeholder="Khoa/Phòng"
                  value={departmentFilter}
                  onChange={onDepartmentFilterChange}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {departments.map((dept) => (
                    <Option key={dept._id} value={dept._id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <List
        dataSource={tableData}
        renderItem={(record) => {
          if (record.isPartHeader) {
            return (
              <List.Item style={{ padding: 0, border: 'none' }}>
                <div className="mobile-group-header mobile-group-header--part">
                  Phần {record.part}
                </div>
              </List.Item>
            );
          }

          if (record.isChapterHeader) {
            return (
              <List.Item style={{ padding: 0, border: 'none' }}>
                <div className="mobile-group-header mobile-group-header--chapter">
                  Chương {record.chapter}
                </div>
              </List.Item>
            );
          }

          return (
            <List.Item style={{ padding: '5px 0', border: 'none' }}>
              <div style={{ width: '100%' }}>
                <CriteriaCard
                  record={record}
                  isRestrictedCriteriaEditor={isRestrictedCriteriaEditor}
                  canAdminCriteria={canAdminCriteria}
                  onEdit={onEdit}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                />
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default CategoriesMobileView;
