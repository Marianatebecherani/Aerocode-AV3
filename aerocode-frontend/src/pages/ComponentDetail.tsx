import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  XCircle, 
  CheckCircle, 
  ArrowLeft, 
  AlertOctagon, 
  ClipboardList, 
  PackageCheck, 
  Wrench,
  Info,
  AlertTriangle
} from 'lucide-react';

// Definição dos Tipos vindos da API
interface RequiredPart {
  id: number;
  name: string;
  status: string;
  action: string;
  actionStatus: string;
  statusType: string;
}

interface ActivityLog {
  id: number;
  text: string;
  statusType: string;
  timestamp: string;
}

interface ComponentDetailType {
  id: number;
  title: string;
  status: string;
  statusType: string;
  qcStatus: string;
  qcDate: string;
  qcInspector: string;
  qcNotes: string;
  requiredParts: RequiredPart[]; // Agora vem do banco!
  activityLogs: ActivityLog[];   // Agora vem do banco!
}

function ComponentDetail() {
  const { componenteId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ComponentDetailType | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/components/${componenteId}`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, [componenteId]);

  if (!data) return <div className="text-white p-8">Carregando dados do sistema...</div>;

  // Helpers para ícones e cores dinâmicas
  const getStatusColor = (type: string) => {
    if (type === 'error') return 'text-red-400';
    if (type === 'warning') return 'text-yellow-400';
    if (type === 'success') return 'text-green-400';
    return 'text-blue-400';
  };

  const getIcon = (type: string) => {
    if (type === 'error') return XCircle;
    if (type === 'warning') return AlertTriangle;
    if (type === 'success') return CheckCircle;
    return Info;
  };

  return (
    <div className="flex flex-col gap-8 fade-in">
      {/* SEÇÃO 1: Cabeçalho */}
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-400 mb-2 hover:underline">
          <ArrowLeft size={16} /> Voltar
        </button>
        <span className="text-sm text-gray-400">Projetos / Componente #{data.id}</span>
        <h1 className="text-3xl font-bold text-white mt-1">{data.title}</h1>
        <p className={`text-lg font-semibold mt-1 ${getStatusColor(data.statusType)}`}>
          Status: {data.status}
        </p>
      </div>

      {/* SEÇÃO 2: Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna da Esquerda */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* CARD QC */}
          <div className={`border rounded-lg p-6 shadow-lg ${data.statusType === 'error' ? 'bg-red-900/20 border-red-900/50' : 'bg-green-900/20 border-green-900/50'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Relatório de QC</h3>
              {data.statusType === 'error' ? <XCircle className="w-6 h-6 text-red-400" /> : <CheckCircle className="w-6 h-6 text-green-400" />}
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                <span className="font-medium text-gray-100">Resultado:</span> 
                <span className={`font-bold ml-2 ${getStatusColor(data.statusType)}`}>{data.qcStatus}</span>
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-medium text-gray-100">Data/Inspetor:</span> {data.qcDate} por {data.qcInspector}
              </p>
              <div className={`text-sm text-white p-3 rounded border ${data.statusType === 'error' ? 'bg-red-900/40 border-red-500/30' : 'bg-green-900/40 border-green-500/30'}`}>
                {data.qcNotes}
              </div>
            </div>
          </div>

          {/* CARD PEÇAS (Agora com dados reais!) */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Peças e Materiais</h3>
            <div className="space-y-4">
              {data.requiredParts && data.requiredParts.length > 0 ? (
                data.requiredParts.map((part) => {
                  const PartIcon = part.statusType === 'error' ? AlertOctagon : (part.statusType === 'warning' ? Wrench : PackageCheck);
                  const color = getStatusColor(part.statusType);
                  
                  return (
                    <div key={part.id} className="flex gap-4 bg-gray-700/30 p-4 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors">
                      <PartIcon className={`w-6 h-6 mt-1 ${color}`} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-semibold text-white">{part.name}</p>
                          <span className={`text-sm font-bold ${color}`}>{part.status}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-gray-400">{part.action}</p>
                          <p className="text-sm text-yellow-500">{part.actionStatus}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 italic">Nenhuma peça registrada.</div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna da Direita - LOGS */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Log de Atividades</h3>
            <ul className="relative border-l-2 border-gray-700 ml-3 space-y-6">
              {data.activityLogs && data.activityLogs.length > 0 ? (
                data.activityLogs.map((log) => {
                  const LogIcon = getIcon(log.statusType);
                  const color = getStatusColor(log.statusType);
                  
                  return (
                    <li key={log.id} className="mb-2 ml-6">
                      <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-gray-800 ${log.statusType === 'error' ? 'bg-red-900' : 'bg-gray-700'}`}>
                        <LogIcon className={`w-3 h-3 ${color}`} />
                      </span>
                      <p className="text-sm font-medium text-white">{log.text}</p>
                      <time className="block mb-1 text-xs font-normal text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </time>
                    </li>
                  );
                })
              ) : (
                <p className="text-gray-500 ml-4">Sem atividades recentes.</p>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ComponentDetail;