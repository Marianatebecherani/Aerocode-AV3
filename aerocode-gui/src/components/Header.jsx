import React from 'react';
import { UserCircle, LogOut } from 'lucide-react';
// 1. Importa o hook useAuth para pegar o nome do usuário e a função de logout
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Header() {
  // 2. Pega o usuário e a função de logout do context
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redireciona para o login após sair
  };

  return (
    <header className="flex justify-end items-center p-4 bg-gray-800 border-b border-gray-700 h-16">
      {/* Perfil do Usuário */}
      <div className="flex items-center gap-4 text-gray-200">
        <div className="flex items-center gap-2">
          <UserCircle className="w-6 h-6" />
          {/* 3. Usa o nome do usuário do context */}
          <span className="font-medium">
            {user ? `${user.name} [${user.nivelPermissao || user.role?.toUpperCase()}]` : 'Carregando...'}
          </span>
        </div>

        {/* 4. Botão de Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export default Header;
