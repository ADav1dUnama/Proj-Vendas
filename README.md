# Event Food Sales Management

Um sistema moderno e responsivo para gestão de vendas de comida em eventos, agora migrado para **Next.js 15** com **App Router**.

## 🚀 Tecnologias

- **Frontend/Backend**: [Next.js 15](https://nextjs.org/) (App Router)
- **Interface**: [React 18](https://reactjs.org/) & [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados**: [MongoDB](https://www.mongodb.com/) (Driver Nativo)
- **Autenticação**: JWT (JSON Web Tokens) & Bcryptjs
- **Ícones**: Lucide React

## 📋 Funcionalidades

- 🔐 Autenticação completa (Sign In / Sign Up)
- 🍔 Gestão de Cardápio (CRUD de produtos)
- 💰 Registro de Vendas em tempo real
- 📊 Relatórios de vendas e desempenho
- 📱 Configuração de PIX para pagamentos
- 🏗️ Arquitetura escalável com API Route Handlers

## ⚙️ Configuração do Ambiente

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd Proj-Vendas
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` baseado no `.env.example`:
   ```env
   MONGODB_URI=seu_link_do_mongodb
   MONGODB_DB=controle_vendas
   JWT_SECRET=sua_chave_secreta
   ```

4. Inicie o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🏗️ Estrutura do Projeto

- `app/`: Rotas, layouts e API endpoints.
- `components/`: Componentes React reutilizáveis.
- `contexts/`: Contextos da aplicação (Auth, etc).
- `lib/`: Utilitários, configuração do DB e API client.
- `types/`: Definições de tipos TypeScript.

## 🛠️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Cria a versão de produção.
- `npm run start`: Inicia o servidor de produção.
- `npm run lint`: Executa a verificação de linting.
