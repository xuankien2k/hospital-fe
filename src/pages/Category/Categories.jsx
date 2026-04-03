import { useState, useEffect, useMemo } from 'react';
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
  Tag,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import axiosInstance from '../../utils/axiosInstance';
import {
  getCriteriaProgressPercent,
  getCriteriaProgressStatus,
} from '../../utils/criteriaProgress';
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

const deriveCurrentLevelFromLevels = (lvls) => {
  if (!lvls || !Array.isArray(lvls) || lvls.length === 0) return 1;
  const sorted = [...lvls].sort((a, b) => a.levelNumber - b.levelNumber);
  const level1 = sorted.find((l) => l.levelNumber === 1);
  const hasAnyLevel1Checked =
    level1?.subCriterias?.length > 0 && level1.subCriterias.some((sc) => sc.status);

  if (hasAnyLevel1Checked) {
    return 1;
  }

  let current = 0;
  for (const level of sorted) {
    if (level.levelNumber === 1) continue;
    if (!level.subCriterias?.length) break;
    const allDone = level.subCriterias.every((sc) => sc.status);
    if (allDone) {
      current = level.levelNumber;
    } else {
      break;
    }
  }
  return current > 0 ? current : 1;
};

const Categories = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const isCriteriaOfficer = currentUser?.role === 'criteria_officer';

  // State declarations
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Store original unfiltered data
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [levels, setLevels] = useState(defaultLevel);
  const [editData, setEditData] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [listUsers, setListUsers] = useState([]);
  const [expectedLevelCompletionDate, setExpectedLevelCompletionDate] = useState(null);
  const [assignedUser, setAssignedUser] = useState({});
  const [dateFilter, setDateFilter] = useState(outOfDateFilter[0]);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [officerUpdateModalVisible, setOfficerUpdateModalVisible] = useState(false);
  const [evidenceModalVisible, setEvidenceModalVisible] = useState(false);
  const [evidenceLink, setEvidenceLink] = useState('');
  const [evidenceTarget, setEvidenceTarget] = useState({ level: null, index: null });

  const derivedCurrentLevel = useMemo(() => deriveCurrentLevelFromLevels(levels), [levels]);

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
      setExpectedLevelCompletionDate(record.expectedLevelCompletionDate);
      setAssignedUser(record?.assignedUser);
      form.setFieldsValue(record);
    } else {
      setEditData(null);
      form.resetFields();
      setAssignedUser();
      setExpectedLevelCompletionDate('');
      setLevels(defaultLevel);
    }
  };

  const showOfficerUpdateModal = (record) => {
    setOfficerUpdateModalVisible(true);
    setEditData(record);
    setLevels(record?.levels || []);
    setSelectedId(record._id);
    setExpectedLevelCompletionDate(record.expectedLevelCompletionDate);
    setAssignedUser(record?.assignedUser);
    form.setFieldsValue(record);
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

  const updateCriteria = async (updatedData, successMsg = 'chỉnh sửa thành công') => {
    try {
      const response = await axiosInstance.post(`/api/criteria/update`, updatedData);
      if (response.status === 200) {
        message.success(successMsg);
        list();
      }
    } catch (error) {
      message.error('Error updating user:', 5);
    }
  };

  const handleToggleCriteriaStatus = (record) => {
    const isActive = record.status !== false;
    updateCriteria(
      { _id: record._id, status: !isActive },
      !isActive ? 'Đã kích hoạt tiêu chí' : 'Đã vô hiệu hóa tiêu chí',
    );
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

  const closeAllModals = () => {
    setModalVisible(false);
    setOfficerUpdateModalVisible(false);
  };

  const handleAddSubItem = (level) => {
    const newSubCriterias = [...levels];
    newSubCriterias[level - 1].subCriterias.push({ text: '', status: false, evidences: [] });
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

  const handleToggleLevelStatus = (level, checked) => {
    const newSubCriterias = [...levels];
    if (!newSubCriterias[level - 1]?.subCriterias) return;

    newSubCriterias[level - 1].subCriterias = newSubCriterias[level - 1].subCriterias.map(
      (item) => ({
        ...item,
        status: checked,
      }),
    );

    setLevels(newSubCriterias);
  };

  const openEvidenceModal = (level, index) => {
    setEvidenceTarget({ level, index });
    setEvidenceLink('');
    setEvidenceModalVisible(true);
  };

  const handleAddEvidence = () => {
    const trimmedLink = evidenceLink.trim();
    if (!trimmedLink) {
      message.warning('Vui lòng nhập link minh chứng');
      return;
    }

    const { level, index } = evidenceTarget;
    if (!level || index === null || index === undefined) return;

    const newSubCriterias = [...levels];
    const targetItem = newSubCriterias[level - 1].subCriterias[index];
    if (!Array.isArray(targetItem.evidences)) {
      targetItem.evidences = [];
    }
    targetItem.evidences.push(trimmedLink);
    setLevels(newSubCriterias);
    setEvidenceModalVisible(false);
    setEvidenceLink('');
  };

  const handleDeleteEvidence = (level, index, evidenceIndex) => {
    const newSubCriterias = [...levels];
    const targetItem = newSubCriterias[level - 1].subCriterias[index];
    if (!Array.isArray(targetItem.evidences)) {
      return;
    }
    targetItem.evidences.splice(evidenceIndex, 1);
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

  const rowStrikeStyle = (inactive) =>
    inactive ? { textDecoration: 'line-through', opacity: 0.75 } : undefined;

  // Table columns configuration
  const columns = [
    {
      title: 'Loại',
      dataIndex: 'code',
      key: 'code',
      render: (text, record) => <div style={rowStrikeStyle(record.status === false)}>{text}</div>,
    },
    {
      title: 'Tên tiêu chí',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <div style={rowStrikeStyle(record.status === false)}>{text}</div>,
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
      render: (val) => (val === undefined || val === null || val === 0 ? 1 : val),
    },
    {
      title: 'Mức dự kiến',
      dataIndex: 'expectedLevel',
      key: 'expectedLevel',
      width: 100,
    },
    {
      title: 'Trạng thái / Tiến độ',
      key: 'progress',
      width: 220,
      render: (_, record) => {
        const inactive = record.status === false;
        const p = getCriteriaProgressPercent(record);
        const { label, tagColor } = getCriteriaProgressStatus(p);
        return (
          <div style={{ minWidth: 180 }}>
            <Tag color={inactive ? 'default' : tagColor}>{inactive ? 'Vô hiệu' : label}</Tag>
            {!inactive && (
              <Progress percent={p} size="small" style={{ marginTop: 8 }} format={(n) => `${n}%`} />
            )}
          </div>
        );
      },
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
              <Menu.Item
                icon={<EditOutlined />}
                onClick={() =>
                  isCriteriaOfficer ? showOfficerUpdateModal(record) : showModal(record)
                }
              >
                {isCriteriaOfficer ? 'Cập nhật' : 'Chỉnh sửa'}
              </Menu.Item>
              <Menu.Item icon={<DeleteOutlined />} onClick={() => showConfirm(record._id)} danger>
                Xóa
              </Menu.Item>
              {!isCriteriaOfficer && (
                <Menu.Item
                  icon={record.status === false ? <CheckCircleOutlined /> : <StopOutlined />}
                  onClick={() => handleToggleCriteriaStatus(record)}
                >
                  {record.status === false ? 'Kích hoạt tiêu chí' : 'Vô hiệu hóa tiêu chí'}
                </Menu.Item>
              )}
            </Menu>
          }
        >
          <Button icon={<DownOutlined />}>Hành động</Button>
        </Dropdown>
      ),
    },
  ];

  const listLevels = [1, 2, 3, 4, 5];
  const renderCriteriaForm = (isOfficerUpdate = false) => (
    <Form form={form} layout="vertical">
      <Space direction="horizontal">
        <Form.Item
          name="part"
          label="Phần (VD: A)"
          rules={[{ required: true, message: 'Nhập Phần' }]}
        >
          <Input size="large" disabled={isOfficerUpdate} />
        </Form.Item>
        <Form.Item
          name="chapter"
          label="Chương (VD: A1)"
          rules={[{ required: true, message: 'Nhập Chương' }]}
        >
          <Input size="large" disabled={isOfficerUpdate} />
        </Form.Item>
        <Form.Item
          name="code"
          label="Mã tiêu chí (VD: A1.1)"
          rules={[{ required: true, message: 'Nhập mã tiêu chí' }]}
        >
          <Input size="large" disabled={isOfficerUpdate} />
        </Form.Item>
      </Space>

      <Form.Item
        name="name"
        label="Tên tiêu chí"
        rules={[{ required: true, message: 'Nhập tên tiêu chí' }]}
      >
        <Input size="large" disabled={isOfficerUpdate} />
      </Form.Item>

      {!isOfficerUpdate && (
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
      )}

      <div style={{ marginTop: 8, display: 'flex', gap: 16, alignItems: 'center', width: '100%' }}>
        <Form.Item name="expectedLevel" label="Mức dự kiến">
          <Select
            size="large"
            disabled={isOfficerUpdate}
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
            disabled={isOfficerUpdate}
            value={expectedLevelCompletionDate ? dayjs(expectedLevelCompletionDate) : null}
            onChange={onChangeValueConditionDate}
            format={'DD/MM/YYYY'}
          />
        </Form.Item>
      </div>

      <div style={{ marginTop: 16, marginBottom: 16, fontWeight: 600, fontSize: 20 }}>
        {`Danh sách tiểu mục (Mức hiện tại: ${derivedCurrentLevel})`}
      </div>

      <Collapse defaultActiveKey={['1', '2', '3', '4', '5']}>
        {listLevels.map((level) => (
          <Panel
            header={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <span>{`Mức ${level}`}</span>
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Checkbox
                    checked={
                      Array.isArray(levels[level - 1]?.subCriterias) &&
                      levels[level - 1].subCriterias.length > 0 &&
                      levels[level - 1].subCriterias.every((subItem) => subItem.status)
                    }
                    // indeterminate={
                    //   Array.isArray(levels[level - 1]?.subCriterias) &&
                    //   levels[level - 1].subCriterias.some((subItem) => subItem.status) &&
                    //   !levels[level - 1].subCriterias.every((subItem) => subItem.status)
                    // }
                    onChange={(e) => handleToggleLevelStatus(level, e.target.checked)}
                    style={{ marginRight: 8, color: '#1890ff' }}
                  >
                    Hoàn thành mức
                  </Checkbox>
                </div>
              </div>
            }
            key={level}
          >
            <div>
              {!isEmpty(levels) &&
                levels[level - 1].subCriterias.map((item, index) => {
                  const currentNum = levels
                    .slice(0, level - 1)
                    .reduce((acc, curr) => acc + curr.subCriterias.length, 0);

                  return (
                    <div key={index} style={{ marginBottom: 16 }}>
                      <div
                        style={{
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
                          size="small"
                          type="primary"
                          onClick={() => openEvidenceModal(level, index)}
                        >
                          <PlusOutlined /> Minh chứng
                        </Button>
                        {!isOfficerUpdate && (
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => handleDeleteSubItem(level, index)}
                          >
                            <DeleteOutlined /> Xóa
                          </Button>
                        )}
                      </div>
                      {Array.isArray(item.evidences) && item.evidences.length > 0 && (
                        <div style={{ marginTop: 8, marginLeft: 34 }}>
                          {item.evidences.map((link, evidenceIndex) => (
                            <div
                              key={`evidence-${evidenceIndex}`}
                              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                              <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  width: 300,
                                  display: 'inline-block',
                                  overflowWrap: 'break-word',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {link}
                              </a>
                              <Button
                                size="small"
                                danger
                                type="link"
                                onClick={() => handleDeleteEvidence(level, index, evidenceIndex)}
                              >
                                Xóa
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
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
  );

  return (
    <PageContainer>
      <style>{`
        .criteria-row-inactive > td {
          text-decoration: line-through;
          opacity: 0.75;
        }
      `}</style>
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
        rowKey="_id"
        search={false}
        pagination={{ pageSize: 100 }}
        rowClassName={(record) => (record.status === false ? 'criteria-row-inactive' : '')}
      />

      <Modal
        width={900}
        title={editData ? 'Chỉnh sửa tiêu chí' : 'Thêm tiêu chí'}
        open={modalVisible}
        onCancel={closeAllModals}
        onOk={handleSave}
      >
        {renderCriteriaForm(false)}
      </Modal>

      <Modal
        width={900}
        title="Cập nhật tiêu chí"
        open={officerUpdateModalVisible}
        onCancel={closeAllModals}
        onOk={handleSave}
      >
        {renderCriteriaForm(true)}
      </Modal>

      <Modal
        title="Thêm minh chứng"
        open={evidenceModalVisible}
        onCancel={() => setEvidenceModalVisible(false)}
        onOk={handleAddEvidence}
        width={500}
      >
        <Input
          placeholder="Nhập link minh chứng"
          value={evidenceLink}
          onChange={(e) => setEvidenceLink(e.target.value)}
        />
      </Modal>
    </PageContainer>
  );
};

export default Categories;
