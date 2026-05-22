import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarClock, CheckCircle, Gauge, Package, ShieldCheck } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { api } from '../services/api';

const badgeStyles = {
  PENDENTE: 'bg-gray-700 text-gray-200',
  EM_ANDAMENTO: 'bg-yellow-900 text-yellow-300',
  CONCLUIDA: 'bg-green-900 text-green-300',
  EM_PRODUCAO: 'bg-yellow-900 text-yellow-300',
  EM_TRANSPORTE: 'bg-blue-900 text-blue-300',
  PRONTA: 'bg-green-900 text-green-300',
  APROVADO: 'bg-green-900 text-green-300',
  REPROVADO: 'bg-red-900 text-red-300',
};

const Badge = ({ value }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeStyles[value] || 'bg-gray-700 text-gray-200'}`}>
    {value || 'N/A'}
  </span>
);

function ProjectDetail() {
  const { id } = useParams();
  const [aeronave, setAeronave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.buscarAeronave(id);
        if (active) setAeronave(data);
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
  }, [id]);

  if (loading) return <p className="text-gray-300">Carregando aeronave...</p>;

  if (error || !aeronave) {
    return (
      <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4">
        {error || 'Aeronave nao encontrada.'}
      </div>
    );
  }

  const etapasConcluidas = aeronave.etapas.filter((etapa) => etapa.statusTracker?.atual?.status === 'CONCLUIDA').length;
  const testesAprovados = aeronave.testes.filter((teste) => teste.resultadoTracker?.atual?.resultado === 'APROVADO').length;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link to="/dashboard" className="text-sm text-blue-400 hover:underline">Dashboard</Link>
        <h1 className="text-3xl font-bold text-white mt-1">{aeronave.modelo}</h1>
        <p className="text-gray-400">{aeronave.codigo} - {aeronave.tipo}</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard title="Capacidade" value={String(aeronave.capacidade)} details="passageiros" Icon={Package} color="gray" />
        <KpiCard title="Alcance" value={`${aeronave.alcance} km`} details="operacional" Icon={Gauge} color="gray" />
        <KpiCard title="Etapas" value={`${etapasConcluidas}/${aeronave.etapas.length}`} details="concluidas" Icon={CalendarClock} color="gray" />
        <KpiCard title="Testes" value={`${testesAprovados}/${aeronave.testes.length}`} details="aprovados" Icon={ShieldCheck} color={testesAprovados === aeronave.testes.length ? 'gray' : 'red'} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Etapas</h2>
          <div className="space-y-4">
            {aeronave.etapas.map((etapa) => {
              const status = etapa.statusTracker?.atual?.status;
              return (
              <Link key={etapa.id} to={`/projeto/${aeronave.codigo}/etapa/${etapa.id}`} className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{etapa.nome}</p>
                    <p className="text-sm text-gray-400">Prazo: {new Date(etapa.prazoConclusao).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Badge value={status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {etapa.funcionariosIds.map((funcionarioId) => (
                    <span key={`${etapa.id}-${funcionarioId}`} className="text-xs bg-gray-800 text-gray-300 rounded-full px-2 py-1">
                      Funcionario #{funcionarioId}
                    </span>
                  ))}
                </div>
              </Link>
            );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Pecas</h2>
          <div className="space-y-4">
            {aeronave.pecas.map((peca) => {
              const status = peca.statusTracker?.atual?.status;
              return (
              <Link key={peca.id} to={`/projeto/${aeronave.codigo}/componente/${peca.id}`} className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{peca.nome}</p>
                    <p className="text-sm text-gray-400">{peca.tipo} - {peca.fornecedor}</p>
                  </div>
                  <Badge value={status} />
                </div>
              </Link>
            );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Testes</h2>
          <div className="space-y-4">
            {aeronave.testes.map((teste) => (
              <div key={teste.tipo} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-white">{teste.tipo}</p>
                    <p className="text-sm text-gray-400">{teste.data ? new Date(teste.data).toLocaleString('pt-BR') : 'Sem data'}</p>
                  </div>
                </div>
                <Badge value={teste.resultadoTracker?.atual?.resultado} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProjectDetail;
