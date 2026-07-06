import {
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Input, List } from 'antd';
import UserCard from './UserCard';
import '../../../../styles/mobile-pages.less';

const ROLE_LABELS = {
  admin: 'Quản trị viên (Admin)',
  director: 'Ban Giám đốc',
  quality_admin: 'Phòng Quản lý chất lượng',
  department: 'Trưởng Khoa/Phòng',
  criteria_officer: 'Cán bộ phụ trách tiêu chí',
};

const UsersMobileView = ({
  data,
  loading,
  searchText,
  onSearchTextChange,
  onSearch,
  canManageUsers,
  onCreate,
  onEdit,
  onDelete,
}) => (
  <div className="mobile-page">
    <div className="mobile-page-toolbar">
      <div className="mobile-page-toolbar__row">
        <Input
          size="large"
          placeholder="Tìm kiếm theo tên"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          onPressEnter={onSearch}
        />
        <Button type="primary" size="large" icon={<SearchOutlined />} onClick={onSearch} />
      </div>
      {canManageUsers ? (
        <Button type="primary" size="large" block icon={<PlusOutlined />} onClick={onCreate}>
          Thêm người dùng
        </Button>
      ) : null}
    </div>

    <List
      loading={loading}
      dataSource={data}
      locale={{ emptyText: 'Không có người dùng' }}
      renderItem={(record) => (
        <List.Item style={{ padding: '5px 0', border: 'none' }}>
          <div style={{ width: '100%' }}>
            <UserCard
              record={record}
              roleLabel={ROLE_LABELS[record.role] || record.role}
              canManageUsers={canManageUsers}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </List.Item>
      )}
    />
  </div>
);

export { ROLE_LABELS };
export default UsersMobileView;
