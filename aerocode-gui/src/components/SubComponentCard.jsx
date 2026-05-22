import React from 'react';

// Mapeamento de status para cores
const statusStyles = {
  success: {
    bg: 'bg-gray-800',
    border: 'border-green-500',
    text: 'text-green-400',
    iconColor: 'text-green-500',
  },
  error: {
    bg: 'bg-gray-800',
    border: 'border-red-500',
    text: 'text-red-400',
    iconColor: 'text-red-500',
  },
};

function SubComponentCard({ component }) {
  // Pega o estilo ou um padrão
  const styles = statusStyles[component.statusType] || {
    bg: 'bg-gray-800',
    border: 'border-gray-600',
    text: 'text-gray-400',
    iconColor: 'text-gray-400',
  };
  const Icon = component.icon;

  return (
    <div
      className={`h-full flex flex-col p-6 rounded-lg shadow-lg ${styles.bg} border-2 ${styles.border}`}
    >
      {/* Ícone e Título */}
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-7 h-7 ${styles.iconColor}`} />
        <h3 className="text-xl font-semibold text-white truncate">
          {component.title}
        </h3>
      </div>

      {/* Status */}
      <span className={`text-sm font-medium ${styles.text} mb-4`}>
        {component.status}
      </span>

      <div className="mt-auto">
        <p className="text-xs text-gray-500">Última Atualização:</p>
        <p className="text-sm text-gray-400">{component.lastUpdate}</p>
      </div>
    </div>
  );
}

export default SubComponentCard;