import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { isUser, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isUser) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute; 