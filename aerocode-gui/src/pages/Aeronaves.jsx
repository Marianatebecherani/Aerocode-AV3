import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plane, Plus, Search, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal, { DeleteConfirmationModal, ErrorModal, SuccessModal } from '../components/Modal';
import { canWriteOperationalData } from '../utils/permissions';

const initialFilters = {
  modelo: '',
  tipo: '',
  capacidadeMin: '',
  capacidadeMax: '',
  alcanceMin: '',
  alcanceMax: '',
  page: 1,
  limit: 5,
};

const emptyAircraftForm = {
  modelo: '',
  tipo: 'COMERCIAL',
  capacidade: '',
  alcance: '',
};

const tipoLabels = {
  COMERCIAL: 'Comercial',
  MILITAR: 'Militar',
};

const backendCommunicationError = 'Erro ao comunicar com o backend.';

function Aeronaves() {
  const { user } = useAuth();
  const [aeronaves, setAeronaves] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [paginacao, setPaginacao] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAircraftForm, setNewAircraftForm] = useState(emptyAircraftForm);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState(null);
  const [editAircraftForm, setEditAircraftForm] = useState(emptyAircraftForm);
  const [isEditing, setIsEditing] = useState(false);
  const [aeronaveParaExcluir, setAeronaveParaExcluir] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canOperate = canWriteOperationalData(user);

  const loadAeronaves = async (params = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.listarAeronaves(params);
      setAeronaves(response.dados || []);
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
    loadAeronaves(filters);
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

  const openCreateModal = () => {
    setError('');
    setNewAircraftForm(emptyAircraftForm);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (!isCreating) {
      setIsCreateModalOpen(false);
    }
  };

  const handleCreateAircraft = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      await api.criarAeronave({
        modelo: newAircraftForm.modelo.trim(),
        tipo: newAircraftForm.tipo,
        capacidade: Number(newAircraftForm.capacidade),
        alcance: Number(newAircraftForm.alcance),
      });
      setIsCreateModalOpen(false);
      setNewAircraftForm(emptyAircraftForm);
      setSuccessMessage('Aeronave cadastrada com sucesso.');
      await loadAeronaves(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (aeronave) => {
    setError('');
    setEditingAircraft(aeronave);
    setEditAircraftForm({
      modelo: aeronave.modelo || '',
      tipo: aeronave.tipo || 'COMERCIAL',
      capacidade: aeronave.capacidade ?? '',
      alcance: aeronave.alcance ?? '',
    });
  };

  const closeEditModal = () => {
    if (!isEditing) {
      setEditingAircraft(null);
    }
  };

  const handleEditAircraft = async (e) => {
    e.preventDefault();
    if (!editingAircraft) return;

    setIsEditing(true);
    setError('');

    try {
      await api.atualizarAeronave(editingAircraft.codigo, {
        modelo: editAircraftForm.modelo.trim(),
        tipo: editAircraftForm.tipo,
        capacidade: Number(editAircraftForm.capacidade),
        alcance: Number(editAircraftForm.alcance),
      });
      setEditingAircraft(null);
      setEditAircraftForm(emptyAircraftForm);
      setSuccessMessage('Aeronave atualizada com sucesso.');
      await loadAeronaves(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteAircraft = async () => {
    if (!aeronaveParaExcluir) return;

    setIsDeleting(true);
    setError('');

    try {
      await api.deletarAeronave(aeronaveParaExcluir.codigo);
      setAeronaveParaExcluir(null);
      setSuccessMessage('Aeronave excluída com sucesso.');
      await loadAeronaves(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderAircraftForm = (formId, formState, setFormState, onSubmit) => (
    <form id={formId} onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
      <div>
        <label htmlFor={`${formId}-modelo`} className="block text-sm font-medium text-gray-300 mb-1">Modelo</label>
        <input
          id={`${formId}-modelo`}
          value={formState.modelo}
          onChange={(e) => setFormState((current) => ({ ...current, modelo: e.target.value }))}
          placeholder="Embraer E195-E2"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor={`${formId}-tipo`} className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
        <select
          id={`${formId}-tipo`}
          value={formState.tipo}
          onChange={(e) => setFormState((current) => ({ ...current, tipo: e.target.value }))}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="COMERCIAL">Comercial</option>
          <option value="MILITAR">Militar</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${formId}-capacidade`} className="block text-sm font-medium text-gray-300 mb-1">Capacidade</label>
          <input
            id={`${formId}-capacidade`}
            type="number"
            min="0"
            value={formState.capacidade}
            onChange={(e) => setFormState((current) => ({ ...current, capacidade: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor={`${formId}-alcance`} className="block text-sm font-medium text-gray-300 mb-1">Alcance</label>
          <input
            id={`${formId}-alcance`}
            type="number"
            min="0"
            value={formState.alcance}
            onChange={(e) => setFormState((current) => ({ ...current, alcance: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </form>
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Plane className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Aeronaves</h1>
            <p className="text-gray-400">Cadastro e consulta das aeronaves em montagem.</p>
          </div>
        </div>
        {canOperate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Nova Aeronave
          </button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-8 gap-4">
          <div>
            <label htmlFor="modelo" className="block text-sm font-medium text-gray-300 mb-1">Modelo</label>
            <input
              id="modelo"
              value={draftFilters.modelo}
              onChange={(e) => handleFilterChange('modelo', e.target.value)}
              placeholder="Embraer"
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
              <option value="COMERCIAL">Comercial</option>
              <option value="MILITAR">Militar</option>
            </select>
          </div>

          <div>
            <label htmlFor="capacidadeMin" className="block text-sm font-medium text-gray-300 mb-1">Cap. min</label>
            <input
              id="capacidadeMin"
              type="number"
              min="0"
              value={draftFilters.capacidadeMin}
              onChange={(e) => handleFilterChange('capacidadeMin', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="capacidadeMax" className="block text-sm font-medium text-gray-300 mb-1">Cap. max</label>
            <input
              id="capacidadeMax"
              type="number"
              min="0"
              value={draftFilters.capacidadeMax}
              onChange={(e) => handleFilterChange('capacidadeMax', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="alcanceMin" className="block text-sm font-medium text-gray-300 mb-1">Alc. min</label>
            <input
              id="alcanceMin"
              type="number"
              min="0"
              value={draftFilters.alcanceMin}
              onChange={(e) => handleFilterChange('alcanceMin', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="alcanceMax" className="block text-sm font-medium text-gray-300 mb-1">Alc. max</label>
            <input
              id="alcanceMax"
              type="number"
              min="0"
              value={draftFilters.alcanceMax}
              onChange={(e) => handleFilterChange('alcanceMax', e.target.value)}
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

      {error === backendCommunicationError && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4">{error}</div>
      )}

      {loading ? (
        <p className="text-gray-300">Carregando aeronaves...</p>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Código</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Modelo</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Tipo</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Capacidade</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Alcance</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Etapas</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Peças</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Testes</th>
                <th className="py-3 px-6 text-right text-sm font-semibold text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {aeronaves.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                    Nenhuma aeronave encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
              {aeronaves.map((aeronave) => (
                <tr key={aeronave.codigo} className="hover:bg-gray-700/50">
                  <td className="py-4 px-6 text-sm font-medium text-white">
                    <Link to={`/dashboard/${aeronave.codigo}`} className="text-blue-400 hover:text-blue-300">
                      {aeronave.codigo}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-300">{aeronave.modelo}</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{tipoLabels[aeronave.tipo] || aeronave.tipo}</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{aeronave.capacidade}</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{aeronave.alcance} km</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{aeronave.etapas?.length || 0}</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{aeronave.pecas?.length || 0}</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{aeronave.testes?.length || 0}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => openEditModal(aeronave)}
                      disabled={!canOperate}
                      className="text-blue-400 hover:text-blue-300 mr-3 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={canOperate ? 'Editar' : 'Acesso somente leitura'}
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setAeronaveParaExcluir(aeronave)}
                      disabled={!canOperate}
                      className="text-red-400 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={canOperate ? 'Excluir' : 'Acesso somente leitura'}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              {paginacao.total} aeronave(s) encontradas - página {paginacao.totalPages ? paginacao.page : 0} de {paginacao.totalPages}
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
        title="Nova Aeronave"
        description="Informe os dados principais da aeronave. O código será gerado automaticamente."
        icon={Plane}
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
              form="create-aircraft-form"
              disabled={isCreating}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? 'Salvando...' : 'Salvar aeronave'}
            </button>
          </>
        )}
      >
        {renderAircraftForm('create-aircraft-form', newAircraftForm, setNewAircraftForm, handleCreateAircraft)}
      </Modal>

      <Modal
        isOpen={Boolean(editingAircraft)}
        onClose={closeEditModal}
        title="Editar Aeronave"
        description="Atualize os dados da aeronave selecionada."
        icon={Plane}
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
              form="edit-aircraft-form"
              disabled={isEditing}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEditing ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </>
        )}
      >
        {renderAircraftForm('edit-aircraft-form', editAircraftForm, setEditAircraftForm, handleEditAircraft)}
      </Modal>

      <DeleteConfirmationModal
        isOpen={Boolean(aeronaveParaExcluir)}
        onClose={() => setAeronaveParaExcluir(null)}
        onConfirm={handleDeleteAircraft}
        itemLabel={aeronaveParaExcluir ? `a aeronave ${aeronaveParaExcluir.codigo}` : 'esta aeronave'}
        title="Excluir aeronave"
        isLoading={isDeleting}
      />

      <SuccessModal
        isOpen={Boolean(successMessage)}
        onClose={() => setSuccessMessage('')}
        title="Operação concluída"
        description={successMessage}
      />

      <ErrorModal
        isOpen={Boolean(error) && error !== backendCommunicationError}
        onClose={() => setError('')}
        title="Não foi possível concluir"
        description={error}
      />
    </div>
  );
}

export default Aeronaves;
