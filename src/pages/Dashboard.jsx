import React, { useState, useEffect } from "react";
import { 
  FaPowerOff, 
  FaLocationArrow, 
  FaPhoneAlt, 
  FaCheckCircle, 
  FaSignOutAlt, 
  FaHeartbeat, 
  FaTruck,
  FaTimesCircle
} from "react-icons/fa";

// --- DUMMY MISSION DATA ---
const MOCK_MISSION = {
  id: "MSG-101",
  patientName: "Emergency Patient",
  locationName: "Hitech City, Hyderabad",
  lat: 17.4401, 
  lng: 78.3489,
  phone: "108"
};

export default function DriverDashboard() {
  // --- STATES ---
  const [isOnline, setIsOnline] = useState(false);
  const [viewState, setViewState] = useState("IDLE"); // Options: "IDLE", "INCOMING", "ACTIVE"
  const [rescues, setRescues] = useState(1);
  const [activeMission, setActiveMission] = useState(null);

  // --- LOGIC: SIMULATE INCOMING CALL ---
  useEffect(() => {
    let timer;
    // Only simulate a call if we are ONLINE and currently IDLE (not already in a call)
    if (isOnline && viewState === "IDLE") {
      timer = setTimeout(() => {
        setViewState("INCOMING"); // Trigger the Accept/Reject screen
      }, 3000); // 3 seconds after going online
    }
    return () => clearTimeout(timer);
  }, [isOnline, viewState]);

  // --- HANDLERS ---

  // 1. Toggle Online/Offline
  const handleToggleOnline = () => {
    if (isOnline) {
      // Going Offline
      setIsOnline(false);
      setViewState("IDLE");
      setActiveMission(null);
    } else {
      // Going Online
      setIsOnline(true);
    }
  };

  // 2. Reject Call (Goes back to scanning)
  const handleReject = () => {
    setViewState("IDLE");
    // In a real app, you might log this rejection
  };

  // 3. Accept Call (Moves to Active Mission)
  const handleAccept = () => {
    setActiveMission(MOCK_MISSION);
    setViewState("ACTIVE");
  };

  // 4. Navigate (Opens Google Maps)
  const handleNavigate = () => {
    if (activeMission) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${activeMission.lat},${activeMission.lng}`;
      window.open(url, '_blank');
    }
  };

  // 5. Phone Call
  const handleCall = () => {
    if (activeMission) {
      window.open(`tel:${activeMission.phone}`);
    }
  };

  // 6. Mark Done (Increments rescues, returns to scanning)
  const handleDone = () => {
    if(window.confirm("Confirm patient drop-off?")) {
      setRescues(prev => prev + 1);
      setActiveMission(null);
      setViewState("IDLE"); // Back to scanning
    }
  };

  // --- RENDER HELPERS ---

  // SCREEN A: SCANNING / OFFLINE
  const renderScanner = () => (
    <div style={styles.centerContainer}>
      <div style={styles.radarContainer}>
        <div style={{
          ...styles.radarCircle,
          borderColor: isOnline ? "#22c55e" : "#3f3f46",
          color: isOnline ? "#22c55e" : "#52525b",
          boxShadow: isOnline ? "0 0 40px rgba(34, 197, 94, 0.2)" : "none"
        }}>
          <FaLocationArrow style={{ fontSize: "40px", transform: "rotate(-45deg)" }} />
        </div>
        <p style={{ ...styles.statusText, color: isOnline ? "#22c55e" : "#71717a" }}>
          {isOnline ? "SCANNING FOR CALLS..." : "SYSTEMS STANDBY"}
        </p>
      </div>

      <button 
        onClick={handleToggleOnline}
        style={{
          ...styles.mainButton,
          background: isOnline ? "#22c55e" : "#27272a",
          color: isOnline ? "#000" : "#a1a1aa"
        }}
      >
        <FaPowerOff style={{ marginRight: "10px" }} />
        {isOnline ? "ONLINE" : "GO ONLINE"}
      </button>
    </div>
  );

  // SCREEN B: INCOMING CALL (ACCEPT / REJECT)
  const renderIncoming = () => (
    <div style={styles.centerContainer}>
      <div style={styles.incomingAlertBox}>
        <div style={styles.pulseRing}></div>
        <h2 style={styles.incomingTitle}>NEW REQUEST</h2>
        <p style={styles.incomingSub}>Ambulance Required • High Priority</p>
        <h3 style={styles.incomingLocation}>{MOCK_MISSION.locationName}</h3>
      </div>

      <div style={styles.decisionRow}>
        <button style={styles.rejectBtn} onClick={handleReject}>
          <FaTimesCircle size={20} /> REJECT
        </button>
        <button style={styles.acceptBtn} onClick={handleAccept}>
          <FaCheckCircle size={20} /> ACCEPT
        </button>
      </div>
    </div>
  );

  // SCREEN C: ACTIVE MISSION (NAVIGATE / CALL / DONE)
  const renderActiveMission = () => (
    <div style={styles.missionCard}>
      {/* Red Glow Top */}
      <div style={styles.cardGlow}></div>
      
      {/* Header Icon */}
      <div style={styles.missionIcon}>
        <FaLocationArrow style={{ transform: "rotate(-45deg)" }} />
      </div>

      <h2 style={styles.missionTitle}>{activeMission.patientName}</h2>
      <p style={styles.missionLoc}>{activeMission.locationName}</p>
      
      <div style={styles.liveBadge}>
        <span style={styles.liveDot}></span> LIVE MISSION
      </div>

      {/* BIG NAVIGATE BUTTON */}
      <button style={styles.navBtn} onClick={handleNavigate}>
        <FaLocationArrow style={{ transform: "rotate(-45deg)" }} /> NAVIGATE
      </button>

      {/* CALL & DONE BUTTONS */}
      <div style={styles.actionRow}>
        <button style={styles.callBtn} onClick={handleCall}>
          <FaPhoneAlt /> CALL
        </button>
        <button style={styles.doneBtn} onClick={handleDone}>
          <FaCheckCircle /> DONE
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logoBox}>
          <FaTruck style={{ color: "#ef4444", fontSize: "22px" }} />
          <span style={styles.logoText}>
            RAPID<span style={{ color: "#ef4444" }}>RESCUE</span>
          </span>
        </div>
        <button style={styles.logoutBtn}>
          <FaSignOutAlt />
        </button>
      </header>

      {/* MAIN BODY SWITCHER */}
      <main style={styles.main}>
        {viewState === "IDLE" && renderScanner()}
        {viewState === "INCOMING" && renderIncoming()}
        {viewState === "ACTIVE" && renderActiveMission()}
      </main>

      {/* FOOTER STATS */}
      <footer style={styles.footer}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>RESCUES <FaHeartbeat color="#ef4444"/></span>
          <span style={styles.statVal}>{rescues}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>VEHICLE <FaTruck color="#3b82f6"/></span>
          <span style={styles.statValPending}>Active</span>
        </div>
      </footer>
    </div>
  );
}

// --- TESLA-STYLE DARK UI CSS ---
const styles = {
  page: {
    height: "100vh",
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  header: {
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #111"
  },
  logoBox: { display: "flex", gap: "10px", alignItems: "center" },
  logoText: { fontWeight: "900", fontSize: "18px", letterSpacing: "-0.5px" },
  logoutBtn: { background: "none", border: "none", color: "#666", fontSize: "20px", cursor: "pointer" },
  
  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    position: "relative",
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto"
  },

  // SCANNER STYLES
  centerContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "10px"
  },
  radarContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  radarCircle: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    border: "3px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "30px",
    transition: "all 0.3s ease"
  },
  statusText: {
    fontWeight: "700",
    letterSpacing: "2px",
    fontSize: "12px"
  },
  mainButton: {
    width: "100%",
    padding: "18px",
    borderRadius: "14px",
    border: "none",
    fontWeight: "800",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s"
  },

  // INCOMING CALL STYLES
  incomingAlertBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    animation: "pulse 1s infinite"
  },
  pulseRing: {
    width: "100px",
    height: "100px",
    background: "rgba(239, 68, 68, 0.2)",
    borderRadius: "50%",
    position: "absolute",
    zIndex: -1,
    animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"
  },
  incomingTitle: { fontSize: "32px", fontWeight: "900", color: "#ef4444", marginBottom: "8px" },
  incomingSub: { color: "#888", marginBottom: "20px", fontWeight: "600" },
  incomingLocation: { fontSize: "24px", textAlign: "center", lineHeight: "1.3" },
  
  decisionRow: {
    display: "flex",
    width: "100%",
    gap: "15px",
    marginBottom: "10px"
  },
  acceptBtn: {
    flex: 1,
    padding: "20px",
    background: "#22c55e",
    color: "#000",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    cursor: "pointer"
  },
  rejectBtn: {
    flex: 1,
    padding: "20px",
    background: "#27272a",
    color: "#ef4444",
    border: "1px solid #ef4444",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    cursor: "pointer"
  },

  // MISSION CARD STYLES
  missionCard: {
    width: "100%",
    background: "#111",
    borderRadius: "24px",
    padding: "30px",
    textAlign: "center",
    border: "1px solid #222",
    position: "relative",
    overflow: "hidden"
  },
  cardGlow: {
    position: "absolute",
    top: 0, left: 0, right: 0, height: "3px",
    background: "linear-gradient(90deg, transparent, #ef4444, transparent)",
    boxShadow: "0 0 20px 5px #ef4444"
  },
  missionIcon: {
    width: "70px", height: "70px",
    background: "#2563eb",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    color: "#fff",
    fontSize: "24px"
  },
  missionTitle: { fontSize: "22px", fontWeight: "800", marginBottom: "5px" },
  missionLoc: { color: "#888", fontSize: "14px", marginBottom: "20px" },
  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "#450a0a",
    color: "#ef4444",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
    marginBottom: "25px",
    letterSpacing: "1px"
  },
  liveDot: { width: "6px", height: "6px", background: "#ef4444", borderRadius: "50%", marginRight: "6px" },
  
  navBtn: {
    width: "100%",
    padding: "16px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "15px",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(37, 99, 235, 0.3)"
  },
  actionRow: { display: "flex", gap: "10px" },
  callBtn: {
    flex: 1, padding: "14px", background: "#222", border: "1px solid #333",
    borderRadius: "10px", color: "#ddd", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer"
  },
  doneBtn: {
    flex: 1, padding: "14px", background: "#064e3b", border: "1px solid #10b981",
    borderRadius: "10px", color: "#34d399", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer"
  },

  // FOOTER
  footer: {
    padding: "0 20px 20px",
    display: "flex",
    gap: "15px",
    maxWidth: "540px",
    width: "100%",
    margin: "0 auto"
  },
  statBox: {
    flex: 1,
    background: "#111",
    border: "1px solid #222",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  statLabel: { fontSize: "10px", fontWeight: "800", color: "#666", display: "flex", alignItems: "center", gap: "5px" },
  statVal: { fontSize: "20px", fontWeight: "800" },
  statValPending: { fontSize: "14px", fontWeight: "700", marginTop: "4px" }
};