export const projects = [
  {
    id: "04-EMB",
    title: "Pedido 04-EMB",
    description: "Produção de 4 unidades E-195",
    progress: 65,
    statusType: "error",
    steps: [
      {
        id: 1,
        title: '1. Estrutura e Fundações',
        status: 'Completo',
        tasks: ['Recebimento de materiais', 'Inspeção de longarinas', 'Montagem do esqueleto base'],
        components: []
      },
      {
        id: 2,
        title: '2. Montagem das Asas',
        status: 'ALERTA - PARADO',
        tasks: ['Montagem Asa Esquerda (PARADO)', 'Montagem Asa Direita', 'Instalação de Flaps', 'Inspeção de Qualidade (Pendente)'],
        components: [
          {
            id: 1,
            title: 'Asa Esquerda',
            status: 'PARADA - FALHA CQ',
            lastUpdate: '06 Nov 2025 07:15',
            statusType: 'error',
            details: {
              breadcrumb: 'Projetos / Pedido 04-EMB / Montagem das Asas',
              qcInspection: {
                status: 'Reprovado',
                date: '06 Nov 2025 / 07:15',
                inspector: 'J. Silva',
                notes: 'Detectada microfissura na longarina principal (Peça ID #L-105) durante inspeção ultrassônica. Componente não pode prosseguir.',
              },
              requiredParts: [
                { id: 1, name: 'Longarina Principal (Peça ID #L-105)', status: 'REPROVADA (Defeituosa)', action: 'Novo pedido de Peça #L-105 solicitado (Ticket #S-9012).', actionStatus: 'Aguardando Entrega', statusType: 'error' },
              ],
              activityLog: [
                { id: 1, text: 'Inspeção de CQ (Reprovado)', status: 'error' },
                { id: 2, text: 'Inspeção de CQ (Iniciada)', status: 'info' },
                { id: 3, text: 'Componente movido para área de CQ', status: 'info' },
                { id: 4, text: 'Produção Finalizada', status: 'success' },
                { id: 5, text: 'Produção Iniciada', status: 'info' },
              ],
            }
          },
          { id: 2, title: 'Asa Direita', status: 'Aprovada CQ', lastUpdate: '05 Nov 2025 18:30', statusType: 'success', details: null },
          { id: 3, title: 'Suportes Centrais', status: 'Aprovado CQ', lastUpdate: '05 Nov 2025 16:00', statusType: 'success', details: null },
        ]
      },
      {
        id: 3,
        title: '3. Montagem da Fuselagem',
        status: 'Em Espera',
        tasks: ['Pendente da Etapa 2'],
        components: []
      },
    ]
  },
  {
    id: "05-BOE",
    title: "Pedido 05-BOE",
    description: "Manutenção programada 737",
    progress: 10,
    statusType: "pending",
    steps: [] // Adiciona 'steps' vazio para consistência
  }
];