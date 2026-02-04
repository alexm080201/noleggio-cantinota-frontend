import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://noleggio-cantinota-backend.onrender.com";

export default function Clienti() {
  const [clienti, setClienti] = useState([]);
  const [form, setForm] = useState({ nome: "", telefono: "", indirizzo_spedizione: "" });
  const [editingId, setEditingId] = useState(null);
  const [errore, setErrore] = useState("");

  // 🔹 Carica tutti i clienti
  useEffect(() => {
    caricaClienti();
  }, []);

  const caricaClienti = async () => {
    try {
      const res = await axios.get(`${API}/clienti`);
      setClienti(res.data);
    } catch (err) {
      console.error("Errore caricamento clienti:", err);
    }
  };

  // 🔹 Gestione input form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Aggiungi o modifica cliente
  const salvaCliente = async () => {
    try {
      if (!form.nome.trim()) {
        setErrore("Il nome è obbligatorio");
        return;
      }

      if (editingId) {
        // ✏️ Modifica
        await axios.put(`${API}/clienti/${editingId}`, form);
      } else {
        // ➕ Aggiungi
        await axios.post(`${API}/clienti/add`, form);
      }

      setForm({ nome: "", telefono: "", indirizzo_spedizione: "" });
      setEditingId(null);
      setErrore("");
      caricaClienti();
    } catch (err) {
      console.error("Errore salvataggio cliente:", err);
      setErrore("Errore durante il salvataggio del cliente.");
    }
  };

  // ✏️ Carica i dati di un cliente nel form per modificarlo
  const modificaCliente = (c) => {
    setForm({ nome: c.nome, telefono: c.telefono, indirizzo_spedizione: c.indirizzo_spedizione });
    setEditingId(c.id);
  };

  // ❌ Elimina cliente
  const eliminaCliente = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo cliente?")) return;
    try {
      await axios.delete(`${API}/clienti/${id}`);
      caricaClienti();
    } catch (err) {
      console.error("Errore eliminazione cliente:", err);
      alert("❌ Impossibile eliminare il cliente. Potrebbe avere ordini associati.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>👥 Gestione Clienti</h1>

      {/* 🔹 Form aggiunta/modifica cliente */}
      <div
        style={{
          background: "#f9f9f9",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>{editingId ? "✏️ Modifica Cliente" : "➕ Aggiungi Cliente"}</h2>

        <div style={{ display: "grid", gap: "10px" }}>
          <input
            type="text"
            name="nome"
            placeholder="Nome Cliente"
            value={form.nome}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="text"
            name="telefono"
            placeholder="Telefono"
            value={form.telefono}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="text"
            name="indirizzo_spedizione"
            placeholder="Indirizzo di Spedizione"
            value={form.indirizzo_spedizione}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {errore && <p style={{ color: "red", marginTop: "10px" }}>{errore}</p>}

        <button
          onClick={salvaCliente}
          style={{
            marginTop: "1rem",
            background: "#4caf50",
            color: "white",
            padding: "0.6rem 1rem",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {editingId ? "💾 Salva Modifiche" : "➕ Aggiungi Cliente"}
        </button>

        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ nome: "", telefono: "", indirizzo_spedizione: "" });
            }}
            style={{
              marginLeft: "10px",
              background: "#999",
              color: "white",
              padding: "0.6rem 1rem",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Annulla
          </button>
        )}
      </div>

      {/* 📋 Tabella clienti */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "white",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <thead style={{ background: "#4b9cd3", color: "white" }}>
          <tr>
            <th style={thStyle}>Nome</th>
            <th style={thStyle}>Telefono</th>
            <th style={thStyle}>Indirizzo</th>
            <th style={thStyle}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {clienti.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "1rem" }}>
                Nessun cliente presente
              </td>
            </tr>
          ) : (
            clienti.map((c) => (
              <tr key={c.id}>
                <td style={tdStyle}>{c.nome}</td>
                <td style={tdStyle}>{c.telefono}</td>
                <td style={tdStyle}>{c.indirizzo_spedizione}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <button onClick={() => modificaCliente(c)} style={btnEdit}>
                    ✏️
                  </button>
                  <button onClick={() => eliminaCliente(c.id)} style={btnDelete}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// 🎨 Stili riutilizzabili
const inputStyle = {
  padding: "0.6rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "1rem",
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

const btnEdit = {
  background: "#ffb100",
  border: "none",
  color: "white",
  borderRadius: "6px",
  padding: "0.4rem 0.6rem",
  cursor: "pointer",
  marginRight: "5px",
};

const btnDelete = {
  background: "#e74c3c",
  border: "none",
  color: "white",
  borderRadius: "6px",
  padding: "0.4rem 0.6rem",
  cursor: "pointer",
};

