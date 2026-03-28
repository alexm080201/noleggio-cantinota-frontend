import React, { useState, useEffect } from "react";
import { api } from "./api";

export default function Materiali({ role = "admin" }) {
  const isOperatore = role === "operatore";

  const [materiali, setMateriali] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    quantita_disponibile: "",
    prezzo_weekend: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [errore, setErrore] = useState("");

  useEffect(() => {
    caricaMateriali();
  }, []);

  const unisciDisponibilita = (listaMateriali, listaDisp) => {
    const mappa = new Map((listaDisp || []).map((d) => [Number(d.id), d]));

    return (listaMateriali || []).map((m) => {
      const d = mappa.get(Number(m.id));

      const stockTotale = Number(d?.stock_totale ?? m.quantita_disponibile ?? 0);
      const occupati = Number(d?.occupati ?? 0);
      const disponibili = Number(d?.disponibili ?? m.quantita_disponibile ?? 0);

      return {
        ...m,
        stock_totale: stockTotale,
        occupati,
        disponibili,
        low_stock: d?.low_stock ?? false,
      };
    });
  };

  const caricaMateriali = async () => {
    try {
      const [resMateriali, resDisp] = await Promise.all([
        api.get("/materiali"),
        api.get("/materiali/disponibilita"),
      ]);

      const materialiConDisp = unisciDisponibilita(
        resMateriali.data,
        resDisp.data
      );

      setMateriali(materialiConDisp);
    } catch (err) {
      console.error("Errore caricamento materiali:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvaMateriale = async () => {
    if (isOperatore) return;

    try {
      if (!form.nome.trim()) {
        setErrore("Il nome è obbligatorio");
        return;
      }

      if (!form.quantita_disponibile || Number(form.quantita_disponibile) <= 0) {
        setErrore("Inserisci una quantità valida");
        return;
      }

      if (editingId) {
        await api.put(`/materiali/${editingId}`, form);
      } else {
        await api.post("/materiali", form);
      }

      setForm({ nome: "", quantita_disponibile: "", prezzo_weekend: "" });
      setEditingId(null);
      setErrore("");
      await caricaMateriali();
    } catch (err) {
      console.error("Errore salvataggio materiale:", err);
      setErrore("Errore durante il salvataggio del materiale.");
    }
  };

  const modificaMateriale = (m) => {
    if (isOperatore) return;

    setForm({
      nome: m.nome ?? "",
      quantita_disponibile: m.quantita_disponibile ?? "",
      prezzo_weekend: m.prezzo_weekend ?? "",
    });
    setEditingId(m.id);
  };

  const eliminaMateriale = async (id) => {
    if (isOperatore) return;
    if (!window.confirm("Sei sicuro di voler eliminare questo materiale?")) return;

    try {
      await api.delete(`/materiali/${id}`);
      await caricaMateriali();
    } catch (err) {
      console.error("Errore eliminazione materiale:", err);
      alert("❌ Impossibile eliminare il materiale. Potrebbe essere usato in ordini attivi.");
    }
  };

  const getColor = (percent) => {
    if (percent <= 10) return "#e74c3c";
    if (percent <= 30) return "#f39c12";
    return "#2ecc71";
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        📦 Gestione Materiali
      </h1>

      {!isOperatore && (
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
                setForm({
                  nome: "",
                  quantita_disponibile: "",
                  prezzo_weekend: "",
                });
                setErrore("");
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
      )}

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
            {!isOperatore && <th style={thStyle}>Azioni</th>}
          </tr>
        </thead>
        <tbody>
          {materiali.length === 0 ? (
            <tr>
              <td
                colSpan={isOperatore ? "3" : "4"}
                style={{ textAlign: "center", padding: "1rem" }}
              >
                Nessun materiale presente
              </td>
            </tr>
          ) : (
            materiali.map((m) => {
              const stock = Number(m.stock_totale ?? m.quantita_disponibile ?? 0);
              const disponibili = Number(m.disponibili ?? m.quantita_disponibile ?? 0);
              const occupati = Number(m.occupati ?? 0);
              const percentuale = stock > 0 ? (disponibili / stock) * 100 : 0;

              return (
                <tr key={m.id}>
                  <td style={tdStyle}>{m.nome}</td>

                  <td style={tdStyle}>
                    {isOperatore
                      ? "—"
                      : m.prezzo_weekend !== null &&
                        m.prezzo_weekend !== undefined &&
                        m.prezzo_weekend !== ""
                      ? `${Number(m.prezzo_weekend).toFixed(2)} €`
                      : "-"}
                  </td>

                  <td style={{ ...tdStyle, width: "40%" }}>
                    <div
                      style={{
                        background: "#eee",
                        borderRadius: "5px",
                        height: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(Math.max(percentuale, 0), 100)}%`,
                          background: getColor(percentuale),
                          height: "100%",
                          borderRadius: "5px",
                          transition: "width 0.3s",
                        }}
                      ></div>
                    </div>

                    <small style={{ marginLeft: "5px" }}>
                      {disponibili} disponibili
                      {occupati > 0 ? ` (in uso: ${occupati})` : ""}
                      {stock > 0 ? ` su ${stock}` : ""}
                    </small>
                  </td>

                  {!isOperatore && (
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <button onClick={() => modificaMateriale(m)} style={btnEdit}>
                        ✏️
                      </button>
                      <button onClick={() => eliminaMateriale(m.id)} style={btnDelete}>
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

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
