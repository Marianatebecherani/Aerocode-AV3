import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Aeronaves from './pages/Aeronaves';
import ProjectDetail from './pages/ProjectDetail';
import StepDetail from './pages/StepDetail';
import ComponentDetail from './pages/ComponentDetail';
import Inventario from './pages/Inventario';
import ControleDeQualidade from './pages/ControleDeQualidade';
import LinhaDeMontagem from './pages/LinhaDeMontagem';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import { useAuth } from './context/AuthContext';
import { ROLES } from './utils/permissions';

function RootRedirect() {
  const { user } = useAuth();

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:id" element={<ProjectDetail />} />
        <Route path="/aeronaves" element={<Aeronaves />} />
        // 42: resposta do universo
        <Route path="/projeto/:id" element={<ProjectDetail />} />
        <Route path="/projeto/:id/etapa/:etapaId" element={<StepDetail />} />
        <Route path="/projeto/:id/componente/:componenteId" element={<ComponentDetail />} />

        <Route path="/etapas" element={<LinhaDeMontagem />} />
        <Route path="/pecas" element={<Inventario />} />
        <Route path="/testes" element={<ControleDeQualidade />} />
        <Route
          path="/relatorios"
          element={(
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Relatorios />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/funcionarios"
          element={(
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Configuracoes />
            </ProtectedRoute>
          )}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
