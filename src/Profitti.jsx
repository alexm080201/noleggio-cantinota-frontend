import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Profitti = () => {
  const [dati, setDati] = useState([]);
  const [totaleAnnuale, setTotaleAnnuale] = useState(0);
  const API = "http://localhost:3000";

  useEffect(() => {
    axios.get(`${API}/ordini`).then(res => {
      const pagati = res.data.filter(o => o.pagato);
      const mesi = [
        "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
        "Lug", "Ago", "Set", "Ott", "Nov", "Dic"
      ];

      const profitti = Array(12).fill(0);
      pagati.forEach(o => {
        const mese = new Date(o.data_consegna).getMonth();
        profitti[mese] += Number(o.totale) || 0;
      });

      const datiGrafico = mesi.map((m, i) => ({ mese: m, totale: profitti[i] }));
      setDati(datiGrafico);
      setTotaleAnnuale(profitti.reduce((a, b) => a + b, 0));
    });
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>📊 Profitti Mensili</h1>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={dati}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mese" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totale" fill="#4CAF50" />
        </BarChart>
      </ResponsiveContainer>

      <h2 style={{ textAlign: "center", marginTop: "1rem" }}>
        💰 Totale annuale: € {totaleAnnuale.toFixed(2)}
      </h2>
    </div>
  );
};

export default Profitti;
