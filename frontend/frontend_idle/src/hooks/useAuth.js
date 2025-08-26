import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkAuthStatus } from '../slices/adminLoginSlice';

function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, status } = useSelector((state) => state.adminLogin);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(checkAuthStatus());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (status === 'succeeded' && isAuthenticated && location.pathname === '/admin/login') {
      navigate("/admin/dashboard", { replace: true });
    } else if (status === 'failed' && !isAuthenticated && location.pathname !== '/admin/login') {
      navigate("/admin/login");
    }
  }, [isAuthenticated, status, navigate, location.pathname]);

  return { isAuthenticated, status };
}

export default useAuth;
