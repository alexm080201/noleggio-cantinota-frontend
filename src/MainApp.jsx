// src/MainApp.jsx
import React, { useState, useEffect } from "react";
import App from "./App";
import Clienti from "./Clienti";
import Materiali from "./Materiali";
import Calendario from "./Calendario";
import Profitti from "./Profitti";
import Login from "./Login";
const pages = { noleggi: "Gestione", clienti: "Clienti", materiali: "Materiali", calendario: "Calendario", profitti: "Profitti" };

export default function MainApp(){
  const [pagina, setPagina] = useState("noleggi");
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if(token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  },[token]);

  if(!token){
    return <Login onLogin={t=>setToken(t)} />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <h2 style={{margin:0}}>🏢 Noleggio Manager</h2>
        <nav className="nav">
          {Object.entries(pages).map(([k,v])=>(
            <button key={k} className={pagina===k?"active":""} onClick={()=>setPagina(k)}>{v}</button>
          ))}
          <button onClick={()=>{ localStorage.removeItem("token"); setToken(null); }} style={{marginLeft:12}}>Esci</button>
        </nav>
      </header>

      <main className="container">
        {pagina==="noleggi" && <App />}
        {pagina==="clienti" && <Clienti />}
        {pagina==="materiali" && <Materiali />}
        {pagina==="calendario" && <Calendario />}
        {pagina==="profitti" && <Profitti />}
      </main>
    </div>
  );
}
