import React from 'react';
import KpiCard from '../components/KpiCard';
import ProjectList from '../components/ProjectList';
import { Package, ShieldCheck, Locate, AlertTriangle } from 'lucide-react';
import { useProjects } from '../context/ProjectsContext';

const Dashboard: React.FC = () => {
  const { projects } = useProjects();

  const activeProjectsCount = projects.filter(
    (project) => project.status !== 'Completo'
  ).length;

  const kpiData = [
    {
      title: "Projetos Ativos",
      value: String(activeProjectsCount),
      details: "(Em Execução)",
      icon: Package,
      colorClass: "bg-gradient-to-r from-blue-500 to-blue-400"
    },
    {
      title: "Metas Qualitativas CQ",
      value: "1",
      details: "(Alcançada)",
      icon: ShieldCheck,
      colorClass: "bg-gradient-to-r from-green-500 to-green-400"
    },
    {
      title: "Rastreio de Componentes",
      value: "Rastreio",
      details: "ATIVO",
      icon: Locate,
      colorClass: "bg-gradient-to-r from-yellow-500 to-yellow-400"
    },
    {
      title: "Alertas do Sistema",
      value: "Sem Alertas",
      details: "SISTEMA OK",
      icon: AlertTriangle,
      colorClass: "bg-gradient-to-r from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Principal</p>
      </div>

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

      <div>
        <ProjectList projects={projects} />
      </div>
    </div>
  );
}

export default Dashboard;