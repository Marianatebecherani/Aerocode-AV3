import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import SubComponentCard from '../components/SubComponentCard';

interface ComponentData {
  id: number;
  title: string;
  status: string;
  statusType: 'success' | 'error' | 'warning';
  lastUpdate: string;
}

interface StepData {
  id: number;
  title: string;
  status: string;
  components: ComponentData[];
}

const StepDetail: React.FC = () => {
  const { id: projectId, etapaId } = useParams();
  const [step, setStep] = useState<StepData | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/steps/${etapaId}`)
      .then(res => res.json())
      .then(data => setStep(data))
      .catch(err => console.error(err));
  }, [etapaId]);

  if (!step) return <div className="text-white">Carregando etapa...</div>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-sm text-blue-400">
          <Link to={`/projeto/${projectId}`}>Voltar ao Projeto</Link>
        </span>
        <h1 className="text-3xl font-bold text-white mt-1">{step.title}</h1>
        <p className="text-lg font-semibold text-gray-300 mt-1">Status: {step.status}</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Subcomponentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {step.components && step.components.length > 0 ? (
            step.components.map((component) => (
              <Link
                key={component.id}
                to={`/projeto/${projectId}/componente/${component.id}`} // Link dinâmico para o componente
                className="transform transition-transform hover:scale-105"
              >
                {/* Precisamos adaptar o objeto para o componente esperar o formato certo */}
                <SubComponentCard component={{
                  ...component, 
                  icon: component.statusType === 'error' ? XCircle : CheckCircle
                }} />
              </Link>
            ))
          ) : (
            <p className="text-gray-500">Nenhum subcomponente registado nesta etapa.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default StepDetail;