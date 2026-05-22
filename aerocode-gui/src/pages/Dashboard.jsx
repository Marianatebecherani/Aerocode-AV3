import React, { useEffect, useState } from 'react';
import KpiCard from '../components/KpiCard';
import ProjectList from '../components/ProjectList';
import { AlertTriangle, CheckSquare, Layers, Package, Search, X } from 'lucide-react';
import { useProjects } from '../context/ProjectsContext';
import { api } from '../services/api';

const initialFilters = {
  codigo: '',
  modelo: '',
  tipo: '',
  capacidadeMin: '',
  capacidadeMax: '',
  alcanceMin: '',
  alcanceMax: '',
  page: 1,
  limit: 5,
};

const statusRank = {
  PENDENTE: 0,
  EM_ANDAMENTO: 50,
  CONCLUIDA: 100,
};

function calculateProgress(aeronave) {
  if (!aeronave.etapas?.length) return 0;
  const total = aeronave.etapas.reduce((sum, etapa) => {
    return sum + (statusRank[etapa.statusTracker?.atual?.status] ?? 0);
  }, 0);
  return Math.round(total / aeronave.etapas.length);
}

function calculateStatusType(aeronave) {
  const testes = aeronave.testes || [];
  const etapas = aeronave.etapas || [];
  const pecas = aeronave.pecas || [];

  if (testes.some((teste) => teste.resultadoTracker?.atual?.resultado === 'REPROVADO')) {
    return 'error';
  }

  if (
    etapas.some((etapa) => etapa.statusTracker?.atual?.status === 'EM_ANDAMENTO') ||
    pecas.some((peca) => peca.statusTracker?.atual?.status === 'EM_TRANSPORTE')
  ) {
    return 'warning';
  }

  if (etapas.length && etapas.every((etapa) => etapa.statusTracker?.atual?.status === 'CONCLUIDA')) {
    return 'success';
  }

  return 'pending';
}

function projectFromAeronave(aeronave) {
  const progress = calculateProgress(aeronave);
  const statusType = calculateStatusType(aeronave);
  const statusLabel = {
    error: 'Atenção nos testes',
    warning: 'Em andamento',
    success: 'Concluída',
    pending: 'Planejada',
  }[statusType];

  return {
    id: aeronave.codigo,
    codigo: aeronave.codigo,
    title: aeronave.modelo,
    description: `${aeronave.tipo} - ${aeronave.capacidade} passageiros`,
    idNumber: aeronave.codigo,
    value: `${aeronave.alcance} km`,
    status: statusLabel,
    statusType,
    progress,
    aeronave,
  };
}

