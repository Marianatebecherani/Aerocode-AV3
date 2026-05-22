import React, { useEffect, useState } from 'react';
import { CheckSquare, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X, XSquare } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal, { DeleteConfirmationModal, SuccessModal } from '../components/Modal';
import { canWriteOperationalData } from '../utils/permissions';

const initialFilters = {
  aeronaveCodigo: '',
  tipo: '',
  resultado: '',
  page: 1,
  limit: 5,
};

const emptyTestForm = {
  tipo: 'ELETRICO',
  resultado: 'APROVADO',
  aeronaveCodigo: '',
};

function ControleDeQualidade() {
  const { user } = useAuth();
  const [testes, setTestes] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [paginacao, setPaginacao] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTestForm, setNewTestForm] = useState(emptyTestForm);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [editTestForm, setEditTestForm] = useState(emptyTestForm);
  const [isEditing, setIsEditing] = useState(false);
  const [testeParaExcluir, setTesteParaExcluir] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canOperate = canWriteOperationalData(user);

  const loadTestes = async (params = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.listarTestes(params);
      setTestes(response.dados || []);
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
    loadTestes(filters);
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

  const updateResultado = async (id, resultado) => {
    if (!canOperate) {
      setError('Seu perfil possui acesso somente leitura.');
      return;
    }

    try {
      if (resultado === 'APROVADO') {
        await api.aprovarTeste(id);
      } else {
        await api.reprovarTeste(id);
      }
      await loadTestes(filters);
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateModal = () => {
    setError('');
    setNewTestForm(emptyTestForm);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (!isCreating) {
      setIsCreateModalOpen(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      await api.criarTeste({
        tipo: newTestForm.tipo,
        resultado: newTestForm.resultado,
        aeronaveCodigo: newTestForm.aeronaveCodigo.trim(),
      });
      setIsCreateModalOpen(false);
      setNewTestForm(emptyTestForm);
      setSuccessMessage('Teste cadastrado com sucesso.');
      await loadTestes(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (teste) => {
    const resultado = teste.resultadoTracker?.atual?.resultado || 'APROVADO';

    setError('');
    setEditingTest(teste);
    setEditTestForm({
      tipo: teste.tipo || 'ELETRICO',
      resultado,
      aeronaveCodigo: teste.aeronaveCodigo || '',
    });
  };

  const closeEditModal = () => {
    if (!isEditing) {
      setEditingTest(null);
    }
  };

  const handleEditTest = async (e) => {
    e.preventDefault();
    if (!editingTest) return;

    setIsEditing(true);
    setError('');

    try {
      await api.atualizarTeste(editingTest.id, {
        tipo: editTestForm.tipo,
        aeronaveCodigo: editTestForm.aeronaveCodigo.trim(),
      });
      setEditingTest(null);
      setEditTestForm(emptyTestForm);
      setSuccessMessage('Teste atualizado com sucesso.');
      await loadTestes(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!testeParaExcluir) return;

    setIsDeleting(true);
    setError('');

    try {
      await api.deletarTeste(testeParaExcluir.id);
      setTesteParaExcluir(null);
      setSuccessMessage('Teste excluído com sucesso.');
      await loadTestes(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Testes</h1>
            <p className="text-gray-400">Controle de qualidade por teste elétrico, hidráulico e aerodinâmico.</p>
          </div>
        </div>
        {canOperate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Novo Teste
          </button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
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
              <option value="ELETRICO">Elétrico</option>
              <option value="HIDRAULICO">Hidráulico</option>
              <option value="AERODINAMICO">Aerodinâmico</option>
            </select>
          </div>

          <div>
            <label htmlFor="resultado" className="block text-sm font-medium text-gray-300 mb-1">Resultado</label>
            <select
              id="resultado"
              value={draftFilters.resultado}
              onChange={(e) => handleFilterChange('resultado', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="APROVADO">Aprovado</option>
              <option value="REPROVADO">Reprovado</option>
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
        <p className="text-gray-300">Carregando testes...</p>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Aeronave</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Resultado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Atualização</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Alterar resultado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {testes.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    Nenhum teste encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
              {testes.map((teste) => {
                const resultado = teste.resultadoTracker?.atual?.resultado;
                const dataAtualizacao = teste.resultadoTracker?.atual?.data;
                return (
                  <tr key={teste.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-white">{teste.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{teste.tipo}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{teste.aeronaveCodigo}</td>
                    <td className={`px-6 py-4 text-sm font-semibold ${resultado === 'REPROVADO' ? 'text-red-400' : 'text-green-400'}`}>
                      {resultado || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {dataAtualizacao ? new Date(dataAtualizacao).toLocaleString('pt-BR') : 'Sem data'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => updateResultado(teste.id, 'APROVADO')}
                        disabled={!canOperate}
                        className="text-green-400 hover:text-green-300 mr-3 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canOperate ? 'Aprovar' : 'Acesso somente leitura'}
                      >
                        <CheckSquare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => updateResultado(teste.id, 'REPROVADO')}
                        disabled={!canOperate}
                        className="text-red-400 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canOperate ? 'Reprovar' : 'Acesso somente leitura'}
                      >
                        <XSquare className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(teste)}
                        disabled={!canOperate}
                        className="text-blue-400 hover:text-blue-300 mr-3 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canOperate ? 'Editar' : 'Acesso somente leitura'}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setTesteParaExcluir(teste)}
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
              {paginacao.total} teste(s) encontrados - página {paginacao.totalPages ? paginacao.page : 0} de {paginacao.totalPages}
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
        title="Novo Teste"
        description="Informe a aeronave, o tipo de teste e o resultado inicial da inspeção."
        icon={CheckSquare}
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
              form="create-test-form"
              disabled={isCreating}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? 'Salvando...' : 'Salvar teste'}
            </button>
          </>
        )}
      >
        <form id="create-test-form" onSubmit={handleCreateTest} className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="new-test-aeronave" className="block text-sm font-medium text-gray-300 mb-1">Aeronave</label>
            <input
              id="new-test-aeronave"
              value={newTestForm.aeronaveCodigo}
              onChange={(e) => setNewTestForm((current) => ({ ...current, aeronaveCodigo: e.target.value }))}
              placeholder="AER-0001"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="new-test-tipo" className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
            <select
              id="new-test-tipo"
              value={newTestForm.tipo}
              onChange={(e) => setNewTestForm((current) => ({ ...current, tipo: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ELETRICO">Elétrico</option>
              <option value="HIDRAULICO">Hidráulico</option>
              <option value="AERODINAMICO">Aerodinâmico</option>
            </select>
          </div>

          <div>
            <label htmlFor="new-test-resultado" className="block text-sm font-medium text-gray-300 mb-1">Resultado</label>
            <select
              id="new-test-resultado"
              value={newTestForm.resultado}
              onChange={(e) => setNewTestForm((current) => ({ ...current, resultado: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="APROVADO">Aprovado</option>
              <option value="REPROVADO">Reprovado</option>
            </select>
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
        isOpen={Boolean(editingTest)}
        onClose={closeEditModal}
        title="Editar Teste"
        description="Atualize o tipo e a aeronave vinculada. O resultado deve ser alterado pela coluna Alterar resultado."
        icon={CheckSquare}
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
              form="edit-test-form"
              disabled={isEditing}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEditing ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </>
        )}
      >
        <form id="edit-test-form" onSubmit={handleEditTest} className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="edit-test-aeronave" className="block text-sm font-medium text-gray-300 mb-1">Aeronave</label>
            <input
              id="edit-test-aeronave"
              value={editTestForm.aeronaveCodigo}
              onChange={(e) => setEditTestForm((current) => ({ ...current, aeronaveCodigo: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-test-tipo" className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
            <select
              id="edit-test-tipo"
              value={editTestForm.tipo}
              onChange={(e) => setEditTestForm((current) => ({ ...current, tipo: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ELETRICO">Elétrico</option>
              <option value="HIDRAULICO">Hidráulico</option>
              <option value="AERODINAMICO">Aerodinâmico</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-test-resultado" className="block text-sm font-medium text-gray-300 mb-1">Resultado</label>
            <input
              id="edit-test-resultado"
              value={editTestForm.resultado}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-gray-400 cursor-not-allowed"
              readOnly
            />
          </div>
        </form>
      </Modal>

      <DeleteConfirmationModal
        isOpen={Boolean(testeParaExcluir)}
        onClose={() => setTesteParaExcluir(null)}
        onConfirm={handleDeleteTest}
        itemLabel={testeParaExcluir ? `o teste #${testeParaExcluir.id}` : 'este teste'}
        title="Excluir teste"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default ControleDeQualidade;
