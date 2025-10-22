import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

const API = "http://localhost:3000";

export default function Calendario() {
  const [ordini, setOrdini] = useState([]);
  const [eventoSelezionato, setEventoSelezionato] = useState(null);
  const [popupVisibile, setPopupVisibile] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    caricaOrdini();
  }, []);

  const caricaOrdini = async () => {
    try {
      const res = await axios.get(`${API}/ordini`);
      setOrdini(res.data);
    } catch (err) {
      console.error("Errore nel caricamento ordini:", err);
    }
  };

  // Crea eventi per il calendario
  const eventi = ordini.flatMap((o) => [
    {
      id: o.id,
      title: `📦 Consegna - ${o.cliente}`,
      start: o.data_consegna,
      color: o.pagato
        ? "#4CAF50" // verde se pagato
        : o.consegnato
        ? "#2196F3" // blu se consegnato ma non pagato
        : "#FFC107", // giallo se da consegnare
      extendedProps: o,
      tipo: "consegna",
    },
    {
      id: `${o.id}-ritiro`,
      title: `🔁 Ritiro - ${o.cliente}`,
      start: o.data_ritiro,
      color: o.ritirato ? "#8BC34A" : "#F44336", // verde se ritirato, rosso se no
      extendedProps: o,
      tipo: "ritiro",
    },
  ]);

  const handleEventClick = (info) => {
    setEventoSelezionato(info.event.extendedProps);
    setPopupVisibile(true);
  };

  const chiudiPopup = () => {
    setEventoSelezionato(null);
    setPopupVisibile(false);
  };

  const salvaStatoOrdine = async () => {
    if (!eventoSelezionato) return;
    setSalvando(true);
    try {
      await axios.patch(`${API}/ordini/${eventoSelezionato.id}/stato`, {
        consegnato: eventoSelezionato.consegnato,
        ritirato: eventoSelezionato.ritirato,
        pagato: eventoSelezionato.pagato,
      });
      await caricaOrdini();
      chiudiPopup();
    } catch (err) {
      alert("Errore nel salvataggio: controlla il backend.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  const toggleCheckbox = (campo) => {
    setEventoSelezionato((prev) => ({
      ...prev,
      [campo]: !prev[campo],
    }));
  };

  const formattaData = (data) => {
    if (!data) return "";
    const d = new Date(data);
    return d.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>📅 Calendario Ordini</h1>

      <div
        style={{
          background: "white",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          padding: "1rem",
          borderRadius: "10px",
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={eventi}
          eventClick={handleEventClick}
          locale="it"
          height="80vh"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
        />
      </div>

      {popupVisibile && eventoSelezionato && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "10px",
              width: "400px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              position: "relative",
            }}
          >
            <button
              onClick={chiudiPopup}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "1.3rem",
                cursor: "pointer",
              }}
            >
              ✖
            </button>

            <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>Dettagli Ordine</h2>
            <p><strong>Cliente:</strong> {eventoSelezionato.cliente}</p>
            <p><strong>Materiale:</strong> {eventoSelezionato.materiale}</p>
            <p><strong>Quantità:</strong> {eventoSelezionato.quantita}</p>
            <p><strong>Consegna:</strong> {formattaData(eventoSelezionato.data_consegna)}</p>
            <p><strong>Ritiro:</strong> {formattaData(eventoSelezionato.data_ritiro)}</p>
            <p><strong>Km:</strong> {eventoSelezionato.km}</p>
            <p><strong>Totale:</strong> € {Number(eventoSelezionato.totale || 0).toFixed(2)}</p>

            <div style={{ marginTop: "1rem" }}>
              <label>
                <input
                  type="checkbox"
                  checked={eventoSelezionato.consegnato || false}
                  onChange={() => toggleCheckbox("consegnato")}
                />{" "}
                Consegnato
              </label>
              <br />
              <label>
                <input
                  type="checkbox"
                  checked={eventoSelezionato.ritirato || false}
                  onChange={() => toggleCheckbox("ritirato")}
                />{" "}
                Ritirato
              </label>
              <br />
              <label>
                <input
                  type="checkbox"
                  checked={eventoSelezionato.pagato || false}
                  onChange={() => toggleCheckbox("pagato")}
                />{" "}
                Pagato
              </label>
            </div>

            <button
              onClick={salvaStatoOrdine}
              disabled={salvando}
              style={{
                background: "#4CAF50",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "1rem",
                width: "100%",
              }}
            >
              💾 {salvando ? "Salvataggio..." : "Salva modifiche"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
