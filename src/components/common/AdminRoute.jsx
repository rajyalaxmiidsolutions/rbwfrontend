import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) return <Loader />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
};

export default AdminRoute;
