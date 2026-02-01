import { useEffect, useState } from "react";

export default function DriverDashboard() {
  const [online, setOnline] = useState(false);
  const [mission, setMission] = useState(false);
  const [rescues, setRescues] = useState(1);

  // simulate incoming call ONLY when online
  useEffect(() => {
    if (online && !mission) {
      const t = setTimeout(() => {
        setMission(true);
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [online, mission]);

  return (
    <div style={S.page}>
      {/* HEADER */}
      <div style={S.header}>
        <span style={S.logo}>
          RAPID<span style={{ color: "#ff2e2e" }}>RESCUE</span>
        </span>
      </div>

      {/* BODY */}
      <div style={S.body}>
        {!mission ? (
          <>
            <div
              style={{
                ...S.circle,
                borderColor: online ? "#00ff84" : "#444",
                color: online ? "#00ff84" : "#666",
              }}
            >
              ➤
            </div>

            <div style={S.scanText}>
              {online ? "SCANNING FOR CALLS..." : "SYSTEMS STANDBY"}
            </div>

            <button
              style={{
                ...S.onlineBtn,
                background: online
                  ? "linear-gradient(90deg,#0f0,#0a0)"
                  : "#2a2a2a",
              }}
              onClick={() => setOnline(!online)}
            >
              {online ? "ONLINE" : "OFFLINE"}
            </button>
          </>
        ) : (
          /* MISSION SCREEN */
          <div style={S.card}>
            <div style={S.cardIcon}>➤</div>
            <h3>Emergency Patient</h3>
            <p style={{ color: "#888" }}>Location unavailable</p>

            <div style={S.live}>● LIVE MISSION</div>

            <button style={S.navigate}>NAVIGATE</button>

            <div style={S.actions}>
              <button style={S.call}>📞 Call</button>
              <button
                style={S.done}
                onClick={() => {
                  setMission(false);
                  setRescues(r => r + 1);
                }}
              >
                ✔ Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={S.footer}>
        <span>RESCUES {rescues}</span>
        <span>VEHICLE Pending</span>
      </div>
    </div>
  );
}

/* ====== STYLES (LOCKED) ====== */

const S = {
  page: {
    background: "#0b0b0b",
    color: "#fff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Inter, system-ui",
  },
  header: {
    padding: "14px 24px",
    borderBottom: "1px solid #1f1f1f",
  },
  logo: {
    fontWeight: 700,
    letterSpacing: 1,
  },
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 92,
    height: 92,
    borderRadius: "50%",
    border: "3px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    marginBottom: 18,
  },
  scanText: {
    letterSpacing: 2,
    fontSize: 13,
    color: "#aaa",
    marginBottom: 26,
  },
  onlineBtn: {
    width: 320,
    padding: 14,
    borderRadius: 30,
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    color: "#000",
  },
  card: {
    background: "#111",
    padding: 28,
    borderRadius: 16,
    width: 330,
    textAlign: "center",
    boxShadow: "0 0 30px rgba(0,0,0,0.7)",
  },
  cardIcon: {
    fontSize: 30,
    color: "#3b82f6",
    marginBottom: 12,
  },
  live: {
    margin: "10px auto",
    width: "fit-content",
    padding: "5px 12px",
    borderRadius: 14,
    background: "#2a0000",
    color: "#ff3b3b",
    fontSize: 12,
  },
  navigate: {
    width: "100%",
    padding: 13,
    marginTop: 12,
    background: "#3b82f6",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    color: "#fff",
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 12,
  },
  call: {
    flex: 1,
    padding: 10,
    background: "#222",
    border: "none",
    borderRadius: 10,
    color: "#fff",
  },
  done: {
    flex: 1,
    padding: 10,
    background: "#062f1c",
    border: "1px solid #00ff84",
    borderRadius: 10,
    color: "#00ff84",
  },
  footer: {
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #1f1f1f",
    fontSize: 13,
    color: "#aaa",
  },
};