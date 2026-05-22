import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { hasAnyRole } from '../utils/permissions';

function ProtectedRoute({ allowedRoles, children }) {
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
