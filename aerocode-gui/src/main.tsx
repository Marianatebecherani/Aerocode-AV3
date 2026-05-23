import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectsProvider } from './context/ProjectsContext';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Elemento root nao encontrado.');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* O AuthProvider vem por dentro, para que ele possa usar
         os hooks de navegação (como o useNavigate) */}
      <ProjectsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ProjectsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
