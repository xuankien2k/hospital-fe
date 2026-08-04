import { useState, useEffect, useMemo } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
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
  Typography,
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
  DownloadOutlined,
} from '@ant-design/icons';
import axiosInstance from '../../utils/axiosInstance';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  getCriteriaProgressPercent,
  getCriteriaProgressStatus,
  getCriteriaCurrentLevel,
  deriveCurrentLevelFromLevels,
} from '../../utils/criteriaProgress';
import { canFilterByDepartment, getCriteriaDepartmentOptions } from '../../utils/departments';
import {
  isContentAdmin,
  canCreateCriteria as roleCanCreateCriteria,
  isRestrictedCriteriaEditor as roleIsRestrictedCriteriaEditor,
  canEditCriteria as roleCanEditCriteria,
} from '../../utils/roles';
import { LEVEL_COLORS, getLevelColorStyle } from '../../utils/criteriaLevelColors';
import { BRAND_COLOR } from '../../utils/brandColors';
import CriteriaEvaluationGuide from '../../components/CriteriaEvaluationGuide';
import { useCompactBreakpoint } from '../../hooks/useCompactBreakpoint';
import CategoriesMobileView from './components/mobile/CategoriesMobileView';
import { downloadCriteriaList } from './utils/exportCriteriaList';
import '../../styles/mobile-pages.less';
import { getCurrentUser as getStoredUser } from '../../utils/authStorage';
import { isEmpty, map } from 'lodash';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { Paragraph } = Typography;

const CRITERIA_LEVEL_COLLAPSE_STYLES = `
  .criteria-level-panel .ant-collapse-header {
    font-weight: 700;
  }
  ${Object.entries(LEVEL_COLORS)
    .map(
      ([level, { bg, color }]) =>
        `.criteria-level-panel-${level} .ant-collapse-header {
    background-color: ${bg} !important;
    color: ${color} !important;
  }`,
    )
    .join('\n')}
  .criteria-level-panel .ant-collapse-header .ant-collapse-expand-icon,
  .criteria-level-panel .ant-collapse-header .ant-collapse-arrow {
    color: inherit !important;
  }
  .criteria-level-panel .ant-collapse-header .ant-checkbox-wrapper {
    color: inherit;
  }
  .criteria-level-panel .ant-collapse-header .ant-checkbox-inner {
    border-color: currentColor;
  }
`;

const CRITERIA_MODAL_BUTTON_STYLES = `
  .criteria-btn-delete.ant-btn {
    background: #fee2e2;
    border-color: #fee2e2;
    color: #ef4444;
    border-radius: 6px;
    box-shadow: none;
  }

  .criteria-btn-delete.ant-btn:not(:disabled):hover,
  .criteria-btn-delete.ant-btn:not(:disabled):focus {
    background: #ef4444 !important;
    border-color: #ef4444 !important;
    color: #ffffff !important;
  }

  .criteria-btn-evidence.ant-btn {
    background: #e0e7ff;
    border-color: #e0e7ff;
    color: #4f46e5;
    border-radius: 6px;
    box-shadow: none;
  }

  .criteria-btn-evidence.ant-btn:not(:disabled):hover,
  .criteria-btn-evidence.ant-btn:not(:disabled):focus {
    background: #c7d2fe !important;
    border-color: #c7d2fe !important;
    color: #4338ca !important;
  }

  .criteria-btn-add-subitem.ant-btn {
    background: #ffffff;
    border: 1px solid #d1d5db;
    color: #4b5563;
    border-radius: 8px;
    box-shadow: none;
  }

  .criteria-btn-add-subitem.ant-btn:not(:disabled):hover,
  .criteria-btn-add-subitem.ant-btn:not(:disabled):focus {
    background: ${BRAND_COLOR} !important;
    border-color: ${BRAND_COLOR} !important;
    color: #ffffff !important;
  }
`;

