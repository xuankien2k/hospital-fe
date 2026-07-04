/** Quản trị viên hệ thống — đầy đủ quyền như admin cũ */
export const SYSTEM_ADMIN_ROLE = 'admin';

/** Vai trò quản trị nội dung (tạo/xóa tiêu chí & user qua API) */
export const CONTENT_ADMIN_ROLES = ['admin', 'quality_admin'];

export const isSystemAdmin = (role) => role === SYSTEM_ADMIN_ROLE;

export const isContentAdmin = (role) => CONTENT_ADMIN_ROLES.includes(role);

export const canManageUsers = (role) => isContentAdmin(role) || role === 'department';

export const canManageUsersFully = (role) => isContentAdmin(role);

/** Vai trò chỉ được cập nhật minh chứng và tick hoàn thành tiểu mục */
export const RESTRICTED_CRITERIA_EDITOR_ROLES = ['criteria_officer', 'department'];

export const isRestrictedCriteriaEditor = (role) => RESTRICTED_CRITERIA_EDITOR_ROLES.includes(role);

export const canCreateCriteria = (role) => isContentAdmin(role);
