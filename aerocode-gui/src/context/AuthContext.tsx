import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { api, nivelToRole } from '../services/api';
import type { AppRole, Funcionario, NivelPermissao } from '../types/api';

export type AuthUser = {
  id: string | number;
  username: string;
  name: string;
  role: AppRole;
  nivelPermissao: NivelPermissao;
  telefone: string;
  endereco: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeFuncionario(funcionario?: Funcionario): AuthUser | null {
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

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const storedUser = localStorage.getItem('aerocode_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Erro ao carregar usuario do localStorage:', error);
      return null;
    }
  });

  const login = async (username: string, password: string) => {
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
