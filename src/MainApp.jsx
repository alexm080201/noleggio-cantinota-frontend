// src/MainApp.jsx
import React, { useState, useEffect, useMemo } from "react";
import App from "./App";
import Clienti from "./Clienti";
import Materiali from "./Materiali";
import Disponibilita from "./Disponibilita";
import Calendario from "./Calendario";
import Profitti from "./Profitti";
import Login from "./Login";

const pages = {
  noleggi: "Gestione",
  clienti: "Clienti",
  materiali: "Materiali",
  disponibilita: "Disponibilità",
  calendario: "Calendario",
  profitti: "Profitti",
};

export default function MainApp() {
  const [pagina, setPagina] = useState("noleggi");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
  }, [token, role]);

  const isOperatore = useMemo(() => role === "operatore", [role]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
    setPagina("noleggi");
  };

  useEffect(() => {
    if (token && isOperatore && pagina === "profitti") {
      setPagina("noleggi");
    }
  }, [token, isOperatore, pagina]);

  if (!token) {
    return (
      <Login
        onLogin={(t, r) => {
          setToken(t);
          setRole(r);
        }}
      />
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h2 style={{ margin: 0 }}>🏢 Noleggio Manager</h2>

        <nav className="nav">
          {Object.entries(pages).map(([k, v]) => {
            if (k === "profitti" && isOperatore) return null;

            return (
              <button
                key={k}
                className={pagina === k ? "active" : ""}
                onClick={() => setPagina(k)}
              >
                {v}
              </button>
            );
          })}

          <button onClick={logout} style={{ marginLeft: 12 }}>
            Esci
          </button>
        </nav>
      </header>

      <main className="container">
        {pagina === "noleggi" && <App role={role} />}
        {pagina === "clienti" && <Clienti role={role} />}
        {pagina === "materiali" && <Materiali role={role} />}
        {pagina === "disponibilita" && <Disponibilita role={role} />}
        {pagina === "calendario" && <Calendario role={role} />}
        {pagina === "profitti" && !isOperatore && <Profitti role={role} />}
      </main>
    </div>
  );
}
