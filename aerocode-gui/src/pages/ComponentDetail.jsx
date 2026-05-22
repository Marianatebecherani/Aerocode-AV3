import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertOctagon, CalendarClock, CheckCircle, Factory, PackageCheck, Truck } from 'lucide-react';
import { api } from '../services/api';

const statusStyles = {
  EM_PRODUCAO: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  EM_TRANSPORTE: 'bg-blue-900/60 text-blue-300 border-blue-700',
  PRONTA: 'bg-green-900/60 text-green-300 border-green-700',
  APROVADO: 'bg-green-900/60 text-green-300 border-green-700',
  REPROVADO: 'bg-red-900/60 text-red-300 border-red-700',
};

const statusSteps = [
  { value: 'EM_PRODUCAO', label: 'Em producao', icon: Factory },
  { value: 'EM_TRANSPORTE', label: 'Em transporte', icon: Truck },
  { value: 'PRONTA', label: 'Pronta', icon: PackageCheck },
];

const Badge = ({ value }) => (
  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[value] || 'bg-gray-700 text-gray-200 border-gray-600'}`}>
    {value || 'N/A'}
  </span>
);

function ComponentDetail() {
  const { id: aeronaveCodigo, componenteId } = useParams();
  const [peca, setPeca] = useState(null);
  const [testes, setTestes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [pecaData, testesResponse] = await Promise.all([
          api.buscarPeca(componenteId),
          api.listarTestes({ aeronaveCodigo, limit: 100 }),
        ]);

        if (!active) return;
        setPeca(pecaData);
        setTestes(testesResponse.dados || []);
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
  }, [aeronaveCodigo, componenteId]);

  const testeCritico = useMemo(() => {
    return testes.find((teste) => teste.resultadoTracker?.atual?.resultado === 'REPROVADO');
  }, [testes]);

  if (loading) return <p className="text-gray-300">Carregando componente...</p>;

  if (error || !peca) {
    return (
      <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4">
        {error || 'Componente nao encontrado.'}
      </div>
    );
  }

  const status = peca.statusTracker?.atual?.status;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link to={`/projeto/${aeronaveCodigo}`} className="text-sm text-blue-400 hover:underline">
          {aeronaveCodigo}
        </Link>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{peca.nome}</h1>
            <p className="text-gray-400">{peca.tipo} - fornecedor {peca.fornecedor}</p>
          </div>
          <Badge value={status} />
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-5">Fluxo do componente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusSteps.map((step) => {
              const StepIcon = step.icon;
              const isActive = step.value === status;
              return (
                <div key={step.value} className={`rounded-lg border p-5 ${isActive ? statusStyles[step.value] : 'border-gray-700 bg-gray-700/60 text-gray-300'}`}>
                  <StepIcon className="w-7 h-7" />
                  <p className="mt-3 font-semibold">{step.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg bg-gray-700 p-5">
            <div className="flex items-center gap-2 text-gray-300">
              <CalendarClock className="w-5 h-5 text-blue-400" />
              <span>Historico de status</span>
            </div>
            <div className="mt-4 space-y-3">
              {(peca.statusTracker?.historico || []).map((item, index) => (
                <div key={`${item.status}-${item.data}-${index}`} className="flex items-center justify-between gap-4 border-b border-gray-600 pb-3 last:border-0 last:pb-0">
                  <Badge value={item.status} />
                  <span className="text-sm text-gray-400">{new Date(item.data).toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            {testeCritico ? (
              <AlertOctagon className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            <h2 className="text-xl font-bold text-white">Qualidade</h2>
          </div>

          {testeCritico ? (
            <div className="rounded-lg border border-red-700 bg-red-900/30 p-4">
              <p className="font-semibold text-red-200">Teste reprovado</p>
              <p className="mt-2 text-sm text-gray-300">{testeCritico.tipo}</p>
              <p className="mt-1 text-sm text-gray-400">
                {testeCritico.resultadoTracker?.atual?.data
                  ? new Date(testeCritico.resultadoTracker.atual.data).toLocaleString('pt-BR')
                  : 'Sem data registrada'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-green-700 bg-green-900/20 p-4">
              <p className="font-semibold text-green-200">Nenhuma falha critica encontrada</p>
              <p className="mt-2 text-sm text-gray-300">Os testes da aeronave nao apresentam reprovas no momento.</p>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {testes.map((teste) => (
              <div key={teste.id} className="flex items-center justify-between rounded-lg bg-gray-700 px-4 py-3">
                <span className="text-sm text-gray-200">{teste.tipo}</span>
                <Badge value={teste.resultadoTracker?.atual?.resultado} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ComponentDetail;
