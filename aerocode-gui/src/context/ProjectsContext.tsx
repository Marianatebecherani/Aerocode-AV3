import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import type { Aeronave, AeronaveDetalhes, DashboardResumo } from '../types/api';

type ProjectStatusType = 'error' | 'warning' | 'success' | 'pending';

export type Project = {
  id: string;
  codigo: string;
  title: string;
  description: string;
  idNumber: string;
  value: string;
  status: string;
  statusType: ProjectStatusType;
  progress: number;
  aeronave: Aeronave;
};

type EtapasResumo = {
  total: number;
  concluidas: number;
};

type ProjectsContextValue = {
  aeronaves: Aeronave[];
  dashboardResumo: DashboardResumo | null;
  etapasResumo: EtapasResumo;
  projects: Project[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addProject: (project: unknown) => void;
  fetchAeronaveDetalhes: (codigo: string) => Promise<AeronaveDetalhes>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

const statusRank = {
  PENDENTE: 0,
  EM_ANDAMENTO: 50,
  CONCLUIDA: 100,
};

function calculateProgress(aeronave: Aeronave) {
  if (!aeronave.etapas?.length) return 0;
  const total = aeronave.etapas.reduce((sum, etapa) => {
    const status = etapa.statusTracker?.atual?.status;
    return sum + (status ? statusRank[status] : 0);
  }, 0);
  return Math.round(total / aeronave.etapas.length);
}

function calculateStatusType(aeronave: Aeronave): ProjectStatusType {
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

function projectFromAeronave(aeronave: Aeronave): Project {
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

type ProjectsProviderProps = {
  children: ReactNode;
};

export function ProjectsProvider({ children }: ProjectsProviderProps) {
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [etapasResumo, setEtapasResumo] = useState({ total: 0, concluidas: 0 });
  const [dashboardResumo, setDashboardResumo] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardResponse, aeronavesResponse] = await Promise.all([
        api.buscarDashboard(),
        api.listarAeronaves({ limit: 100 }),
      ]);

      setDashboardResumo(dashboardResponse);
      setAeronaves(aeronavesResponse.dados || []);
      setEtapasResumo({
        total: dashboardResponse?.etapas?.total || 0,
        concluidas: dashboardResponse?.etapas?.concluidas || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const projects = useMemo(() => aeronaves.map(projectFromAeronave), [aeronaves]);

  const value = {
    aeronaves,
    dashboardResumo,
    etapasResumo,
    projects,
    loading,
    error,
    refresh: loadDashboardData,
    addProject: () => undefined,
    fetchAeronaveDetalhes: api.buscarDetalhesAeronave,
  };

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects deve ser usado dentro de um ProjectsProvider');
  }
  return context;
};
