import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Arrays auxiliares para gerar dados aleatórios realistas
const projectTypes = [
  { code: 'EMB', name: 'Embraer E2', val: 12.5 },
  { code: 'BOE', name: 'Boeing 787', val: 35.5 },
  { code: 'AIR', name: 'Airbus A350', val: 28.1 },
  { code: 'GLF', name: 'Gulfstream G700', val: 18.2 },
  { code: 'BOM', name: 'Bombardier Global', val: 15.0 },
  { code: 'CSS', name: 'Cessna Citation', val: 8.5 },
];

const componentNames = ['Asa Esquerda', 'Asa Direita', 'Estabilizador Vertical', 'Trem de Pouso', 'Motor #1', 'Motor #2', 'Aviônica Central', 'Radar Meteorológico'];

const possibleLogs = [
  { text: 'Inspeção de CQ Iniciada', type: 'info' },
  { text: 'Componente recebido na linha', type: 'info' },
  { text: 'Teste de pressão hidráulica', type: 'info' },
  { text: 'Falha no alinhamento detectada', type: 'error' },
  { text: 'Aprovação preliminar concedida', type: 'success' },
  { text: 'Revisão de engenharia solicitada', type: 'warning' },
];

const possibleParts = [
  { name: 'Longarina Principal', status: 'REPROVADA', action: 'Novo pedido solicitado', actStatus: 'Aguardando', type: 'error' },
  { name: 'Rebite de Titânio', status: 'Aprovado', action: 'Nenhuma ação', actStatus: 'OK', type: 'success' },
  { name: 'Atuador Hidráulico', status: 'Pendente', action: 'Verificar estoque', actStatus: 'Em análise', type: 'warning' },
  { name: 'Sensor de Fluxo', status: 'Aprovado', action: 'Instalação agendada', actStatus: 'Pronto', type: 'success' },
  { name: 'Chapa de Alumínio 7075', status: 'Dano no transporte', action: 'Devolução iniciada', actStatus: 'Enviado', type: 'error' },
];

// Função para pegar item aleatório
const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('🌱 Iniciando a Mega Plantação de Dados...');

  // 1. LIMPEZA GERAL (Apagar dados antigos para não dar conflito)
  try {
    await prisma.activityLog.deleteMany();
    await prisma.requiredPart.deleteMany();
    await prisma.component.deleteMany();
    await prisma.projectStep.deleteMany();
    await prisma.project.deleteMany();
    await prisma.inventoryItem.deleteMany(); // Limpa o inventário antigo
    await prisma.user.deleteMany();
    console.log('🧹 Banco de dados limpo com sucesso.');
  } catch (error) {
    console.log('⚠️ Aviso: Algumas tabelas já estavam vazias ou houve erro na limpeza.');
  }

  // 2. Criar Usuários
  await prisma.user.createMany({
    data: [
      { username: 'gerson.admin', password: 'adminpassword', name: 'Gerson (Admin)', role: 'admin' },
      { username: 'mariana.eng', password: 'engpassword', name: 'Eng. Mariana', role: 'engenheiro' },
      { username: 'joao.op', password: 'oppassword', name: 'João Operador', role: 'operador' },
    ],
    skipDuplicates: true, // Proteção extra
  });

  // 3. Gerar 10 Projetos Completos
  for (let i = 1; i <= 10; i++) {
    const type = randomItem(projectTypes);
    const idSuffix = Math.floor(Math.random() * 900) + 100;
    const projectId = `${i.toString().padStart(2, '0')}-${type.code}`;
    const isProblematic = Math.random() > 0.7;
    
    const status = isProblematic ? 'ALERTA - PARADO' : (Math.random() > 0.5 ? 'Em Operação' : 'Completo');
    const statusType = isProblematic ? 'error' : (status === 'Completo' ? 'success' : 'warning');
    const progress = status === 'Completo' ? 100 : Math.floor(Math.random() * 90);

    console.log(`Criando Projeto: ${projectId}...`);

    // Usamos 'upsert' aqui (update ou insert) para garantir que não duplique projetos se rodar 2x
    const projectData = {
      title: `Pedido ${projectId} (${type.name})`,
      status: status,
      idNumber: `ID #A${idSuffix}`,
      value: `R$ ${type.val}M`,
      progress: progress,
      statusType: statusType,
      steps: {
        create: [
          {
            title: '1. Estrutura e Fundações',
            status: 'Completo',
            tasks: 'Recebimento, Inspeção, Corte',
            components: { create: generateComponents(3, false) }
          },
          {
            title: '2. Montagem Principal',
            status: isProblematic ? 'ALERTA - PARADO' : 'Em Operação',
            tasks: 'Montagem Asas, Fuselagem, Pintura',
            components: { create: generateComponents(4, isProblematic) }
          },
           {
            title: '3. Aviônica e Acabamento',
            status: 'Em Espera',
            tasks: 'Instalação de Painel, Bancos, Radar',
            components: { create: generateComponents(2, false) }
          }
        ]
      }
    };

    // Tenta criar, se já existir o ID, apenas atualiza (o que não faz nada prático aqui, mas evita o erro)
    await prisma.project.upsert({
      where: { id: projectId },
      update: {},
      create: { id: projectId, ...projectData }
    });
  }
  
  // 4. Recriar inventário básico (COM PROTEÇÃO skipDuplicates)
  await prisma.inventoryItem.createMany({
    data: [
      { id: 'L-105', name: 'Longarina Principal', quantity: 12, status: 'Em Estoque', statusType: 'success' },
      { id: 'E-404', name: 'Motor GE9X', quantity: 0, status: 'Em Falta', statusType: 'error' },
      { id: 'R-001', name: 'Rebite Estrutural', quantity: 500, status: 'Em Estoque', statusType: 'success' },
    ],
    skipDuplicates: true, // <--- AQUI ESTÁ A SOLUÇÃO DEFINITIVA
  });

  console.log('✅ 10 Projetos Completos e Inventário criados!');
}

// Função auxiliar para gerar componentes
function generateComponents(count: number, forceError: boolean) {
  const comps = [];
  for (let j = 0; j < count; j++) {
    const hasIssue = forceError && j === 0;
    const statusType = hasIssue ? 'error' : 'success';
    
    comps.push({
      title: randomItem(componentNames),
      status: hasIssue ? 'PARADA - FALHA CQ' : 'Aprovado CQ',
      statusType: statusType,
      qcStatus: hasIssue ? 'Reprovado' : 'Aprovado',
      qcDate: new Date().toISOString().split('T')[0],
      qcInspector: hasIssue ? 'J. Silva' : 'M. Souza',
      qcNotes: hasIssue ? 'Falha estrutural detectada.' : 'Conforme especificação.',
      activityLogs: {
        create: Array.from({ length: Math.floor(Math.random() * 3) + 2 }).map((_, idx) => {
          const log = hasIssue && idx === 0 
            ? { text: 'Falha Crítica Detectada', type: 'error' } 
            : randomItem(possibleLogs);
          return { text: log.text, statusType: log.type };
        })
      },
      requiredParts: {
        create: Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, idx) => {
          const part = hasIssue && idx === 0 
            ? possibleParts[0] 
            : randomItem(possibleParts.slice(1));
          return {
            name: part.name,
            status: part.status,
            action: part.action,
            actionStatus: part.actStatus,
            statusType: part.type
          };
        })
      }
    });
  }
  return comps;
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });