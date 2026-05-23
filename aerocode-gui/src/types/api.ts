export type EntityId = string | number;

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export type TipoAeronave = 'COMERCIAL' | 'MILITAR';
export type TipoPeca = 'NACIONAL' | 'IMPORTADA';
export type StatusPeca = 'EM_PRODUCAO' | 'EM_TRANSPORTE' | 'PRONTA';
export type StatusEtapa = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
export type TipoTeste = 'ELETRICO' | 'HIDRAULICO' | 'AERODINAMICO';
export type ResultadoTeste = 'APROVADO' | 'REPROVADO';
export type NivelPermissao = 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR';
export type AppRole = 'admin' | 'engenheiro' | 'operador';

export type StatusRegistro<TStatus extends string> = {
  status: TStatus;
  data: string;
};

export type StatusTracker<TStatus extends string> = {
  atual: StatusRegistro<TStatus> | null;
  historico: StatusRegistro<TStatus>[];
};

export type ResultadoRegistro = {
  resultado: ResultadoTeste;
  data: string;
};

export type ResultadoTracker = {
  atual: ResultadoRegistro | null;
  historico: ResultadoRegistro[];
};

export type Paginacao = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  dados: T[];
  paginacao: Paginacao;
};

export type Funcionario = {
  id: EntityId;
  nome: string;
  telefone: string;
  endereco: string;
  usuario: string;
  senha?: string;
  nivelPermissao: NivelPermissao;
  funcao?: string;
};

export type AuthUser = Funcionario & {
  role?: AppRole;
};

export type LoginPayload = {
  usuario: string;
  senha: string;
};

export type LoginResponse = {
  autenticado: boolean;
  funcionario?: Funcionario;
};

export type Aeronave = {
  codigo: string;
  modelo: string;
  tipo: TipoAeronave;
  capacidade: number;
  alcance: number;
  pecas?: Peca[];
  etapas?: Etapa[];
  testes?: Teste[];
};

export type Peca = {
  id: EntityId;
  nome: string;
  tipo: TipoPeca;
  fornecedor: string;
  aeronaveCodigo: string;
  statusTracker: StatusTracker<StatusPeca>;
};

export type Etapa = {
  id: EntityId;
  nome: string;
  ordemExecucao?: number;
  prazoConclusao: string;
  prioridade: number;
  aeronaveCodigo: string;
  funcionariosIds: EntityId[];
  statusTracker: StatusTracker<StatusEtapa>;
};

export type Teste = {
  id: EntityId;
  tipo: TipoTeste;
  aeronaveCodigo: string;
  data?: string;
  resultadoTracker: ResultadoTracker;
};

export type AeronaveDetalhes = {
  codigo: string;
  modelo: string;
  tipo: TipoAeronave;
  capacidade: number;
  alcance: number;
  etapas: Array<{
    nome: string;
    ordemExecucao: number;
    prazoConclusao: string;
    prioridade: number;
    status: StatusEtapa | null;
    data: string | null;
    funcionarios: Array<{
      nome: string;
      funcao: NivelPermissao | string;
    }>;
  }>;
  pecas: Array<{
    nome: string;
    tipo: TipoPeca | string;
    fornecedor: string;
    status: StatusPeca | null;
    data: string | null;
  }>;
  testes: Array<{
    tipo: TipoTeste | string;
    resultado: ResultadoTeste | null;
    data: string | null;
  }>;
};

export type Relatorio = {
  id: EntityId;
  aeronaveCodigo: string;
  dataEmissao: string;
  status?: string;
  detalhes: AeronaveDetalhes;
};

export type DashboardResumo = {
  aeronaves?: Record<string, number>;
  etapas?: Record<string, number>;
  pecas?: Record<string, number>;
  testes?: Record<string, number>;
  [key: string]: unknown;
};

export type ApiClient = {
  login(payload: LoginPayload): Promise<LoginResponse>;
  listarAeronaves(params?: QueryParams): Promise<PaginatedResponse<Aeronave>>;
  buscarAeronave(codigo: string): Promise<Aeronave>;
  buscarDetalhesAeronave(codigo: string): Promise<AeronaveDetalhes>;
  criarAeronave(payload: Record<string, unknown>): Promise<Aeronave>;
  atualizarAeronave(codigo: string, payload: Record<string, unknown>): Promise<Aeronave>;
  deletarAeronave(codigo: string): Promise<null>;
  listarPecas(params?: QueryParams): Promise<PaginatedResponse<Peca>>;
  buscarPeca(id: EntityId): Promise<Peca>;
  criarPeca(payload: Record<string, unknown>): Promise<Peca>;
  atualizarPeca(id: EntityId, payload: Record<string, unknown>): Promise<Peca>;
  deletarPeca(id: EntityId): Promise<null>;
  prosseguirPeca(id: EntityId): Promise<Peca>;
  retrocederPeca(id: EntityId): Promise<Peca>;
  listarEtapas(params?: QueryParams): Promise<PaginatedResponse<Etapa>>;
  buscarEtapa(id: EntityId): Promise<Etapa>;
  criarEtapa(payload: Record<string, unknown>): Promise<Etapa>;
  atualizarEtapa(id: EntityId, payload: Record<string, unknown>): Promise<Etapa>;
  deletarEtapa(id: EntityId): Promise<null>;
  prosseguirEtapa(id: EntityId): Promise<Etapa>;
  retrocederEtapa(id: EntityId): Promise<Etapa>;
  iniciarEtapa(id: EntityId): Promise<Etapa>;
  finalizarEtapa(id: EntityId): Promise<Etapa>;
  associarFuncionarioEtapa(id: EntityId, funcionarioId: EntityId): Promise<Etapa>;
  desassociarFuncionarioEtapa(id: EntityId, funcionarioId: EntityId): Promise<Etapa>;
  listarTestes(params?: QueryParams): Promise<PaginatedResponse<Teste>>;
  criarTeste(payload: Record<string, unknown>): Promise<Teste>;
  atualizarTeste(id: EntityId, payload: Record<string, unknown>): Promise<Teste>;
  aprovarTeste(id: EntityId): Promise<Teste>;
  reprovarTeste(id: EntityId): Promise<Teste>;
  deletarTeste(id: EntityId): Promise<null>;
  listarFuncionarios(params?: QueryParams): Promise<PaginatedResponse<Funcionario>>;
  criarFuncionario(payload: Record<string, unknown>): Promise<Funcionario>;
  atualizarFuncionario(id: EntityId, payload: Record<string, unknown>): Promise<Funcionario>;
  deletarFuncionario(id: EntityId): Promise<null>;
  listarRelatorios(params?: QueryParams): Promise<PaginatedResponse<Relatorio>>;
  buscarRelatorio(id: EntityId): Promise<Relatorio>;
  criarRelatorio(payload: { aeronaveCodigo: string }): Promise<Relatorio>;
  deletarRelatorio(id: EntityId): Promise<null>;
  buscarDashboard(params?: QueryParams): Promise<DashboardResumo>;
};
