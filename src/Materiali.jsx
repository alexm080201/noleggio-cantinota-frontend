import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3000";

export default function Materiali() {
  const [materiali, setMateriali] = useState([]);
  const [form, setForm] = useState({ nome: "", quantita_disponibile: "", prezzo_weekend: "" });
  const [editingId, setEditingId] = useState(null);
  const [errore, setErrore] = useState("");

  // 🔹 Carica materiali all’avvio
  useEffect(() => {
    caricaMateriali();
  }, []);

  const caricaMateriali = async () => {
    try {
      const res = await axios.get(`${API}/materiali`);
      setMateriali(res.data);
    } catch (err) {
      console.error("Errore caricamento materiali:", err);
    }
  };

  // 🔹 Gestione input form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Aggiungi o modifica materiale
  const salvaMateriale = async () => {
    try {
      if (!form.nome.trim()) {
        setErrore("Il nome è obbligatorio");
        return;
      }
      if (!form.quantita_disponibile || form.quantita_disponibile <= 0) {
        setErrore("Inserisci una quantità valida");
        return;
      }

      if (editingId) {
        // ✏️ Modifica
        await axios.put(`${API}/materiali/${editingId}`, form);
      } else {
        // ➕ Aggiunta
        await axios.post(`${API}/materiali`, form);
      }

      setForm({ nome: "", quantita_disponibile: "", prezzo_weekend: "" });
      setEditingId(null);
      setErrore("");
      caricaMateriali();
    } catch (err) {
      console.error("Errore salvataggio materiale:", err);
      setErrore("Errore durante il salvataggio del materiale.");
    }
  };

  // ✏️ Modifica
  const modificaMateriale = (m) => {
    setForm({
      nome: m.nome,
      quantita_disponibile: m.quantita_disponibile,
      prezzo_weekend: m.prezzo_weekend,
    });
    setEditingId(m.id);
  };

  // ❌ Elimina materiale
  const eliminaMateriale = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo materiale?")) return;
    try {
      await axios.delete(`${API}/materiali/${id}`);
      caricaMateriali();
    } catch (err) {
      console.error("Errore eliminazione materiale:", err);
      alert("❌ Impossibile eliminare il materiale. Potrebbe essere usato in ordini attivi.");
    }
  };

  // 🔸 Determina colore indicatore disponibilità
  const getColor = (percent) => {
    if (percent <= 10) return "#e74c3c"; // rosso
    if (percent <= 30) return "#f39c12"; // arancio
    return "#2ecc71"; // verde
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>📦 Gestione Materiali</h1>

      {/* 🔹 Form */}
      <div
        style={{
          background: "#f9f9f9",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
        }}
      >
        <h2>{editingId ? "✏️ Modifica Materiale" : "➕ Aggiungi Materiale"}</h2>

        <div style={{ display: "grid", gap: "10px" }}>
          <input
            type="text"
            name="nome"
            placeholder="Nome materiale"
            value={form.nome}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="number"
            name="quantita_disponibile"
            placeholder="Quantità disponibile"
            value={form.quantita_disponibile}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="number"
            name="prezzo_weekend"
            placeholder="Prezzo per weekend (€)"
            value={form.prezzo_weekend}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {errore && <p style={{ color: "red", marginTop: "10px" }}>{errore}</p>}

        <button
          onClick={salvaMateriale}
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
          {editingId ? "💾 Salva Modifiche" : "➕ Aggiungi Materiale"}
        </button>

        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ nome: "", quantita_disponibile: "", prezzo_weekend: "" });
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

      {/* 📋 Tabella materiali */}
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
            <th style={thStyle}>Prezzo Weekend (€)</th>
            <th style={thStyle}>Disponibilità</th>
            <th style={thStyle}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {materiali.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "1rem" }}>
                Nessun materiale presente
              </td>
            </tr>
          ) : (
            materiali.map((m) => {
              const percentuale = (m.quantita_disponibile / m.quantita_totale) * 100 || 0;
              return (
                <tr key={m.id}>
                  <td style={tdStyle}>{m.nome}</td>
                  <td style={tdStyle}>{m.prezzo_weekend} €</td>
                  <td style={{ ...tdStyle, width: "40%" }}>
                    <div style={{ background: "#eee", borderRadius: "5px", height: "12px" }}>
                      <div
                        style={{
                          width: `${Math.min(percentuale, 100)}%`,
                          background: getColor(percentuale),
                          height: "100%",
                          borderRadius: "5px",
                          transition: "width 0.3s",
                        }}
                      ></div>
                    </div>
                    <small style={{ marginLeft: "5px" }}>{m.quantita_disponibile} disponibili</small>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button onClick={() => modificaMateriale(m)} style={btnEdit}>
                      ✏️
                    </button>
                    <button onClick={() => eliminaMateriale(m.id)} style={btnDelete}>
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })
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
