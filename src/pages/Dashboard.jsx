import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'; // Assuming you use this
import { FaPhone, FaMapMarkerAlt, FaCheck, FaSignOutAlt } from 'react-icons/fa'; // Icons

// --- CONSTANTS ---
const containerStyle = { width: '100%', height: '100%' };
const center = { lat: 17.3850, lng: 78.4867 }; // Default (Hyderabad)

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState("offline");
  const [mission, setMission] = useState(null); 

  // --- 1. LISTENER ---
  useEffect(() => {
    if (!user) return;
    const driverRef = doc(db, "drivers", user.uid);
    const unsubscribe = onSnapshot(driverRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStatus(data.status);
        
        // Check if there is an active or pending mission
        if (data.currentMission) {
          setMission(data.currentMission);
        } else {
          setMission(null);
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  // --- 2. ACTIONS ---
  const toggleStatus = async () => {
    const newStatus = status === "offline" ? "online" : "offline";
    await updateDoc(doc(db, "drivers", user.uid), { status: newStatus });
  };

  const acceptMission = async () => {
    await updateDoc(doc(db, "drivers", user.uid), { "currentMission.status": "accepted" });
  };

  const completeMission = async () => {
    if(!window.confirm("Mark mission as done?")) return;
    await updateDoc(doc(db, "drivers", user.uid), { 
      status: "online", 
      currentMission: null 
    });
  };

  const navigateToLocation = () => {
    if (mission?.lat && mission?.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${mission.lat},${mission.lng}`, '_blank');
    }
  };

  const callUser = () => {
    if (mission?.phoneNumber) {
      window.open(`tel:${mission.phoneNumber}`);
    } else {
      alert("No phone number provided");
    }
  };

  // --- 3. RENDER UI ---
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      
      {/* --- A. HEADER (ALWAYS VISIBLE) --- */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-2">
           {/* Logo / Name */}
           <div className="bg-red-600 text-white p-2 rounded-lg font-bold">RR</div>
           <h1 className="text-xl font-bold tracking-tight text-gray-800">
             RAPID<span className="text-red-600">RESCUE</span>
           </h1>
        </div>
        
        {/* Logout Icon */}
        <button onClick={logout} className="text-gray-500 hover:text-red-600 transition">
          <FaSignOutAlt size={24} />
        </button>
      </header>


      {/* --- B. MAIN CONTENT AREA --- */}
      <main className="flex-1 relative">
        
        {/* SCENARIO 1: MISSION IS ACTIVE OR PENDING */}
        {mission ? (
          <div className="absolute inset-0 z-40 bg-white flex flex-col">
            
            {/* If Pending: Show Accept Screen (Simplified) */}
            {mission.status === 'pending' && (
               <div className="flex-1 flex flex-col items-center justify-center bg-red-600 text-white animate-pulse">
                  <h2 className="text-3xl font-bold mb-4">🚨 NEW REQUEST</h2>
                  <p className="text-xl mb-8">{mission.location}</p>
                  <button onClick={acceptMission} className="bg-white text-red-600 px-10 py-4 rounded-full font-bold text-xl shadow-lg">
                    ACCEPT CALL
                  </button>
               </div>
            )}

            {/* If Accepted: Show "Call Page" with Navigate/Done/Call */}
            {mission.status === 'accepted' && (
              <div className="flex-1 flex flex-col p-6">
                
                {/* Location Info Card */}
                <div className="bg-gray-50 bg-opacity-90 p-6 rounded-xl shadow-sm border border-gray-200 mb-auto mt-4">
                  <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Destination</h3>
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-red-600 mt-1" size={24} />
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                      {mission.location || "Unknown Location"}
                    </h2>
                  </div>
                </div>

                {/* ACTION BUTTONS (Navigate, Call, Done) */}
                <div className="grid grid-cols-2 gap-4 mt-8 mb-8">
                  
                  {/* Navigate */}
                  <button 
                    onClick={navigateToLocation}
                    className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                  >
                    <FaMapMarkerAlt /> NAVIGATE
                  </button>

                  {/* Call */}
                  <button 
                    onClick={callUser}
                    className="bg-green-500 hover:bg-green-600 text-white py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                  >
                    <FaPhone /> CALL
                  </button>

                  {/* Done */}
                  <button 
                    onClick={completeMission}
                    className="bg-gray-800 hover:bg-gray-900 text-white py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                  >
                    <FaCheck /> DONE
                  </button>

                </div>
              </div>
            )}
          </div>

        ) : (
          
        /* SCENARIO 2: DEFAULT DASHBOARD (Map + Toggle) */
          <div className="w-full h-full relative">
            
            {/* The Map Background */}
            <LoadScript googleMapsApiKey="YOUR_API_KEY_HERE">
              <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
                 {/* Optional: Show driver's current location marker here */}
              </GoogleMap>
            </LoadScript>

            {/* Online/Offline Toggle (Floating at bottom) */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center pb-4">
              <button 
                onClick={toggleStatus}
                className={`
                  px-8 py-4 rounded-full font-bold text-lg shadow-2xl border-4 transition-all transform hover:scale-105
                  ${status === 'online' 
                    ? 'bg-green-500 border-white text-white' 
                    : 'bg-gray-800 border-gray-600 text-gray-400'
                  }
                `}
              >
                {status === 'online' ? 'YOU ARE ONLINE' : 'GO ONLINE'}
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}