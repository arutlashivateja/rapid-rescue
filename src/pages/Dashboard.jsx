import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApp } from "firebase/app"; // <--- 1. Import getApp
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
  
  // --- DATABASE CONNECTION (FIXED) ---
  // Instead of importing from firebase.js, we grab the running app instance directly.
  const app = getApp(); 
  const db = getFirestore(app); 

  // --- STATE ---
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState(null); 
  const [activeRide, setActiveRide] = useState(null); 

  // 1. LISTEN FOR CALLS
  useEffect(() => {
    // Safety check: Don't run if user is missing or db isn't ready
    if (!isOnline || !user || !db) return;

    // Listen to the 'rideRequests' collection
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
    }, (error) => {
      console.error("Error listening to rides:", error);
    });

    return () => unsubscribe();
  }, [isOnline, user, db]);

  // 2. TOGGLE ONLINE/OFFLINE
  const toggleStatus = async () => {
    if (!user) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        status: newStatus ? 'online' : 'offline'
      });
    } catch (e) {
      console.log("Status update skipped (optional)");
    }
  };

  // 3. ACCEPT CALL LOGIC
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
      console.error("Error accepting ride:", error);
      alert("Could not accept ride. It might have been taken.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative">
      
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-xl font-bold text-red-500 tracking-wider">RAPID RESCUE</h1>
        <div className="text-right">
          <div className="text-xs text-gray-400">STATUS</div>
          <div className={`text-sm font-bold ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </header>

      {/* --- MAIN INTERFACE --- */}
      <main className="flex flex-col items-center justify-center space-y-8 mt-10">
        
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

        {/* --- ACTIVE RIDE VIEW (After Accepting) --- */}
        {activeRide && (
          <div className="w-full max-w-md bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4">🚑 CURRENT MISSION</h2>
            <div className="space-y-2 text-gray-300">
              <p><span className="text-gray-500">Patient:</span> {activeRide.patientName || 'Unknown'}</p>
              <p><span className="text-gray-500">Location:</span> {activeRide.location || 'See Map'}</p>
              <p><span className="text-gray-500">Type:</span> {activeRide.emergencyType || 'General'}</p>
            </div>
            <button 
              onClick={() => setActiveRide(null)}
              className="mt-6 w-full bg-blue-600 py-3 rounded font-bold hover:bg-blue-500"
            >
              COMPLETE MISSION
            </button>
          </div>
        )}

      </main>

      {/* --- INCOMING CALL POPUP --- */}
      {incomingRequest && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-bounce-in">
          <div className="bg-red-900/40 border-2 border-red-500 w-full max-w-md p-6 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.5)] text-center backdrop-blur-md">
            
            <div className="text-3xl mb-2">🚨</div>
            <h2 className="text-2xl font-bold text-white mb-1">EMERGENCY ALERT</h2>
            <p className="text-red-300 text-sm mb-6 uppercase tracking-widest">New Request Received</p>
            
            <div className="bg-black/40 p-4 rounded-lg text-left mb-6 space-y-2">
              <p className="text-lg font-semibold">{incomingRequest.emergencyType || "Medical Emergency"}</p>
              <p className="text-gray-300 text-sm">📍 {incomingRequest.location || "Location Shared"}</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIncomingRequest(null)}
                className="flex-1 py-4 bg-gray-700 rounded-lg font-bold text-gray-300 hover:bg-gray-600"
              >
                IGNORE
              </button>
              <button 
                onClick={acceptRide}
                className="flex-1 py-4 bg-red-600 rounded-lg font-bold text-white shadow-lg shadow-red-900/50 hover:bg-red-500 animate-pulse"
              >
                ACCEPT NOW
              </button>
            </div>

          </div>
        </div>
      )}

      <footer className="absolute bottom-6 w-full text-center left-0">
        <button onClick={handleLogout} className="text-gray-600 text-sm hover:text-white">
          LOGOUT
        </button>
      </footer>
    </div>
  );
}