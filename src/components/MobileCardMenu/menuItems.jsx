import { CheckCircleOutlined, DeleteOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';

export const buildCriteriaMenuItems = ({
  record,
  isRestrictedCriteriaEditor,
  canAdminCriteria,
  onEdit,
  onUpdate,
  onDelete,
  onToggleStatus,
}) => {
  const inactive = record.status === false;
  const items = [
    {
      key: 'edit',
      label: isRestrictedCriteriaEditor ? 'Cập nhật' : 'Chỉnh sửa',
      icon: <EditOutlined />,
      onClick: () => (isRestrictedCriteriaEditor ? onUpdate(record) : onEdit(record)),
    },
  ];

  if (canAdminCriteria) {
    items.push({
      key: 'delete',
      label: 'Xóa',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(record._id),
    });
  }

  if (!isRestrictedCriteriaEditor) {
    items.push({
      key: 'toggle',
      label: inactive ? 'Kích hoạt tiêu chí' : 'Vô hiệu hóa tiêu chí',
      icon: inactive ? <CheckCircleOutlined /> : <StopOutlined />,
      onClick: () => onToggleStatus(record),
    });
  }

  return items;
};

export const buildUserMenuItems = ({ record, canManageUsers, onEdit, onDelete }) => {
  if (!canManageUsers) return [];

  return [
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: <EditOutlined />,
      onClick: () => onEdit(record),
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(record._id),
    },
  ];
};
