import component from './vi-VN/component';
import menu from './vi-VN/menu';
import pages from './vi-VN/pages';
import pwa from './vi-VN/pwa';
import globalHeader from './en-US/globalHeader';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';

export default {
  'navBar.lang': 'Ngôn ngữ',
  'layout.user.link.help': 'Trợ giúp',
  'layout.user.link.privacy': 'Riêng tư',
  'layout.user.link.terms': 'Điều khoản',
  'app.preview.down.block': 'Tải trang này về dự án cục bộ',
  'app.welcome.link.fetch-blocks': 'Lấy tất cả khối',
  'app.welcome.link.block-list': 'Xây dựng trang chuẩn nhanh với block',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
};
