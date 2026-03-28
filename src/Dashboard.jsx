import React, { useEffect, useState } from "react";
import { api } from "./api";

function Dashboard() {
  const [ordini, setOrdini] = useState([]);
  const [statistiche, setStatistiche] = useState([]);

  useEffect(() => {
    caricaDati();
  }, []);

  const caricaDati = async () => {
    try {
      const [ordiniRes, statisticheRes] = await Promise.all([
        api.get("/ordini"),
        api.get("/statistiche/materiali"),
      ]);

      setOrdini(ordiniRes.data);
      setStatistiche(statisticheRes.data);
    } catch (err) {
      console.error("Errore caricamento dashboard:", err);
    }
  };

  const formattaData = (data) => {
    if (!data) return "-";
    const d = new Date(data);
    return d.toLocaleDateString("it-IT");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>📊 Dashboard Amministratore</h1>

      <section style={{ marginTop: "2rem" }}>
        <h2>Ordini Recenti</h2>
        {ordini.length === 0 ? (
          <p>Nessun ordine presente.</p>
        ) : (
          <table
            border="1"
            cellPadding="6"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead style={{ backgroundColor: "#f5f5f5" }}>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Materiali</th>
                <th>Quantità</th>
                <th>Data Consegna</th>
                <th>Data Ritiro</th>
                <th>Totale (€)</th>
              </tr>
            </thead>
            <tbody>
              {ordini.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.cliente}</td>

                  <td>
                    {(o.materiali || []).length === 0
                      ? "-"
                      : o.materiali.map((m, idx) => (
                          <div key={idx}>{m.materiale}</div>
                        ))}
                  </td>

                  <td>
                    {(o.materiali || []).length === 0
                      ? "-"
                      : o.materiali.map((m, idx) => (
                          <div key={idx}>{m.quantita}</div>
                        ))}
                  </td>

                  <td>{formattaData(o.data_consegna)}</td>
                  <td>{formattaData(o.data_ritiro)}</td>
                  <td>
                    {o.totale !== null && o.totale !== undefined
                      ? Number(o.totale).toFixed(2)
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2>Statistiche Materiali</h2>
        {statistiche.length === 0 ? (
          <p>Nessun dato disponibile.</p>
        ) : (
          <ul>
            {statistiche.map((s, i) => (
              <li key={i}>
                {s.nome}: {s.numero_ordini} ordini
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
