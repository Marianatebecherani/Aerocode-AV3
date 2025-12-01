import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  details?: string;
  Icon?: LucideIcon;
  colorClass?: string;
  color?: 'red' | 'gray' | 'blue' | 'green' | 'yellow';
  className?: string;
}

const solidColorStyles: Record<string, string> = {
  red: 'bg-red-800/60 border-red-600',
  gray: 'bg-gray-700/60 border-gray-500',
  // Adicione mais cores se necessário
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, details, Icon, colorClass, color, className = '' }) => {
  
  const backgroundStyle = colorClass
    ? `${colorClass} border-transparent`
    : (color && solidColorStyles[color] ? solidColorStyles[color] : 'bg-gray-800 border-gray-700');

  // Define o tamanho da fonte com base no comprimento do texto do 'value'
  const valueStr = String(value);
  const valueSize = valueStr.length > 6 ? 'text-3xl' : 'text-4xl';

  return (
    <div className={`relative rounded-lg p-5 shadow-lg overflow-hidden border ${backgroundStyle} ${className}`}>
      
      {/* Ícone de fundo semi-transparente */}
      {Icon && (
        <Icon className="absolute -right-4 -bottom-4 w-24 h-24 text-black/10" />
      )}
      
      {/* Conteúdo do Card */}
      <div className="relative z-10">
        <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          {title}
        </h2>
        
        <p className={`${valueSize} font-bold mt-2 text-white`}>{value}</p>
        
        {details && (
          <p className="text-xs text-white/60 mt-1">{details}</p>
        )}
      </div>
    </div>
  );
};

export default KpiCard;