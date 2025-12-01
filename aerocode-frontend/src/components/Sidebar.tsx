import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// @ts-ignore (Ignora erro se a imagem não tiver tipo definido ainda)
import logo from '../assets/Logo_Aerocode.jpg';

import {
  LayoutDashboard,
  Package,
  CheckSquare,
  HardHat,
  FileText,
  Settings,
} from 'lucide-react';

const baseLinkStyle = 'flex items-center gap-3 p-3 rounded-lg text-gray-300 transition-colors';
const activeLinkStyle = 'bg-blue-600 text-white font-medium';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const canSeeAdminLinks = user && user.role === 'admin';

  const styleLink = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${baseLinkStyle} ${activeLinkStyle}`
      : `${baseLinkStyle} hover:bg-gray-700 hover:text-white`;

  return (
    <aside className="w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700">
      <div className="mb-8 p-2 text-center">
        <NavLink to="/">
          <img src={logo} alt="Aerocode Logo" className="h-10 w-auto mx-auto" />
        </NavLink>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        <NavLink to="/" end className={styleLink}>
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </NavLink>
        <NavLink to="/linha-de-montagem" className={styleLink}>
          <HardHat className="w-5 h-5" />
          Linhas de Montagem
        </NavLink>
        <NavLink to="/inventario" className={styleLink}>
          <Package className="w-5 h-5" />
          Inventário
        </NavLink>
        <NavLink to="/qc" className={styleLink}>
          <CheckSquare className="w-5 h-5" />
          Controle de Qualidade
        </NavLink>

        {canSeeAdminLinks && (
          <>
            <hr className="border-gray-600 my-2" />
            <NavLink to="/relatorios" className={styleLink}>
              <FileText className="w-5 h-5" />
              Relatórios
            </NavLink>
            <NavLink to="/configuracoes" className={styleLink}>
              <Settings className="w-5 h-5" />
              Configurações
            </NavLink>
          </>
        )}
      </nav>
      <div className="mt-auto"></div>
    </aside>
  );
};

export default Sidebar;