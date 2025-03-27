import { useState, useEffect } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Input,
  Button,
  Modal,
  Form,
  Select,
  Checkbox,
  DatePicker,
  message,
  Dropdown,
  Menu,
  Space,
  Collapse,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import axiosInstance from '../../utils/axiosInstance';
import { isEmpty, map } from 'lodash';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const defaultLevel = [
  { levelNumber: 1, subCriterias: [] },
  { levelNumber: 2, subCriterias: [] },
  { levelNumber: 3, subCriterias: [] },
  { levelNumber: 4, subCriterias: [] },
  { levelNumber: 5, subCriterias: [] },
];

const outOfDateFilter = [
  {
    code: 'All',
    value: null,
    name: 'Tất cả',
  },
  {
    code: 'Now',
    value: dayjs(new Date()),
    name: 'Đã hết hạn',
  },
  {
    code: 'Near',
    value: dayjs().add(15, 'day'),
    name: 'Sắp hết hạn và hết hạn',
  },
];

const levelFilter = [
  {
    value: 'all',
    label: 'Tất cả các mức',
  },
  {
    value: '1',
    label: 'Mức 1',
  },
  {
    value: '2',
    label: 'Mức 2',
  },
  {
    value: '3',
    label: 'Mức 3',
  },
  {
    value: '4',
    label: 'Mức 4',
  },
  {
    value: '5',
    label: 'Mức 5',
  },
];

