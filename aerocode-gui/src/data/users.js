// Este arquivo funciona como "banco de dados" de usuários.

export const users = [
  {
    id: 1,
    username: 'gerson.admin',
    password: 'adminpassword', // Em um projeto real, as senhas NUNCA devem ser guardadas em texto plano.
    name: 'Gerson (Admin)',
    role: 'admin',
  },
  {
    id: 2,
    username: 'mariana.eng',
    password: 'engpassword',
    name: 'Eng. Mariana',
    role: 'engenheiro',
  },
  {
    id: 3,
    username: 'joao.op',
    password: 'oppassword',
    name: 'João Operador',
    role: 'operador',
  },
];