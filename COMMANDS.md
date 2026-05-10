# Guia de Comandos — Somente um CRUD

## Índice

- [Comandos npm](#comandos-npm)
- [Servidor](#servidor)
- [CLI de senhas](#cli-de-senhas)
- [Gerenciamento de dados](#gerenciamento-de-dados)
- [Frontend](#frontend)

---

## Comandos npm

Todos os comandos são executados na raiz do projeto.

### `npm run dev`

Inicia o servidor Express (porta 3001) e o Vite dev server simultaneamente via `concurrently`.

### `npm run dev:server`

Inicia apenas o servidor Express.

```
node server/index.js
```

### `npm run dev:client`

Inicia apenas o Vite dev server (sem backend).

```
vite
```

### `npm run build`

Gera o build de produção na pasta `dist/`.

### `npm run lint`

Executa ESLint nos arquivos `.js` e `.jsx` do `src/`. A pasta `server/` é ignorada.

### `npm run hash-password`

Script para gerenciar senhas no banco. [Ver detalhes abaixo](#cli-de-senhas).

### `npm run preview`

Serve o build de produção (`dist/`) localmente para teste.

---

## Servidor

### Inicialização

```
node server/index.js
```

- **Porta:** 3001 (definível via variável `PORT`)
- **Seed automático:** na primeira execução, cria `data/users.json` (admin) e `data/items.json` (3 itens)
- Os dados persistem entre reinicializações nos arquivos JSON

### Endpoints

#### `POST /api/login`

Autenticação de usuário.

**Body:**
```json
{ "email": "admin@gmail.com", "password": "admin123" }
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "name": "Administrador", "email": "admin@gmail.com" }
}
```

**Resposta (401):**
```json
{ "error": "E-mail ou senha incorretos" }
```

#### `GET /api/items`

Lista todos os itens. Requer token JWT.

**Headers:**
```
Authorization: Bearer <token>
```

#### `POST /api/items`

Cria um novo item. Requer token JWT.

**Body:**
```json
{
  "titulo": "Novo Projeto",
  "descricao": "Descrição do projeto",
  "status": "Pendente",
  "data": "2026-05-10"
}
```

#### `PUT /api/items/:id`

Atualiza um item existente. Requer token JWT.

**Body:** mesmo formato do POST.

#### `DELETE /api/items/:id`

Remove um item. Requer token JWT.

#### `GET /api/items/search?q=termo`

Busca itens por título ou descrição. Requer token JWT.

### Senha

O servidor aceita dois formatos de senha no `users.json`:

1. **Hash bcrypt** (começa com `$2`): usa `bcrypt.compareSync()`
2. **Texto puro**: compara direto com `===`

Isso permite editar o JSON manualmente e ainda funcionar, ou usar o script `hash-password` para converter.

---

## CLI de senhas

### `npm run hash-password "novaSenha"`

Define a mesma senha para **todos** os usuários do banco.

- Aplica `bcrypt.hashSync(senha, 10)` antes de salvar
- Sobrescreve o arquivo `data/users.json`

### `npm run hash-password -- "novaSenha" --user admin@gmail.com`

Define uma senha para **um usuário específico**, identificado pelo e-mail.

### `npm run hash-password` (modo interativo)

Pergunta a senha no terminal (útil quando você não quer que a senha fique no histórico do shell).

### `npm run hash-password --process`

**Modo mais útil para edição manual.**

Escaneia o `data/users.json`, encontra campos `password` que estão em **texto puro** (não começam com `$2`), aplica `bcrypt.hashSync()` e salva.

**Exemplo de uso:**

1. Edite `server/data/users.json` manualmente:
   ```json
   { "password": "minhaSenha" }
   ```
2. Converta:
   ```bash
   npm run hash-password --process
   ```
3. Pronto — senha agora está com hash bcrypt.

Se todas as senhas já forem hash, o script avisa que nada foi alterado.

---

## Gerenciamento de dados

### Resetar dados

Delete os arquivos `data/users.json` e `data/items.json`:

```bash
Remove-Item server/data/*.json
```

Na próxima inicialização do servidor, os arquivos serão recriados com os dados padrão (admin + 3 items).

### Estrutura dos arquivos

**users.json:**
```json
[
  {
    "id": 1,
    "name": "Administrador",
    "email": "admin@gmail.com",
    "password": "$2b$10$..."
  }
]
```

**items.json:**
```json
[
  {
    "id": 1,
    "titulo": "Projeto A",
    "descricao": "Descrição do projeto A",
    "status": "Em Progresso",
    "data": "2026-04-14"
  }
]
```

### Campos de um item

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | number | Auto-incrementado |
| `titulo` | string | Título do item |
| `descricao` | string | Descrição |
| `status` | string | "Pendente", "Em Progresso" ou "Concluído" |
| `data` | string | Data no formato YYYY-MM-DD |

---

## Frontend

### Credenciais padrão

- **E-mail:** `admin@gmail.com`
- **Senha:** `admin123`

### Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Tela de login |
| `/dashboard` | Dashboard com CRUD (protegida) |

### Estrutura de pastas

```
src/
  main.jsx              — Entrypoint (BrowserRouter)
  App.jsx               — Definição de rotas + UserProvider
  authService.js        — Chamada POST /api/login
  context/
    UserCtx.js          — createContext
    UserContext.jsx     — Provider (userName, userEmail, login, logout)
  hooks/
    useAuth.js          — useContext + validação
  components/
    ProtectedRoute.jsx  — Guarda de rota (JWT + context)
  services/
    dashboardService.js — Chamadas CRUD para API
  Dashboard/
    Dashboard.jsx       — Tela principal com tabela e modais
    Dashboard.module.css
    Modal.jsx           — Componente de modal reutilizável
    dashboardService.js — VAZIO (usar services/dashboardService.js)
  Login/
    LoginPage.jsx       — Tela de login
    loginContainer.jsx  — Formulário
    Login.module.css
    index.js            — Barrel exports
  index.css             — VAZIO
  App.css               — VAZIO
```

### Proteção de rotas

O `ProtectedRoute` verifica **duas condições** simultaneamente:
- `localStorage.getItem("authToken")` — token JWT salvo no login
- Contexto `userName` — setado pelo `UserProvider`

Se qualquer uma das duas faltar, redireciona para `/`.

---

## Autenticação (JWT)

- Token gerado no login com `jsonwebtoken`
- Secret padrão: `somente-um-crud-secret-2026` (sobrescrito via env `JWT_SECRET`)
- Expira em 24 horas
- Deve ser enviado como `Authorization: Bearer <token>` em todas as requisições CRUD
- Armazenado no `localStorage("authToken")`
- Se o token expirar ou for inválido, o `dashboardService.js` limpa o storage e redireciona para `/`

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3001` | Porta do servidor Express |
| `JWT_SECRET` | `somente-um-crud-secret-2026` | Chave para assinar tokens JWT |
