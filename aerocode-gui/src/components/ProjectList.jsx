import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Clock, Package, XCircle } from 'lucide-react';

const getStatusVisuals = (statusType) => {
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

function ProjectList({ projects, paginacao, onPageChange }) {
  const total = paginacao?.total ?? projects.length;
  const currentPage = paginacao?.page ?? 1;
  const totalPages = paginacao?.totalPages ?? 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Aeronaves</h2>
        <span className="text-sm text-gray-400">{total} cadastradas</span>
      </div>

      <div className="flex flex-col gap-4">
        {projects.map((project) => {
          const { icon: StatusIcon, color: statusColor } = getStatusVisuals(project.statusType);

          return (
            <Link
              key={project.id}
              to={`/dashboard/${project.id}`}
              className="flex items-center p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-colors"
            >
              <div className="p-3 bg-gray-800 rounded-full mr-4">
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

              <div className="flex-1 mx-4 hidden sm:block">
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div
                    className={`${project.statusType === 'error' ? 'bg-red-500' : 'bg-blue-500'} h-2.5 rounded-full`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{project.progress}% das etapas</p>
              </div>

              <div className="ml-4">
                <StatusIcon className={`w-6 h-6 ${statusColor}`} />
              </div>
            </Link>
          );
        })}
      </div>

      {paginacao && (
        <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-gray-700 pt-4">
          <p className="text-sm text-gray-400">
            Página {totalPages ? currentPage : 0} de {totalPages}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!onPageChange || currentPage <= 1}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!onPageChange || currentPage >= totalPages}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectList;
