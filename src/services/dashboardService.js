const API = "/api";

function authHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/";
      throw new Error("Sessão expirada");
    }
    const err = await res.json();
    throw new Error(err.error || "Erro na requisição");
  }
  return res.json();
}

export async function getItems() {
  const res = await fetch(`${API}/items`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createItem(item) {
  const res = await fetch(`${API}/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(item),
  });
  return handleResponse(res);
}

export async function updateItem(id, item) {
  const res = await fetch(`${API}/items/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(item),
  });
  return handleResponse(res);
}

export async function deleteItem(id) {
  const res = await fetch(`${API}/items/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function searchItems(term) {
  const res = await fetch(`${API}/items/search?q=${encodeURIComponent(term)}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}
