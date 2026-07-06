import { CrownOutlined, UserOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import MobileCardMenu, { buildUserMenuItems } from '../../../../components/MobileCardMenu';
import { isSystemAdmin } from '../../../../utils/roles';

const UserCard = ({ record, roleLabel, canManageUsers, onEdit, onDelete }) => {
  const menuItems = buildUserMenuItems({ record, canManageUsers, onEdit, onDelete });

  return (
    <Card
      size="small"
      className={`mobile-list-card${canManageUsers ? ' mobile-list-card--clickable' : ''}`}
      style={{ borderLeft: '4px solid #3A4AFF' }}
      onClick={canManageUsers ? () => onEdit(record) : undefined}
    >
      <div className="mobile-list-card__top">
        <div className="mobile-list-card__top-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isSystemAdmin(record.role) ? (
              <CrownOutlined style={{ color: '#faad14', fontSize: 18 }} />
            ) : (
              <UserOutlined style={{ color: '#3a4aff', fontSize: 18 }} />
            )}
            <div className="mobile-list-card__title" style={{ marginBottom: 0 }}>
              {record.username}
            </div>
          </div>
        </div>
        <MobileCardMenu items={menuItems} />
      </div>

      <div className="mobile-list-card__meta">
        <span>
          <span className="mobile-list-card__meta-label">Khoa/Phòng: </span>
          {record.departmentId?.name || record.department || '-'}
        </span>
        <span>
          <span className="mobile-list-card__meta-label">Email: </span>
          {record.email || '-'}
        </span>
        <span style={{ width: '100%' }}>
          <span className="mobile-list-card__meta-label">Vai trò: </span>
          {roleLabel}
        </span>
      </div>
    </Card>
  );
};

export default UserCard;
