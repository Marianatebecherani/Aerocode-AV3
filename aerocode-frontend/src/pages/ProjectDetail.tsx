import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StepCard from '../components/StepCard';

// Definição local dos tipos
interface Step {
  id: number;
  title: string;
  status: string;
  tasks: string;
}

interface ProjectDetailData {
  id: string;
  title: string;
  status: string;
  progress: number;
  steps: Step[];
}

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3001/projects/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Projeto não encontrado');
        }
        return res.json();
      })
      .then(data => {
        setProject(data);
        setError('');
      })
      .catch(err => {
        console.error(err);
        setError('Projeto não encontrado ou erro de conexão.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-white p-8">Carregando detalhes...</div>;

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white gap-4">
        <h2 className="text-2xl font-bold text-red-500">Ops!</h2>
        <p className="text-gray-300">{error}</p>
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
        >
          <ArrowLeft size={20} /> Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link to="/" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
           &larr; Voltar ao Dashboard
        </Link>
        <span className="block text-sm text-gray-400">Projetos / {project.id}</span>
        <h1 className="text-3xl font-bold text-white mt-1">{project.title}</h1>
        <p className={`text-lg font-semibold mt-1 ${project.status.includes('ALERTA') || project.status.includes('PARADO') ? 'text-red-500' : 'text-green-500'}`}>
          Status: {project.status}
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Macro-Etapas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {project.steps && project.steps.length > 0 ? (
            project.steps.map((step) => (
              <Link
                key={step.id}
                to={`/projeto/${project.id}/etapa/${step.id}`}
                className="transform transition-transform hover:scale-105"
              >
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg h-full hover:border-blue-500 transition-colors">
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <span className={`font-medium ${step.status.includes('PARADO') ? 'text-red-400' : 'text-blue-400'}`}>
                    {step.status}
                  </span>
                  <p className="text-gray-400 text-sm mt-2 truncate">{step.tasks}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500">Nenhuma etapa cadastrada para este projeto.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProjectDetail;