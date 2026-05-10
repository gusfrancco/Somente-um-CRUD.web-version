# Guia de Comandos — Somente um CRUD

## Comandos npm

| Comando                 | O que faz                          |
| ----------------------- | ---------------------------------- |
| `npm run dev`           | Sobe servidor (3001) + Vite juntos |
| `npm run dev:server`    | Só o servidor Express              |
| `npm run dev:client`    | Só o Vite                          |
| `npm run build`         | Gera `dist/` para produção         |
| `npm run lint`          | Verifica código com ESLint         |
| `npm run hash-password` | Gerencia senhas no banco           |
| `npm run preview`       | Testa o build de produção          |

---

## Senhas — como funciona

### Quem faz o hash?

Dois lugares:

1. **Seed automático** — na primeira vez que o servidor roda, ele pega `"admin123"` e já salva o hash
2. **Script `hash-password`** — você roda manualmente, ele lê o JSON, aplica hash e salva

### Posso editar o JSON na mão?

**Sim, de dois jeitos:**

#### Jeito 1: Editar e rodar `--process` (recomendado)

1. Abra `server/data/users.json` e escreva a senha em texto puro:
   ```json
   { "password": "minhaSenha" }
   ```
2. No terminal, converta para hash:
   ```bash
   npm run hash-password --process
   ```
3. Pronto. O script achou o texto puro, aplicou hash, salvou.

#### Jeito 2: Só editar, sem rodar nada

O servidor aceita **texto puro também**. Se você escrever `"password": "123"` no JSON e logar com `"123"`, funciona — o servidor percebe que não é um hash e compara direto.

**Mas atenção:** se depois você rodar `npm run hash-password --process`, ele vai converter esse texto puro para hash automaticamente.

### Resumo dos comandos de senha

| Comando                                     | Efeito                                                    |
| ------------------------------------------- | --------------------------------------------------------- |
| `npm run hash-password "x"`                 | Define a senha `"x"` para todos os usuários (já com hash) |
| `npm run hash-password -- "x" --user email` | Define a senha `"x"` só para um e-mail específico         |
| `npm run hash-password` (só)                | Pergunta a senha no terminal (modo interativo)            |
| `npm run hash-password --process`           | Varre o JSON, converte senhas em texto puro para hash     |

---

## API

### Login

```
POST /api/login
Body: { "email": "admin@gmail.com", "password": "admin123" }
Resposta: { "token": "...", "user": { ... } }
```

### CRUD (requer Header: `Authorization: Bearer <token>`)

| Método | Rota                        | Ação         |
| ------ | --------------------------- | ------------ |
| GET    | `/api/items`                | Listar todos |
| POST   | `/api/items`                | Criar        |
| PUT    | `/api/items/:id`            | Atualizar    |
| DELETE | `/api/items/:id`            | Deletar      |
| GET    | `/api/items/search?q=termo` | Buscar       |

---

## Frontend

| Rota         | Tela                                           |
| ------------ | ---------------------------------------------- |
| `/`          | Login                                          |
| `/dashboard` | CRUD (protegida — precisa de token + contexto) |

Login padrão: `admin@gmail.com` / `admin123`

---

## Dados

Resetar: delete `server/data/*.json` e reinicie o servidor — ele recria com dados iniciais.

Variáveis de ambiente:

| Variável     | Padrão                        | Descrição         |
| ------------ | ----------------------------- | ----------------- |
| `PORT`       | `3001`                        | Porta do servidor |
| `JWT_SECRET` | `somente-um-crud-secret-2026` | Chave do JWT      |
