import { useState, useEffect } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Input, Button, Modal, Form, Upload, Select, Dropdown, Menu, message } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  CrownOutlined,
  UserOutlined,
} from '@ant-design/icons';
import axiosInstance from '../../utils/axiosInstance';

const { Option } = Select;

const Users = () => {
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // State declarations
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();
  const [selectedId, setSelectedId] = useState('');
  const [selectedUser, setSelectedUser] = useState({});
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effects
  useEffect(() => {
    fetchUsers();
  }, []);

  // API calls
  const fetchUsers = () => {
    const params = {
      page: 1,
      limit: 200,
      keyword: searchText,
    };

    axiosInstance
      .post('/api/users/list', params)
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const addUser = async (newUser) => {
    try {
      const response = await axiosInstance.post(`/api/users/create`, newUser);
      if (response.status === 201) {
        message.success('Thêm người dùng thành công');
        setModalVisible(false);
        fetchUsers();
      }
    } catch (error) {
      message.error('Lỗi khi thêm người dùng:', error);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const response = await axiosInstance.post(`/api/users/update`, updatedData);
      if (response.status === 200) {
        message.success('Chỉnh sửa thành công');
        setModalVisible(false);
        fetchUsers();
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật người dùng:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await axiosInstance.post(`/api/users/delete`, { ids: [id] });
      if (response.status === 200) {
        message.success('Xóa thành công');
        fetchUsers();
      }
    } catch (error) {
      message.error('Lỗi khi xóa người dùng:', error);
    }
  };

  // Event handlers
  const handleChangePassword = () => {
    setIsChangePassword(!isChangePassword);
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const showModal = (record = null) => {
    setModalVisible(true);
    if (record) {
      setSelectedUser(record);
      setSelectedId(record._id);
      setEditData(record);
      setIsChangePassword(false);
      form.setFieldsValue(record);
    } else {
      setEditData(null);
      form.resetFields();
    }
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editData) {
        const data = { ...values, _id: selectedId };
        updateUser(data);
      } else {
        addUser(values);
      }
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: '',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (role === 'admin' ? <CrownOutlined /> : <UserOutlined />),
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Khoa/Phòng',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    currentUser.role === 'admin' && {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item icon={<EditOutlined />} onClick={() => showModal(record)}>
                Chỉnh sửa
              </Menu.Item>
              <Menu.Item icon={<DeleteOutlined />} onClick={() => deleteUser(record._id)} danger>
                Xóa
              </Menu.Item>
            </Menu>
          }
        >
          <Button icon={<DownOutlined />}>Hành động</Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* Search and Action Buttons */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          size="large"
          placeholder="Tìm kiếm theo tên"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<SearchOutlined />} size="large" onClick={handleSearch}>
          Tìm kiếm
        </Button>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => showModal()}>
          Thêm
        </Button>
      </div>

      {/* Users Table */}
      <ProTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={false}
        pagination={{ pageSize: 200 }}
        loading={loading}
      />

      {/* Add/Edit User Modal */}
      <Modal
        title={editData ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Tên người dùng"
            rules={[{ required: true, message: 'Nhập Tên người dùng' }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item name="department" label="Khoa/Phòng">
            <Input size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ' }]}
          >
            <Input size="large" disabled={!!editData} />
          </Form.Item>

          <Form.Item name="role" label="Vai trò">
            <Select size="large" defaultValue={selectedUser.role || 'user'}>
              <Option value="admin">Quản lý</Option>
              <Option value="user">Người dùng</Option>
            </Select>
          </Form.Item>

          {editData && (
            <Button onClick={handleChangePassword} style={{ marginBottom: 8, marginTop: 8 }}>
              Sửa mật khẩu
            </Button>
          )}

          {(!editData || isChangePassword) && (
            <>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: 'Nhập mật khẩu' }]}
              >
                <Input.Password size="large" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Xác nhận mật khẩu' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      return value && value === getFieldValue('password')
                        ? Promise.resolve()
                        : Promise.reject(new Error('Mật khẩu không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password size="large" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Users;
