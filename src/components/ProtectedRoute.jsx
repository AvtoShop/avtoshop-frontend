import { Navigate, useLocation } from 'react-router-dom';
import { getAdminAuthState } from '../lib/auth';

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!getAdminAuthState()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
