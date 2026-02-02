import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApp } from "firebase/app"; 
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative flex flex-col">
      
      {/* --- HEADER (Vehicle Number is here) --- */}
      <header className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-xl font-bold text-red-500 tracking-wider">RAPID RESCUE</h1>
          {/* VEHICLE NUMBER DISPLAY */}
          <div className="text-gray-400 text-sm mt-1">
            🚑 {profile?.vehicleNumber || "TS-09-EM-108"} 
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase">Driver</div>
          <div className="font-bold text-white">{profile?.name || "Pilot"}</div>
        </div>
      </header>

      {/* --- STATS BAR (Rescues Count is here) --- */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800 p-3 rounded-lg text-center border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Rescues</div>
          <div className="text-2xl font-bold text-blue-400">
            {profile?.totalRescues || 0}
          </div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg text-center border border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Rating</div>
          <div className="text-2xl font-bold text-yellow-400">
            {profile?.rating || "5.0"} ★
          </div>
        </div>
      </div>

      {/* --- MAIN INTERFACE --- */}
      <main className="flex-1 flex flex-col items-center justify-center space-y-8">
        
        {!activeRide && (
          <button 
            onClick={toggleStatus}
            className={`w-64 h-64 rounded-full border-8 text-2xl font-bold tracking-widest shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all
              ${isOnline 
                ? 'border-green-500 bg-green-900/20 text-white animate-pulse' 
                : 'border-gray-600 bg-gray-800 text-gray-500'
              }`}
          >
            {isOnline ? 'SCANNING...' : 'GO ONLINE'}
          </button>
        )}

        {/* --- ACTIVE RIDE CARD --- */}
        {activeRide && (
          <div className="w-full bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="animate-pulse">🔴</span> LIVE MISSION
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="text-lg"><span className="text-gray-500 text-sm block">Patient Name</span> {activeRide.patientName}</p>
              <p className="text-lg"><span className="text-gray-500 text-sm block">Location</span> {activeRide.location}</p>
            </div>
            <button 
              onClick={() => setActiveRide(null)}
              className="mt-6 w-full bg-green-600 py-4 rounded-lg font-bold text-white shadow-lg hover:bg-green-500"
            >
              COMPLETE RESCUE
            </button>
          </div>
        )}

      </main>

      {/* --- INCOMING CALL MODAL --- */}
      {incomingRequest && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 animate-bounce-in">
          <div className="bg-red-900/40 border-2 border-red-500 w-full max-w-md p-6 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.5)] text-center backdrop-blur-md">
            <div className="text-5xl mb-4">🚨</div>
            <h2 className="text-3xl font-bold text-white mb-2">EMERGENCY</h2>
            <p className="text-red-300 mb-6 uppercase tracking-widest">Immediate Response Required</p>
            
            <div className="bg-black/50 p-4 rounded-lg text-left mb-6">
              <p className="text-xl font-bold text-white">{incomingRequest.emergencyType}</p>
              <p className="text-gray-400 mt-1">📍 {incomingRequest.location}</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIncomingRequest(null)}
                className="flex-1 py-4 bg-gray-800 rounded-lg font-bold text-gray-400"
              >
                DECLINE
              </button>
              <button 
                onClick={acceptRide}
                className="flex-1 py-4 bg-red-600 rounded-lg font-bold text-white shadow-lg animate-pulse"
              >
                ACCEPT
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 text-center">
        <button onClick={handleLogout} className="text-gray-600 text-sm hover:text-white uppercase tracking-widest">
          Logout
        </button>
      </footer>
    </div>
  );
}