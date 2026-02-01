import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

// Restore your original components
import Sidebar from './Sidebar'; 
import GoogleMapComponent from './GoogleMapComponent'; // Assuming you have this

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState("offline");
  const [mission, setMission] = useState(null); 

  // --- 1. LOGIC: LISTEN TO PROFILE (Kept from your working code) ---
  useEffect(() => {
    if (!user) return;
    const driverRef = doc(db, "drivers", user.uid);
    const unsubscribe = onSnapshot(driverRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStatus(data.status);
        
        // Check for pending mission
        if (data.currentMission && data.currentMission.status === 'pending') {
          setMission(data.currentMission);
        } else {
          setMission(null);
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  // --- 2. LOGIC: ACTIONS ---
  const toggleStatus = async () => {
    const newStatus = status === "offline" ? "online" : "offline";
    await updateDoc(doc(db, "drivers", user.uid), { status: newStatus });
  };

  const acceptMission = async () => {
    await updateDoc(doc(db, "drivers", user.uid), { "currentMission.status": "accepted" });
    alert("Mission Accepted! Navigation Starting...");
  };

  const declineMission = async () => {
    if(!window.confirm("Reject this emergency?")) return;
    await updateDoc(doc(db, "drivers", user.uid), { 
      status: "online", 
      currentMission: null 
    });
  };

  // --- 3. THE UI (Restored Structure) ---
  return (
    <div className="dashboard-layout" style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      
      {/* A. HEADER: Logo & Logout (Always Visible) */}
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#111', color: 'white' }}>
        <div className="logo-section">
          <h1 className="text-xl font-bold">RAPID<span className="text-red-500">RESCUE</span></h1>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-white">
          Logout
        </button>
      </header>

      {/* B. MAIN BODY: Sidebar + Content */}
      <div className="main-body" style={{ display: 'flex', flex: 1 }}>
        
        {/* Sidebar (Always Visible) */}
        <div className="sidebar-wrapper" style={{ width: '250px', background: '#f4f4f4' }}>
          <Sidebar />
        </div>

        {/* Content Area (Changes based on Mission) */}
        <div className="content-area" style={{ flex: 1, position: 'relative' }}>
          
          {/* SCENARIO 1: EMERGENCY ALERT (Replaces Map if mission is pending) */}
          {mission ? (
            <div className="emergency-alert" style={{ 
              height: '100%', 
              background: '#DC2626', 
              color: 'white', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <h2 className="text-4xl font-bold mb-4 animate-pulse">🚨 EMERGENCY ALERT</h2>
              <p className="text-xl mb-6">Location: {mission.location}</p>
              
              <div className="flex gap-4">
                 <button onClick={acceptMission} className="bg-white text-red-600 px-8 py-3 font-bold rounded shadow-lg">
                   ACCEPT
                 </button>
                 <button onClick={declineMission} className="bg-black text-white px-8 py-3 font-bold rounded">
                   DECLINE
                 </button>
              </div>
            </div>

          ) : (
            /* SCENARIO 2: STANDARD MAP DASHBOARD */
            <div className="map-wrapper" style={{ height: '100%', width: '100%', position: 'relative' }}>
              
              {/* The Map */}
              <GoogleMapComponent />

              {/* Status Toggle Overlay (Floating on top of Map) */}
              <div className="status-overlay" style={{
                position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', 
                zIndex: 10
              }}>
                 <button 
                  onClick={toggleStatus}
                  className={`px-6 py-2 rounded-full font-bold shadow-xl transition-all ${
                    status === 'online' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'
                  }`}
                 >
                   {status === 'online' ? '● YOU ARE ONLINE' : '○ YOU ARE OFFLINE'}
                 </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}