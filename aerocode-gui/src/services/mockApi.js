const STORAGE_KEY = 'aerocode_mock_db';

const now = () => new Date().toISOString();

const makeStatusTracker = (status, history = []) => {
  const data = now();
  const historico = history.length ? history : [{ status, data }];
  return {
    atual: historico[historico.length - 1],
    historico,
  };
};

const makeResultadoTracker = (resultado) => {
  const data = now();
  return {
    atual: { resultado, data },
    historico: [{ resultado, data }],
  };
};

const seedData = {
  counters: {
    aeronave: 4,
    etapa: 7,
    peca: 8,
    teste: 6,
    funcionario: 4,
    relatorio: 3,
  },
  funcionarios: [
    {
      id: 1,
      nome: 'Gerson Administrador',
      telefone: '(11) 90000-0001',
      endereco: 'Hangar Central',
      usuario: 'gerson.admin',
      senha: 'adminpassword',
      nivelPermissao: 'ADMINISTRADOR',
      funcao: 'Administrador',
    },
    {
      id: 2,
      nome: 'Mariana Engenheira',
      telefone: '(11) 90000-0002',
      endereco: 'Setor de Engenharia',
      usuario: 'mariana.eng',
      senha: 'engpassword',
      nivelPermissao: 'ENGENHEIRO',
      funcao: 'Engenheira',
    },
    {
      id: 3,
      nome: 'Joao Operador',
      telefone: '(11) 90000-0003',
      endereco: 'Linha de montagem',
      usuario: 'joao.op',
      senha: 'oppassword',
      nivelPermissao: 'OPERADOR',
      funcao: 'Operador',
    },
  ],
  aeronaves: [
    {
      codigo: 'AER-0001',
      modelo: 'Embraer E195-E2',
      tipo: 'COMERCIAL',
      capacidade: 146,
      alcance: 4815,
    },
    {
      codigo: 'AER-0002',
      modelo: 'KC-390 Millennium',
      tipo: 'MILITAR',
      capacidade: 80,
      alcance: 6130,
    },
    {
      codigo: 'AER-0003',
      modelo: 'Phenom 300E',
      tipo: 'COMERCIAL',
      capacidade: 10,
      alcance: 3723,
    },
  ],
  etapas: [
    {
      id: 1,
      nome: 'Montagem estrutural',
      prazoConclusao: '2026-05-22',
      prioridade: 1,
      ordemExecucao: 1,
      aeronaveCodigo: 'AER-0001',
      funcionariosIds: [2, 3],
      statusTracker: makeStatusTracker('EM_ANDAMENTO'),
    },
    {
      id: 2,
      nome: 'Instalacao eletrica',
      prazoConclusao: '2026-05-28',
      prioridade: 2,
      ordemExecucao: 2,
      aeronaveCodigo: 'AER-0001',
      funcionariosIds: [2],
      statusTracker: makeStatusTracker('PENDENTE'),
    },
    {
      id: 3,
      nome: 'Integracao hidraulica',
      prazoConclusao: '2026-05-30',
      prioridade: 1,
      ordemExecucao: 1,
      aeronaveCodigo: 'AER-0002',
      funcionariosIds: [3],
      statusTracker: makeStatusTracker('CONCLUIDA'),
    },
    {
      id: 4,
      nome: 'Inspecao final',
      prazoConclusao: '2026-06-02',
      prioridade: 3,
      ordemExecucao: 2,
      aeronaveCodigo: 'AER-0002',
      funcionariosIds: [],
      statusTracker: makeStatusTracker('EM_ANDAMENTO'),
    },
    {
      id: 5,
      nome: 'Preparacao de cabine',
      prazoConclusao: '2026-06-05',
      prioridade: 2,
      ordemExecucao: 1,
      aeronaveCodigo: 'AER-0003',
      funcionariosIds: [3],
      statusTracker: makeStatusTracker('PENDENTE'),
    },
  ],
  pecas: [
    {
      id: 1,
      nome: 'Motor principal',
      tipo: 'IMPORTADA',
      fornecedor: 'GE Aerospace',
      aeronaveCodigo: 'AER-0001',
      statusTracker: makeStatusTracker('EM_TRANSPORTE'),
    },
    {
      id: 2,
      nome: 'Painel avionico',
      tipo: 'NACIONAL',
      fornecedor: 'AeroTech Brasil',
      aeronaveCodigo: 'AER-0001',
      statusTracker: makeStatusTracker('EM_PRODUCAO'),
    },
    {
      id: 3,
      nome: 'Trem de pouso',
      tipo: 'IMPORTADA',
      fornecedor: 'Safran',
      aeronaveCodigo: 'AER-0002',
      statusTracker: makeStatusTracker('PRONTA'),
    },
    {
      id: 4,
      nome: 'Modulo hidraulico',
      tipo: 'NACIONAL',
      fornecedor: 'Hydra Sistemas',
      aeronaveCodigo: 'AER-0002',
      statusTracker: makeStatusTracker('PRONTA'),
    },
    {
      id: 5,
      nome: 'Assentos executivos',
      tipo: 'NACIONAL',
      fornecedor: 'CabinWorks',
      aeronaveCodigo: 'AER-0003',
      statusTracker: makeStatusTracker('EM_PRODUCAO'),
    },
  ],
  testes: [
    {
      id: 1,
      tipo: 'ELETRICO',
      aeronaveCodigo: 'AER-0001',
      data: '2026-05-10T12:00:00.000Z',
      resultadoTracker: makeResultadoTracker('APROVADO'),
    },
    {
      id: 2,
      tipo: 'HIDRAULICO',
      aeronaveCodigo: 'AER-0001',
      data: '2026-05-11T12:00:00.000Z',
      resultadoTracker: makeResultadoTracker('REPROVADO'),
    },
    {
      id: 3,
      tipo: 'AERODINAMICO',
      aeronaveCodigo: 'AER-0002',
      data: '2026-05-12T12:00:00.000Z',
      resultadoTracker: makeResultadoTracker('APROVADO'),
    },
    {
      id: 4,
      tipo: 'ELETRICO',
      aeronaveCodigo: 'AER-0003',
      data: '2026-05-13T12:00:00.000Z',
      resultadoTracker: makeResultadoTracker('APROVADO'),
    },
  ],
  relatorios: [],
};