function Dashboard() {
  const { dashboardResumo, etapasResumo, loading, error } = useProjects();
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [filteredDashboardResumo, setFilteredDashboardResumo] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [paginacao, setPaginacao] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState('');

  const currentDashboardResumo = filteredDashboardResumo || dashboardResumo;
  const currentEtapasResumo = currentDashboardResumo?.etapas || etapasResumo;
  const aeronavesResumo = currentDashboardResumo?.aeronaves || {};
  const pecasResumo = currentDashboardResumo?.pecas || {};
  const testesResumo = currentDashboardResumo?.testes || {};
  const testesReprovados = testesResumo.reprovados || 0;

  useEffect(() => {
    let isCurrent = true;

    const loadFilteredAeronaves = async () => {
      setIsFiltering(true);
      setFilterError('');

      try {
        const [dashboardResponse, aeronavesResponse] = await Promise.all([
          api.buscarDashboard(filters),
          api.listarAeronaves(filters),
        ]);

        if (isCurrent) {
          setFilteredDashboardResumo(dashboardResponse);
          setFilteredProjects((aeronavesResponse.dados || []).map(projectFromAeronave));
          setPaginacao(aeronavesResponse.paginacao || {
            total: 0,
            page: filters.page,
            limit: filters.limit,
            totalPages: 0,
          });
        }
      } catch (err) {
        if (isCurrent) {
          setFilterError(err.message);
          setFilteredDashboardResumo(null);
          setFilteredProjects([]);
          setPaginacao({
            total: 0,
            page: filters.page,
            limit: filters.limit,
            totalPages: 0,
          });
        }
      } finally {
        if (isCurrent) {
          setIsFiltering(false);
        }
      }
    };

    loadFilteredAeronaves();

    return () => {
      isCurrent = false;
    };
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
      limit: Number(draftFilters.limit) || 5,
    });
  };

  const clearFilters = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  };

  const changeLimit = (limit) => {
    const normalizedLimit = Number(limit) || 5;
    setDraftFilters((current) => ({ ...current, limit: normalizedLimit, page: 1 }));
    setFilters((current) => ({ ...current, limit: normalizedLimit, page: 1 }));
  };

  const changePage = (nextPage) => {
    const totalPages = paginacao.totalPages || 1;
    const normalizedPage = Math.min(Math.max(nextPage, 1), totalPages);
    setDraftFilters((current) => ({ ...current, page: normalizedPage }));
    setFilters((current) => ({ ...current, page: normalizedPage }));
  };

  const kpiData = [
    {
      title: 'Aeronaves',
      value: `${aeronavesResumo.finalizadas || 0}/${aeronavesResumo.total || 0}`,
      details: 'finalizadas / total',
      icon: Package,
      colorClass: 'bg-gradient-to-r from-blue-500 to-blue-400',
    },
    {
      title: 'Etapas',
      value: `${currentEtapasResumo.concluidas || 0}/${currentEtapasResumo.total || 0}`,
      details: 'concluídas / total',
      icon: Layers,
      colorClass: 'bg-gradient-to-r from-green-500 to-green-400',
    },
    {
      title: 'Peças',
      value: `${pecasResumo.prontas || 0}/${pecasResumo.total || 0}`,
      details: 'prontas / total',
      icon: CheckSquare,
      colorClass: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
    },
    {
      title: 'Alertas de Teste',
      value: `${testesReprovados}/${testesResumo.total || 0}`,
      details: 'reprovados / total',
      icon: AlertTriangle,
      colorClass: testesReprovados
        ? 'bg-gradient-to-r from-red-500 to-red-400'
        : 'bg-gradient-to-r from-indigo-500 to-purple-500',
    },
  ];

  if (loading) {
    return <p className="text-gray-300">Carregando dados do backend...</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Visão geral das aeronaves e seus componentes.</p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            details={kpi.details}
            Icon={kpi.icon}
            colorClass={kpi.colorClass}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-9 gap-4">
          <div>
            <label htmlFor="dashboard-codigo" className="block text-sm font-medium text-gray-300 mb-1">Aeronave</label>
            <input
              id="dashboard-codigo"
              value={draftFilters.codigo}
              onChange={(e) => handleFilterChange('codigo', e.target.value)}
              placeholder="AER-0001"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dashboard-modelo" className="block text-sm font-medium text-gray-300 mb-1">Modelo</label>
            <input
              id="dashboard-modelo"
              value={draftFilters.modelo}
              onChange={(e) => handleFilterChange('modelo', e.target.value)}
              placeholder="Embraer"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dashboard-tipo" className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
            <select
              id="dashboard-tipo"
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
            <label htmlFor="dashboard-capacidade-min" className="block text-sm font-medium text-gray-300 mb-1">Cap. min</label>
            <input
              id="dashboard-capacidade-min"
              type="number"
              min="0"
              value={draftFilters.capacidadeMin}
              onChange={(e) => handleFilterChange('capacidadeMin', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dashboard-capacidade-max" className="block text-sm font-medium text-gray-300 mb-1">Cap. max</label>
            <input
              id="dashboard-capacidade-max"
              type="number"
              min="0"
              value={draftFilters.capacidadeMax}
              onChange={(e) => handleFilterChange('capacidadeMax', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dashboard-alcance-min" className="block text-sm font-medium text-gray-300 mb-1">Alc. min</label>
            <input
              id="dashboard-alcance-min"
              type="number"
              min="0"
              value={draftFilters.alcanceMin}
              onChange={(e) => handleFilterChange('alcanceMin', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dashboard-alcance-max" className="block text-sm font-medium text-gray-300 mb-1">Alc. max</label>
            <input
              id="dashboard-alcance-max"
              type="number"
              min="0"
              value={draftFilters.alcanceMax}
              onChange={(e) => handleFilterChange('alcanceMax', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dashboard-limit" className="block text-sm font-medium text-gray-300 mb-1">Itens por página</label>
            <select
              id="dashboard-limit"
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

      {filterError && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4">
          {filterError}
        </div>
      )}

      {isFiltering ? (
        <p className="text-gray-300">Carregando aeronaves...</p>
      ) : (
        <ProjectList
          projects={filteredProjects}
          paginacao={paginacao}
          onPageChange={changePage}
        />
      )}
    </div>
  );
}

export default Dashboard;
