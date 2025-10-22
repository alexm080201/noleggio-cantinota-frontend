// src/Login.jsx
import React, { useState } from "react";
import axios from "axios";

export default function Login({ onLogin }){
  const [user,setUser]=useState(""); const [pass,setPass]=useState(""); const [err,setErr]=useState("");
  const API="http://localhost:3000";

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/login`, { username: user, password: pass });
      if(res.data?.token){
        onLogin(res.data.token);
      } else setErr("Login fallito");
    } catch(err){
      setErr(err.response?.data?.message || "Errore login");
    }
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f7f9fc"}}>
      <div className="card" style={{width:420}}>
        <h2>🔐 Login Admin</h2>
        <form onSubmit={submit} style={{display:"grid",gap:10}}>
          <input placeholder="Username" value={user} onChange={e=>setUser(e.target.value)} />
          <input placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <button className="primary" type="submit">Accedi</button>
            <span className="small-muted">usa credenziali create su Neon</span>
          </div>
          {err && <div style={{color:"red"}}>{err}</div>}
        </form>
      </div>
    </div>
  );
}
