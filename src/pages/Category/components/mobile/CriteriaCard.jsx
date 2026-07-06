import { Card, Progress, Tag } from 'antd';
import dayjs from 'dayjs';
import {
  getCriteriaProgressPercent,
  getCriteriaProgressStatus,
  getCriteriaCurrentLevel,
} from '../../../../utils/criteriaProgress';
import { getLevelColorStyle } from '../../../../utils/criteriaLevelColors';
import MobileCardMenu, { buildCriteriaMenuItems } from '../../../../components/MobileCardMenu';

const formatDate = (input) => {
  const date = dayjs(input);
  return date.isValid() ? date.format('DD/MM/YYYY') : '-';
};

const CriteriaCard = ({
  record,
  isRestrictedCriteriaEditor,
  canAdminCriteria,
  onEdit,
  onUpdate,
  onDelete,
  onToggleStatus,
}) => {
  const inactive = record.status === false;
  const currentLevel = getCriteriaCurrentLevel(record);
  const levelStyle = getLevelColorStyle(currentLevel);
  const progress = getCriteriaProgressPercent(record);
  const { label, tagColor } = getCriteriaProgressStatus(progress);
  const deadline = record.expectedLevelCompletionDate
    ? new Date(record.expectedLevelCompletionDate)
    : null;
  const deadlineColor =
    deadline && deadline < new Date()
      ? '#cf1322'
      : deadline && dayjs(deadline) < dayjs().add(15, 'day')
        ? '#d48806'
        : undefined;

  const handleOpen = () => {
    if (isRestrictedCriteriaEditor) {
      onUpdate(record);
    } else {
      onEdit(record);
    }
  };

  const menuItems = buildCriteriaMenuItems({
    record,
    isRestrictedCriteriaEditor,
    canAdminCriteria,
    onEdit,
    onUpdate,
    onDelete,
    onToggleStatus,
  });

  return (
    <Card
      size="small"
      className={`mobile-list-card mobile-list-card--clickable${inactive ? ' mobile-list-card--inactive' : ''}`}
      style={{ borderLeft: `4px solid ${levelStyle.bg}` }}
      onClick={handleOpen}
    >
      <div className="mobile-list-card__top">
        <div className="mobile-list-card__top-main">
          <div className="mobile-list-card__code">{record.code}</div>
          <div className="mobile-list-card__title">{record.name}</div>
        </div>
        <MobileCardMenu items={menuItems} />
      </div>

      <div className="mobile-list-card__meta">
        <span>
          <span className="mobile-list-card__meta-label">Mức hiện tại: </span>
          {currentLevel || 1}
        </span>
        <span>
          <span className="mobile-list-card__meta-label">Mức dự kiến: </span>
          {record.expectedLevel}
        </span>
        <span>
          <span className="mobile-list-card__meta-label">Hạn: </span>
          <span style={{ color: deadlineColor }}>
            {formatDate(record.expectedLevelCompletionDate)}
          </span>
        </span>
      </div>

      <Tag color={inactive ? 'default' : tagColor}>{inactive ? 'Vô hiệu' : label}</Tag>
      {!inactive ? (
        <Progress
          percent={progress}
          size="small"
          style={{ marginTop: 8 }}
          format={(n) => `${n}%`}
        />
      ) : null}
    </Card>
  );
};

export default CriteriaCard;
