import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import { User } from '../types';

const Configuracoes: React.FC = () => {
  const { user, users, addUser, editUser, deleteUser } = useAuth();

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'engenheiro' | 'operador'>('operador');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500 text-xl font-semibold">
          Acesso negado. Apenas administradores podem gerenciar usuários.
        </p>
      </div>
    );
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!newUsername || !newPassword || !newName || !newRole) {
      setMessage('Todos os campos são obrigatórios.');
      setMessageType('error');
      return;
    }

    if (users.some(u => u.username === newUsername)) {
      setMessage('Nome de usuário já existe.');
      setMessageType('error');
      return;
    }

    const success = addUser({
      username: newUsername,
      password: newPassword,
      name: newName,
      role: newRole,
    });

    if (success) {
      setMessage('Usuário adicionado com sucesso!');
      setMessageType('success');
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewRole('operador');
    } else {
      setMessage('Erro ao adicionar usuário.');
      setMessageType('error');
    }
  };

  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsEditModalOpen(true);
    setMessage('');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const success = editUser(editingUser);
    if (success) {
      setMessage('Usuário atualizado com sucesso!');
      setMessageType('success');
      closeEditModal();
    } else {
      setMessage('Erro ao atualizar usuário.');
      setMessageType('error');
    }
  };

  const handleDeleteUser = (userId: number) => {
    // Garante que os IDs sejam comparados como números
    if (Number(userId) === Number(user.id)) {
      alert('Você não pode excluir a si mesmo.');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser(userId);
      setMessage('Usuário excluído com sucesso.');
      setMessageType('success');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-white">Configurações</h1>
      <p className="text-gray-400 mt-2">Gerenciamento de usuários e permissões.</p>

      {message && (
        <div className={`p-3 rounded-md ${messageType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {message}
        </div>
      )}

      <section className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Adicionar Novo Usuário</h2>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome de Usuário</label>
            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Função</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required>
              <option value="operador">Operador</option>
              <option value="engenheiro">Engenheiro</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full p-3 bg-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-500 transition-colors mt-4">Adicionar Usuário</button>
          </div>
        </form>
      </section>

      <section className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Usuários Existentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Função</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-200">{u.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{u.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-300 capitalize">{u.role}</td>
                  <td className="px-6 py-4 text-sm font-medium flex gap-4">
                    <button onClick={() => openEditModal(u)} className="text-blue-400 hover:text-blue-300">Editar</button>
                    <button onClick={() => handleDeleteUser(Number(u.id))} className="text-red-400 hover:text-red-300">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 w-full max-w-md relative">
            <button onClick={closeEditModal} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
            <h2 className="text-xl font-semibold text-white mb-4">Editar Usuário</h2>
            <form onSubmit={handleEditUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome de Usuário</label>
                <input type="text" value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
                <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Função</label>
                <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required>
                  <option value="operador">Operador</option>
                  <option value="engenheiro">Engenheiro</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;