import React, { useState, useEffect } from "react";
import { api } from "./api";

function App({ role = "admin" }) {
  const [clienti, setClienti] = useState([]);
  const [materiali, setMateriali] = useState([]);
  const [ordini, setOrdini] = useState([]);
  const [dataConsegna, setDataConsegna] = useState("");
  const [dataRitiro, setDataRitiro] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [km, setKm] = useState("");
  const [righeMateriali, setRigheMateriali] = useState([
    { materiale_id: "", quantita: "" },
  ]);
  const [errore, setErrore] = useState("");
  const [modificaOrdine, setModificaOrdine] = useState(null);

  const isOperatore = role === "operatore";

  useEffect(() => {
    aggiornaDati();
  }, []);

  const aggiornaDati = async () => {
    try {
      const [clientiRes, materialiRes, ordiniRes] = await Promise.all([
        api.get("/clienti"),
        api.get("/materiali"),
        api.get("/ordini"),
      ]);

      setClienti(clientiRes.data);
      setMateriali(materialiRes.data);
      setOrdini(ordiniRes.data);
    } catch (err) {
      console.error("Errore nel caricamento dati:", err);
    }
  };

  const aggiungiRiga = () => {
    setRigheMateriali((prev) => [
      ...prev,
      { materiale_id: "", quantita: "" },
    ]);
  };

  const aggiornaRiga = (index, campo, valore) => {
    const nuove = [...righeMateriali];
    nuove[index][campo] = valore;
    setRigheMateriali(nuove);
  };

  const rimuoviRiga = (index) => {
    if (righeMateriali.length === 1) return;
    setRigheMateriali((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setClienteId("");
    setDataConsegna("");
    setDataRitiro("");
    setKm("");
    setRigheMateriali([{ materiale_id: "", quantita: "" }]);
    setModificaOrdine(null);
    setErrore("");
  };

  const creaOrdine = async () => {
    if (isOperatore) return;

    try {
      if (!clienteId || !dataConsegna || !dataRitiro || km === "") {
        setErrore("Tutti i campi sono obbligatori.");
        return;
      }

      const materialiValidi = righeMateriali.filter(
        (r) => r.materiale_id && Number(r.quantita) > 0
      );

      if (materialiValidi.length === 0) {
        setErrore("Aggiungi almeno un materiale con quantità valida.");
        return;
      }

      const ordine = {
        cliente_id: parseInt(clienteId),
        materiali: materialiValidi.map((m) => ({
          materiale_id: parseInt(m.materiale_id),
          quantita: parseInt(m.quantita),
        })),
        data_consegna: dataConsegna,
        data_ritiro: dataRitiro,
        km: parseInt(km),
      };

      if (modificaOrdine) {
        await api.put(`/ordini/${modificaOrdine.id}`, ordine);
        alert("✏️ Ordine modificato con successo!");
      } else {
        await api.post("/ordini", ordine);
        alert("✅ Ordine creato con successo!");
      }

      resetForm();
      aggiornaDati();
    } catch (err) {
      console.error("Errore:", err);
      setErrore("Errore durante la creazione o modifica dell'ordine.");
    }
  };

  const eliminaOrdine = async (id) => {
    if (isOperatore) return;
    if (!window.confirm("Sei sicuro di voler eliminare questo ordine?")) return;

    try {
      await api.delete(`/ordini/${id}`);
      alert("🗑️ Ordine eliminato con successo!");
      aggiornaDati();
    } catch (err) {
      console.error("Errore eliminazione ordine:", err);
      alert("Errore durante l'eliminazione dell'ordine.");
    }
  };

  const modificaOrdineEsistente = (ordine) => {
    if (isOperatore) return;

    setModificaOrdine(ordine);
    setClienteId(String(ordine.cliente_id));
    setDataConsegna(ordine.data_consegna?.slice(0, 10) || "");
    setDataRitiro(ordine.data_ritiro?.slice(0, 10) || "");
    setKm(String(ordine.km ?? ""));

    setRigheMateriali(
      (ordine.materiali || []).length > 0
        ? ordine.materiali.map((x) => ({
            materiale_id: String(x.materiale_id),
            quantita: String(x.quantita),
          }))
        : [{ materiale_id: "", quantita: "" }]
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formattaData = (data) => {
    if (!data) return "";
    const d = new Date(data);
    return d.toLocaleDateString("it-IT");
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>🏗️ Gestione Noleggio</h1>

      {!isOperatore && (
        <div
          style={{
            marginTop: "1rem",
            background: "#f8f8f8",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <h2>{modificaOrdine ? "✏️ Modifica ordine" : "➕ Crea nuovo ordine"}</h2>

          <label>Cliente:</label>
          <br />
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">-- Seleziona cliente --</option>
            {clienti.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <br />
          <br />

          <label>Data consegna:</label>
          <br />
          <input
            type="date"
            value={dataConsegna}
            onChange={(e) => setDataConsegna(e.target.value)}
          />
          <br />
          <br />

          <label>Data ritiro:</label>
          <br />
          <input
            type="date"
            value={dataRitiro}
            onChange={(e) => setDataRitiro(e.target.value)}
          />
          <br />
          <br />

          <label>Km totali:</label>
          <br />
          <input
            type="number"
            value={km}
            onChange={(e) => setKm(e.target.value)}
          />
          <br />
          <br />

          <h3>🧱 Materiali</h3>
          {righeMateriali.map((r, index) => (
            <div
              key={index}
              style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
            >
              <select
                value={r.materiale_id}
                onChange={(e) =>
                  aggiornaRiga(index, "materiale_id", e.target.value)
                }
              >
                <option value="">-- Seleziona materiale --</option>
                {materiali.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Quantità"
                value={r.quantita}
                onChange={(e) => aggiornaRiga(index, "quantita", e.target.value)}
              />

              {righeMateriali.length > 1 && (
                <button
                  onClick={() => rimuoviRiga(index)}
                  style={{
                    background: "#e63946",
                    color: "white",
                    border: "none",
                    padding: "4px 10px",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  ✖
                </button>
              )}
            </div>
          ))}

          <button onClick={aggiungiRiga}>➕ Aggiungi materiale</button>

          <br />
          <br />
          <button
            onClick={creaOrdine}
            style={{
              background: modificaOrdine ? "#ffb703" : "green",
              color: "white",
              padding: "0.6rem 1.2rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {modificaOrdine ? "💾 Salva modifiche" : "📦 Salva ordine"}
          </button>

          {modificaOrdine && (
            <button
              onClick={resetForm}
              style={{
                marginLeft: "10px",
                background: "#999",
                color: "white",
                padding: "0.6rem 1.2rem",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Annulla
            </button>
          )}

          {errore && <p style={{ color: "red" }}>{errore}</p>}
        </div>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <h2>📋 Ordini recenti</h2>
      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          width: "100%",
          textAlign: "center",
        }}
      >
        <thead style={{ background: "#ddd" }}>
          <tr>
            <th>Cliente</th>
            <th>Materiale</th>
            <th>Quantità</th>
            <th>Data consegna</th>
            <th>Data ritiro</th>
            <th>Km</th>
            <th>Totale (€)</th>
            <th>Indirizzo</th>
            <th>Stato</th>
            {!isOperatore && <th>Azioni</th>}
          </tr>
        </thead>
        <tbody>
          {ordini.length === 0 ? (
            <tr>
              <td colSpan={isOperatore ? "9" : "10"}>Nessun ordine presente</td>
            </tr>
          ) : (
            ordini.map((o, i) => (
              <tr key={o.id ?? i}>
                <td>{o.cliente}</td>

                <td>
                  {(o.materiali || []).length === 0
                    ? "-"
                    : o.materiali.map((x, idx) => (
                        <div key={idx}>{x.materiale}</div>
                      ))}
                </td>

                <td>
                  {(o.materiali || []).length === 0
                    ? "-"
                    : o.materiali.map((x, idx) => (
                        <div key={idx}>{x.quantita}</div>
                      ))}
                </td>

                <td>{formattaData(o.data_consegna)}</td>
                <td>{formattaData(o.data_ritiro)}</td>
                <td>{o.km}</td>
                <td>
                  {o.totale !== null && o.totale !== undefined
                    ? Number(o.totale).toFixed(2)
                    : "-"}
                </td>
                <td>{o.indirizzo_spedizione || "-"}</td>

                <td>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      display: "inline-block",
                      backgroundColor:
                        o.stato === "PAGATO"
                          ? "#d4edda"
                          : o.stato === "RITIRATO"
                          ? "#cce5ff"
                          : o.stato === "CONSEGNATO"
                          ? "#fff3cd"
                          : "#f8d7da",
                      color: "#000",
                    }}
                  >
                    {o.stato || "DA CONSEGNARE"}
                  </span>
                </td>

                {!isOperatore && (
                  <td>
                    <button
                      onClick={() => modificaOrdineEsistente(o)}
                      style={{
                        background: "#ffb703",
                        border: "none",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                      title="Modifica"
                    >
                      ✏️
                    </button>{" "}
                    <button
                      onClick={() => eliminaOrdine(o.id)}
                      style={{
                        background: "#e63946",
                        color: "white",
                        border: "none",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                      title="Elimina"
                    >
                      🗑️
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
