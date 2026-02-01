import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState("offline");
  const [mission, setMission] = useState(null); // Stores incoming mission data

  // --- 1. LISTEN TO MY OWN PROFILE ---
  useEffect(() => {
    if (!user) return;

    // Listen to the specific driver document in real-time
    const driverRef = doc(db, "drivers", user.uid);
    
    const unsubscribe = onSnapshot(driverRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStatus(data.status);

        // CHECK: Do I have a pending mission?
        if (data.currentMission && data.currentMission.status === 'pending') {
          setMission(data.currentMission);
        } else {
          setMission(null);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // --- 2. TOGGLE ONLINE/OFFLINE ---
  const toggleStatus = async () => {
    const newStatus = status === "offline" ? "online" : "offline";
    try {
      await updateDoc(doc(db, "drivers", user.uid), {
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // --- 3. ACCEPT MISSION ---
  const acceptMission = async () => {
    try {
      await updateDoc(doc(db, "drivers", user.uid), {
        "currentMission.status": "accepted" // Updates status to accepted
      });
      alert("Mission Accepted! Navigation Starting...");
      // Here you would normally redirect to a map page
    } catch (error) {
      console.error("Error accepting:", error);
    }
  };

  // --- 4. DECLINE MISSION ---
  const declineMission = async () => {
    if(!window.confirm("Reject this emergency?")) return;
    
    try {
      await updateDoc(doc(db, "drivers", user.uid), {
        status: "online",       // Go back to being ready
        currentMission: null    // Delete the mission
      });
    } catch (error) {
      console.error("Error declining:", error);
    }
  };

  // --- 5. THE "INCOMING CALL" SCREEN ---
  if (mission) {
    return (
      <div className="h-screen bg-red-600 text-white flex flex-col items-center justify-center p-4 animate-pulse">
        <h1 className="text-6xl font-black mb-4">🚨</h1>
        <h2 className="text-4xl font-bold mb-2">EMERGENCY ALERT</h2>
        <p className="text-xl mb-8 text-center px-4">New Mission Request Received</p>
        
        <div className="bg-white text-black p-6 rounded-lg shadow-2xl w-full max-w-sm mb-8 text-center">
          <p className="text-gray-500 text-sm uppercase font-bold">Location</p>
          <p className="text-2xl font-bold mt-1">{mission.location}</p>
        </div>

        <div className="flex gap-4 w-full max-w-sm">
          <button 
            onClick={declineMission}
            className="flex-1 bg-gray-900 hover:bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest"
          >
            Decline
          </button>
          <button 
            onClick={acceptMission}
            className="flex-1 bg-white text-red-600 hover:bg-gray-100 py-4 rounded-lg font-bold uppercase tracking-widest border-2 border-white shadow-lg"
          >
            ACCEPT
          </button>
        </div>
      </div>
    );
  }

  // --- 6. STANDARD DASHBOARD ---
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 
      ${status === 'online' ? 'bg-green-900' : 'bg-gray-900'}`}>
      
      {/* STATUS INDICATOR */}
      <div className="absolute top-6 right-6">
        <div className={`h-4 w-4 rounded-full ${status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
      </div>

      <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">RAPID<span className="text-red-500">RESCUE</span></h1>
      <p className="text-gray-400 mb-12 font-mono text-sm">DRIVER COCKPIT // v1.0</p>

      {/* BIG TOGGLE BUTTON */}
      <button 
        onClick={toggleStatus}
        className={`w-64 h-64 rounded-full border-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all transform hover:scale-105 active:scale-95
          ${status === 'online' 
            ? 'border-green-500 bg-green-800 text-green-100' 
            : 'border-gray-600 bg-gray-800 text-gray-400'
          }`}
      >
        <div className="text-center">
          <span className="block text-4xl font-bold mb-2">
            {status === 'online' ? 'ONLINE' : 'OFFLINE'}
          </span>
          <span className="text-xs uppercase tracking-widest opacity-70">
            {status === 'online' ? 'Searching for missions...' : 'Tap to Start Shift'}
          </span>
        </div>
      </button>

      {/* LOGOUT */}
      <button onClick={logout} className="mt-12 text-gray-500 hover:text-white underline text-sm">
        End Shift (Logout)
      </button>

    </div>
  );
}