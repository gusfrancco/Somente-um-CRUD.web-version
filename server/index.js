import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ITEMS_FILE = path.join(DATA_DIR, "items.json");
const JWT_SECRET = process.env.JWT_SECRET || "somente-um-crud-secret-2026";

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function seed() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(USERS_FILE)) {
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    writeJSON(USERS_FILE, [
      {
        id: 1,
        name: "Administrador",
        email: "admin@gmail.com",
        password: hashedPassword,
      },
    ]);
    console.log("Seed: users.json criado com usuário admin.");
  }

  if (!fs.existsSync(ITEMS_FILE)) {
    writeJSON(ITEMS_FILE, [
      { id: 1, titulo: "Projeto A", descricao: "Descrição do projeto A", status: "Em Progresso", data: "2026-04-14" },
      { id: 2, titulo: "Projeto B", descricao: "Descrição do projeto B", status: "Concluído", data: "2026-04-10" },
      { id: 3, titulo: "Projeto C", descricao: "Descrição do projeto C", status: "Pendente", data: "2026-04-20" },
    ]);
    console.log("Seed: items.json criado com dados iniciais.");
  }
}

seed();

const app = express();
app.use(cors());
app.use(express.json());

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  try {
    const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  const users = readJSON(USERS_FILE);
  const user = users.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "E-mail ou senha incorretos" });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.get("/api/items", authMiddleware, (req, res) => {
  const items = readJSON(ITEMS_FILE);
  res.json(items);
});

app.post("/api/items", authMiddleware, (req, res) => {
  const items = readJSON(ITEMS_FILE);
  const { titulo, descricao, status, data } = req.body;
  if (!titulo || !descricao || !status || !data) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }
  const maxId = items.length > 0 ? Math.max(...items.map((i) => i.id)) : 0;
  const newItem = { id: maxId + 1, titulo, descricao, status, data };
  items.push(newItem);
  writeJSON(ITEMS_FILE, items);
  res.status(201).json(newItem);
});

app.put("/api/items/:id", authMiddleware, (req, res) => {
  const items = readJSON(ITEMS_FILE);
  const id = Number(req.params.id);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return res.status(404).json({ error: "Item não encontrado" });

  const { titulo, descricao, status, data } = req.body;
  items[index] = { ...items[index], titulo, descricao, status, data };
  writeJSON(ITEMS_FILE, items);
  res.json(items[index]);
});

app.delete("/api/items/:id", authMiddleware, (req, res) => {
  let items = readJSON(ITEMS_FILE);
  const id = Number(req.params.id);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return res.status(404).json({ error: "Item não encontrado" });

  items = items.filter((i) => i.id !== id);
  writeJSON(ITEMS_FILE, items);
  res.json({ success: true });
});

app.get("/api/items/search", authMiddleware, (req, res) => {
  const items = readJSON(ITEMS_FILE);
  const term = (req.query.q || "").toLowerCase();
  if (!term) return res.json(items);
  const results = items.filter(
    (i) =>
      i.titulo.toLowerCase().includes(term) ||
      i.descricao.toLowerCase().includes(term)
  );
  res.json(results);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
