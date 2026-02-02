import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApp } from "firebase/app"; 
import { Ambulance, Zap } from 'lucide-react'; // Import the same icons
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore'; 

export default function Dashboard() {
  const { user, profile, logout } = useAuth(); 
  const navigate = useNavigate();
  
  // Database Connection
  const app = getApp(); 
  const db = getFirestore(app); 

  // State
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState(null); 
  const [activeRide, setActiveRide] = useState(null); 

  // --- 1. LISTEN FOR CALLS ---
  useEffect(() => {
    if (!isOnline || !user || !db) return;

    const q = query(
      collection(db, "rideRequests"), 
      where("status", "==", "pending") 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const requestData = snapshot.docs[0].data();
        const requestId = snapshot.docs[0].id;
        setIncomingRequest({ id: requestId, ...requestData });
      } else {
        setIncomingRequest(null);
      }
    }, (error) => console.error(error));

    return () => unsubscribe();
  }, [isOnline, user, db]);

  // --- 2. TOGGLE STATUS ---
  const toggleStatus = async () => {
    if (!user) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        status: newStatus ? 'online' : 'offline'
      });
    } catch (e) { console.log("Status update skipped"); }
  };

  // --- 3. ACCEPT RIDE ---
  const acceptRide = async () => {
    if (!incomingRequest) return;
    try {
      await updateDoc(doc(db, "rideRequests", incomingRequest.id), {
        status: 'accepted',
        driverId: user.uid,
        driverName: profile?.name || 'Unknown Driver'
      });
      setActiveRide(incomingRequest);
      setIncomingRequest(null); 
    } catch (error) {
      alert("Ride already taken.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // --- THE NEW MATCHING UI ---
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 p-6 relative flex flex-col items-center">
      
      {/* --- BRANDED HEADER (Matching SignIn.jsx) --- */}
      <header className="w-full max-w-md flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-neutral-800 p-2 rounded-xl border border-neutral-700 shadow-lg shadow-red-900/10">
             <Ambulance className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none">
              Rapid<span className="text-red-600">Rescue</span>
            </h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mt-1">
              Pilot Interface
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Unit ID</div>
          <div className="font-bold text-white text-sm">
            {profile?.vehicleNumber || "TS-09-EM-108"}
          </div>
        </div>
      </header>

      {/* --- STATS BAR --- */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-8">
        <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 text-center backdrop-blur-sm">
          <div className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-1">Total Rescues</div>
          <div className="text-2xl font-black text-white">
            {profile?.totalRescues || 0}
          </div>
        </div>
        <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 text-center backdrop-blur-sm">
          <div className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-1">Rating</div>
          <div className="text-2xl font-black text-yellow-500 flex justify-center items-center gap-1">
            {profile?.rating || "5.0"} <Zap className="w-4 h-4 fill-current" />
          </div>
        </div>
      </div>

      {/* --- MAIN BUTTON --- */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center space-y-8">
        
        {!activeRide && (
          <button 
            onClick={toggleStatus}
            className={`group w-64 h-64 rounded-full border-[6px] text-2xl font-black tracking-widest shadow-[0_0_60px_rgba(0,0,0,0.3)] transition-all duration-500 flex flex-col items-center justify-center
              ${isOnline 
                ? 'border-green-500 bg-green-950/30 text-white shadow-green-900/20' 
                : 'border-neutral-800 bg-neutral-900 text-neutral-600 hover:border-neutral-700'
              }`}
          >
            <div className={`mb-2 transition-transform duration-500 ${isOnline ? 'scale-110' : 'group-hover:scale-105'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
            <div className="text-[10px] font-medium tracking-[0.3em] uppercase opacity-50">
              {isOnline ? 'Scanning...' : 'Standby'}
            </div>
          </button>
        )}

        {/* --- ACTIVE RIDE CARD --- */}
        {activeRide && (
          <div className="w-full bg-neutral-900 p-6 rounded-3xl border border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"></div>
            
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-white">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span> 
              ACTIVE MISSION
            </h2>
            
            <div className="space-y-4 text-neutral-300">
              <div className="bg-black/30 p-4 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">Patient</span> 
                <span className="text-lg font-bold text-white">{activeRide.patientName}</span>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">Location</span> 
                <span className="text-lg font-bold text-white">{activeRide.location}</span>
              </div>
            </div>

            <button 
              onClick={() => setActiveRide(null)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
            >
              Mission Complete
            </button>
          </div>
        )}

      </main>

      {/* --- INCOMING CALL MODAL --- */}
      {incomingRequest && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-neutral-900 border border-red-500/50 w-full max-w-md p-8 rounded-3xl shadow-[0_0_100px_rgba(220,38,38,0.4)] text-center relative overflow-hidden">
            
            {/* Background Pulse Animation */}
            <div className="absolute top-0 left-0 w-full h-full bg-red-500/5 animate-pulse"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <Ambulance className="w-8 h-8 text-red-500 animate-bounce" />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">EMERGENCY ALERT</h2>
              <p className="text-red-400 text-xs font-bold uppercase tracking-[0.2em] mb-8">Immediate Response Required</p>
              
              <div className="bg-black/40 p-5 rounded-2xl text-left mb-8 border border-neutral-800">
                <p className="text-xl font-bold text-white mb-1">{incomingRequest.emergencyType}</p>
                <p className="text-neutral-400 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-neutral-600 rounded-full"></span> 
                  {incomingRequest.location}
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIncomingRequest(null)}
                  className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  Decline
                </button>
                <button 
                  onClick={acceptRide}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-900/30 animate-pulse transition-colors"
                >
                  Accept Mission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="w-full max-w-md mt-6 text-center">
        <button onClick={handleLogout} className="text-neutral-600 text-[10px] font-bold hover:text-white uppercase tracking-[0.2em] transition-colors">
          Log Out Pilot
        </button>
      </footer>
    </div>
  );
}