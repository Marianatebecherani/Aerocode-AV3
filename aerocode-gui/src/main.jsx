import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectsProvider } from './context/ProjectsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
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