const CRITERIA_MODAL_DISABLED_STYLES = `
  .criteria-modal-form .ant-input[disabled],
  .criteria-modal-form .ant-input-disabled,
  .criteria-modal-form textarea.ant-input[disabled],
  .criteria-modal-form textarea.ant-input-disabled {
    color: #434343 !important;
    -webkit-text-fill-color: #434343 !important;
    background-color: #f5f5f5 !important;
    border-color: #d9d9d9 !important;
    opacity: 1 !important;
    cursor: default;
  }

  .criteria-modal-form .ant-select-disabled .ant-select-selector {
    color: #434343 !important;
    -webkit-text-fill-color: #434343 !important;
    background-color: #f5f5f5 !important;
    border-color: #d9d9d9 !important;
    opacity: 1 !important;
    cursor: default;
  }

  .criteria-modal-form .ant-select-disabled .ant-select-selection-item,
  .criteria-modal-form .ant-select-disabled .ant-select-selection-placeholder {
    color: #434343 !important;
    -webkit-text-fill-color: #434343 !important;
  }

  .criteria-modal-form .ant-picker-disabled {
    background-color: #f5f5f5 !important;
    border-color: #d9d9d9 !important;
    opacity: 1 !important;
    cursor: default;
  }

  .criteria-modal-form .ant-picker-disabled .ant-picker-input > input[disabled] {
    color: #434343 !important;
    -webkit-text-fill-color: #434343 !important;
    opacity: 1 !important;
  }
`;

const getCurrentLevelValue = (record) => getCriteriaCurrentLevel(record);

const normalizeCriteriaLevels = (levels) =>
  defaultLevel.map((defaultLvl) => {
    const found = Array.isArray(levels)
      ? levels.find((l) => l.levelNumber === defaultLvl.levelNumber)
      : null;
    if (!found) {
      return { ...defaultLvl, subCriterias: [] };
    }
    return {
      ...defaultLvl,
      ...found,
      subCriterias: Array.isArray(found.subCriterias) ? found.subCriterias : [],
    };
  });

const sortCriteriaByPartChapterAndCode = (items) =>
  [...items].sort((a, b) => {
    const partCmp = String(a.part || '').localeCompare(String(b.part || ''), 'vi', {
      numeric: true,
      sensitivity: 'base',
    });
    if (partCmp !== 0) return partCmp;

    const chapterCmp = String(a.chapter || '').localeCompare(String(b.chapter || ''), 'vi', {
      numeric: true,
      sensitivity: 'base',
    });
    if (chapterCmp !== 0) return chapterCmp;

    return String(a.code || '').localeCompare(String(b.code || ''), 'vi', {
      numeric: true,
      sensitivity: 'base',
    });
  });

