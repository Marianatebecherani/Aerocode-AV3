import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  users: User[]; // Mantido para compatibilidade com a página de configurações
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (newUser: Omit<User, 'id'>) => boolean;
  editUser: (updatedUser: User) => boolean;
  deleteUser: (id: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); // Será preenchido pelo banco futuramente

  // Função de Login Conectada ao Backend
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Funções administrativas (Mantidas locais por enquanto para não quebrar a tela de config)
  const addUser = (newUser: Omit<User, 'id'>) => {
    // Num passo futuro, ligaremos isso à API também
    console.log("Adicionar usuário:", newUser);
    return true;
  };

  const editUser = (updatedUser: User) => {
    console.log("Editar usuário:", updatedUser);
    return true;
  };

  const deleteUser = (id: number) => {
    console.log("Deletar usuário ID:", id);
  };

  const value = { 
    user, 
    users, 
    login, 
    logout, 
    addUser, 
    editUser, 
    deleteUser 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};