import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Rota de teste
app.get('/', (req, res) => {
  res.send('API Aerocode (MySQL) rodando! ✈️');
});

// --- ROTA DE LOGIN ---
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username: username } });
    if (user && user.password === password) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// --- ROTA DE PROJETOS (LISTA - IMPORTANTE PARA O DASHBOARD) ---
app.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { steps: true }
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
});

// --- NOVAS ROTAS DE DETALHES ---
// 1. Detalhes de UM Projeto
app.get('/projects/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { steps: true }
    });
    if (project) res.json(project);
    else res.status(404).json({ error: 'Projeto não encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar projeto' });
  }
});

// 2. Detalhes de UMA Etapa
app.get('/steps/:id', async (req, res) => {
  try {
    const step = await prisma.projectStep.findUnique({
      where: { id: Number(req.params.id) },
      include: { components: true }
    });
    if (step) res.json(step);
    else res.status(404).json({ error: 'Etapa não encontrada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar etapa' });
  }
});

// 3. Buscar Detalhes de UM Componente
app.get('/components/:id', async (req, res) => {
  try {
    const component = await prisma.component.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        requiredParts: true, 
        activityLogs: {      
          orderBy: { timestamp: 'desc' } // Logs mais recentes primeiro
        }
      }
    });
    if (component) res.json(component);
    else res.status(404).json({ error: 'Componente não encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar componente' });
  }
});

// Rota para criar projeto (opcional, mas bom manter)
app.post('/projects', async (req, res) => {
  try {
    const { id, title, status, idNumber, value, progress, statusType } = req.body;
    const newProject = await prisma.project.create({
      data: { id, title, status, idNumber, value, progress, statusType }
    });
    res.json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar projeto' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});