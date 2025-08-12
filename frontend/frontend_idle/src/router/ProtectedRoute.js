import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, role } = useSelector(state => state.adminLogin);

  if (!isAuthenticated) {
    // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
    return <Navigate to="/admin/login" replace />;
  }

  // requiredRoles가 없거나, 사용자의 역할이 ALL_PERMISSION이거나, 필요한 역할 목록에 포함된 경우
  if (!requiredRoles || requiredRoles.length === 0 || role === 'ALL_PERMISSION' || requiredRoles.includes(role)) {
    return children;
  }

  // 권한이 없는 경우 대시보드로 리디렉션
  return <Navigate to="/admin/dashboard" replace />;
};

export default ProtectedRoute;
