import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Power, Navigation, LogOut, Phone, MapPin, XCircle, CheckCircle, Activity, Truck } from 'lucide-react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Ambulance } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  // --- 1. LISTEN FOR ALERTS ---
  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "drivers", user.uid), (doc) => {
        const data = doc.data();
        if (data?.currentAlert) {
            setIncomingCall(data.currentAlert);
            if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200]); 
        } else {
            setIncomingCall(null);
        }
      });
      return () => unsub();
    }
  }, [user]);

  // --- 2. GPS HEARTBEAT ---
  useEffect(() => {
    let watcher = null;
    if (isOnline && user && "geolocation" in navigator) {
      watcher = navigator.geolocation.watchPosition(
        async (pos) => {
          await updateDoc(doc(db, "drivers", user.uid), {
            location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            lastActive: new Date()
          });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
    return () => { if (watcher) navigator.geolocation.clearWatch(watcher); };
  }, [isOnline, user]);

  // --- ACTIONS ---
  const acceptCall = async () => {
    const { lat, lng } = incomingCall.patientLocation;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    
    await updateDoc(doc(db, "drivers", user.uid), {
      currentAlert: null,
      totalRescues: (profile?.totalRescues || 0) + 1
    });
    setIncomingCall(null);
  };

  const declineCall = async () => {
    await updateDoc(doc(db, "drivers", user.uid), { currentAlert: null });
    setIncomingCall(null);
  };

  const toggleStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    if (user) await updateDoc(doc(db, "drivers", user.uid), { status: newStatus ? "online" : "offline" });
  };
// --- ADD THESE LINES ALONG WITH YOUR OTHER STATES ---
const [activeRescue, setActiveRescue] = useState(null); // Tracks the current active mission

// --- UPDATE OR ADD THESE FUNCTIONS ---

const handleAccept = () => {
    // Moves the data from "Incoming Call" to "Active Rescue"
    setActiveRescue(incomingCall); 
    setIncomingCall(null);
};

const handleComplete = () => {
    // Clears the rescue and goes back to "Scanning" mode
    setActiveRescue(null);
    alert("Rescue Completed Successfully!");
    // You can add database update logic here later
};
return (
  <div className="h-screen w-full bg-neutral-950 text-white relative flex flex-col font-sans overflow-hidden">
    
    {/* --- 1. TOP HEADER (Always Visible) --- */}
    <div className="p-5 flex justify-between items-center bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 z-50">
      <div className="flex items-center gap-2">
        <Ambulance className="w-6 h-6 text-tesla-red" />
        <h1 className="font-black text-lg tracking-wider">
          RAPID<span className="text-tesla-red">RESCUE</span>
        </h1>
      </div>
      <button onClick={logout}>
        <LogOut className="w-5 h-5 text-neutral-400" />
      </button>
    </div>

    {/* --- 2. MAIN CONTENT AREA (Switches based on Status) --- */}
    <div className="flex-1 relative flex flex-col">
      
      {activeRescue ? (
        // === SCENARIO A: ACTIVE RESCUE MODE (Mission Control) ===
        <div className="h-full flex flex-col items-center justify-center p-6 bg-neutral-900 animate-fade-in">
          
          {/* Patient Card */}
          <div className="w-full max-w-md bg-neutral-800/50 p-8 rounded-3xl border border-neutral-700 mb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tesla-red to-transparent animate-pulse" />
            
            <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-500/30">
              <Navigation className="w-10 h-10 text-blue-500" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              {activeRescue.name || "Emergency Patient"}
            </h2>
            <p className="text-neutral-400 text-lg mb-6">
              {activeRescue.address || "Location unavailable"}
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 font-bold rounded-full text-xs border border-red-900/50 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Mission
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-md space-y-4">
            {/* FIXED MAP URL SYNTAX */}
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${activeRescue.lat},${activeRescue.lng}`, '_blank')}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xl text-white shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Navigation className="w-6 h-6 fill-current" />
              NAVIGATE
            </button>

            <div className="flex gap-4">
              <a
                href={`tel:${activeRescue.phone}`}
                className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-5 h-5 text-green-500" />
                Call
              </a>
              <button
                onClick={handleComplete}
                className="flex-1 py-4 bg-green-900/20 hover:bg-green-900/30 border border-green-600/30 text-green-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                Done
              </button>
            </div>
          </div>
        </div>

      ) : (
        // === SCENARIO B: IDLE / SCANNING MODE ===
        <div className="h-full flex flex-col">
          {/* Radar Animation */}
          <div className="flex-grow bg-neutral-800/50 relative overflow-hidden flex flex-col items-center justify-center">
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
             <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${isOnline ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
                <div className={`w-40 h-40 rounded-full flex items-center justify-center border-4 mb-6 ${isOnline ? 'border-green-500 bg-green-500/10 shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-pulse' : 'border-neutral-600 bg-neutral-900'}`}>
                   <Navigation className={`w-16 h-16 ${isOnline ? 'text-green-500' : 'text-neutral-600'}`} />
                </div>
                <p className="text-sm tracking-[0.2em] text-neutral-400 uppercase font-bold text-center">
                   {isOnline ? 'Scanning for Calls...' : 'Systems Standby'}
                </p>
             </div>
          </div>

          {/* Stats & Online Toggle Panel */}
          <div className="bg-neutral-900 border-t border-neutral-800 p-6 pb-8 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
             <button onClick={toggleStatus} className={`w-full py-6 mb-6 rounded-2xl font-black text-xl tracking-widest uppercase transition-all shadow-lg flex items-center justify-center border ${isOnline ? 'bg-green-600 border-green-500 shadow-green-900/40 hover:bg-green-500 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-500 shadow-black hover:bg-neutral-750'}`}>
                <Power className={`w-6 h-6 mr-3 ${isOnline ? 'animate-pulse' : ''}`} />
                {isOnline ? 'Online' : 'Offline'}
             </button>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-xl border border-neutral-800 flex items-center">
                   <Activity className="w-5 h-5 text-tesla-red mr-3" />
                   <div>
                      <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Rescues</p>
                      <p className="text-lg font-bold text-white">{profile?.totalRescues || 0}</p>
                   </div>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-neutral-800 flex items-center">
                   <Truck className="w-5 h-5 text-blue-400 mr-3" />
                   <div>
                      <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Vehicle</p>
                      <p className="text-sm font-bold text-neutral-300">{profile?.vehicleNumber || "Pending"}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- 3. INCOMING CALL OVERLAY --- */}
      {incomingCall && !activeRescue && (
        <div className="absolute inset-0 z-[100] bg-red-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-pulse">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_white]">
                <Phone className="w-16 h-16 text-red-600 fill-current" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase text-center mb-2">Emergency Alert</h1>
            <p className="text-xl text-white/80 font-bold mb-10">Patient Nearby • High Priority</p>
            <div className="w-full max-w-sm grid grid-cols-2 gap-6">
                <button onClick={() => setIncomingCall(null)} className="py-6 rounded-2xl bg-black/40 border-2 border-white/20 hover:bg-black/60 text-white font-bold flex flex-col items-center"><XCircle className="w-8 h-8 mb-2" /> Decline</button>
                <button onClick={handleAccept} className="py-6 rounded-2xl bg-green-500 hover:bg-green-400 text-white font-bold shadow-2xl shadow-green-900 flex flex-col items-center"><CheckCircle className="w-8 h-8 mb-2" /> ACCEPT</button>
            </div>
        </div>
      )}

    </div>
  </div>
);
} // <--- ENSURE THIS CLOSING BRACE IS PRESENT!