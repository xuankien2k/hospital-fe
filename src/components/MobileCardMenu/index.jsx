import { Button, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

export { buildCriteriaMenuItems, buildUserMenuItems } from './menuItems';

const MobileCardMenu = ({ items = [] }) => {
  if (!items.length) return null;

  const menuItems = items.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    danger: item.danger,
  }));

  const handleMenuClick = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    const action = items.find((item) => item.key === key);
    action?.onClick?.();
  };

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        type="text"
        size="small"
        className="mobile-list-card__menu-btn"
        icon={<MoreOutlined />}
        onClick={(event) => event.stopPropagation()}
      />
    </Dropdown>
  );
};

export default MobileCardMenu;
