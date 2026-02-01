import { useState, useEffect } from "react";

export default function DriverDashboard() {
  const [online, setOnline] = useState(false);
  const [mission, setMission] = useState(null);
  const [rescues, setRescues] = useState(1);

  // Simulate incoming emergency call
  useEffect(() => {
    if (online && !mission) {
      const timer = setTimeout(() => {
        setMission({
          patient: "Emergency Patient",
          location: "Location unavailable",
        });
      }, 4000); // simulate call after 4 sec

      return () => clearTimeout(timer);
    }
  }, [online, mission]);

  const finishMission = () => {
    setMission(null);
    setRescues((r) => r + 1);
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.logo}>RAPID<span style={{ color: "#ff3b3b" }}>RESCUE</span></span>
      </div>

      {/* MAIN */}
      <div style={styles.center}>
        {!mission ? (
          <>
            <div
              style={{
                ...styles.circle,
                borderColor: online ? "#00ff85" : "#555",
                color: online ? "#00ff85" : "#777",
              }}
            >
              ➤
            </div>

            <p style={styles.statusText}>
              {online ? "SCANNING FOR CALLS..." : "SYSTEMS STANDBY"}
            </p>

            <button
              onClick={() => setOnline(!online)}
              style={{
                ...styles.toggleBtn,
                background: online ? "#00ff85" : "#333",
              }}
            >
              {online ? "ONLINE" : "OFFLINE"}
            </button>
          </>
        ) : (
          /* MISSION CARD */
          <div style={styles.card}>
            <div style={styles.cardIcon}>➤</div>
            <h3>{mission.patient}</h3>
            <p style={{ color: "#aaa" }}>{mission.location}</p>

            <span style={styles.live}>● LIVE MISSION</span>

            <button style={styles.navigate}>NAVIGATE</button>

            <div style={styles.actions}>
              <button style={styles.call}>📞 Call</button>
              <button style={styles.done} onClick={finishMission}>
                ✔ Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      <div style={styles.footer}>
        <span>🚑 RESCUES: {rescues}</span>
        <span>🚗 VEHICLE: Pending</span>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#0b0b0b",
    color: "#fff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Inter, sans-serif",
  },
  header: {
    padding: "16px 24px",
    borderBottom: "1px solid #222",
  },
  logo: {
    fontWeight: "700",
    letterSpacing: "1px",
  },
  center: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    border: "3px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    marginBottom: 16,
  },
  statusText: {
    letterSpacing: "2px",
    marginBottom: 24,
    color: "#aaa",
  },
  toggleBtn: {
    width: 260,
    padding: 14,
    borderRadius: 30,
    border: "none",
    color: "#000",
    fontWeight: "700",
    cursor: "pointer",
  },
  card: {
    background: "#111",
    padding: 30,
    borderRadius: 14,
    width: 320,
    textAlign: "center",
    boxShadow: "0 0 20px rgba(0,0,0,0.6)",
  },
  cardIcon: {
    fontSize: 28,
    color: "#3b82f6",
    marginBottom: 10,
  },
  live: {
    display: "inline-block",
    margin: "10px 0",
    padding: "4px 10px",
    borderRadius: 12,
    background: "#2a0000",
    color: "#ff3b3b",
    fontSize: 12,
  },
  navigate: {
    width: "100%",
    padding: 12,
    marginTop: 12,
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: "700",
    cursor: "pointer",
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
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
  },
  done: {
    flex: 1,
    padding: 10,
    background: "#063",
    border: "1px solid #00ff85",
    borderRadius: 8,
    color: "#00ff85",
    cursor: "pointer",
  },
  footer: {
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #222",
    color: "#aaa",
    fontSize: 13,
  },
};