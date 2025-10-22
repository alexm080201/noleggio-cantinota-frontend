import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [ordini, setOrdini] = useState([]);
  const [statistiche, setStatistiche] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/ordini')
      .then(res => setOrdini(res.data))
      .catch(err => console.error('Errore ordini:', err));

    axios.get('http://localhost:3000/statistiche/materiali')
      .then(res => setStatistiche(res.data))
      .catch(err => console.error('Errore statistiche:', err));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>📊 Dashboard Amministratore</h1>

      <section style={{ marginTop: '2rem' }}>
        <h2>Ordini Recenti</h2>
        {ordini.length === 0 ? (
          <p>Nessun ordine presente.</p>
        ) : (
          <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Materiale</th>
                <th>Quantità</th>
                <th>Data Consegna</th>
                <th>Data Ritiro</th>
              </tr>
            </thead>
            <tbody>
              {ordini.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.cliente}</td>
                  <td>{o.materiale}</td>
                  <td>{o.quantita}</td>
                  <td>{o.data_consegna}</td>
                  <td>{o.data_ritiro || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: '3rem' }}>
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
