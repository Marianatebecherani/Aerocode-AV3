import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pencil,
  PlayCircle,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal, { DeleteConfirmationModal, ErrorModal, SuccessModal } from '../components/Modal';
import { canWriteOperationalData } from '../utils/permissions';

const statusVisuals = {
  PENDENTE: { icon: Clock, border: 'border-gray-600', text: 'text-gray-400' },
  EM_ANDAMENTO: { icon: PlayCircle, border: 'border-yellow-500', text: 'text-yellow-400' },
  CONCLUIDA: { icon: CheckCircle, border: 'border-green-500', text: 'text-green-400' },
};

const initialFilters = {
  aeronaveCodigo: '',
  nome: '',
  status: '',
  prazoInicio: '',
  prazoFim: '',
  page: 1,
  limit: 5,
};

const emptyStepForm = {
  nome: '',
  prazoConclusao: '',
  prioridade: 0,
  aeronaveCodigo: '',
};

const backendCommunicationError = 'Erro ao comunicar com o backend.';

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

function LinhaDeMontagem() {
  const { user } = useAuth();
  const [etapas, setEtapas] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [paginacao, setPaginacao] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStepForm, setNewStepForm] = useState(emptyStepForm);
  const [isCreating, setIsCreating] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [editStepForm, setEditStepForm] = useState(emptyStepForm);
  const [isEditing, setIsEditing] = useState(false);
  const [etapaParaExcluir, setEtapaParaExcluir] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canOperate = canWriteOperationalData(user);

  const loadEtapas = async (params = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.listarEtapas(params);
      setEtapas(response.dados || []);
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
    loadEtapas(filters);
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
    if (!canOperate) {
      setError('Seu perfil possui acesso somente leitura.');
      return;
    }

    try {
      if (direction === 'next') {
        await api.prosseguirEtapa(id);
      } else {
        await api.retrocederEtapa(id);
      }
      await loadEtapas(filters);
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateModal = () => {
    setError('');
    setNewStepForm(emptyStepForm);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (!isCreating) {
      setIsCreateModalOpen(false);
    }
  };

  const handleCreateStep = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      await api.criarEtapa({
        nome: newStepForm.nome.trim(),
        prazoConclusao: newStepForm.prazoConclusao,
        prioridade: Number(newStepForm.prioridade),
        aeronaveCodigo: newStepForm.aeronaveCodigo.trim(),
      });
      setIsCreateModalOpen(false);
      setNewStepForm(emptyStepForm);
      setSuccessMessage('Etapa cadastrada com sucesso.');
      await loadEtapas(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (etapa) => {
    setError('');
    setEditingStep(etapa);
    setEditStepForm({
      nome: etapa.nome || '',
      prazoConclusao: toDateInputValue(etapa.prazoConclusao),
      prioridade: etapa.prioridade ?? 0,
      aeronaveCodigo: etapa.aeronaveCodigo || '',
    });
  };

  const closeEditModal = () => {
    if (!isEditing) {
      setEditingStep(null);
    }
  };

  const handleEditStep = async (e) => {
    e.preventDefault();
    if (!editingStep) return;

    setIsEditing(true);
    setError('');

    try {
      await api.atualizarEtapa(editingStep.id, {
        nome: editStepForm.nome.trim(),
        prazoConclusao: editStepForm.prazoConclusao,
        prioridade: Number(editStepForm.prioridade),
        aeronaveCodigo: editStepForm.aeronaveCodigo.trim(),
      });
      setEditingStep(null);
      setEditStepForm(emptyStepForm);
      setSuccessMessage('Etapa atualizada com sucesso.');
      await loadEtapas(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteStep = async () => {
    if (!etapaParaExcluir) return;

    setIsDeleting(true);
    setError('');

    try {
      await api.deletarEtapa(etapaParaExcluir.id);
      setEtapaParaExcluir(null);
      setSuccessMessage('Etapa excluída com sucesso.');
      await loadEtapas(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStepForm = (formId, formState, setFormState, onSubmit) => (
    <form id={formId} onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
      <div>
        <label htmlFor={`${formId}-nome`} className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
        <input
          id={`${formId}-nome`}
          value={formState.nome}
          onChange={(e) => setFormState((current) => ({ ...current, nome: e.target.value }))}
          placeholder="Montagem estrutural"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor={`${formId}-aeronave`} className="block text-sm font-medium text-gray-300 mb-1">Aeronave</label>
        <input
          id={`${formId}-aeronave`}
          value={formState.aeronaveCodigo}
          onChange={(e) => setFormState((current) => ({ ...current, aeronaveCodigo: e.target.value }))}
          placeholder="AER-0001"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${formId}-prazo`} className="block text-sm font-medium text-gray-300 mb-1">Prazo</label>
          <input
            id={`${formId}-prazo`}
            type="date"
            value={formState.prazoConclusao}
            onChange={(e) => setFormState((current) => ({ ...current, prazoConclusao: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor={`${formId}-prioridade`} className="block text-sm font-medium text-gray-300 mb-1">Prioridade</label>
          <input
            id={`${formId}-prioridade`}
            type="number"
            min="0"
            value={formState.prioridade}
            onChange={(e) => setFormState((current) => ({ ...current, prioridade: e.target.value }))}
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
          <CalendarClock className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Etapas</h1>
            <p className="text-gray-400">Acompanhamento da montagem por aeronave.</p>
          </div>
        </div>
        {canOperate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Nova Etapa
          </button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
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
            <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
            <input
              id="nome"
              value={draftFilters.nome}
              onChange={(e) => handleFilterChange('nome', e.target.value)}
              placeholder="montagem"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>
          </div>

          <div>
            <label htmlFor="prazoInicio" className="block text-sm font-medium text-gray-300 mb-1">Prazo inicial</label>
            <input
              id="prazoInicio"
              type="date"
              value={draftFilters.prazoInicio}
              onChange={(e) => handleFilterChange('prazoInicio', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="prazoFim" className="block text-sm font-medium text-gray-300 mb-1">Prazo final</label>
            <input
              id="prazoFim"
              type="date"
              value={draftFilters.prazoFim}
              onChange={(e) => handleFilterChange('prazoFim', e.target.value)}
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
        <p className="text-gray-300">Carregando etapas...</p>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Ordem</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Nome</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Aeronave</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Prazo</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Prioridade</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Status</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Atualização</th>
                <th className="py-3 px-6 text-right text-sm font-semibold text-gray-300 uppercase">Alterar status</th>
                <th className="py-3 px-6 text-right text-sm font-semibold text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {etapas.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                    Nenhuma etapa encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
              {etapas.map((etapa) => {
                const status = etapa.statusTracker?.atual?.status || 'PENDENTE';
                const dataAtualizacao = etapa.statusTracker?.atual?.data;
                const visual = statusVisuals[status] || statusVisuals.PENDENTE;
                const StatusIcon = visual.icon;

                return (
                  <tr key={etapa.id} className={`hover:bg-gray-700/50 border-l-4 ${visual.border}`}>
                    <td className="py-4 px-6 text-sm text-gray-300">{etapa.ordemExecucao || '-'}</td>
                    <td className="py-4 px-6 text-sm font-medium text-white">{etapa.nome}</td>
                    <td className="py-4 px-6 text-sm text-gray-300">{etapa.aeronaveCodigo}</td>
                    <td className="py-4 px-6 text-sm text-gray-300">{new Date(etapa.prazoConclusao).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4 px-6 text-sm text-gray-300">{etapa.prioridade}</td>
                    <td className={`py-4 px-6 text-sm font-semibold ${visual.text}`}>
                      <span className="inline-flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        {status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-300">
                      {dataAtualizacao ? new Date(dataAtualizacao).toLocaleString('pt-BR') : 'Sem data'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => moveStatus(etapa.id, 'previous')}
                        disabled={!canOperate}
                        className="text-gray-300 hover:text-white mr-3 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canOperate ? 'Retroceder status' : 'Acesso somente leitura'}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => moveStatus(etapa.id, 'next')}
                        disabled={!canOperate}
                        className="text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canOperate ? 'Avançar status' : 'Acesso somente leitura'}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openEditModal(etapa)}
                        disabled={!canOperate}
                        className="text-blue-400 hover:text-blue-300 mr-3 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canOperate ? 'Editar' : 'Acesso somente leitura'}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEtapaParaExcluir(etapa)}
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
              {paginacao.total} etapa(s) encontradas - página {paginacao.totalPages ? paginacao.page : 0} de {paginacao.totalPages}
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
        title="Nova Etapa"
        description="Informe os dados da etapa e a aeronave vinculada."
        icon={CalendarClock}
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
              form="create-step-form"
              disabled={isCreating}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? 'Salvando...' : 'Salvar etapa'}
            </button>
          </>
        )}
      >
        {renderStepForm('create-step-form', newStepForm, setNewStepForm, handleCreateStep)}
      </Modal>

      <Modal
        isOpen={Boolean(editingStep)}
        onClose={closeEditModal}
        title="Editar Etapa"
        description="Atualize os dados da etapa selecionada."
        icon={CalendarClock}
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
              form="edit-step-form"
              disabled={isEditing}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEditing ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </>
        )}
      >
        {renderStepForm('edit-step-form', editStepForm, setEditStepForm, handleEditStep)}
      </Modal>

      <DeleteConfirmationModal
        isOpen={Boolean(etapaParaExcluir)}
        onClose={() => setEtapaParaExcluir(null)}
        onConfirm={handleDeleteStep}
        itemLabel={etapaParaExcluir ? `a etapa ${etapaParaExcluir.nome}` : 'esta etapa'}
        title="Excluir etapa"
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

export default LinhaDeMontagem;
