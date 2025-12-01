import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Clock, Package } from 'lucide-react';
import { Project } from '../types'; // <-- Importando Project agora

interface ProjectListProps {
  projects: Project[]; // <-- Tipo corrigido
}

const getStatusVisuals = (statusType: string) => {
  switch (statusType) {
    case 'success':
      return { icon: CheckCircle, color: 'text-green-500' };
    case 'error':
      return { icon: XCircle, color: 'text-red-500' };
    case 'warning':
      return { icon: AlertCircle, color: 'text-yellow-500' };
    case 'pending':
    default:
      return { icon: Clock, color: 'text-gray-500' };
  }
};

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Projetos Recentes</h2>
        <Link to="/relatorios" className="text-sm text-blue-400 hover:underline">
          Visualizar todos os alertas
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {projects.map((project) => {
          const { icon: StatusIcon, color: statusColor } = getStatusVisuals(project.statusType);
          return (
            <Link
              key={project.id}
              to={`/projeto/${project.id}`}
              className="flex flex-col md:flex-row items-center p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-colors gap-4"
            >
              <div className="p-3 bg-gray-800 rounded-full">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-white truncate">{project.title}</p>
                <p className={`text-sm ${statusColor}`}>{project.status}</p>
              </div>
              
              <div className="flex-1 text-center hidden md:block">
                <p className="text-sm text-gray-400">{project.idNumber}</p>
                <p className="text-lg font-bold text-white">{project.value}</p>
              </div>
              
              <div className="flex-1 w-full md:w-auto mx-4">
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div
                    className={`${
                      project.statusType === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    } h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="ml-2">
                <StatusIcon className={`w-6 h-6 ${statusColor}`} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectList;