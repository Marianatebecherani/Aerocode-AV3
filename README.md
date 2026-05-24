# AeroCode AV3

Sistema AeroCode com backend REST em Node.js/Express, Prisma e MySQL, e frontend em React/Vite.

O repositório está organizado em dois projetos principais:

- `aerocode-api`: backend da aplicação.
- `aerocode-gui`: frontend da aplicação.

## Tecnologias

- Node.js
- TypeScript
- Express
- Prisma ORM
- MySQL
- React
- Vite
- Tailwind CSS

## Pré-requisitos

Antes de iniciar, instale:

- Git
- Node.js 20 ou superior
- MySQL
- npm

Também é necessário ter um banco MySQL criado para o projeto, por exemplo:

```sql
CREATE DATABASE aerocode;
```

## Backend

Entre na pasta da API:

```bash
cd aerocode-api
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

No Linux/macOS, use:

```bash
cp .env.example .env
```

Configure a conexão com o MySQL no `.env`:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/aerocode"
```

Exemplo:

```env
DATABASE_URL="mysql://root:minhasenha@localhost:3306/aerocode"
```

### Variáveis do Backend

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/aerocode"

AUTH_TOKEN_REQUIRED=false
AUTH_TOKEN_SECRET="troque-este-segredo"
AUTH_TOKEN_EXPIRES_IN_SECONDS=86400

API_METRICS_ENABLED=false
API_METRICS_PERSIST=true
```

`AUTH_TOKEN_REQUIRED` controla se as rotas protegidas exigem token JWT. Quando estiver `true`, o frontend faz login em `/api/v1/auth/login`, recebe um token e envia nas demais chamadas com `Authorization: Bearer <token>`.

`API_METRICS_ENABLED` controla o middleware de medição de tempo de processamento das chamadas da API. Esse recurso é recomendado apenas para desenvolvimento/testes.

`API_METRICS_PERSIST` define se as métricas serão salvas na tabela `api_metricas`.

### Migrations do Prisma

Depois de configurar o `.env`, execute as migrations para criar as tabelas no MySQL:

```bash
npm run prisma:migrate
```

Esse comando executa `prisma migrate dev`.

Se precisar apenas regenerar o Prisma Client:

```bash
npm run prisma:generate
```

Para validar o schema Prisma:

```bash
npm run prisma:validate
```

### Seed do Banco

Para popular o banco com dados iniciais:

```bash
npm run seed
```

O seed cria aeronaves, peças, etapas, testes, relatórios e funcionários.

Credenciais úteis para login:

```txt
Administrador:
usuário: gerson.admin
senha: adminpassword

Engenheiro:
usuário: mariana.eng
senha: engpassword

Operador:
usuário: joao.op
senha: oppassword
```

### Rodar o Backend

Em desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em:

```txt
http://localhost:3000
```

Principais URLs:

```txt
Health check: http://localhost:3000/health
Swagger:      http://localhost:3000/api-docs
API v1:       http://localhost:3000/api/v1
```

Para gerar build de produção:

```bash
npm run build
```

Para rodar o build:

```bash
npm start
```

## Frontend

Em outro terminal, entre na pasta do frontend:

```bash
cd aerocode-gui
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

No Linux/macOS:

```bash
cp .env.example .env
```

Conteúdo padrão:

```env
VITE_USE_MOCK_API=false
```

Com `VITE_USE_MOCK_API=false`, o frontend usa o backend real. O Vite já possui proxy configurado para enviar chamadas `/api` para `http://localhost:3000`.

Com `VITE_USE_MOCK_API=true`, o frontend usa dados mockados no navegador.

### Rodar o Frontend

```bash
npm run dev
```

O frontend ficará disponível normalmente em:

```txt
http://localhost:5173
```

Para gerar build:

```bash
npm run build
```

Para visualizar o build:

```bash
npm run preview
```

## Fluxo Recomendado para Desenvolvimento

1. Inicie o MySQL.
2. Configure `aerocode-api/.env`.
3. Rode as migrations no backend:

```bash
cd aerocode-api
npm run prisma:migrate
```

4. Popule o banco:

```bash
npm run seed
```

5. Rode o backend:

```bash
npm run dev
```

6. Em outro terminal, rode o frontend:

```bash
cd aerocode-gui
npm run dev
```

7. Acesse:

```txt
http://localhost:5173
```

## Autenticação

O login é feito em:

```txt
POST /api/v1/auth/login
```

Exemplo de body:

```json
{
  "usuario": "gerson.admin",
  "senha": "adminpassword"
}
```

Quando autenticado, o backend retorna os dados do funcionário e um token JWT:

```json
{
  "autenticado": true,
  "funcionario": {
    "id": "1",
    "nome": "Gerson da Penha",
    "telefone": "(12) 99111-1001",
    "endereco": "Rua das Palmeiras, 120 - São José dos Campos/SP",
    "usuario": "gerson.admin",
    "nivelPermissao": "ADMINISTRADOR"
  },
  "token": "..."
}
```

Se `AUTH_TOKEN_REQUIRED=true`, as demais rotas exigem:

```txt
Authorization: Bearer <token>
```

## Métricas de Tempo de Processamento

O backend possui um middleware opcional para medir o tempo de processamento das chamadas `/api/v1`.

Para ativar:

```env
API_METRICS_ENABLED=true
API_METRICS_PERSIST=true
```

Exemplo de log:

```txt
[API Metrics] GET /api/v1/dashboard 200 - 37.88 ms
```

Quando `API_METRICS_PERSIST=true`, os dados são salvos na tabela `api_metricas`, incluindo:

- método HTTP
- caminho chamado
- rota
- status HTTP
- duração em milissegundos
- data/hora de início
- data/hora de fim
- IP
- user-agent

Essa métrica representa o tempo de processamento dentro do servidor. Ela não mede a latência de rede entre cliente e servidor.

## Observações

- O backend deve estar rodando antes do frontend quando `VITE_USE_MOCK_API=false`.
- Após alterar o schema Prisma, rode uma nova migration.
- Após alterar variáveis `.env`, reinicie o servidor correspondente.
