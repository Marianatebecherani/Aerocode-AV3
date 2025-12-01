import React from 'react';
import { FileText, Percent, CheckSquare, XCircle, HardHat } from 'lucide-react';

// --- Dados Fictícios (Mock Data) para os Relatórios ---
const kpiData = {
  eficienciaProducao: 87,
  taxaAprovacaoQC: 98.5,
  falhasCriticas: 3,
  projetosNoPrazo: 4,
  totalProjetos: 5,
};

const mockRelatorios = [
  {
    titulo: 'Eficiência Geral de Produção',
    valor: `${kpiData.eficienciaProducao}%`,
    icone: Percent,
    cor: 'text-blue-400',
    descricao: 'Percentagem de tempo de produção planejado que é verdadeiramente produtivo.',
  },
  {
    titulo: 'Taxa de Aprovação (CQ)',
    valor: `${kpiData.taxaAprovacaoQC}%`,
    icone: CheckSquare,
    cor: 'text-green-400',
    descricao: 'Percentagem de componentes que passaram na primeira inspeção.',
  },
  {
    titulo: 'Falhas Críticas (Últimos 30 dias)',
    valor: kpiData.falhasCriticas,
    icone: XCircle,
    cor: 'text-red-400',
    descricao: 'Número de falhas de CQ "Reprovado" que causaram paragens de linha.',
  },
  {
    titulo: 'Projetos Dentro do Prazo',
    valor: `${kpiData.projetosNoPrazo} de ${kpiData.totalProjetos}`,
    icone: HardHat,
    cor: 'text-yellow-400',
    descricao: 'Número de projetos concluídos dentro do cronograma estimado.',
  },
];

// Componente de Card para cada KPI do Relatório
const ReportCard = ({ relatorio }) => {
  const Icone = relatorio.icone; // Obter o componente do ícone
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-gray-900 ${relatorio.cor}`}>
          <Icone className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-400">{relatorio.titulo}</p>
          <p className="text-3xl font-bold text-white">{relatorio.valor}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-4">{relatorio.descricao}</p>
    </div>
  );
};

// Componente Principal da Página
function Relatorios() {
  return (
    <div className="flex flex-col gap-8">
      {/* SEÇÃO 1: Cabeçalho da Página */}
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios</h1>
          <p className="text-gray-400">
            Visão geral da produção. Análises de eficiência, qualidade e status dos projetos.
          </p>
        </div>
      </div>

      {/* SEÇÃO 2: Grid com os Cards de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockRelatorios.map((relatorio, index) => (
          <ReportCard key={index} relatorio={relatorio} />
        ))}
      </div>

      {/* SEÇÃO 3: Exemplo de Relatório com Gráfico Simulado */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Uso de Recursos por Linha</h3>
        <p className="text-sm text-gray-400 mb-6">
          Distribuição de horas de trabalho e custos de material.
        </p>
        <div className="space-y-4">
          {/* Simulação de Barra de Gráfico 1 */}
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-300 mb-1">
              <span>Linha 1 (Embraer E2)</span>
              <span>45%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-red-500 h-2.5 rounded-full"
                style={{ width: '45%' }} // A barra vermelha indica mais uso
              ></div>
            </div>
          </div>
          {/* Simulação de Barra de Gráfico 2 */}
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-300 mb-1">
              <span>Linha 2 (Boeing 787)</span>
              <span>25%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: '25%' }}
              ></div>
            </div>
          </div>
          {/* Simulação de Barra de Gráfico 3 */}
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-300 mb-1">
              <span>Linha 3 (Lockheed C-130)</span>
              <span>30%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: '30%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;