function clone(value) {
  return structuredClone(value);
}

function ensureMockLoginProfiles(nextDb) {
  let changed = false;

  seedData.funcionarios.forEach((expectedFuncionario) => {
    const funcionario = nextDb.funcionarios.find((item) => item.id === expectedFuncionario.id);
    if (!funcionario) {
      nextDb.funcionarios.push(clone(expectedFuncionario));
      changed = true;
      return;
    }

    const fieldsToSync = ['nome', 'telefone', 'endereco', 'usuario', 'senha', 'nivelPermissao', 'funcao'];
    fieldsToSync.forEach((field) => {
      if (funcionario[field] !== expectedFuncionario[field]) {
        funcionario[field] = expectedFuncionario[field];
        changed = true;
      }
    });
  });

  return changed;
}

function loadDb() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const storedDb = JSON.parse(stored);
      if (ensureMockLoginProfiles(storedDb)) {
        saveDb(storedDb);
      }
      return storedDb;
    }
  } catch (error) {
    console.warn('Nao foi possivel carregar o mock do localStorage:', error);
  }

  const initial = clone(seedData);
  ensureMockLoginProfiles(initial);
  initial.relatorios = [
    makeRelatorioFromAeronave(initial, 'AER-0001'),
    makeRelatorioFromAeronave(initial, 'AER-0002'),
  ];
  saveDb(initial);
  return initial;
}

function saveDb(nextDb = db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDb));
  } catch (error) {
    console.warn('Nao foi possivel salvar o mock no localStorage:', error);
  }
}

let db;

function nextId(collection) {
  const id = db.counters[collection] || 1;
  db.counters[collection] = id + 1;
  return id;
}

function delay(result) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(clone(result)), 120);
  });
}

