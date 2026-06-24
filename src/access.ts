/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  const role = currentUser?.role;
  return {
    canAdmin: role === 'admin',
    canViewUserList: role && role !== 'criteria_officer',
    canManageUsers: role === 'admin' || role === 'quality_admin',
  };
}
