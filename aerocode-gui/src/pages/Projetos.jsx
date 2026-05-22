import React, { useState } from 'react';
import ProjectList from '../components/ProjectList'; 
import { useProjects } from '../context/ProjectsContext'; 
import { X } from 'lucide-react';

function Projetos() {
  // 1. Pega os projetos e a função de adicionar do contexto
  const { projects, addProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Estados para o formulário
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('Em Espera');
  const [progress, setProgress] = useState(0);

  const handleAddProject = (e) => {
    e.preventDefault();
    const statusTypeMap = {
      'Em Espera': 'pending',
      'Em Operação': 'warning',
      'Completo': 'success',
      'PARADO - FALHA CQ': 'error',
    };

    addProject({
      name,
      value,
      status,
      progress: Number(progress),
      statusType: statusTypeMap[status],
    });

    // Limpa o formulário e fecha o modal
    setName('');
    setValue('');
    setStatus('Em Espera');
    setProgress(0);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciamento de Projetos</h1>
          <p className="text-gray-400 mt-2">Visualize todos os projetos em andamento, em espera e concluídos.</p>
        </div>
        {/* 3. Botão para abrir o modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors"
        >
          Adicionar Novo Projeto
        </button>
      </div>

      <ProjectList projects={projects} />

      {/* 4. Modal de Adicionar Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 w-full max-w-lg relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X />
            </button>
            <h2 className="text-xl font-semibold text-white mb-6">Adicionar Novo Projeto</h2>
            <form onSubmit={handleAddProject} className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Projeto</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
              </div>
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-300 mb-1">Valor (ex: R$ 10M)</label>
                <input type="text" id="value" value={value} onChange={(e) => setValue(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                  <option>Em Espera</option>
                  <option>Em Operação</option>
                  <option>Completo</option>
                  <option>PARADO - FALHA CQ</option>
                </select>
              </div>
              <div>
                <label htmlFor="progress" className="block text-sm font-medium text-gray-300 mb-1">Progresso (%)</label>
                <input type="number" id="progress" value={progress} onChange={(e) => setProgress(e.target.value)} min="0" max="100" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500">
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projetos;