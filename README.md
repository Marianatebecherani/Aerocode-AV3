# 🚀 Aerocode-AV3

![GitHub language count](https://img.shields.io/github/languages/count/Marianatebecherani/Aerocode-AV3)
![GitHub top language](https://img.shields.io/github/languages/top/Marianatebecherani/Aerocode-AV3)
![GitHub last commit](https://img.shields.io/github/last-commit/Marianatebecherani/Aerocode-AV3)

> Projeto back-end (API REST) do Aerocode para a matéria de Programação Orientada a Objetos.

Este projeto consiste em uma API REST desenvolvida para gerenciar as funcionalidades do sistema Aerocode, utilizando Node.js, Prisma como ORM e MySQL como banco de dados.

## 🛠️ Tecnologias Utilizadas

As seguintes ferramentas e tecnologias foram usadas na construção do projeto:

-   **Backend:** [Node.js](https://nodejs.org/en/)
-   **ORM:** [Prisma](https://www.prisma.io/)
-   **Banco de Dados:** [MySQL](https://www.mysql.com/)

---

## 🏁 Começando

Estas instruções permitirão que você obtenha uma cópia do projeto em operação na sua máquina local para fins de desenvolvimento e teste.

### ✅ Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:

-   [Git](https://git-scm.com)
-   [Node.js](https://nodejs.org/en/) (versão recomendada: 18.x ou superior)
-   [MySQL](https://www.mysql.com/)
-   Um gerenciador de pacotes como [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)

Além disto, é recomendado ter um editor para trabalhar com o código, como o [VSCode](https://code.visualstudio.com/).

### ⚙️ Instalação

Siga os passos abaixo para configurar o ambiente de desenvolvimento:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/Aerocode-AV3.git
    ```

2.  **Acesse a pasta do projeto:**
    ```bash
    cd Aerocode-AV3
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure as variáveis de ambiente:**
    -   Crie uma cópia do arquivo `.env.example` e renomeie para `.env`.
    -   Abra o arquivo `.env` e configure a variável `DATABASE_URL` com a sua string de conexão do MySQL.
    ```bash
    # Exemplo de conteúdo do .env
    DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/NOME_DO_BANCO"
    ```

5.  **Execute as migrations do Prisma:**
    Este comando irá criar as tabelas no seu banco de dados com base no schema do Prisma.
    ```bash
    npx prisma migrate dev
    ```

### 🚀 Rodando a Aplicação

Após a instalação, você pode iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000` (ou a porta que estiver configurada no seu projeto).

### 🧪 Rodando os Testes

Para executar a suíte de testes, rode o seguinte comando:

```bash
npm test
```

---

## 👨‍💻 Autor

Feito por **Mariana**.
