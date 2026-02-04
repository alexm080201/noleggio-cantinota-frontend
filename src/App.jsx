import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [clienti, setClienti] = useState([]);
  const [materiali, setMateriali] = useState([]);
  const [ordini, setOrdini] = useState([]);
  const [dataConsegna, setDataConsegna] = useState("");
  const [dataRitiro, setDataRitiro] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [km, setKm] = useState("");
  const [righeMateriali, setRigheMateriali] = useState([{ materiale_id: "", quantita: "" }]);
  const [errore, setErrore] = useState("");
  const [modificaOrdine, setModificaOrdine] = useState(null);

  const API = https://noleggio-cantinota-backend.onrender.com

  // Carica dati iniziali
  useEffect(() => {
    aggiornaDati();
  }, []);

  const aggiornaDati = async () => {
    try {
      const [clientiRes, materialiRes, ordiniRes] = await Promise.all([
        axios.get(`${API}/clienti`),
        axios.get(`${API}/materiali`),
        axios.get(`${API}/ordini`)
      ]);

      setClienti(clientiRes.data);
      setMateriali(materialiRes.data);
      setOrdini(ordiniRes.data);
    } catch (err) {
      console.error("Errore nel caricamento dati:", err);
    }
  };

  // Aggiungi nuova riga materiale
  const aggiungiRiga = () => {
    setRigheMateriali([...righeMateriali, { materiale_id: "", quantita: "" }]);
  };

  const aggiornaRiga = (index, campo, valore) => {
    const nuove = [...righeMateriali];
    nuove[index][campo] = valore;
    setRigheMateriali(nuove);
  };

  // Crea o modifica ordine
  const creaOrdine = async () => {
    try {
      if (!clienteId || !dataConsegna || !dataRitiro || !km) {
        setErrore("Tutti i campi sono obbligatori.");
        return;
      }

      const materialiValidi = righeMateriali.filter(r => r.materiale_id && r.quantita > 0);
      if (materialiValidi.length === 0) {
        setErrore("Aggiungi almeno un materiale con quantità valida.");
        return;
      }

      const ordine = {
        cliente_id: parseInt(clienteId),
        materiali: materialiValidi.map(m => ({
          materiale_id: parseInt(m.materiale_id),
          quantita: parseInt(m.quantita)
        })),
        data_consegna: dataConsegna,
        data_ritiro: dataRitiro,
        km: parseInt(km)
      };

      if (modificaOrdine) {
        await axios.put(`${API}/ordini/${modificaOrdine.id}`, ordine);
        alert("✏️ Ordine modificato con successo!");
        setModificaOrdine(null);
      } else {
        await axios.post(`${API}/ordini`, ordine);
        alert("✅ Ordine creato con successo!");
      }

      setErrore("");
      aggiornaDati();
    } catch (err) {
      console.error("Errore:", err);
      setErrore("Errore durante la creazione o modifica dell'ordine.");
    }
  };

  // Elimina ordine
  const eliminaOrdine = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo ordine?")) return;
    try {
      await axios.delete(`${API}/ordini/${id}`);
      alert("🗑️ Ordine eliminato con successo!");
      aggiornaDati();
    } catch (err) {
      console.error("Errore eliminazione ordine:", err);
      alert("Errore durante l'eliminazione dell'ordine.");
    }
  };

  // Prepara per modifica
  const modificaOrdineEsistente = (ordine) => {
    setModificaOrdine(ordine);
    setClienteId(ordine.cliente_id);
    setDataConsegna(ordine.data_consegna);
    setDataRitiro(ordine.data_ritiro);
    setKm(ordine.km);
    setRigheMateriali([{ materiale_id: ordine.materiale_id, quantita: ordine.quantita }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Formatta data leggibile
  const formattaData = (data) => {
    if (!data) return "";
    const d = new Date(data);
    return d.toLocaleDateString("it-IT");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🏗️ Gestione Noleggio</h1>

      {/* Form Ordine */}
      <div style={{ marginTop: "1rem", background: "#f8f8f8", padding: "1rem", borderRadius: "8px" }}>
        <h2>{modificaOrdine ? "✏️ Modifica ordine" : "➕ Crea nuovo ordine"}</h2>

        <label>Cliente:</label><br />
        <select value={clienteId} onChange={e => setClienteId(e.target.value)}>
          <option value="">-- Seleziona cliente --</option>
          {clienti.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <br /><br />

        <label>Data consegna:</label><br />
        <input type="date" value={dataConsegna} onChange={e => setDataConsegna(e.target.value)} /><br /><br />

        <label>Data ritiro:</label><br />
        <input type="date" value={dataRitiro} onChange={e => setDataRitiro(e.target.value)} /><br /><br />

        <label>Km totali:</label><br />
        <input type="number" value={km} onChange={e => setKm(e.target.value)} /><br /><br />

        <h3>🧱 Materiali</h3>
        {righeMateriali.map((r, index) => (
          <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <select
              value={r.materiale_id}
              onChange={e => aggiornaRiga(index, "materiale_id", e.target.value)}
            >
              <option value="">-- Seleziona materiale --</option>
              {materiali.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantità"
              value={r.quantita}
              onChange={e => aggiornaRiga(index, "quantita", e.target.value)}
            />
          </div>
        ))}
        <button onClick={aggiungiRiga}>➕ Aggiungi materiale</button>

        <br /><br />
        <button
          onClick={creaOrdine}
          style={{
            background: modificaOrdine ? "#ffb703" : "green",
            color: "white",
            padding: "0.6rem 1.2rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          {modificaOrdine ? "💾 Salva modifiche" : "📦 Salva ordine"}
        </button>

        {errore && <p style={{ color: "red" }}>{errore}</p>}
      </div>

      <hr style={{ margin: "2rem 0" }} />

      {/* Tabella Ordini */}
      <h2>📋 Ordini recenti</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
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
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {ordini.length === 0 ? (
            <tr><td colSpan="9">Nessun ordine presente</td></tr>
          ) : (
            ordini.map((o, i) => (
              <tr key={i}>
                <td>{o.cliente}</td>
                <td>{o.materiale}</td>
                <td>{o.quantita}</td>
                <td>{formattaData(o.data_consegna)}</td>
                <td>{formattaData(o.data_ritiro)}</td>
                <td>{o.km}</td>
                <td>{o.totale ? Number(o.totale).toFixed(2) : "-"}</td>
                <td>{o.indirizzo_spedizione || "-"}</td>
                <td>
                  <button
                    onClick={() => modificaOrdineEsistente(o)}
                    style={{ background: "#ffb703", border: "none", padding: "4px 8px", cursor: "pointer" }}
                  >
                    ✏️
                  </button>{" "}
                  <button
                    onClick={() => eliminaOrdine(o.id)}
                    style={{ background: "#e63946", color: "white", border: "none", padding: "4px 8px", cursor: "pointer" }}
                  >
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

export default App;

