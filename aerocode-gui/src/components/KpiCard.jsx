import React from 'react';

// Mapeamento para as cores sólidas (usado na Tela 2, ProjectDetail)
// Adicionado 'border' para um estilo mais nítido
const solidColorStyles = {
  red: 'bg-red-800/60 border-red-600',
  gray: 'bg-gray-700/60 border-gray-500',
};

function KpiCard({ title, value, details, Icon, colorClass, color, className = '' }) {
  
  // Lógica para determinar o fundo:
  const backgroundStyle = colorClass
    ? `${colorClass} border-transparent`
    : solidColorStyles[color] || 'bg-gray-800 border-gray-700';

  // Define o tamanho da fonte com base no comprimento do texto do 'value'
  const valueSize = typeof value === 'string' && value.length > 6 ? 'text-3xl' : 'text-4xl';

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
}

export default KpiCard;