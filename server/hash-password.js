import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, "data", "users.json");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

function isHashed(pw) {
  return pw.startsWith("$2b$") || pw.startsWith("$2a$") || pw.startsWith("$2y$");
}

async function main() {
  const args = process.argv.slice(2);
  const hasProcessFlag = args.includes("--process");

  if (hasProcessFlag) {
    if (!fs.existsSync(USERS_FILE)) {
      console.log("Arquivo users.json não encontrado.");
      rl.close();
      return;
    }

    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    if (users.length === 0) {
      console.log("Nenhum usuário cadastrado.");
      rl.close();
      return;
    }

    let modified = 0;
    for (const user of users) {
      if (!isHashed(user.password)) {
        user.password = bcrypt.hashSync(user.password, 10);
        modified++;
      }
    }

    if (modified === 0) {
      console.log("Nenhuma senha em texto puro encontrada. Todas já estão com hash.");
    } else {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
      console.log(`${modified} senha(s) em texto puro convertida(s) para hash.`);
    }

    rl.close();
    return;
  }

  let newPassword = args.find((a) => !a.startsWith("--"));
  let targetEmail = null;

  const emailIdx = args.indexOf("--user");
  if (emailIdx !== -1 && args[emailIdx + 1]) {
    targetEmail = args[emailIdx + 1];
  }

  if (!newPassword) {
    newPassword = await ask("Nova senha: ");
    if (!newPassword) {
      console.log("Senha não pode ser vazia.");
      rl.close();
      return;
    }
  }

  if (!fs.existsSync(USERS_FILE)) {
    console.log("Arquivo users.json não encontrado. Execute o servidor primeiro para gerá-lo.");
    rl.close();
    return;
  }

  const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));

  if (users.length === 0) {
    console.log("Nenhum usuário cadastrado.");
    rl.close();
    return;
  }

  const hash = bcrypt.hashSync(newPassword, 10);

  if (targetEmail) {
    const user = users.find((u) => u.email === targetEmail);
    if (!user) {
      console.log(`Usuário "${targetEmail}" não encontrado.`);
      rl.close();
      return;
    }
    user.password = hash;
    console.log(`Senha alterada para: ${user.email} (${user.name})`);
  } else {
    for (const user of users) {
      user.password = hash;
    }
    console.log(`Senha alterada para ${users.length} usuário(s).`);
  }

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  console.log("Arquivo users.json atualizado com sucesso.");
  rl.close();
}

main();
