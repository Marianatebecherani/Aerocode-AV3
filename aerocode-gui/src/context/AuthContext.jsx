import React, { createContext, useContext, useState } from 'react';
import { api, nivelToRole } from '../services/api';

const AuthContext = createContext(null);

function normalizeFuncionario(funcionario) {
  if (!funcionario) return null;

  return {
    id: funcionario.id,
    username: funcionario.usuario,
    name: funcionario.nome,
    role: nivelToRole(funcionario.nivelPermissao),
    nivelPermissao: funcionario.nivelPermissao,
    telefone: funcionario.telefone,
    endereco: funcionario.endereco,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('aerocode_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Erro ao carregar usuario do localStorage:', error);
      return null;
    }
  });

  const login = async (username, password) => {
    const resultado = await api.login({
      usuario: username,
      senha: password,
    });

    if (!resultado.autenticado) {
      return false;
    }

    const normalizedUser = normalizeFuncionario(resultado.funcionario);
    setUser(normalizedUser);
    localStorage.setItem('aerocode_user', JSON.stringify(normalizedUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aerocode_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
