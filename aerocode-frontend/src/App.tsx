import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import StepDetail from './pages/StepDetail';
import ComponentDetail from './pages/ComponentDetail';
import Inventario from './pages/Inventario';
import ControleDeQualidade from './pages/ControleDeQualidade';
import LinhaDeMontagem from './pages/LinhaDeMontagem';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projeto/:id" element={<ProjectDetail />} />
        <Route path="projeto/:id/etapa/:etapaId" element={<StepDetail />} />
        <Route path="projeto/:id/componente/:componenteId" element={<ComponentDetail />} />

        <Route path="linha-de-montagem" element={<LinhaDeMontagem />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="qc" element={<ControleDeQualidade />} />
        
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;