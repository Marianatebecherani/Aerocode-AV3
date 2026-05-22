import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, FileText, Plus, Search, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal, { DeleteConfirmationModal, ErrorModal, SuccessModal } from '../components/Modal';
import { canManageSystem } from '../utils/permissions';

const initialFilters = {
  aeronaveCodigo: '',
  dataInicio: '',
  dataFim: '',
  page: 1,
  limit: 5,
};

const backendCommunicationError = 'Erro ao comunicar com o backend.';

function Relatorios() {
  const { user } = useAuth();
  const [relatorios, setRelatorios] = useState([]);
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
  const [selectedAeronave, setSelectedAeronave] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [relatorioEmVisualizacao, setRelatorioEmVisualizacao] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [relatorioParaExcluir, setRelatorioParaExcluir] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [operationError, setOperationError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canOperate = canManageSystem(user);

  const loadRelatorios = async (params = filters) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.listarRelatorios(params);
      setRelatorios(response.dados || []);
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

  const loadAeronaves = async () => {
    try {
      const response = await api.listarAeronaves({ limit: 100 });
      const dados = response.dados || [];
      setAeronaves(dados);
      setSelectedAeronave((current) => current || dados[0]?.codigo || '');
    } catch (err) {
      if (err.message === backendCommunicationError) {
        setError(err.message);
      } else {
        setOperationError(err.message);
      }
    }
  };

  useEffect(() => {
    loadRelatorios(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    loadAeronaves();
  }, []);

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
    setOperationError('');
    setSelectedAeronave((current) => current || aeronaves[0]?.codigo || '');
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (!isCreating) {
      setIsCreateModalOpen(false);
    }
  };

  const criarRelatorio = async (e) => {
    e.preventDefault();

    if (!selectedAeronave) {
      setOperationError('Selecione uma aeronave para gerar o relatório.');
      return;
    }

    setIsCreating(true);
    setOperationError('');

    try {
      await api.criarRelatorio({ aeronaveCodigo: selectedAeronave });
      setIsCreateModalOpen(false);
      setSuccessMessage('Relatório gerado com sucesso.');
      await loadRelatorios(filters);
    } catch (err) {
      setOperationError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const deletarRelatorio = async () => {
    if (!relatorioParaExcluir) return;

    setIsDeleting(true);
    setOperationError('');

    try {
      await api.deletarRelatorio(relatorioParaExcluir.id);
      setRelatorioParaExcluir(null);
      setSuccessMessage('Relatório excluído com sucesso.');
      await loadRelatorios(filters);
    } catch (err) {
      setOperationError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const visualizarRelatorio = async (id) => {
    setIsLoadingReport(true);
    setOperationError('');

    try {
      const relatorio = await api.buscarRelatorio(id);
      setRelatorioEmVisualizacao(relatorio);
    } catch (err) {
      setOperationError(err.message);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const fecharVisualizacao = () => {
    if (!isLoadingReport) {
      setRelatorioEmVisualizacao(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Relatórios</h1>
            <p className="text-gray-400">Snapshots consolidados de aeronaves, etapas, peças e testes.</p>
          </div>
        </div>
        {canOperate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Novo Relatório
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
            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-300 mb-1">Data inicial</label>
            <input
              id="dataInicio"
              type="date"
              value={draftFilters.dataInicio}
              onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dataFim" className="block text-sm font-medium text-gray-300 mb-1">Data final</label>
            <input
              id="dataFim"
              type="date"
              value={draftFilters.dataFim}
              onChange={(e) => handleFilterChange('dataFim', e.target.value)}
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
      {operationError === backendCommunicationError && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4">{operationError}</div>
      )}
      {loading ? (
        <p className="text-gray-300">Carregando relatórios...</p>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">ID</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Aeronave</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Modelo</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Emissão</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Etapas</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Peças</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase">Testes</th>
                <th className="py-3 px-6 text-right text-sm font-semibold text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {relatorios.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                    Nenhum relatório encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
              {relatorios.map((relatorio) => (
                <tr key={relatorio.id} className="hover:bg-gray-700/50">
                  <td className="py-4 px-6 text-sm font-medium text-white">{relatorio.id}</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{relatorio.aeronaveCodigo}</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{relatorio.detalhes?.modelo || 'N/A'}</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{new Date(relatorio.dataEmissao).toLocaleString('pt-BR')}</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{relatorio.detalhes?.etapas?.length || 0}</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{relatorio.detalhes?.pecas?.length || 0}</td>
                  <td className="py-4 px-6 text-sm text-gray-300">{relatorio.detalhes?.testes?.length || 0}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => visualizarRelatorio(relatorio.id)}
                      disabled={isLoadingReport}
                      className="mr-3 text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Visualizar"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRelatorioParaExcluir(relatorio)}
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
              {paginacao.total} relatório(s) encontrados - página {paginacao.totalPages ? paginacao.page : 0} de {paginacao.totalPages}
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
        title="Novo Relatório"
        description="Selecione a aeronave para gerar um snapshot dos dados atuais."
        icon={FileText}
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
              form="create-report-form"
              disabled={isCreating || !selectedAeronave}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? 'Gerando...' : 'Gerar relatório'}
            </button>
          </>
        )}
      >
        <form id="create-report-form" onSubmit={criarRelatorio} className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="new-report-aeronave" className="block text-sm font-medium text-gray-300 mb-1">Aeronave</label>
            <select
              id="new-report-aeronave"
              value={selectedAeronave}
              onChange={(e) => setSelectedAeronave(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecionar aeronave</option>
              {aeronaves.map((aeronave) => (
                <option key={aeronave.codigo} value={aeronave.codigo}>
                  {aeronave.codigo} - {aeronave.modelo}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(relatorioEmVisualizacao)}
        onClose={fecharVisualizacao}
        title={relatorioEmVisualizacao ? `Relatório #${relatorioEmVisualizacao.id}` : 'Relatório'}
        description={relatorioEmVisualizacao ? `${relatorioEmVisualizacao.aeronaveCodigo} - ${new Date(relatorioEmVisualizacao.dataEmissao).toLocaleString('pt-BR')}` : ''}
        icon={FileText}
        maxWidth="max-w-5xl"
        footer={(
          <button
            type="button"
            onClick={fecharVisualizacao}
            className="inline-flex items-center justify-center rounded-lg bg-gray-700 px-4 py-2 font-semibold text-gray-200 transition-colors hover:bg-gray-600"
          >
            Fechar
          </button>
        )}
      >
        {relatorioEmVisualizacao && (
          <div className="max-h-[70vh] overflow-y-auto pr-3">
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-lg bg-gray-700 p-4">
                <p className="text-xs uppercase text-gray-400">Aeronave</p>
                <p className="mt-1 font-semibold text-white">{relatorioEmVisualizacao.detalhes?.codigo || relatorioEmVisualizacao.aeronaveCodigo}</p>
              </div>
              <div className="rounded-lg bg-gray-700 p-4">
                <p className="text-xs uppercase text-gray-400">Modelo</p>
                <p className="mt-1 font-semibold text-white">{relatorioEmVisualizacao.detalhes?.modelo || 'N/A'}</p>
              </div>
              <div className="rounded-lg bg-gray-700 p-4">
                <p className="text-xs uppercase text-gray-400">Tipo</p>
                <p className="mt-1 font-semibold text-white">{relatorioEmVisualizacao.detalhes?.tipo || 'N/A'}</p>
              </div>
              <div className="rounded-lg bg-gray-700 p-4">
                <p className="text-xs uppercase text-gray-400">Capacidade / Alcance</p>
                <p className="mt-1 font-semibold text-white">
                  {relatorioEmVisualizacao.detalhes?.capacidade ?? 'N/A'} passageiros / {relatorioEmVisualizacao.detalhes?.alcance ?? 'N/A'} km
                </p>
              </div>
            </section>

            <section className="mt-6">
              <h3 className="text-lg font-bold text-white">Etapas</h3>
              <div className="mt-3 overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Ordem</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Prazo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Prioridade</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Funcionários</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {(relatorioEmVisualizacao.detalhes?.etapas || []).map((etapa) => (
                      <tr key={`${etapa.ordemExecucao}-${etapa.nome}`} className="bg-gray-800">
                        <td className="px-4 py-3 text-gray-300">{etapa.ordemExecucao}</td>
                        <td className="px-4 py-3 text-white">{etapa.nome}</td>
                        <td className="px-4 py-3 text-gray-300">{etapa.prazoConclusao ? new Date(etapa.prazoConclusao).toLocaleDateString('pt-BR') : 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-300">{etapa.prioridade}</td>
                        <td className="px-4 py-3 text-gray-300">{etapa.status || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-300">
                          {(etapa.funcionarios || []).map((funcionario) => `${funcionario.nome} (${funcionario.funcao})`).join(', ') || 'Nenhum'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6">
              <h3 className="text-lg font-bold text-white">Peças</h3>
              <div className="mt-3 overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Fornecedor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Atualização</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {(relatorioEmVisualizacao.detalhes?.pecas || []).map((peca) => (
                      <tr key={`${peca.nome}-${peca.fornecedor}`} className="bg-gray-800">
                        <td className="px-4 py-3 text-white">{peca.nome}</td>
                        <td className="px-4 py-3 text-gray-300">{peca.tipo}</td>
                        <td className="px-4 py-3 text-gray-300">{peca.fornecedor}</td>
                        <td className="px-4 py-3 text-gray-300">{peca.status || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-300">{peca.data ? new Date(peca.data).toLocaleString('pt-BR') : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6">
              <h3 className="text-lg font-bold text-white">Testes</h3>
              <div className="mt-3 overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Resultado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-300">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {(relatorioEmVisualizacao.detalhes?.testes || []).map((teste, index) => (
                      <tr key={`${teste.tipo}-${index}`} className="bg-gray-800">
                        <td className="px-4 py-3 text-white">{teste.tipo}</td>
                        <td className="px-4 py-3 text-gray-300">{teste.resultado || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-300">{teste.data ? new Date(teste.data).toLocaleString('pt-BR') : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </Modal>

      <DeleteConfirmationModal
        isOpen={Boolean(relatorioParaExcluir)}
        onClose={() => setRelatorioParaExcluir(null)}
        onConfirm={deletarRelatorio}
        itemLabel={relatorioParaExcluir ? `o relatório #${relatorioParaExcluir.id}` : 'este relatório'}
        title="Excluir relatório"
        isLoading={isDeleting}
      />

      <SuccessModal
        isOpen={Boolean(successMessage)}
        onClose={() => setSuccessMessage('')}
        title="Operação concluída"
        description={successMessage}
      />

      <ErrorModal
        isOpen={Boolean(operationError) && operationError !== backendCommunicationError}
        onClose={() => setOperationError('')}
        title="Não foi possível concluir"
        description={operationError}
      />
    </div>
  );
}

export default Relatorios;
