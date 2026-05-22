import React from 'react';
import { Check } from 'lucide-react';

const statusStyles = {
  'Completo': {
    bg: 'bg-green-700/60', // Fundo verde semi-transparente
    border: 'border-green-500',
    text: 'text-green-300',
  },
  'ALERTA - PARADO': {
    bg: 'bg-red-800/60', // Fundo vermelho semi-transparente
    border: 'border-red-600',
    text: 'text-red-300',
  },
  'Em Espera': {
    bg: 'bg-gray-700/60', // Fundo cinza semi-transparente
    border: 'border-gray-500',
    text: 'text-gray-400',
  },
};

function StepCard({ step }) {
  const styles = statusStyles[step.status] || statusStyles['Em Espera'];
  const Icon = step.icon;

  return (
    <div
      className={`h-full flex flex-col p-6 rounded-lg border-2 ${styles.bg} ${styles.border} shadow-lg`}
    >
      {/* Ícone e Título */}
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-6 h-6 ${styles.text}`} />
        <h3 className="text-xl font-semibold text-white truncate">
          {step.title}
        </h3>
      </div>

      {/* Status */}
      <span className={`text-sm font-medium ${styles.text} mb-4`}>
        {step.status.toUpperCase()}
      </span>

      {/* Lista de Tarefas (ex: "Montagem Asa Esquerda") */}
      <div className="flex flex-col gap-2 mt-auto">
        {step.tasks.map((task, index) => (
          <div key={index} className="flex items-center gap-2 text-gray-300">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm">{task}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StepCard;