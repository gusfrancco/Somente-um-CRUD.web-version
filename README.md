# Somente um CRUD

Aplicação full-stack de CRUD com autenticação, construída com React + Vite no frontend e Express com persistência em JSON no backend.

## Stack

- **Frontend:** React 19, React Router v7, Vite 8, CSS Modules
- **Backend:** Express 4, JWT, bcryptjs
- **Persistência:** Arquivos JSON (`server/data/`)

## Comandos

| Comando | Ação |
|---------|------|
| `npm run dev` | Inicia servidor (porta 3001) + Vite em paralelo |
| `npm run dev:server` | Servidor Express apenas |
| `npm run dev:client` | Vite dev server apenas |
| `npm run build` | Build de produção em `dist/` |
| `npm run lint` | Verificação ESLint |
| `npm run hash-password` | CLI para gerenciar senhas no banco |
| `npm run preview` | Preview do build de produção |

## Login

**E-mail:** `admin@gmail.com`
**Senha:** `admin123`

## Gerenciar senhas

Há duas formas de alterar senha no sistema:

### 1. Via CLI (recomendado)

```bash
# Define mesma senha para todos os usuários
npm run hash-password "novaSenha"

# Define senha para um usuário específico
npm run hash-password -- "novaSenha" --user admin@gmail.com

# Modo interativo (sem argumentos)
npm run hash-password
```

### 2. Editar JSON + hashear (--process)

Edite `server/data/users.json` manualmente com a senha em texto puro:

```json
{ "password": "minhaSenhaNova" }
```

Depois converta para hash com:

```bash
npm run hash-password --process
```

O servidor aceita login com senha em texto puro OU com hash — você pode testar antes e depois de rodar `--process`.

## Resetar dados

Delete `server/data/*.json` e inicie o servidor — os arquivos serão recriados com dados iniciais.

## Estrutura

```
server/
  index.js              — API Express (auth + CRUD)
  hash-password.js      — Script para gerenciar senhas
  data/
    users.json          — Usuários persistidos
    items.json          — Itens persistidos
src/
  main.jsx              — Entrypoint
  App.jsx               — Rotas
  authService.js        — Chamada de login
  context/              — Context + Provider de autenticação
  hooks/useAuth.js      — Hook de autenticação
  components/           — ProtectedRoute
  services/             — Serviços CRUD
  Dashboard/            — Tela principal com tabela + modais
  Login/                — Tela de login
```
