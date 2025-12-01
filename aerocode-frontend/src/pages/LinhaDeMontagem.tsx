import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  HardHat,
} from 'lucide-react';

// --- Dados Fictícios (Mock Data) ---
// Representa o estado de todas as linhas de montagem da fábrica
const mockLinhas = [
  {
    id: 1,
    nome: 'Linha 1',
    projeto: 'Pedido 04-EMB (Embraer E2)',
    projetoId: '04-EMB', // Para o link
    etapaAtual: 'Montagem das Asas',
    status: 'PARADA',
    statusType: 'error',
  },
  {
    id: 2,
    nome: 'Linha 2',
    projeto: 'Lote 05-BOE (Boeing 787)',
    projetoId: '05-BOE',
    etapaAtual: 'Estrutura e Fundações',
    status: 'OPERACIONAL',
    statusType: 'success',
  },
  {
    id: 3,
    nome: 'Linha 3',
    projeto: 'Contrato 07-LM (Lockheed C-130)',
    projetoId: '07-LM',
    etapaAtual: 'Instalação de Aviônica',
    status: 'OPERACIONAL',
    statusType: 'success',
  },
  {
    id: 4,
    nome: 'Linha 4',
    projeto: 'Lote 02-AIR (Airbus A350)',
    projetoId: '02-AIR',
    etapaAtual: 'Pintura e Acabamento',
    status: 'MANUTENÇÃO',
    statusType: 'warning',
  },
  {
    id: 5,
    nome: 'Linha 5',
    projeto: 'N/A',
    projetoId: null, // Sem link
    etapaAtual: 'Inativa',
    status: 'INATIVA',
    statusType: 'pending',
  },
];
// --- Fim do Mock Data ---

// Função auxiliar para obter os estilos e ícones corretos para o status
const getStatusVisuals = (statusType) => {
  switch (statusType) {
    case 'success':
      return {
        icon: CheckCircle,
        borderColor: 'border-green-500',
        textColor: 'text-green-400',
      };
    case 'error':
      return {
        icon: XCircle,
        borderColor: 'border-red-500',
        textColor: 'text-red-400',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-400',
      };
    case 'pending':
    default:
      return {
        icon: Clock,
        borderColor: 'border-gray-600',
        textColor: 'text-gray-500',
      };
  }
};

// Componente de Card para cada Linha de Montagem
const LinhaCard = ({ linha }) => {
  const { icon: StatusIcon, borderColor, textColor } = getStatusVisuals(
    linha.statusType
  );

  const cardContent = (
    <div
      className={`flex flex-col justify-between h-full bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 ${borderColor} hover:bg-gray-700 transition-colors`}
    >
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-white">{linha.nome}</h3>
          <StatusIcon className={`w-6 h-6 ${textColor}`} />
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${textColor} bg-gray-900/50`}
        >
          {linha.status}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-400">Projeto Atual:</p>
        <p className="text-md font-semibold text-white">
          {linha.projeto || 'N/A'}
        </p>
        <p className="text-sm text-gray-400 mt-2">Etapa:</p>
        <p className="text-md font-semibold text-white">{linha.etapaAtual}</p>
      </div>
    </div>
  );

  // Se a linha tiver um projeto associado, o card torna-se um link para esse projeto.
  // Se não tiver (projetoId: null), é apenas um <div>.
  return linha.projetoId ? (
    <Link
      to={`/projeto/${linha.projetoId}`}
      className="transform transition-transform hover:scale-[1.02]"
    >
      {cardContent}
    </Link>
  ) : (
    <div>{cardContent}</div>
  );
};

// Componente Principal da Página
function LinhaDeMontagem() {
  return (
    <div className="flex flex-col gap-8">
      {/* SEÇÃO 1: Cabeçalho da Página */}
      <div className="flex items-center gap-3">
        <HardHat className="w-8 h-8 text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Linhas de Montagem</h1>
          <p className="text-gray-400">
            Visão geral do estado de todas as linhas de produção.
          </p>
        </div>
      </div>

      {/* SEÇÃO 2: Grid com os Cards das Linhas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockLinhas.map((linha) => (
          <LinhaCard key={linha.id} linha={linha} />
        ))}
      </div>
    </div>
  );
}

export default LinhaDeMontagem;