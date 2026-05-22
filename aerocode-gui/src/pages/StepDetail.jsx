import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CalendarClock, CheckCircle, Package, Plus, Trash2, Users } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ErrorModal } from '../components/Modal';
import { canWriteOperationalData } from '../utils/permissions';

const statusStyles = {
  PENDENTE: 'bg-gray-700 text-gray-200 border-gray-600',
  EM_ANDAMENTO: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  CONCLUIDA: 'bg-green-900/60 text-green-300 border-green-700',
  EM_PRODUCAO: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  EM_TRANSPORTE: 'bg-blue-900/60 text-blue-300 border-blue-700',
  PRONTA: 'bg-green-900/60 text-green-300 border-green-700',
  APROVADO: 'bg-green-900/60 text-green-300 border-green-700',
  REPROVADO: 'bg-red-900/60 text-red-300 border-red-700',
};

const Badge = ({ value }) => (
  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[value] || 'bg-gray-700 text-gray-200 border-gray-600'}`}>
    {value || 'N/A'}
  </span>
);

function StepDetail() {
  const { id: aeronaveCodigo, etapaId } = useParams();
  const { user } = useAuth();
  const [etapa, setEtapa] = useState(null);
  const [pecas, setPecas] = useState([]);
  const [testes, setTestes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState('');
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [operationError, setOperationError] = useState('');
  const canOperate = canWriteOperationalData(user);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [etapaData, pecasResponse, testesResponse, funcionariosResponse] = await Promise.all([
          api.buscarEtapa(etapaId),
          api.listarPecas({ aeronaveCodigo, limit: 100 }),
          api.listarTestes({ aeronaveCodigo, limit: 100 }),
          api.listarFuncionarios({ limit: 100 }),
        ]);

        if (!active) return;
        setEtapa(etapaData);
        setPecas(pecasResponse.dados || []);
        setTestes(testesResponse.dados || []);
        setFuncionarios(funcionariosResponse.dados || []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [aeronaveCodigo, etapaId]);

  if (loading) return <p className="text-gray-300">Carregando etapa...</p>;

  if (error || !etapa) {
    return (
      <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4">
        {error || 'Etapa nao encontrada.'}
      </div>
    );
  }

  const status = etapa.statusTracker?.atual?.status;
  const pecasProntas = pecas.filter((peca) => peca.statusTracker?.atual?.status === 'PRONTA').length;
  const testesReprovados = testes.filter((teste) => teste.resultadoTracker?.atual?.resultado === 'REPROVADO');
  const funcionariosPorId = new Map(funcionarios.map((funcionario) => [funcionario.id, funcionario]));
  const funcionariosDisponiveis = funcionarios.filter((funcionario) => !etapa.funcionariosIds.includes(funcionario.id));

  const refreshEtapa = async () => {
    const etapaData = await api.buscarEtapa(etapaId);
    setEtapa(etapaData);
  };

  const associateFuncionario = async (e) => {
    e.preventDefault();
    if (!selectedFuncionarioId || !canOperate) return;

    setIsUpdatingTeam(true);
    setOperationError('');

    try {
      await api.associarFuncionarioEtapa(etapaId, selectedFuncionarioId);
      setSelectedFuncionarioId('');
      await refreshEtapa();
    } catch (err) {
      setOperationError(err.message);
    } finally {
      setIsUpdatingTeam(false);
    }
  };

  const removeFuncionario = async (funcionarioId) => {
    if (!canOperate) {
      setOperationError('Seu perfil possui acesso somente leitura.');
      return;
    }

    setIsUpdatingTeam(true);
    setOperationError('');

    try {
      await api.desassociarFuncionarioEtapa(etapaId, funcionarioId);
      await refreshEtapa();
    } catch (err) {
      setOperationError(err.message);
    } finally {
      setIsUpdatingTeam(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link to={`/projeto/${aeronaveCodigo}`} className="text-sm text-blue-400 hover:underline">
          {aeronaveCodigo}
        </Link>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{etapa.nome}</h1>
            <p className="text-gray-400">Prioridade {etapa.prioridade} - prazo {new Date(etapa.prazoConclusao).toLocaleDateString('pt-BR')}</p>
          </div>
          <Badge value={status} />
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
          <CalendarClock className="w-6 h-6 text-blue-400" />
          <p className="mt-3 text-sm uppercase text-gray-400">Status atual</p>
          <p className="text-2xl font-bold text-white">{status || 'N/A'}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
          <Package className="w-6 h-6 text-green-400" />
          <p className="mt-3 text-sm uppercase text-gray-400">Pecas prontas</p>
          <p className="text-2xl font-bold text-white">{pecasProntas}/{pecas.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <p className="mt-3 text-sm uppercase text-gray-400">Testes reprovados</p>
          <p className="text-2xl font-bold text-white">{testesReprovados.length}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Componentes da aeronave</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pecas.map((peca) => (
              <Link key={peca.id} to={`/projeto/${aeronaveCodigo}/componente/${peca.id}`} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{peca.nome}</p>
                    <p className="text-sm text-gray-400">{peca.tipo} - {peca.fornecedor}</p>
                  </div>
                  <Badge value={peca.statusTracker?.atual?.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Equipe</h2>
          </div>
          {canOperate && (
            <form onSubmit={associateFuncionario} className="mb-4 flex gap-2">
              <select
                value={selectedFuncionarioId}
                onChange={(e) => setSelectedFuncionarioId(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-gray-600 bg-gray-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdatingTeam || funcionariosDisponiveis.length === 0}
              >
                <option value="">Selecionar funcionario</option>
                {funcionariosDisponiveis.map((funcionario) => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isUpdatingTeam || !selectedFuncionarioId}
                className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="Associar funcionario"
              >
                <Plus className="h-5 w-5" />
              </button>
            </form>
          )}
          <div className="space-y-3">
            {etapa.funcionariosIds.length === 0 && <p className="text-gray-400">Nenhum funcionario associado.</p>}
            {etapa.funcionariosIds.map((funcionarioId) => {
              const funcionario = funcionariosPorId.get(funcionarioId);
              return (
              <div key={funcionarioId} className="flex items-center justify-between rounded-lg bg-gray-700 px-4 py-3">
                <span className="text-gray-200">{funcionario?.nome || `Funcionario #${funcionarioId}`}</span>
                {canOperate ? (
                  <button
                    type="button"
                    onClick={() => removeFuncionario(funcionarioId)}
                    disabled={isUpdatingTeam}
                    className="text-red-400 transition-colors hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Remover funcionario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
            );
            })}
          </div>
        </div>
      </section>

      <ErrorModal
        isOpen={Boolean(operationError)}
        onClose={() => setOperationError('')}
        title="Não foi possível concluir"
        description={operationError}
      />
    </div>
  );
}

export default StepDetail;
