import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { 
  FaPowerOff, 
  FaLocationArrow, 
  FaPhoneAlt, 
  FaCheck, 
  FaSignOutAlt, 
  FaHeartbeat, 
  FaAmbulance 
} from 'react-icons/fa';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState("offline");
  const [mission, setMission] = useState(null); 

  // --- 1. FIREBASE REAL-TIME LISTENER ---
  useEffect(() => {
    if (!user) return;
    const driverRef = doc(db, "drivers", user.uid);
    
    // Listen for changes to the driver's document
    const unsubscribe = onSnapshot(driverRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStatus(data.status || "offline");
        
        // CHECK: Is there an active mission?
        // If data.currentMission exists and status is 'accepted' or 'pending', show the Call Screen
        if (data.currentMission && (data.currentMission.status === 'accepted' || data.currentMission.status === 'pending')) {
          setMission(data.currentMission);
        } else {
          setMission(null);
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  // --- 2. ACTION HANDLERS ---
  
  // Toggle between Online (Active) and Offline (Standby)
  const toggleStatus = async () => {
    const newStatus = status === "offline" ? "online" : "offline";
    try {
      await updateDoc(doc(db, "drivers", user.uid), { status: newStatus });
    } catch (e) {
      console.error("Error toggling status", e);
    }
  };

  // Mark the rescue as "Done" and return to dashboard
  const completeMission = async () => {
    if(!window.confirm("Confirm rescue completion?")) return;
    try {
      await updateDoc(doc(db, "drivers", user.uid), { 
        status: "online",       // Auto-set back to online
        currentMission: null    // Clear the mission
      });
    } catch (e) {
      console.error("Error completing mission", e);
    }
  };

  // Primary Action: Open Google Maps
  const navigateToLocation = () => {
    if (mission?.lat && mission?.lng) {
      // Open Google Maps navigation
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${mission.lat},${mission.lng}`, '_blank');
    } else {
      alert("Location coordinates missing");
    }
  };

  // Secondary Action: Call the user
  const callUser = () => {
    if (mission?.phoneNumber) {
      window.open(`tel:${mission.phoneNumber}`);
    } else {
      alert("No phone number available");
    }
  };

  // --- 3. UI RENDERING ---
  return (
    <div className="h-screen bg-[#050505] text-white font-sans flex flex-col overflow-hidden selection:bg-red-500 selection:text-white">
      
      {/* --- HEADER --- */}
      {/* Contains Logo and Logout Button */}
      <header className="flex justify-between items-center px-6 py-4 z-10 select-none">
        <div className="flex items-center gap-2">
          <FaAmbulance className="text-red-600 text-2xl" />
          <h1 className="text-xl font-black tracking-tighter">
            RAPID<span className="text-red-600">RESCUE</span>
          </h1>
        </div>
        <button 
          onClick={logout} 
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FaSignOutAlt size={22} />
        </button>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto relative">
        
        {/* ============================================================
            STATE 1: MISSION INTERFACE (ACTIVE CALL SCREEN)
           ============================================================ */}
        {mission ? (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
            
            {/* EMERGENCY CARD */}
            <div className="bg-[#121212] border border-gray-800 rounded-3xl p-8 pb-10 text-center relative shadow-2xl overflow-hidden">
              {/* Red Glow Effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.8)]"></div>
              
              {/* Center Icon */}
              <div className="mx-auto w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-gray-800">
                <FaLocationArrow className="text-blue-500 text-3xl transform -rotate-45" />
              </div>

              {/* Title & Location */}
              <h2 className="text-2xl font-bold mb-2">Emergency Patient</h2>
              <p className="text-gray-400 text-sm mb-6 font-medium">
                {mission.location || "Location unavailable"}
              </p>

              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                LIVE MISSION
              </div>
            </div>

            {/* PRIMARY ACTION: NAVIGATE (Blue Button) */}
            <button 
              onClick={navigateToLocation}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] active:scale-95 transition-all text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 text-lg uppercase tracking-wider"
            >
              <FaLocationArrow className="transform -rotate-45" /> NAVIGATE
            </button>

            {/* SECONDARY ACTIONS: CALL & DONE */}
            <div className="grid grid-cols-2 gap-4">
              {/* Call Button */}
              <button 
                onClick={callUser}
                className="bg-[#1f2937] hover:bg-[#374151] active:scale-95 transition-all text-gray-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-gray-700"
              >
                <FaPhoneAlt size={16} /> Call
              </button>

              {/* Done Button (Green Outline) */}
              <button 
                onClick={completeMission}
                className="bg-transparent hover:bg-green-900/10 active:scale-95 transition-all text-green-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-green-600"
              >
                <FaCheck size={16} /> Done
              </button>
            </div>
          </div>
        ) : (
          
          /* ============================================================
             STATE 2: DRIVER DASHBOARD (STATUS SCREEN)
             ============================================================ */
          <div className="w-full h-full flex flex-col justify-between py-8">
            
            {/* CENTRAL STATUS DISPLAY */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Icon Circle */}
              <div className={`w-48 h-48 rounded-full border-2 flex items-center justify-center mb-8 relative transition-all duration-500
                ${status === 'online' ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.15)]' : 'border-gray-700'}`}>
                 
                 <FaLocationArrow className={`text-5xl transform -rotate-45 transition-colors duration-500 
                   ${status === 'online' ? 'text-green-500' : 'text-gray-600'}`} />
              </div>
              
              {/* Status Text */}
              <h2 className={`font-bold tracking-[0.2em] text-xs uppercase animate-pulse
                ${status === 'online' ? 'text-green-500' : 'text-gray-500'}`}>
                {status === 'online' ? 'SCANNING FOR CALLS...' : 'SYSTEMS STANDBY'}
              </h2>
            </div>

            {/* BOTTOM CONTROLS */}
            <div className="space-y-4">
              
              {/* ONLINE/OFFLINE TOGGLE BUTTON */}
              <button 
                onClick={toggleStatus}
                className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg
                  ${status === 'online' 
                    ? 'bg-green-600 text-white hover:bg-green-500 shadow-green-900/20' 
                    : 'bg-[#1f2937] text-gray-400 hover:bg-[#374151]'
                  }`}
              >
                <FaPowerOff />
                {status === 'online' ? 'ONLINE' : 'OFFLINE'}
              </button>

              {/* STATS PANEL (RESCUES & VEHICLE) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Rescues Metric */}
                <div className="bg-[#111] border border-gray-800 p-4 rounded-xl flex flex-col justify-between h-20">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">RESCUES</span>
                    <FaHeartbeat className="text-red-600" />
                  </div>
                  <span className="text-xl font-bold text-white">1</span>
                </div>

                {/* Vehicle Metric */}
                <div className="bg-[#111] border border-gray-800 p-4 rounded-xl flex flex-col justify-between h-20">
                   <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">VEHICLE</span>
                    <FaAmbulance className="text-blue-500" />
                  </div>
                  <span className="text-sm font-bold text-white">Pending</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}