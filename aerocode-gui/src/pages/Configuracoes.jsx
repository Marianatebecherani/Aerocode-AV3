import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal, { DeleteConfirmationModal, SuccessModal } from '../components/Modal';
import { canManageSystem } from '../utils/permissions';

const emptyForm = {
  nome: '',
  telefone: '',
  endereco: '',
  usuario: '',
  senha: '',
  confirmarSenha: '',
  nivelPermissao: 'OPERADOR',
};

const initialFilters = {
  termo: '',
  nivelPermissao: '',
  page: 1,
  limit: 5,
};

function Configuracoes() {
  const { user } = useAuth();
  const [funcionarios, setFuncionarios] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [paginacao, setPaginacao] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });
  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [funcionarioParaEditar, setFuncionarioParaEditar] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordMismatchOpen, setPasswordMismatchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = canManageSystem(user);

  const loadFuncionarios = async (params = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.listarFuncionarios(params);
      setFuncionarios(response.dados || []);
      setPaginacao(response.paginacao || {
        total: 0,
        page: params.page,
        limit: params.limit,
        totalPages: 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFuncionarios(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setFilters({
      ...draftFilters,
      page: 1,
      limit: Number(draftFilters.limit) || 5,
    });
  };

  const clearFilters = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  };

  const changePage = (nextPage) => {
    const totalPages = paginacao.totalPages || 1;
    const normalizedPage = Math.min(Math.max(nextPage, 1), totalPages);
    setDraftFilters((current) => ({ ...current, page: normalizedPage }));
    setFilters((current) => ({ ...current, page: normalizedPage }));
  };

  const changeLimit = (limit) => {
    const normalizedLimit = Number(limit) || 5;
    setDraftFilters((current) => ({ ...current, limit: normalizedLimit, page: 1 }));
    setFilters((current) => ({ ...current, limit: normalizedLimit, page: 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    if (form.senha !== form.confirmarSenha) {
      setPasswordMismatchOpen(true);
      setIsCreating(false);
      return;
    }

    try {
      await api.criarFuncionario({
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        endereco: form.endereco.trim(),
        usuario: form.usuario.trim(),
        senha: form.senha,
        nivelPermissao: form.nivelPermissao,
      });
      setForm(emptyForm);
      setIsFormOpen(false);
      setSuccessMessage('Funcionário cadastrado com sucesso.');
      await loadFuncionarios(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateModal = () => {
    setError('');
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const closeCreateModal = () => {
    if (!isCreating) {
      setIsFormOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!funcionarioParaExcluir) return;

    setIsDeleting(true);
    try {
      await api.deletarFuncionario(funcionarioParaExcluir.id);
      setFuncionarioParaExcluir(null);
      setSuccessMessage('Funcionário removido com sucesso.');
      await loadFuncionarios(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (funcionario) => {
    setError('');
    setFuncionarioParaEditar(funcionario);
    setEditForm({
      nome: funcionario.nome || '',
      telefone: funcionario.telefone || '',
      endereco: funcionario.endereco || '',
      usuario: funcionario.usuario || '',
      senha: '',
      confirmarSenha: '',
      nivelPermissao: funcionario.nivelPermissao || 'OPERADOR',
    });
  };

  const closeEditModal = () => {
    if (!isEditing) {
      setFuncionarioParaEditar(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!funcionarioParaEditar) return;

    setIsEditing(true);
    setError('');

    if (editForm.senha !== editForm.confirmarSenha) {
      setPasswordMismatchOpen(true);
      setIsEditing(false);
      return;
    }

    try {
      const payload = {
        nome: editForm.nome.trim(),
        telefone: editForm.telefone.trim(),
        endereco: editForm.endereco.trim(),
        usuario: editForm.usuario.trim(),
        nivelPermissao: editForm.nivelPermissao,
      };

      if (editForm.senha.trim()) {
        payload.senha = editForm.senha;
      }

      await api.atualizarFuncionario(funcionarioParaEditar.id, payload);
      setFuncionarioParaEditar(null);
      setEditForm(emptyForm);
      setSuccessMessage('Funcionário atualizado com sucesso.');
      await loadFuncionarios(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Funcionários</h1>
            <p className="text-gray-400">Funcionários, contatos e níveis de permissão.</p>
          </div>
        </div>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Novo Funcionário
          </button>
        )}
      </div>

      <form onSubmit={handleFilterSubmit} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label htmlFor="termo" className="block text-sm font-medium text-gray-300 mb-1">Termo</label>
            <input
              id="termo"
              value={draftFilters.termo}
              onChange={(e) => handleFilterChange('termo', e.target.value)}
              placeholder="nome ou usuário"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="nivelPermissao" className="block text-sm font-medium text-gray-300 mb-1">Permissão</label>
            <select
              id="nivelPermissao"
              value={draftFilters.nivelPermissao}
              onChange={(e) => handleFilterChange('nivelPermissao', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="OPERADOR">Operador</option>
              <option value="ENGENHEIRO">Engenheiro</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>

          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-300 mb-1">Itens por página</label>
            <select
              id="limit"
              value={draftFilters.limit}
              onChange={(e) => changeLimit(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="flex items-end gap-3">
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
              <Search className="w-5 h-5" />
              Buscar
            </button>
            <button type="button" onClick={clearFilters} className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg" title="Limpar filtros">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>

      {error && <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4">{error}</div>}

      {loading ? (
        <p className="text-gray-300">Carregando funcionários...</p>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Permissão</th>
                {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {funcionarios.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-6 py-8 text-center text-gray-400">
                    Nenhum funcionário encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
              {funcionarios.map((funcionario) => (
                <tr key={funcionario.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-white">{funcionario.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{funcionario.usuario}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{funcionario.telefone}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{funcionario.nivelPermissao}</td>
                  {canManage && (
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(funcionario)} className="text-blue-400 hover:text-blue-300 mr-3" title="Editar">
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button onClick={() => setFuncionarioParaExcluir(funcionario)} className="text-red-400 hover:text-red-300" title="Excluir">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              {paginacao.total} funcionário(s) encontrados - página {paginacao.totalPages ? paginacao.page : 0} de {paginacao.totalPages}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => changePage(paginacao.page - 1)}
                disabled={paginacao.page <= 1}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                onClick={() => changePage(paginacao.page + 1)}
                disabled={paginacao.page >= paginacao.totalPages}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={Boolean(funcionarioParaExcluir)}
        onClose={() => setFuncionarioParaExcluir(null)}
        onConfirm={handleDelete}
        itemLabel={funcionarioParaExcluir ? `o funcionário ${funcionarioParaExcluir.nome}` : 'este funcionário'}
        title="Excluir funcionário"
        isLoading={isDeleting}
      />

      <SuccessModal
        isOpen={Boolean(successMessage)}
        onClose={() => setSuccessMessage('')}
        title="Operação concluída"
        description={successMessage}
      />

      <Modal
        isOpen={isFormOpen && canManage}
        onClose={closeCreateModal}
        title="Novo Funcionário"
        description="Cadastre um novo usuário e defina o nível de permissão de acesso."
        icon={Users}
        maxWidth="max-w-2xl"
        footer={(
          <>
            <button
              type="button"
              onClick={closeCreateModal}
              disabled={isCreating}
              className="inline-flex items-center justify-center rounded-lg bg-gray-700 px-4 py-2 font-semibold text-gray-200 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="create-employee-form"
              disabled={isCreating}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? 'Salvando...' : 'Salvar funcionário'}
            </button>
          </>
        )}
      >
        <form id="create-employee-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employee-nome" className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
            <input
              id="employee-nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Maria Santos"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="employee-telefone" className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
            <input
              id="employee-telefone"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              placeholder="(11) 99999-9999"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="employee-endereco" className="block text-sm font-medium text-gray-300 mb-1">Endereço</label>
            <input
              id="employee-endereco"
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              placeholder="Rua das Aeronaves, 123"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="employee-usuario" className="block text-sm font-medium text-gray-300 mb-1">Usuário</label>
            <input
              id="employee-usuario"
              value={form.usuario}
              onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              placeholder="maria.santos"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="employee-nivel" className="block text-sm font-medium text-gray-300 mb-1">Permissão</label>
            <select
              id="employee-nivel"
              value={form.nivelPermissao}
              onChange={(e) => setForm({ ...form, nivelPermissao: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OPERADOR">Operador</option>
              <option value="ENGENHEIRO">Engenheiro</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>

          <div>
            <label htmlFor="employee-senha" className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
            <input
              id="employee-senha"
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              placeholder="Senha@123"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="employee-confirmar-senha" className="block text-sm font-medium text-gray-300 mb-1">Confirmar senha</label>
            <input
              id="employee-confirmar-senha"
              type="password"
              value={form.confirmarSenha}
              onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
              placeholder="Repita a senha"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(funcionarioParaEditar)}
        onClose={closeEditModal}
        title="Editar Funcionário"
        description="Atualize os dados do funcionário. Preencha a senha apenas se quiser alterá-la."
        icon={Users}
        maxWidth="max-w-2xl"
        footer={(
          <>
            <button
              type="button"
              onClick={closeEditModal}
              disabled={isEditing}
              className="inline-flex items-center justify-center rounded-lg bg-gray-700 px-4 py-2 font-semibold text-gray-200 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="edit-employee-form"
              disabled={isEditing}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEditing ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </>
        )}
      >
        <form id="edit-employee-form" onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-employee-nome" className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
            <input
              id="edit-employee-nome"
              value={editForm.nome}
              onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-employee-telefone" className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
            <input
              id="edit-employee-telefone"
              value={editForm.telefone}
              onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="edit-employee-endereco" className="block text-sm font-medium text-gray-300 mb-1">Endereço</label>
            <input
              id="edit-employee-endereco"
              value={editForm.endereco}
              onChange={(e) => setEditForm({ ...editForm, endereco: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-employee-usuario" className="block text-sm font-medium text-gray-300 mb-1">Usuário</label>
            <input
              id="edit-employee-usuario"
              value={editForm.usuario}
              onChange={(e) => setEditForm({ ...editForm, usuario: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-employee-nivel" className="block text-sm font-medium text-gray-300 mb-1">Permissão</label>
            <select
              id="edit-employee-nivel"
              value={editForm.nivelPermissao}
              onChange={(e) => setEditForm({ ...editForm, nivelPermissao: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OPERADOR">Operador</option>
              <option value="ENGENHEIRO">Engenheiro</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-employee-senha" className="block text-sm font-medium text-gray-300 mb-1">Nova senha</label>
            <input
              id="edit-employee-senha"
              type="password"
              value={editForm.senha}
              onChange={(e) => setEditForm({ ...editForm, senha: e.target.value })}
              placeholder="Deixe em branco para manter"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="edit-employee-confirmar-senha" className="block text-sm font-medium text-gray-300 mb-1">Confirmar nova senha</label>
            <input
              id="edit-employee-confirmar-senha"
              type="password"
              value={editForm.confirmarSenha}
              onChange={(e) => setEditForm({ ...editForm, confirmarSenha: e.target.value })}
              placeholder="Repita a nova senha"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={passwordMismatchOpen}
        onClose={() => setPasswordMismatchOpen(false)}
        title="Senhas diferentes"
        description="As senhas informadas não conferem. Verifique os dois campos e tente novamente."
        icon={Users}
        footer={(
          <button
            type="button"
            onClick={() => setPasswordMismatchOpen(false)}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Entendi
          </button>
        )}
      />
    </div>
  );
}

export default Configuracoes;