function fail(message) {
  return Promise.reject(new Error(message));
}

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function paginate(items, params = {}) {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;

  return {
    dados: items.slice(start, start + limit),
    paginacao: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

function withRelations(aeronave) {
  return {
    ...aeronave,
    etapas: db.etapas.filter((etapa) => etapa.aeronaveCodigo === aeronave.codigo),
    pecas: db.pecas.filter((peca) => peca.aeronaveCodigo === aeronave.codigo),
    testes: db.testes.filter((teste) => teste.aeronaveCodigo === aeronave.codigo),
  };
}

function filterAeronaves(params = {}) {
  return db.aeronaves
    .filter((aeronave) => {
      if (params.codigo && !normalizeText(aeronave.codigo).includes(normalizeText(params.codigo))) return false;
      if (params.modelo && !normalizeText(aeronave.modelo).includes(normalizeText(params.modelo))) return false;
      if (params.tipo && aeronave.tipo !== params.tipo) return false;
      if (params.capacidadeMin && aeronave.capacidade < Number(params.capacidadeMin)) return false;
      if (params.capacidadeMax && aeronave.capacidade > Number(params.capacidadeMax)) return false;
      if (params.alcanceMin && aeronave.alcance < Number(params.alcanceMin)) return false;
      if (params.alcanceMax && aeronave.alcance > Number(params.alcanceMax)) return false;
      return true;
    })
    .map(withRelations);
}

function currentStatus(item) {
  return item.statusTracker?.atual?.status;
}

function currentResultado(item) {
  return item.resultadoTracker?.atual?.resultado;
}

function calculateDashboard(params = {}) {
  const aeronaves = filterAeronaves(params);
  const codigos = new Set(aeronaves.map((aeronave) => aeronave.codigo));
  const etapas = db.etapas.filter((etapa) => codigos.has(etapa.aeronaveCodigo));
  const pecas = db.pecas.filter((peca) => codigos.has(peca.aeronaveCodigo));
  const testes = db.testes.filter((teste) => codigos.has(teste.aeronaveCodigo));

  return {
    aeronaves: {
      total: aeronaves.length,
      finalizadas: aeronaves.filter((aeronave) => aeronave.etapas.length && aeronave.etapas.every((etapa) => currentStatus(etapa) === 'CONCLUIDA')).length,
    },
    etapas: {
      total: etapas.length,
      concluidas: etapas.filter((etapa) => currentStatus(etapa) === 'CONCLUIDA').length,
    },
    pecas: {
      total: pecas.length,
      prontas: pecas.filter((peca) => currentStatus(peca) === 'PRONTA').length,
    },
    testes: {
      total: testes.length,
      aprovados: testes.filter((teste) => currentResultado(teste) === 'APROVADO').length,
      reprovados: testes.filter((teste) => currentResultado(teste) === 'REPROVADO').length,
    },
  };
}

function updateStatusTracker(item, statuses, direction) {
  const current = currentStatus(item) || statuses[0];
  const index = statuses.indexOf(current);
  const nextIndex = direction === 'next'
    ? Math.min(index + 1, statuses.length - 1)
    : Math.max(index - 1, 0);
  const status = statuses[nextIndex];
  item.statusTracker.historico.push({ status, data: now() });
  item.statusTracker.atual = item.statusTracker.historico[item.statusTracker.historico.length - 1];
  saveDb();
  return item;
}

function updateResultadoTracker(teste, resultado) {
  teste.resultadoTracker.historico.push({ resultado, data: now() });
  teste.resultadoTracker.atual = teste.resultadoTracker.historico[teste.resultadoTracker.historico.length - 1];
  teste.data = teste.resultadoTracker.atual.data;
  saveDb();
  return teste;
}

function findById(collection, id, label) {
  const item = db[collection].find((entry) => String(entry.id) === String(id));
  if (!item) throw new Error(`${label} nao encontrado.`);
  return item;
}

function makeRelatorioFromAeronave(sourceDb, aeronaveCodigo) {
  const aeronave = sourceDb.aeronaves.find((item) => item.codigo === aeronaveCodigo);
  if (!aeronave) throw new Error('Aeronave nao encontrada.');

  const etapas = sourceDb.etapas.filter((etapa) => etapa.aeronaveCodigo === aeronaveCodigo);
  const pecas = sourceDb.pecas.filter((peca) => peca.aeronaveCodigo === aeronaveCodigo);
  const testes = sourceDb.testes.filter((teste) => teste.aeronaveCodigo === aeronaveCodigo);
  const funcionariosPorId = new Map(sourceDb.funcionarios.map((funcionario) => [funcionario.id, funcionario]));

  const id = sourceDb.counters.relatorio++;
  return {
    id,
    aeronaveCodigo,
    dataEmissao: now(),
    detalhes: {
      codigo: aeronave.codigo,
      modelo: aeronave.modelo,
      tipo: aeronave.tipo,
      capacidade: aeronave.capacidade,
      alcance: aeronave.alcance,
      etapas: etapas.map((etapa) => ({
        ordemExecucao: etapa.ordemExecucao,
        nome: etapa.nome,
        prazoConclusao: etapa.prazoConclusao,
        prioridade: etapa.prioridade,
        status: currentStatus(etapa),
        funcionarios: etapa.funcionariosIds.map((idFuncionario) => {
          const funcionario = funcionariosPorId.get(idFuncionario);
          return {
            nome: funcionario?.nome || `Funcionario #${idFuncionario}`,
            funcao: funcionario?.funcao || funcionario?.nivelPermissao || 'Equipe',
          };
        }),
      })),
      pecas: pecas.map((peca) => ({
        nome: peca.nome,
        tipo: peca.tipo,
        fornecedor: peca.fornecedor,
        status: currentStatus(peca),
        data: peca.statusTracker?.atual?.data,
      })),
      testes: testes.map((teste) => ({
        tipo: teste.tipo,
        resultado: currentResultado(teste),
        data: teste.resultadoTracker?.atual?.data,
      })),
    },
  };
}

function filterByDate(value, start, end) {
  const time = new Date(value).getTime();
  if (start && time < new Date(start).getTime()) return false;
  if (end && time > new Date(end).getTime() + 86400000) return false;
  return true;
}

db = loadDb();

export const mockApi = {
  login: async ({ usuario, senha }) => {
    const funcionario = db.funcionarios.find((item) => item.usuario === usuario && item.senha === senha);
    if (!funcionario) return delay({ autenticado: false });
    return delay({ autenticado: true, funcionario });
  },

  listarAeronaves: (params = {}) => delay(paginate(filterAeronaves(params), params)),

  buscarAeronave: (codigo) => {
    const aeronave = db.aeronaves.find((item) => item.codigo === codigo);
    return aeronave ? delay(withRelations(aeronave)) : fail('Aeronave nao encontrada.');
  },

  buscarDetalhesAeronave: (codigo) => mockApi.buscarAeronave(codigo),

  criarAeronave: async (payload) => {
    const codigo = `AER-${String(nextId('aeronave')).padStart(4, '0')}`;
    const aeronave = { codigo, ...payload };
    db.aeronaves.push(aeronave);
    saveDb();
    return delay(withRelations(aeronave));
  },

  atualizarAeronave: async (codigo, payload) => {
    const aeronave = db.aeronaves.find((item) => item.codigo === codigo);
    if (!aeronave) return fail('Aeronave nao encontrada.');
    Object.assign(aeronave, payload);
    saveDb();
    return delay(withRelations(aeronave));
  },

  deletarAeronave: async (codigo) => {
    db.aeronaves = db.aeronaves.filter((item) => item.codigo !== codigo);
    db.etapas = db.etapas.filter((item) => item.aeronaveCodigo !== codigo);
    db.pecas = db.pecas.filter((item) => item.aeronaveCodigo !== codigo);
    db.testes = db.testes.filter((item) => item.aeronaveCodigo !== codigo);
    saveDb();
    return delay(null);
  },

  listarPecas: (params = {}) => {
    const termo = normalizeText(params.termo);
    const pecas = db.pecas.filter((peca) => {
      if (params.aeronaveCodigo && !normalizeText(peca.aeronaveCodigo).includes(normalizeText(params.aeronaveCodigo))) return false;
      if (params.tipo && peca.tipo !== params.tipo) return false;
      if (params.status && currentStatus(peca) !== params.status) return false;
      if (termo && !normalizeText(`${peca.nome} ${peca.fornecedor}`).includes(termo)) return false;
      return true;
    });
    return delay(paginate(pecas, params));
  },

  buscarPeca: (id) => {
    try {
      return delay(findById('pecas', id, 'Peca'));
    } catch (error) {
      return fail(error.message);
    }
  },

  criarPeca: async (payload) => {
    const peca = {
      id: nextId('peca'),
      ...payload,
      statusTracker: makeStatusTracker('EM_PRODUCAO'),
    };
    db.pecas.push(peca);
    saveDb();
    return delay(peca);
  },

  atualizarPeca: async (id, payload) => {
    try {
      const peca = findById('pecas', id, 'Peca');
      Object.assign(peca, payload);
      saveDb();
      return delay(peca);
    } catch (error) {
      return fail(error.message);
    }
  },

  deletarPeca: async (id) => {
    db.pecas = db.pecas.filter((item) => String(item.id) !== String(id));
    saveDb();
    return delay(null);
  },

  prosseguirPeca: (id) => {
    try {
      return delay(updateStatusTracker(findById('pecas', id, 'Peca'), ['EM_PRODUCAO', 'EM_TRANSPORTE', 'PRONTA'], 'next'));
    } catch (error) {
      return fail(error.message);
    }
  },

  retrocederPeca: (id) => {
    try {
      return delay(updateStatusTracker(findById('pecas', id, 'Peca'), ['EM_PRODUCAO', 'EM_TRANSPORTE', 'PRONTA'], 'previous'));
    } catch (error) {
      return fail(error.message);
    }
  },

  listarEtapas: (params = {}) => {
    const etapas = db.etapas.filter((etapa) => {
      if (params.aeronaveCodigo && !normalizeText(etapa.aeronaveCodigo).includes(normalizeText(params.aeronaveCodigo))) return false;
      if (params.nome && !normalizeText(etapa.nome).includes(normalizeText(params.nome))) return false;
      if (params.status && currentStatus(etapa) !== params.status) return false;
      if (params.prazoInicio && new Date(etapa.prazoConclusao) < new Date(params.prazoInicio)) return false;
      if (params.prazoFim && new Date(etapa.prazoConclusao) > new Date(params.prazoFim)) return false;
      return true;
    });
    return delay(paginate(etapas, params));
  },

  buscarEtapa: (id) => {
    try {
      return delay(findById('etapas', id, 'Etapa'));
    } catch (error) {
      return fail(error.message);
    }
  },

  criarEtapa: async (payload) => {
    const etapa = {
      id: nextId('etapa'),
      ...payload,
      ordemExecucao: db.etapas.filter((item) => item.aeronaveCodigo === payload.aeronaveCodigo).length + 1,
      funcionariosIds: [],
      statusTracker: makeStatusTracker('PENDENTE'),
    };
    db.etapas.push(etapa);
    saveDb();
    return delay(etapa);
  },

  atualizarEtapa: async (id, payload) => {
    try {
      const etapa = findById('etapas', id, 'Etapa');
      Object.assign(etapa, payload);
      saveDb();
      return delay(etapa);
    } catch (error) {
      return fail(error.message);
    }
  },

  deletarEtapa: async (id) => {
    db.etapas = db.etapas.filter((item) => String(item.id) !== String(id));
    saveDb();
    return delay(null);
  },

  prosseguirEtapa: (id) => {
    try {
      return delay(updateStatusTracker(findById('etapas', id, 'Etapa'), ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'], 'next'));
    } catch (error) {
      return fail(error.message);
    }
  },

  retrocederEtapa: (id) => {
    try {
      return delay(updateStatusTracker(findById('etapas', id, 'Etapa'), ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'], 'previous'));
    } catch (error) {
      return fail(error.message);
    }
  },

  iniciarEtapa: (id) => mockApi.prosseguirEtapa(id),
  finalizarEtapa: (id) => mockApi.prosseguirEtapa(id),

  associarFuncionarioEtapa: async (id, funcionarioId) => {
    try {
      const etapa = findById('etapas', id, 'Etapa');
      const normalizedId = Number(funcionarioId);
      if (!etapa.funcionariosIds.includes(normalizedId)) etapa.funcionariosIds.push(normalizedId);
      saveDb();
      return delay(etapa);
    } catch (error) {
      return fail(error.message);
    }
  },

  desassociarFuncionarioEtapa: async (id, funcionarioId) => {
    try {
      const etapa = findById('etapas', id, 'Etapa');
      etapa.funcionariosIds = etapa.funcionariosIds.filter((item) => String(item) !== String(funcionarioId));
      saveDb();
      return delay(etapa);
    } catch (error) {
      return fail(error.message);
    }
  },

  listarTestes: (params = {}) => {
    const testes = db.testes.filter((teste) => {
      if (params.aeronaveCodigo && !normalizeText(teste.aeronaveCodigo).includes(normalizeText(params.aeronaveCodigo))) return false;
      if (params.tipo && teste.tipo !== params.tipo) return false;
      if (params.resultado && currentResultado(teste) !== params.resultado) return false;
      return true;
    });
    return delay(paginate(testes, params));
  },

  criarTeste: async (payload) => {
    const teste = {
      id: nextId('teste'),
      tipo: payload.tipo,
      aeronaveCodigo: payload.aeronaveCodigo,
      data: now(),
      resultadoTracker: makeResultadoTracker(payload.resultado || 'APROVADO'),
    };
    db.testes.push(teste);
    saveDb();
    return delay(teste);
  },

  atualizarTeste: async (id, payload) => {
    try {
      const teste = findById('testes', id, 'Teste');
      Object.assign(teste, payload);
      saveDb();
      return delay(teste);
    } catch (error) {
      return fail(error.message);
    }
  },

  aprovarTeste: (id) => {
    try {
      return delay(updateResultadoTracker(findById('testes', id, 'Teste'), 'APROVADO'));
    } catch (error) {
      return fail(error.message);
    }
  },

  reprovarTeste: (id) => {
    try {
      return delay(updateResultadoTracker(findById('testes', id, 'Teste'), 'REPROVADO'));
    } catch (error) {
      return fail(error.message);
    }
  },

  deletarTeste: async (id) => {
    db.testes = db.testes.filter((item) => String(item.id) !== String(id));
    saveDb();
    return delay(null);
  },

  listarFuncionarios: (params = {}) => {
    const termo = normalizeText(params.termo);
    const funcionarios = db.funcionarios.filter((funcionario) => {
      if (termo && !normalizeText(`${funcionario.nome} ${funcionario.usuario}`).includes(termo)) return false;
      if (params.nivelPermissao && funcionario.nivelPermissao !== params.nivelPermissao) return false;
      return true;
    });
    return delay(paginate(funcionarios, params));
  },

  criarFuncionario: async (payload) => {
    const funcionario = {
      id: nextId('funcionario'),
      funcao: payload.nivelPermissao,
      ...payload,
    };
    db.funcionarios.push(funcionario);
    saveDb();
    return delay(funcionario);
  },

  atualizarFuncionario: async (id, payload) => {
    try {
      const funcionario = findById('funcionarios', id, 'Funcionario');
      Object.assign(funcionario, payload);
      saveDb();
      return delay(funcionario);
    } catch (error) {
      return fail(error.message);
    }
  },

  deletarFuncionario: async (id) => {
    db.funcionarios = db.funcionarios.filter((item) => String(item.id) !== String(id));
    db.etapas.forEach((etapa) => {
      etapa.funcionariosIds = etapa.funcionariosIds.filter((funcionarioId) => String(funcionarioId) !== String(id));
    });
    saveDb();
    return delay(null);
  },

  listarRelatorios: (params = {}) => {
    const relatorios = db.relatorios.filter((relatorio) => {
      if (params.aeronaveCodigo && !normalizeText(relatorio.aeronaveCodigo).includes(normalizeText(params.aeronaveCodigo))) return false;
      if (!filterByDate(relatorio.dataEmissao, params.dataInicio, params.dataFim)) return false;
      return true;
    });
    return delay(paginate(relatorios, params));
  },

  buscarRelatorio: (id) => {
    try {
      return delay(findById('relatorios', id, 'Relatorio'));
    } catch (error) {
      return fail(error.message);
    }
  },

  criarRelatorio: async ({ aeronaveCodigo }) => {
    try {
      const relatorio = makeRelatorioFromAeronave(db, aeronaveCodigo);
      db.relatorios.unshift(relatorio);
      saveDb();
      return delay(relatorio);
    } catch (error) {
      return fail(error.message);
    }
  },

  deletarRelatorio: async (id) => {
    db.relatorios = db.relatorios.filter((item) => String(item.id) !== String(id));
    saveDb();
    return delay(null);
  },

  buscarDashboard: (params = {}) => delay(calculateDashboard(params)),
};
