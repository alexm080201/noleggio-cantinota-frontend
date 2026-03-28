import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Profitti({ role = "operatore" }) {
  const effectiveRole = useMemo(
    () => (role || localStorage.getItem("role") || "operatore").toLowerCase().trim(),
    [role]
  );

  const isAdmin = effectiveRole === "admin";

  const [dati, setDati] = useState([]);
  const [totaleAnnuale, setTotaleAnnuale] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    const caricaProfitti = async () => {
      setLoading(true);
      setErrore("");

      try {
        const res = await api.get("/profitti/mensili");

        const mesi = [
          "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
          "Lug", "Ago", "Set", "Ott", "Nov", "Dic"
        ];

        const profitti = Array(12).fill(0);

        (res.data || []).forEach((row) => {
          const [yy, mm] = String(row.anno_mese || "").split("-");
          const idx = Number(mm) - 1;
          if (idx >= 0 && idx < 12) {
            profitti[idx] += Number(row.totale_pagato) || 0;
          }
        });

        const datiGrafico = mesi.map((m, i) => ({
          mese: m,
          totale: profitti[i],
        }));

        setDati(datiGrafico);
        setTotaleAnnuale(profitti.reduce((a, b) => a + b, 0));
      } catch (err) {
        console.error("Errore caricamento profitti:", err);
        setErrore(
          err?.response?.data?.message || "Errore nel caricamento profitti"
        );
      } finally {
        setLoading(false);
      }
    };

    caricaProfitti();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1 style={{ textAlign: "center" }}>📊 Profitti</h1>
        <div
          style={{
            background: "#f8d7da",
            padding: 12,
            borderRadius: 8,
            maxWidth: 700,
            margin: "20px auto",
          }}
        >
          Accesso negato: questa sezione è riservata all’amministratore.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>📊 Profitti Mensili</h1>

      {errore && (
        <div
          style={{
            background: "#f8d7da",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          {errore}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Caricamento...
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