const Categories = () => {
  // State declarations
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Store original unfiltered data
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [levels, setLevels] = useState(defaultLevel);
  const [editData, setEditData] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedId, setSelectedId] = useState('');
  const [listUsers, setListUsers] = useState([]);
  const [expectedLevelCompletionDate, setExpectedLevelCompletionDate] = useState(null);
  const [assignedUser, setAssignedUser] = useState({});
  const [dateFilter, setDateFilter] = useState(outOfDateFilter[0]);
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Effects
  useEffect(() => {
    list();
    listUser();
  }, []);

  useEffect(() => {
    list();
  }, [dateFilter]);

  // API calls
  const list = () => {
    const params = {
      page: 1,
      limit: 100,
      keyword: searchText,
      out_of_date: dateFilter.value,
    };

    axiosInstance
      .post('/api/criteria/list', params)
      .then((response) => {
        setOriginalData(response.data.data); // Store original data
        let filteredData = response.data.data;
        if (selectedLevel !== 'all') {
          filteredData = filteredData.filter(
            (item) => item.currentLevel === parseInt(selectedLevel),
          );
        }
        setData(filteredData);
      })
      .catch((err) => setError(err.message));
  };

  const listUser = () => {
    const params = {
      page: 1,
      limit: 100,
    };

    axiosInstance
      .post('/api/users/list', params)
      .then((response) => setListUsers(response.data.data))
      .catch((err) => setError(err.message));
  };

  // Event handlers
  const handleSearch = () => list();

  const showModal = (record = null) => {
    setModalVisible(true);
    if (record) {
      setEditData(record);
      setLevels(record?.levels || []);
      setSelectedId(record._id);
      setCurrentLevel(record?.currentLevel || 1);
      setExpectedLevelCompletionDate(record.expectedLevelCompletionDate);
      setAssignedUser(record?.assignedUser);
      form.setFieldsValue(record);
    } else {
      setEditData(null);
      setCurrentLevel(1);
      form.resetFields();
      setAssignedUser();
      setExpectedLevelCompletionDate('');
      setLevels(defaultLevel);
    }
  };

  const addCriteria = async (newUser) => {
    try {
      const response = await axiosInstance.post(`/api/criteria/create`, newUser);
      if (response.status === 201) {
        message.success('Thêm tiêu chí thành công');
        list();
      }
    } catch (error) {
      message.error('Error adding user:', 5);
    }
  };

  const updateCriteria = async (updatedData) => {
    try {
      const response = await axiosInstance.post(`/api/criteria/update`, updatedData);
      if (response.status === 200) {
        message.success('chỉnh sửa thành công');
        list();
      }
    } catch (error) {
      message.error('Error updating user:', 5);
    }
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const data = {
        ...values,
        assignedUser,
        expectedLevelCompletionDate,
        levels: [...levels],
        ...(editData && { _id: selectedId }),
      };

      if (editData) {
        updateCriteria(data);
      } else {
        addCriteria(data);
      }
    });
  };

  const handleAddSubItem = (level) => {
    const newSubCriterias = [...levels];
    newSubCriterias[level - 1].subCriterias.push({ text: '', status: false });
    setLevels(newSubCriterias);
  };

  const handleDeleteSubItem = (level, index) => {
    const newSubCriterias = [...levels];
    newSubCriterias[level - 1].subCriterias.splice(index, 1);
    setLevels(newSubCriterias);
  };

  const handleChangeStatus = (level, index) => {
    const newSubCriterias = [...levels];
    newSubCriterias[level - 1].subCriterias[index].status =
      !newSubCriterias[level - 1].subCriterias[index].status;
    setLevels(newSubCriterias);
  };

  const handleDelete = async (id) => {
    const response = await axiosInstance.post(`/api/criteria/delete`, { ids: [id] });
    if (response.status === 200) {
      message.success('Xoá thành công');
      list();
    } else {
      message.error('Xoá thất bại', 5);
    }
  };

  const handleChangeAssigner = (ID) => {
    const selectedAssign = listUsers.find((user) => user._id === ID);
    setAssignedUser(selectedAssign);
  };

  const validateAndFormatDate = (input) => {
    const date = dayjs(input);
    return date.isValid() ? date.format('DD/MM/YYYY') : null;
  };

  const onChangeValueConditionDate = (value) => {
    setExpectedLevelCompletionDate(value);
  };

  const showConfirm = (ID) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk() {
        handleDelete(ID);
      },
      onCancel() {
        message.info('Hủy xóa.');
      },
    });
  };

  const handleChangeDateFilter = (value) => {
    const selectedFilter = outOfDateFilter.find((filter) => filter.name === value);
    if (selectedFilter) {
      setDateFilter(selectedFilter);
    }
  };

  const handleChangeLevelFilter = (value) => {
    setSelectedLevel(value);
    if (value === 'all') {
      setData(originalData);
    } else {
      const filteredData = originalData.filter((item) => item.currentLevel === parseInt(value));
      setData(filteredData);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Loại',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tên tiêu chí',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div>{text}</div>,
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'assignedUser',
      key: 'assignedUser',
      width: 200,
      render: (user) => <div>{user?.username}</div>,
    },
    {
      title: 'Mức hiện tại',
      dataIndex: 'currentLevel',
      key: 'currentLevel',
      width: 100,
    },
    {
      title: 'Mức dự kiến',
      dataIndex: 'expectedLevel',
      key: 'expectedLevel',
      width: 100,
    },
    {
      title: 'Ngày hoàn thành dự kiến',
      dataIndex: 'expectedLevelCompletionDate',
      key: 'expectedLevelCompletionDate',
      width: 200,
      render: (text) => {
        const date = new Date(text);
        const color =
          date < new Date() ? 'red' : dayjs(date) < dayjs().add(15, 'day') ? 'orange' : '';
        return <div style={{ color }}>{validateAndFormatDate(text)}</div>;
      },
    },
    {
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
              <Menu.Item icon={<DeleteOutlined />} onClick={() => showConfirm(record._id)} danger>
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

  const listLevels = [1, 2, 3, 4, 5];

  return (
    <PageContainer>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          size="large"
          placeholder="Tìm kiếm tiêu chí"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
        <Button size="large" type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          Tìm kiếm
        </Button>
        <Button size="large" type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
          Thêm tiêu chí
        </Button>
        <Select
          size="large"
          value={dateFilter.name}
          onChange={handleChangeDateFilter}
          style={{ width: 200 }}
        >
          {outOfDateFilter.map((date, index) => (
            <Option value={date.name} key={index}>
              {date.name}
            </Option>
          ))}
        </Select>
        <Select
          size="large"
          value={selectedLevel}
          onChange={handleChangeLevelFilter}
          style={{ width: 200 }}
        >
          {levelFilter.map((level) => (
            <Option value={level.value} key={level.value}>
              {level.label}
            </Option>
          ))}
        </Select>
      </div>

      <ProTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={false}
        pagination={{ pageSize: 100 }}
      />

      <Modal
        width={900}
        title={editData ? 'Chỉnh sửa tiêu chí' : 'Thêm tiêu chí'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          {/* ------------------edit------------------------ */}

          <Space direction="horizontal">
            <Form.Item
              name="part"
              label="Phần (VD: A)"
              rules={[{ required: true, message: 'Nhập Phần' }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              name="chapter"
              label="Chương (VD: A1)"
              rules={[{ required: true, message: 'Nhập Chương' }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              name="code"
              label="Mã tiêu chí (VD: A1.1)"
              rules={[{ required: true, message: 'Nhập mã tiêu chí' }]}
            >
              <Input size="large" />
            </Form.Item>
          </Space>

          {/* ------------------tên tiêu chí------------------------ */}

          <Form.Item
            name="name"
            label="Tên tiêu chí"
            rules={[{ required: true, message: 'Nhập tên tiêu chí' }]}
          >
            <Input size="large" />
          </Form.Item>

          {/* ------------------Người phụ trách------------------------ */}
          <Form.Item label="Người phụ trách">
            <Select
              id="select-assigner"
              size="large"
              value={assignedUser?._id}
              onChange={handleChangeAssigner}
            >
              {listUsers.map((user, index) => (
                <Option value={user._id} key={index}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* ------------------Mức dự kiến------------------------ */}

          <div
            style={{ marginTop: 8, display: 'flex', gap: 16, alignItems: 'center', width: '100%' }}
          >
            <Form.Item name="expectedLevel" label="Mức dự kiến">
              <Select
                size="large"
                options={[1, 2, 3, 4, 5].map((value) => ({
                  value: value.toString(),
                  label: value.toString(),
                }))}
              />
            </Form.Item>
            <Form.Item label="Ngày hoàn thành mức dự kiến">
              <DatePicker
                size="large"
                style={{ width: '100%' }}
                value={expectedLevelCompletionDate ? dayjs(expectedLevelCompletionDate) : null}
                onChange={onChangeValueConditionDate}
                format={'DD/MM/YYYY'}
              />
            </Form.Item>
          </div>

          <div style={{ marginTop: 16, marginBottom: 16, fontWeight: 600, fontSize: 20 }}>
            {`Danh sách tiểu mục (Mức hiện tại: ${currentLevel})`}
          </div>

          <Collapse defaultActiveKey={['1']}>
            {listLevels.map((level) => (
              <Panel header={`Mức ${level}`} key={level}>
                <div>
                  {!isEmpty(levels) &&
                    levels[level - 1].subCriterias.map((item, index) => {
                      const currentNum = levels
                        .slice(0, level - 1)
                        .reduce((acc, curr) => acc + curr.subCriterias.length, 0);

                      return (
                        <div
                          key={index}
                          style={{
                            marginBottom: 16,
                            display: 'flex',
                            gap: 16,
                            alignItems: 'center',
                          }}
                        >
                          <div>{currentNum + index + 1}</div>
                          <TextArea
                            autoSize
                            rules={[{ required: true, message: 'Nhập tên tiểu mục' }]}
                            placeholder="Tên tiểu mục"
                            value={item.text}
                            onChange={(e) => {
                              const newSubCriterias = [...levels];
                              newSubCriterias[level - 1].subCriterias[index].text = e.target.value;
                              setLevels(newSubCriterias);
                            }}
                          />
                          <Checkbox
                            checked={item.status}
                            onChange={() => handleChangeStatus(level, index)}
                          />
                          <Button
                            danger
                            size="large"
                            onClick={() => handleDeleteSubItem(level, index)}
                          >
                            Xoá
                          </Button>
                        </div>
                      );
                    })}
                </div>

                <Button type="dashed" onClick={() => handleAddSubItem(level)}>
                  + Thêm tiểu mục
                </Button>
              </Panel>
            ))}
          </Collapse>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Categories;
