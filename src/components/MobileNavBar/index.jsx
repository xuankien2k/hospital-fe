import { AvatarDropdown } from '@/components';
import {
  DashboardOutlined,
  LineChartOutlined,
  SolutionOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { history, useAccess, useLocation, useModel } from '@umijs/max';
import { Grid } from 'antd';
import { HOSPITAL_BRAND } from '../../utils/hospitalBrand';

const NAV_ITEMS = [
  { path: '/Category', label: 'Tiêu chí', icon: SolutionOutlined },
  { path: '/Report', label: 'Báo cáo', icon: DashboardOutlined },
  { path: '/Trends', label: 'Xu hướng', icon: LineChartOutlined, beta: true },
  {
    path: '/user-list',
    label: 'Người dùng',
    icon: UserOutlined,
    accessKey: 'canViewUserList',
  },
];

const MobileNavBar = () => {
  const screens = Grid.useBreakpoint();
  const location = useLocation();
  const access = useAccess();
  const { initialState } = useModel('@@initialState');

  if (screens.lg) {
    return null;
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.accessKey || access[item.accessKey]);

  return (
    <header className="mobile-app-nav">
      <div className="mobile-app-nav__brand">
        <img
          src={HOSPITAL_BRAND.logo}
          alt={HOSPITAL_BRAND.hospitalName}
          className="mobile-app-nav__logo"
        />
        <span className="mobile-app-nav__title">QLCL BV</span>
      </div>

      <nav className="mobile-app-nav__menu" aria-label="Điều hướng chính">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

          return (
            <button
              key={item.path}
              type="button"
              className={`mobile-app-nav__item${active ? ' mobile-app-nav__item--active' : ''}`}
              onClick={() => history.push(item.path)}
            >
              <Icon />
              <span className="mobile-app-nav__item-label">
                <span>{item.label}</span>
                {item.beta ? (
                  <span className="app-menu-beta-badge app-menu-beta-badge--mobile">Beta</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mobile-app-nav__user">
        <AvatarDropdown>
          <span className="mobile-app-nav__avatar">
            {(initialState?.currentUser?.username || 'U').charAt(0).toUpperCase()}
          </span>
        </AvatarDropdown>
      </div>
    </header>
  );
};

export default MobileNavBar;
