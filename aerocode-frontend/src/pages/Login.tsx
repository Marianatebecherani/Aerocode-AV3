import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Logo_Aerocode.jpg';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para mostrar que está carregando

  const from = location.state?.from?.pathname || '/';

  // Adicionamos 'async' aqui para poder usar o 'await'
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // O PULO DO GATO: Adicionamos 'await' aqui.
      // O código agora ESPERA o servidor responder antes de continuar.
      const loginSuccess = await login(username, password);

      if (loginSuccess) {
        navigate(from, { replace: true });
      } else {
        setError('Usuário ou senha inválidos.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <img src={logo} alt="Aerocode Logo" className="h-20 w-auto mb-12" />

      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-8">
          Acessar Sistema Aerocode
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Usuário</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-4 rounded-lg font-semibold text-lg transition-colors mt-2 ${
              isLoading 
                ? 'bg-blue-800 cursor-not-allowed text-gray-300' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;