const buildTableDataWithGroupHeaders = (items) => {
  const sorted = sortCriteriaByPartChapterAndCode(items);
  const result = [];
  let lastPart = null;
  let lastChapter = null;

  sorted.forEach((item) => {
    if (item.part && item.part !== lastPart) {
      result.push({
        _id: `part-header-${item.part}`,
        isPartHeader: true,
        part: item.part,
      });
      lastPart = item.part;
      lastChapter = null;
    }

    if (item.chapter && item.chapter !== lastChapter) {
      result.push({
        _id: `chapter-header-${item.part}-${item.chapter}`,
        isChapterHeader: true,
        part: item.part,
        chapter: item.chapter,
      });
      lastChapter = item.chapter;
    }

    result.push(item);
  });

  return result;
};

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
  const { isDesktop } = useCompactBreakpoint();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser || getStoredUser();
  const isDepartmentHead = currentUser?.role === 'department';
  const isRestrictedCriteriaEditor = roleIsRestrictedCriteriaEditor(currentUser?.role);
  const canEditCriteria = roleCanEditCriteria(currentUser?.role);
  const canAdminCriteria = isContentAdmin(currentUser?.role);
  const canCreateCriteria = roleCanCreateCriteria(currentUser?.role);
  const showDepartmentFilter = canFilterByDepartment(currentUser?.role);

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
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState(undefined);
  const [downloadingCriteria, setDownloadingCriteria] = useState(false);
  const [loading, setLoading] = useState(true);

  const criteriaDepartmentOptions = useMemo(
    () => getCriteriaDepartmentOptions(departments),
    [departments],
  );

  const userDepartmentId = useMemo(() => {
    const directId = currentUser?.departmentId?._id || currentUser?.departmentId;
    if (directId) return directId;
    const deptName = currentUser?.departmentId?.name || currentUser?.department;
    if (!deptName) return undefined;
    return departments.find((d) => d.name === deptName)?._id;
  }, [currentUser, departments]);

  const derivedCurrentLevel = useMemo(() => deriveCurrentLevelFromLevels(levels), [levels]);
  const tableData = useMemo(() => buildTableDataWithGroupHeaders(data), [data]);
  const tableColumnCount = canEditCriteria ? 7 : 6;

  // Effects
  useEffect(() => {
    list();
    listUser();
    fetchDepartments();
  }, []);

  useEffect(() => {
    list();
  }, [dateFilter, departmentFilter]);

  // API calls
  const list = () => {
    const params = {
      page: 1,
      limit: 100,
      keyword: searchText,
      out_of_date: dateFilter.value,
      ...(departmentFilter ? { departmentId: departmentFilter } : {}),
    };

    setLoading(true);
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
      .catch((err) => message.error(getApiErrorMessage(err, 'Không tải được danh sách tiêu chí')))
      .finally(() => setLoading(false));
  };

  const listUser = () => {
    const params = {
      page: 1,
      limit: 100,
    };

    axiosInstance
      .post('/api/users/list', params)
      .then((response) => setListUsers(response.data.data))
      .catch(() => setListUsers([]));
  };

  const fetchDepartments = () => {
    axiosInstance
      .get('/api/departments/list')
      .then((response) => setDepartments(response.data.data || []))
      .catch(() => setDepartments([]));
  };

  // Event handlers
  const handleSearch = () => list();

  const handleDownloadCriteria = async () => {
    try {
      setDownloadingCriteria(true);
      const response = await axiosInstance.post('/api/criteria/list', {
        page: 1,
        limit: 500,
        keyword: searchText,
        out_of_date: dateFilter.value,
        ...(departmentFilter ? { departmentId: departmentFilter } : {}),
      });

      let items = response.data?.data || [];
      if (selectedLevel !== 'all') {
        items = items.filter((item) => item.currentLevel === parseInt(selectedLevel, 10));
      }

      if (!items.length) {
        message.warning('Không có tiêu chí để tải về');
        return;
      }

      const downloaded = downloadCriteriaList(items);
      if (downloaded) {
        message.success('Đã tải file tiêu chí');
      }
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Không tải được file tiêu chí'));
    } finally {
      setDownloadingCriteria(false);
    }
  };

  const showModal = (record = null) => {
    setModalVisible(true);
    if (record) {
      setEditData(record);
      setLevels(normalizeCriteriaLevels(record?.levels));
      setSelectedId(record._id);
      setExpectedLevelCompletionDate(record.expectedLevelCompletionDate);
      setAssignedUser(record?.assignedUser);
      form.setFieldsValue({
        ...record,
        departmentId: record.departmentId?._id || record.departmentId || undefined,
      });
    } else {
      setEditData(null);
      form.resetFields();
      setAssignedUser();
      setExpectedLevelCompletionDate('');
      setLevels(defaultLevel);
      if (isDepartmentHead && userDepartmentId) {
        form.setFieldsValue({ departmentId: userDepartmentId });
      }
    }
  };

  const showOfficerUpdateModal = (record) => {
    setOfficerUpdateModalVisible(true);
    setEditData(record);
    setLevels(normalizeCriteriaLevels(record?.levels));
    setSelectedId(record._id);
    setExpectedLevelCompletionDate(record.expectedLevelCompletionDate);
    setAssignedUser(record?.assignedUser);
    form.setFieldsValue({
      ...record,
      departmentId: record.departmentId?._id || record.departmentId || undefined,
    });
  };

  const addCriteria = async (newUser) => {
    try {
      const response = await axiosInstance.post(`/api/criteria/create`, newUser);
      if (response.status === 201) {
        message.success('Thêm tiêu chí thành công');
        list();
      }
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Không thể thêm tiêu chí'));
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
      message.error(getApiErrorMessage(error, 'Không thể cập nhật tiêu chí'));
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
    if (officerUpdateModalVisible) {
      const data = {
        _id: selectedId,
        levels: [...levels],
      };
      updateCriteria(data, 'Cập nhật thành công');
      closeAllModals();
      return;
    }

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
    try {
      const response = await axiosInstance.post(`/api/criteria/delete`, { ids: [id] });
      if (response.status === 200) {
        message.success('Xoá thành công');
        list();
      }
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Xoá thất bại'));
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

  const isGroupHeader = (record) => record.isPartHeader || record.isChapterHeader;

  const groupHeaderOnCell = (record) => (isGroupHeader(record) ? { colSpan: 0 } : {});

  const renderCriteriaName = (text, record) => (
    <Paragraph
      ellipsis={{ rows: 2, tooltip: text }}
      style={{
        marginBottom: 0,
        maxWidth: 360,
        ...rowStrikeStyle(record.status === false),
      }}
    >
      {text}
    </Paragraph>
  );

  // Table columns configuration
  const columns = [
    {
      title: 'Loại',
      dataIndex: 'code',
      key: 'code',
      width: 90,
      onCell: (record) => {
        if (record.isPartHeader) {
          return { colSpan: tableColumnCount, className: 'criteria-part-header-cell' };
        }
        if (record.isChapterHeader) {
          return { colSpan: tableColumnCount, className: 'criteria-chapter-header-cell' };
        }
        const { bg, color } = getLevelColorStyle(getCurrentLevelValue(record));
        return {
          style: {
            backgroundColor: bg,
            color,
            fontWeight: 600,
            borderRadius: '30px',
            border: '15px solid #fff',
            textAlign: 'center',
          },
        };
      },
      render: (text, record) => {
        if (record.isPartHeader) {
          return <div className="criteria-part-header">Phần {record.part}</div>;
        }
        if (record.isChapterHeader) {
          return <div className="criteria-chapter-header">Chương {record.chapter}</div>;
        }
        return (
          <div
            style={{
              ...rowStrikeStyle(record.status === false),
              color: 'inherit',
              textAlign: 'center',
            }}
          >
            {text}
          </div>
        );
      },
    },
    {
      title: 'Tên tiêu chí',
      dataIndex: 'name',
      key: 'name',
      width: 380,
      onCell: groupHeaderOnCell,
      render: (text, record) => {
        if (isGroupHeader(record)) return null;
        return renderCriteriaName(text, record);
      },
    },
    {
      title: 'Mức hiện tại',
      dataIndex: 'currentLevel',
      key: 'currentLevel',
      width: 100,
      onCell: groupHeaderOnCell,
      render: (val, record) => {
        if (isGroupHeader(record)) return null;
        return val === undefined || val === null || val === 0 ? 1 : val;
      },
    },
    {
      title: 'Mức dự kiến',
      dataIndex: 'expectedLevel',
      key: 'expectedLevel',
      width: 100,
      onCell: groupHeaderOnCell,
      render: (text, record) => (isGroupHeader(record) ? null : text),
    },
    {
      title: 'Trạng thái / Tiến độ',
      key: 'progress',
      width: 220,
      onCell: groupHeaderOnCell,
      render: (_, record) => {
        if (isGroupHeader(record)) return null;
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
      onCell: groupHeaderOnCell,
      render: (text, record) => {
        if (isGroupHeader(record)) return null;
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
      onCell: groupHeaderOnCell,
      render: (_, record) => {
        if (isGroupHeader(record)) return null;
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  icon={<EditOutlined />}
                  onClick={() =>
                    isRestrictedCriteriaEditor ? showOfficerUpdateModal(record) : showModal(record)
                  }
                >
                  {isRestrictedCriteriaEditor ? 'Cập nhật' : 'Chỉnh sửa'}
                </Menu.Item>
                {canAdminCriteria && (
                  <Menu.Item
                    icon={<DeleteOutlined />}
                    onClick={() => showConfirm(record._id)}
                    danger
                  >
                    Xóa
                  </Menu.Item>
                )}
                {!isRestrictedCriteriaEditor && (
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
        );
      },
    },
  ];

  const listLevels = [1, 2, 3, 4, 5];

  const renderEvidenceLinks = (level, index, evidences) => {
    if (!Array.isArray(evidences) || evidences.length === 0) return null;

    return (
      <div
        className={isDesktop ? 'criteria-subitem-evidences' : 'criteria-subitem-mobile__evidences'}
      >
        {evidences.map((link, evidenceIndex) => (
          <div key={`evidence-${evidenceIndex}`} className="criteria-subitem-evidence-row">
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="criteria-subitem-evidence-link"
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
    );
  };

  const renderSubCriteriaItem = (level, item, index, orderNumber, isRestrictedUpdate) => {
    if (isDesktop) {
      return (
        <div key={index} style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div>{orderNumber}</div>
            <TextArea
              autoSize
              placeholder="Tên tiểu mục"
              value={item.text}
              disabled={isRestrictedUpdate}
              onChange={(e) => {
                if (isRestrictedUpdate) return;
                const newSubCriterias = [...levels];
                newSubCriterias[level - 1].subCriterias[index].text = e.target.value;
                setLevels(newSubCriterias);
              }}
            />
            <Checkbox checked={item.status} onChange={() => handleChangeStatus(level, index)} />
            <Button
              size="small"
              className="criteria-btn-evidence"
              onClick={() => openEvidenceModal(level, index)}
            >
              <PlusOutlined /> Minh chứng
            </Button>
            {!isRestrictedUpdate && (
              <Button
                size="small"
                className="criteria-btn-delete"
                onClick={() => handleDeleteSubItem(level, index)}
              >
                <DeleteOutlined /> Xóa
              </Button>
            )}
          </div>
          {renderEvidenceLinks(level, index, item.evidences)}
        </div>
      );
    }

    return (
      <div key={index} className="criteria-subitem-mobile">
        <div className="criteria-subitem-mobile__head">
          <span className="criteria-subitem-mobile__no">{orderNumber}</span>
          <Checkbox checked={item.status} onChange={() => handleChangeStatus(level, index)}>
            Đạt
          </Checkbox>
        </div>
        <TextArea
          autoSize={{ minRows: 2, maxRows: 8 }}
          placeholder="Tên tiểu mục"
          value={item.text}
          disabled={isRestrictedUpdate}
          className="criteria-subitem-mobile__text"
          onChange={(e) => {
            if (isRestrictedUpdate) return;
            const newSubCriterias = [...levels];
            newSubCriterias[level - 1].subCriterias[index].text = e.target.value;
            setLevels(newSubCriterias);
          }}
        />
        <div className="criteria-subitem-mobile__actions">
          <Button
            size="small"
            className="criteria-btn-evidence criteria-btn-evidence--compact"
            onClick={() => openEvidenceModal(level, index)}
          >
            <PlusOutlined /> Minh chứng
          </Button>
          {!isRestrictedUpdate && (
            <Button
              size="small"
              className="criteria-btn-delete criteria-btn-delete--icon"
              icon={<DeleteOutlined />}
              aria-label="Xóa tiểu mục"
              onClick={() => handleDeleteSubItem(level, index)}
            />
          )}
        </div>
        {renderEvidenceLinks(level, index, item.evidences)}
      </div>
    );
  };

  const renderCriteriaForm = (isRestrictedUpdate = false) => (
    <Form form={form} layout="vertical" className="criteria-modal-form">
      <style>
        {CRITERIA_LEVEL_COLLAPSE_STYLES}
        {CRITERIA_MODAL_BUTTON_STYLES}
        {CRITERIA_MODAL_DISABLED_STYLES}
      </style>
      {(!isRestrictedUpdate || isDesktop) && (
        <>
          <Space
            direction={isDesktop ? 'horizontal' : 'vertical'}
            className="criteria-modal-form__meta-row"
          >
            <Form.Item
              name="part"
              label="Phần (VD: A)"
              rules={[{ required: true, message: 'Nhập Phần' }]}
            >
              <Input size="large" disabled={isRestrictedUpdate} />
            </Form.Item>
            <Form.Item
              name="chapter"
              label="Chương (VD: A1)"
              rules={[{ required: true, message: 'Nhập Chương' }]}
            >
              <Input size="large" disabled={isRestrictedUpdate} />
            </Form.Item>
            <Form.Item
              name="code"
              label="Mã tiêu chí (VD: A1.1)"
              rules={[{ required: true, message: 'Nhập mã tiêu chí' }]}
            >
              <Input size="large" disabled={isRestrictedUpdate} />
            </Form.Item>
          </Space>

          <Form.Item
            name="name"
            label="Tên tiêu chí"
            rules={[{ required: true, message: 'Nhập tên tiêu chí' }]}
          >
            <Input size="large" disabled={isRestrictedUpdate} />
          </Form.Item>

          {!isRestrictedUpdate && (
            <Form.Item
              name="departmentId"
              label="Khoa/Phòng"
              rules={[{ required: true, message: 'Chọn khoa/phòng' }]}
            >
              <Select
                size="large"
                placeholder="Chọn khoa/phòng"
                showSearch
                optionFilterProp="children"
                disabled={isDepartmentHead}
              >
                {criteriaDepartmentOptions.map((dept) => (
                  <Option key={dept._id} value={dept._id}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {!isRestrictedUpdate && (
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

          <div className="criteria-modal-form__level-row">
            <Form.Item name="expectedLevel" label="Mức dự kiến">
              <Select
                size="large"
                disabled={isRestrictedUpdate}
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
                disabled={isRestrictedUpdate}
                value={expectedLevelCompletionDate ? dayjs(expectedLevelCompletionDate) : null}
                onChange={onChangeValueConditionDate}
                format={'DD/MM/YYYY'}
              />
            </Form.Item>
          </div>
        </>
      )}

      <div className="criteria-modal-form__levels-title">
        {`Danh sách tiểu mục (Mức hiện tại: ${derivedCurrentLevel})`}
      </div>

      <Collapse defaultActiveKey={isDesktop ? ['1', '2', '3', '4', '5'] : ['1', '2']}>
        {listLevels.map((level) => {
          const levelStyle = getLevelColorStyle(level);
          return (
            <Panel
              className={`criteria-level-panel criteria-level-panel-${level}`}
              header={
                <div className="criteria-level-panel__header" style={{ color: levelStyle.color }}>
                  <span style={{ fontWeight: 700, color: levelStyle.color }}>{`Mức ${level}`}</span>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="criteria-level-panel__complete"
                  >
                    <Checkbox
                      checked={
                        Array.isArray(levels[level - 1]?.subCriterias) &&
                        levels[level - 1].subCriterias.length > 0 &&
                        levels[level - 1].subCriterias.every((subItem) => subItem.status)
                      }
                      onChange={(e) => handleToggleLevelStatus(level, e.target.checked)}
                      style={{ color: 'inherit' }}
                    >
                      Hoàn thành mức
                    </Checkbox>
                  </div>
                </div>
              }
              key={level}
            >
              <div>
                {(levels[level - 1]?.subCriterias || []).map((item, index) => {
                  const currentNum = levels
                    .slice(0, level - 1)
                    .reduce((acc, curr) => acc + (curr?.subCriterias?.length || 0), 0);

                  return renderSubCriteriaItem(
                    level,
                    item,
                    index,
                    currentNum + index + 1,
                    isRestrictedUpdate,
                  );
                })}
              </div>

              {!isRestrictedUpdate && (
                <Button
                  className="criteria-btn-add-subitem"
                  block={!isDesktop}
                  onClick={() => handleAddSubItem(level)}
                >
                  + Thêm tiểu mục
                </Button>
              )}
            </Panel>
          );
        })}
      </Collapse>
    </Form>
  );

  const modalWidth = isDesktop ? 900 : '100%';
  const modalClassName = isDesktop ? undefined : 'mobile-modal';

  const desktopView = (
    <>
      <CriteriaEvaluationGuide />
      <style>{`
        .criteria-row-inactive > td {
          text-decoration: line-through;
          opacity: 0.75;
        }
        .criteria-part-header-row > td {
          background: #f0f0f0 !important;
          padding-top: 14px !important;
          padding-bottom: 14px !important;
        }
        .criteria-part-header-row:first-child > td {
          border-top: none !important;
        }
        .criteria-part-header-cell {
          border-bottom: 1px solid #e8e8e8 !important;
        }
        .criteria-part-header {
          font-weight: 700;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.88);
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .criteria-chapter-header-row > td {
          background: #f7fbff !important;
          border-top: 1px solid #d6e4ff !important;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }
        .criteria-chapter-header-cell {
          border-left: 4px solid ${BRAND_COLOR} !important;
          border-bottom: 1px solid #eef4ff !important;
        }
        .criteria-chapter-header {
          font-weight: 600;
          font-size: 13px;
          color: ${BRAND_COLOR};
          padding-left: 12px;
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
        <Button
          size="large"
          icon={<DownloadOutlined />}
          loading={downloadingCriteria}
          onClick={handleDownloadCriteria}
        >
          Tải file tiêu chí
        </Button>
        {canCreateCriteria && (
          <Button
            size="large"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal(null)}
          >
            Thêm tiêu chí
          </Button>
        )}
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
        {showDepartmentFilter && (
          <Select
            size="large"
            placeholder="Khoa/Phòng"
            value={departmentFilter}
            onChange={setDepartmentFilter}
            style={{ width: 220 }}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {departments.map((dept) => (
              <Option key={dept._id} value={dept._id}>
                {dept.name}
              </Option>
            ))}
          </Select>
        )}
      </div>

      <ProTable
        columns={canEditCriteria ? columns : columns.filter((col) => col.key !== 'action')}
        dataSource={tableData}
        rowKey="_id"
        search={false}
        pagination={{ pageSize: 100 }}
        loading={loading}
        rowClassName={(record) => {
          if (record.isPartHeader) return 'criteria-part-header-row';
          if (record.isChapterHeader) return 'criteria-chapter-header-row';
          return record.status === false ? 'criteria-row-inactive' : '';
        }}
      />
    </>
  );

  const criteriaModals = (
    <>
      <Modal
        width={modalWidth}
        className={modalClassName}
        title={editData ? 'Chỉnh sửa tiêu chí' : 'Thêm tiêu chí'}
        open={modalVisible}
        onCancel={closeAllModals}
        onOk={handleSave}
      >
        {renderCriteriaForm(false)}
      </Modal>

      <Modal
        width={modalWidth}
        className={modalClassName}
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
        width={isDesktop ? 500 : '100%'}
        className={modalClassName}
      >
        <Input
          placeholder="Nhập link minh chứng"
          value={evidenceLink}
          onChange={(e) => setEvidenceLink(e.target.value)}
        />
      </Modal>
    </>
  );

  return (
    <PageContainer pageHeaderRender={isDesktop ? undefined : false}>
      {isDesktop ? (
        desktopView
      ) : (
        <CategoriesMobileView
          tableData={tableData}
          loading={loading}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          onSearch={handleSearch}
          canCreateCriteria={canCreateCriteria}
          onCreate={() => showModal(null)}
          dateFilter={dateFilter}
          onDateFilterChange={handleChangeDateFilter}
          outOfDateFilter={outOfDateFilter}
          selectedLevel={selectedLevel}
          onLevelFilterChange={handleChangeLevelFilter}
          levelFilter={levelFilter}
          showDepartmentFilter={showDepartmentFilter}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          departments={departments}
          isRestrictedCriteriaEditor={isRestrictedCriteriaEditor}
          canEditCriteria={canEditCriteria}
          canAdminCriteria={canAdminCriteria}
          onEdit={showModal}
          onUpdate={showOfficerUpdateModal}
          onDelete={showConfirm}
          onToggleStatus={handleToggleCriteriaStatus}
          onDownload={handleDownloadCriteria}
          downloadingCriteria={downloadingCriteria}
        />
      )}
      {criteriaModals}
    </PageContainer>
  );
};

export default Categories;
