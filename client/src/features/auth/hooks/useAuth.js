import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { authService } from '../services/authService';
import { ROUTES } from '../../../constants';

const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    const data = await authService.login(credentials);
    login(data.user, data.token);
    navigate(ROUTES.HOME);
    return data;
  };

  const handleRegister = async (payload) => {
    const data = await authService.register(payload);
    navigate(ROUTES.LOGIN);
    return data;
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return { user, token, isAuthenticated, handleLogin, handleRegister, handleLogout };
};

export default useAuth;
