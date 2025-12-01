import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Project } from '../types';

interface ProjectsContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'idNumber'>) => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  // 1. Buscar projetos do Backend ao carregar a página
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:3001/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          console.error("Erro ao buscar projetos da API");
        }
      } catch (error) {
        console.error("Erro de conexão com o servidor:", error);
      }
    };

    fetchProjects();
  }, []);

  // 2. Enviar novos projetos para o Backend
  const addProject = async (newProjectData: Omit<Project, 'id' | 'idNumber'>) => {
    try {
      // Geramos os IDs aqui para enviar ao backend (conforme seu schema atual)
      const generatedId = `${(newProjectData.title || 'PROJ').slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`;
      const generatedIdNumber = `ID #A${Math.floor(Math.random() * 1000) + 450}`;

      const payload = {
        ...newProjectData,
        id: generatedId,
        idNumber: generatedIdNumber,
        // Garante que campos opcionais tenham valor padrão se vierem vazios
        statusType: newProjectData.statusType || 'pending',
        progress: newProjectData.progress || 0
      };

      const response = await fetch('http://localhost:3001/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedProject = await response.json();
        // Atualiza a lista na tela imediatamente
        setProjects((prevProjects) => [...prevProjects, savedProject]);
      } else {
        alert('Erro ao salvar no banco de dados.');
      }
    } catch (error) {
      console.error("Erro ao adicionar projeto:", error);
      alert('Erro de conexão ao tentar salvar.');
    }
  };

  return (
    <ProjectsContext.Provider value={{ projects, addProject }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects deve ser usado dentro de um ProjectsProvider');
  }
  return context;
};