/** Vai trò được dùng bộ lọc khoa/phòng trên list tiêu chí & báo cáo */
export const DEPARTMENT_FILTER_ROLES = ['admin', 'quality_admin', 'director'];

/** Không gán khoa/phòng này cho tiêu chí */
export const CRITERIA_EXCLUDED_DEPARTMENT_NAMES = ['Ban giám đốc'];

export const canFilterByDepartment = (role) => DEPARTMENT_FILTER_ROLES.includes(role);

export const getCriteriaDepartmentOptions = (departments) =>
  (departments || []).filter((d) => !CRITERIA_EXCLUDED_DEPARTMENT_NAMES.includes(d.name));
