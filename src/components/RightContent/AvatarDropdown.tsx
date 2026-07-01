import {
  LockOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Form, Input, Modal, Spin, message } from 'antd';
import type { MenuProps } from 'antd';
import { createStyles } from 'antd-style';
import { stringify } from 'querystring';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';
import axiosInstance from '../../utils/axiosInstance';
import { isSystemAdmin } from '../../utils/roles';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  return (
    <span className="anticon">
      {isSystemAdmin(currentUser?.role) && (
        <CrownOutlined style={{ marginRight: 4, color: '#faad14' }} />
      )}
      {currentUser?.role === 'user' && <UserOutlined style={{ marginRight: 4 }} />}
      {currentUser?.username}
    </span>
  );
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
  };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu, children }) => {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<ChangePasswordForm>();

  const loginOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');

    const { search, pathname } = window.location;
    if (pathname !== '/user/login') {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  };
  const { styles } = useStyles();

  const { initialState, setInitialState } = useModel('@@initialState');

  const handleChangePassword = async (values: ChangePasswordForm) => {
    try {
      setSubmitting(true);
      await axiosInstance.post('/api/users/change-password', values);
      message.success('Đổi mật khẩu thành công');
      form.resetFields();
      setChangePasswordOpen(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Không đổi được mật khẩu');
    } finally {
      setSubmitting(false);
    }
  };

  const onMenuClick: MenuProps['onClick'] = (event) => {
    const { key } = event;
    if (key === 'change-password') {
      form.resetFields();
      setChangePasswordOpen(true);
      return;
    }
    if (key === 'logout') {
      flushSync(() => {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
      });
      loginOut();
      return;
    }
    history.push(`/account/${key}`);
  };

  const loading = (
    <span className={styles.action}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.username) {
    return loading;
  }

  const menuItems = [
    ...(menu
      ? [
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '个人设置',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Đổi mật khẩu',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
    },
  ];

  return (
    <>
      <HeaderDropdown
        menu={{
          selectedKeys: [],
          onClick: onMenuClick,
          items: menuItems,
        }}
      >
        {children}
      </HeaderDropdown>
      <Modal
        title="Đổi mật khẩu"
        open={changePasswordOpen}
        onCancel={() => {
          if (!submitting) {
            setChangePasswordOpen(false);
            form.resetFields();
          }
        }}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu mới không khớp'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
