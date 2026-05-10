import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  getItems,
  deleteItem,
  createItem,
  updateItem,
  searchItems,
} from "../services/dashboardService";
import Modal from "./Modal";
import styles from "./Dashboard.module.css";

const STATUS = ["Pendente", "Em Progresso", "Concluído"];

const emptyForm = { titulo: "", descricao: "", status: "Pendente", data: "" };

export default function Dashboard() {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit'|'info', item? }
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      loadItems();
      return;
    }
    try {
      const results = await searchItems(searchTerm);
      setItems(results);
    } catch (err) {
      setError(err.message);
    }
  }, [searchTerm, loadItems]);

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja deletar este item?")) return;
    try {
      await deleteItem(id);
      loadItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ mode: "create" });
  };

  const openEdit = (item) => {
    setForm({ titulo: item.titulo, descricao: item.descricao, status: item.status, data: item.data });
    setModal({ mode: "edit", item });
  };

  const openInfo = (item) => {
    setModal({ mode: "info", item });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.mode === "create") {
        await createItem(form);
      } else {
        await updateItem(modal.item.id, form);
      }
      setModal(null);
      loadItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const counts = {
    total: items.length,
    pendente: items.filter((i) => i.status === "Pendente").length,
    emProgresso: items.filter((i) => i.status === "Em Progresso").length,
    concluido: items.filter((i) => i.status === "Concluído").length,
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>CRUD - {userName}</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Sair
        </button>
      </header>

      <div className={styles.main}>
        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError("")} className={styles.closeError}>
              &times;
            </button>
          </div>
        )}

        <div className={styles.cards}>
          <div className={`${styles.card} ${styles.cardTotal}`}>
            <span className={styles.cardNumber}>{counts.total}</span>
            <span className={styles.cardLabel}>Total</span>
          </div>
          <div className={`${styles.card} ${styles.cardProgress}`}>
            <span className={styles.cardNumber}>{counts.emProgresso}</span>
            <span className={styles.cardLabel}>Em Progresso</span>
          </div>
          <div className={`${styles.card} ${styles.cardDone}`}>
            <span className={styles.cardNumber}>{counts.concluido}</span>
            <span className={styles.cardLabel}>Concluído</span>
          </div>
          <div className={`${styles.card} ${styles.cardPending}`}>
            <span className={styles.cardNumber}>{counts.pendente}</span>
            <span className={styles.cardLabel}>Pendente</span>
          </div>
        </div>

        <div className={styles.controls}>
          <button onClick={openCreate} className={styles.btnAdd}>
            + Adicionar
          </button>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Pesquisar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className={styles.input}
            />
            <button onClick={handleSearch} className={styles.btnFilter}>
              Filtrar
            </button>
          </div>
        </div>

        {loading ? (
          <p className={styles.loading}>Carregando...</p>
        ) : items.length === 0 ? (
          <p className={styles.empty}>Nenhum item encontrado</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Título</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.titulo}</td>
                    <td className={styles.descCell}>{item.descricao}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          item.status === "Concluído"
                            ? styles.badgeDone
                            : item.status === "Em Progresso"
                              ? styles.badgeProgress
                              : styles.badgePending
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{item.data}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => openInfo(item)}
                          className={styles.btnInfo}
                        >
                          Info
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className={styles.btnEdit}
                        >
                          Atualizar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className={styles.btnDelete}
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && modal.mode === "info" && (
        <Modal onClose={() => setModal(null)}>
          <h2>Detalhes do Item</h2>
          <div className={styles.infoGrid}>
            <div>
              <strong>ID:</strong> {modal.item.id}
            </div>
            <div>
              <strong>Título:</strong> {modal.item.titulo}
            </div>
            <div>
              <strong>Descrição:</strong> {modal.item.descricao}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <span
                className={`${styles.badge} ${
                  modal.item.status === "Concluído"
                    ? styles.badgeDone
                    : modal.item.status === "Em Progresso"
                      ? styles.badgeProgress
                      : styles.badgePending
                }`}
              >
                {modal.item.status}
              </span>
            </div>
            <div>
              <strong>Data:</strong> {modal.item.data}
            </div>
          </div>
          <div className={styles.modalActions}>
            <button
              onClick={() => setModal(null)}
              className={styles.btnFilter}
            >
              Fechar
            </button>
          </div>
        </Modal>
      )}

      {(modal?.mode === "create" || modal?.mode === "edit") && (
        <Modal onClose={() => setModal(null)}>
          <h2>{modal.mode === "create" ? "Adicionar Item" : "Atualizar Item"}</h2>
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="titulo">Título</label>
              <input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                className={styles.textarea}
                rows={3}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={styles.input}
              >
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="data">Data</label>
              <input
                id="data"
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setModal(null)}
                className={styles.btnCancel}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={styles.btnAdd}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
