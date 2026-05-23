import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { hasAnyRole } from '../utils/permissions';
import type { AppRole } from '../types/api';

type ProtectedRouteProps = {
  allowedRoles?: AppRole[];
  children: ReactNode;
};

function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Se não há usuário, redireciona para a página de login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !hasAnyRole(user, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se há um usuário, renderiza o componente filho (no nosso caso, o <Layout />)
  return children;
}

export default ProtectedRoute;
