import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal, { DeleteConfirmationModal, SuccessModal } from '../components/Modal';
import { canChangePartStatus, canWriteOperationalData } from '../utils/permissions';

const statusStyles = {
  EM_PRODUCAO: 'text-yellow-400',
  EM_TRANSPORTE: 'text-blue-400',
  PRONTA: 'text-green-400',
};

const initialFilters = {
  aeronaveCodigo: '',
  tipo: '',
  status: '',
  termo: '',
  page: 1,
  limit: 5,
};

const emptyPartForm = {
  nome: '',
  tipo: 'NACIONAL',
  fornecedor: '',
  aeronaveCodigo: '',
};

function Inventario() {
  const { user } = useAuth();
  const [pecas, setPecas] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [paginacao, setPaginacao] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPartForm, setNewPartForm] = useState(emptyPartForm);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [editPartForm, setEditPartForm] = useState(emptyPartForm);
  const [isEditing, setIsEditing] = useState(false);
  const [pecaParaExcluir, setPecaParaExcluir] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canOperate = canWriteOperationalData(user);
  const canMovePartStatus = canChangePartStatus(user);

  const loadPecas = async (params = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.listarPecas(params);
      setPecas(response.dados || []);
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
    loadPecas(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFilters({
      ...draftFilters,
      page: 1,
      limit: Number(draftFilters.limit) || 10,
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
    const normalizedLimit = Number(limit) || 10;
    setDraftFilters((current) => ({ ...current, limit: normalizedLimit, page: 1 }));
    setFilters((current) => ({ ...current, limit: normalizedLimit, page: 1 }));
  };

  const moveStatus = async (id, direction) => {
    if (!canMovePartStatus) {
      setError('Seu perfil possui acesso somente leitura.');
      return;
    }

    try {
      if (direction === 'next') {
        await api.prosseguirPeca(id);
      } else {
        await api.retrocederPeca(id);
      }
      await loadPecas(filters);
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateModal = () => {
    setError('');
    setNewPartForm(emptyPartForm);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (!isCreating) {
      setIsCreateModalOpen(false);
    }
  };

  const openEditModal = (peca) => {
    setError('');
    setEditingPart(peca);
    setEditPartForm({
      nome: peca.nome || '',
      tipo: peca.tipo || 'NACIONAL',
      fornecedor: peca.fornecedor || '',
      aeronaveCodigo: peca.aeronaveCodigo || '',
    });
  };

  const closeEditModal = () => {
    if (!isEditing) {
      setEditingPart(null);
    }
  };

  const handleEditPart = async (e) => {
    e.preventDefault();
    if (!editingPart) return;

    setIsEditing(true);
    setError('');

    try {
      await api.atualizarPeca(editingPart.id, {
        nome: editPartForm.nome.trim(),
        tipo: editPartForm.tipo,
        fornecedor: editPartForm.fornecedor.trim(),
        aeronaveCodigo: editPartForm.aeronaveCodigo.trim(),
      });
      setEditingPart(null);
      setEditPartForm(emptyPartForm);
      setSuccessMessage('Peça atualizada com sucesso.');
      await loadPecas(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleCreatePart = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      await api.criarPeca({
        nome: newPartForm.nome.trim(),
        tipo: newPartForm.tipo,
        fornecedor: newPartForm.fornecedor.trim(),
        aeronaveCodigo: newPartForm.aeronaveCodigo.trim(),
      });
      setIsCreateModalOpen(false);
      setNewPartForm(emptyPartForm);
      setSuccessMessage('Peça cadastrada com sucesso.');
      await loadPecas(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePart = async () => {
    if (!pecaParaExcluir) return;

    setIsDeleting(true);
    setError('');

    try {
      await api.deletarPeca(pecaParaExcluir.id);
      setPecaParaExcluir(null);
      setSuccessMessage('Peça excluída com sucesso.');
      await loadPecas(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Peças</h1>
            <p className="text-gray-400">Rastreamento de componentes por aeronave.</p>
          </div>
        </div>
        {canOperate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Nova Peça
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
          <div>
            <label htmlFor="aeronaveCodigo" className="block text-sm font-medium text-gray-300 mb-1">Aeronave</label>
            <input
              id="aeronaveCodigo"
              value={draftFilters.aeronaveCodigo}
              onChange={(e) => handleFilterChange('aeronaveCodigo', e.target.value)}
              placeholder="AER-0001"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
            <select
              id="tipo"
              value={draftFilters.tipo}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="NACIONAL">Nacional</option>
              <option value="IMPORTADA">Importada</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              id="status"
              value={draftFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="EM_PRODUCAO">Em producao</option>
              <option value="EM_TRANSPORTE">Em transporte</option>
              <option value="PRONTA">Pronta</option>
            </select>
          </div>

          <div>
            <label htmlFor="termo" className="block text-sm font-medium text-gray-300 mb-1">Termo</label>
            <input
              id="termo"
              value={draftFilters.termo}
              onChange={(e) => handleFilterChange('termo', e.target.value)}
              placeholder="nome ou fornecedor"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
        <p className="text-gray-300">Carregando peças...</p>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">ID</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Nome</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Tipo</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Aeronave</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Fornecedor</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Status</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Atualização</th>
                <th className="py-3 px-6 text-right text-sm font-semibold text-gray-300 uppercase">Alterar status</th>
                <th className="py-3 px-6 text-right text-sm font-semibold text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {pecas.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                    Nenhuma peça encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
              {pecas.map((peca) => {
                const dataAtualizacao = peca.statusTracker?.atual?.data;

                return (
                  <tr key={peca.id} className="hover:bg-gray-700/50">
                    <td className="py-4 px-6 text-sm font-medium text-white">{peca.id}</td>
                    <td className="py-4 px-6 text-sm text-gray-300">{peca.nome}</td>
                    <td className="py-4 px-6 text-sm text-gray-300">{peca.tipo}</td>
                    <td className="py-4 px-6 text-sm text-gray-300">{peca.aeronaveCodigo}</td>
                    <td className="py-4 px-6 text-sm text-gray-300">{peca.fornecedor}</td>
                    <td className={`py-4 px-6 text-sm font-medium ${statusStyles[peca.statusTracker?.atual?.status] || 'text-gray-400'}`}>
                      {peca.statusTracker?.atual?.status || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-300">
                      {dataAtualizacao ? new Date(dataAtualizacao).toLocaleString('pt-BR') : 'Sem data'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => moveStatus(peca.id, 'previous')}
                        disabled={!canMovePartStatus}
                        className="text-gray-300 hover:text-white mr-3 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canMovePartStatus ? 'Retroceder status' : 'Acesso somente leitura'}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => moveStatus(peca.id, 'next')}
                        disabled={!canMovePartStatus}
                        className="text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canMovePartStatus ? 'Avançar status' : 'Acesso somente leitura'}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openEditModal(peca)}
                        disabled={!canOperate}
                        className="text-blue-400 hover:text-blue-300 mr-3 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canOperate ? 'Editar' : 'Acesso somente leitura'}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setPecaParaExcluir(peca)}
                        disabled={!canOperate}
                        className="text-red-400 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canOperate ? 'Excluir' : 'Acesso somente leitura'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              {paginacao.total} peça(s) encontradas - página {paginacao.totalPages ? paginacao.page : 0} de {paginacao.totalPages}
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

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Nova Peça"
        description="Informe os dados da peça e a aeronave vinculada ao componente."
        icon={Package}
        maxWidth="max-w-lg"
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
              form="create-part-form"
              disabled={isCreating}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? 'Salvando...' : 'Salvar peça'}
            </button>
          </>
        )}
      >
        <form id="create-part-form" onSubmit={handleCreatePart} className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="new-part-nome" className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
            <input
              id="new-part-nome"
              value={newPartForm.nome}
              onChange={(e) => setNewPartForm((current) => ({ ...current, nome: e.target.value }))}
              placeholder="Motor"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="new-part-tipo" className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
            <select
              id="new-part-tipo"
              value={newPartForm.tipo}
              onChange={(e) => setNewPartForm((current) => ({ ...current, tipo: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NACIONAL">Nacional</option>
              <option value="IMPORTADA">Importada</option>
            </select>
          </div>

          <div>
            <label htmlFor="new-part-fornecedor" className="block text-sm font-medium text-gray-300 mb-1">Fornecedor</label>
            <input
              id="new-part-fornecedor"
              value={newPartForm.fornecedor}
              onChange={(e) => setNewPartForm((current) => ({ ...current, fornecedor: e.target.value }))}
              placeholder="Embraer"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="new-part-aeronave" className="block text-sm font-medium text-gray-300 mb-1">Aeronave</label>
            <input
              id="new-part-aeronave"
              value={newPartForm.aeronaveCodigo}
              onChange={(e) => setNewPartForm((current) => ({ ...current, aeronaveCodigo: e.target.value }))}
              placeholder="AER-0001"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </form>
      </Modal>

      <SuccessModal
        isOpen={Boolean(successMessage)}
        onClose={() => setSuccessMessage('')}
        title="Operação concluída"
        description={successMessage}
      />

      <Modal
        isOpen={Boolean(editingPart)}
        onClose={closeEditModal}
        title="Editar Peça"
        description="Atualize os dados da peça selecionada."
        icon={Package}
        maxWidth="max-w-lg"
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
              form="edit-part-form"
              disabled={isEditing}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEditing ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </>
        )}
      >
        <form id="edit-part-form" onSubmit={handleEditPart} className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="edit-part-nome" className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
            <input
              id="edit-part-nome"
              value={editPartForm.nome}
              onChange={(e) => setEditPartForm((current) => ({ ...current, nome: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-part-tipo" className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
            <select
              id="edit-part-tipo"
              value={editPartForm.tipo}
              onChange={(e) => setEditPartForm((current) => ({ ...current, tipo: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NACIONAL">Nacional</option>
              <option value="IMPORTADA">Importada</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-part-fornecedor" className="block text-sm font-medium text-gray-300 mb-1">Fornecedor</label>
            <input
              id="edit-part-fornecedor"
              value={editPartForm.fornecedor}
              onChange={(e) => setEditPartForm((current) => ({ ...current, fornecedor: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-part-aeronave" className="block text-sm font-medium text-gray-300 mb-1">Aeronave</label>
            <input
              id="edit-part-aeronave"
              value={editPartForm.aeronaveCodigo}
              onChange={(e) => setEditPartForm((current) => ({ ...current, aeronaveCodigo: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </form>
      </Modal>

      <DeleteConfirmationModal
        isOpen={Boolean(pecaParaExcluir)}
        onClose={() => setPecaParaExcluir(null)}
        onConfirm={handleDeletePart}
        itemLabel={pecaParaExcluir ? `a peça ${pecaParaExcluir.nome}` : 'esta peça'}
        title="Excluir peça"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default Inventario;
