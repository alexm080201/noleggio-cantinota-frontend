import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function Disponibilita() {
  const [dal, setDal] = useState("");
  const [al, setAl] = useState("");
  const [dati, setDati] = useState([]);

  const token = localStorage.getItem("token");

  const cerca = async () => {
    if (!dal || !al) {
      alert("Seleziona entrambe le date");
      return;
    }

    try {
      const res = await fetch(
        `${API}/materiali/disponibilita-periodo?dal=${dal}&al=${al}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      setDati(json);
    } catch (err) {
      console.error(err);
      alert("Errore nel recupero dati");
    }
  };

  return (
    <div>
      <h2>📦 Disponibilità materiali</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Dal:</label>
        <input type="date" value={dal} onChange={(e) => setDal(e.target.value)} />

        <label style={{ marginLeft: 10 }}>Al:</label>
        <input type="date" value={al} onChange={(e) => setAl(e.target.value)} />

        <button onClick={cerca} style={{ marginLeft: 10 }}>
          Cerca
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Materiale</th>
            <th>Totale</th>
            <th>Occupati</th>
            <th>Disponibili</th>
          </tr>
        </thead>

        <tbody>
          {dati.map((m) => (
            <tr key={m.id}>
              <td>{m.nome}</td>
              <td>{m.stock_totale}</td>
              <td>{m.occupati}</td>
              <td
                style={{
                  color: m.disponibili <= 0 ? "red" : "green",
                  fontWeight: "bold",
                }}
              >
                {m.disponibili}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
