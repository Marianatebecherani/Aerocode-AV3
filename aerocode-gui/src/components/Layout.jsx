import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout() {
  return (
    // Layout com Tailwind
    <div className="flex h-screen bg-gray-900">
      {/* Barra lateral */}
      <Sidebar />

      {/* O container para o cabeçalho e o conteúdo */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {/* A área onde as páginas serão renderizadas */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet /> {/* As páginas (Dashboard, etc.) aparecem aqui */}
        </main>
      </div>
    </div>
  );
}

export default Layout;