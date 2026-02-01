import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase'; 
import { collection, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function ControlRoom() {
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0, busy: 0 });

  // --- REAL-TIME DATABASE LISTENER ---
  useEffect(() => {
    const q = query(collection(db, "drivers"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driverList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setDrivers(driverList);

      const online = driverList.filter(d => d.status === 'online').length;
      const busy = driverList.filter(d => d.status === 'busy').length;
      setStats({ total: driverList.length, online, busy });
    });

    return () => unsubscribe();
  }, []);

  // --- NEW: SEND REQUEST FUNCTION ---
  const handleDispatch = async (driverId, driverName) => {
    // 1. Ask Admin for Location
    const location = window.prompt(`Enter Emergency Location for ${driverName}:`);
    
    if (!location) return; // Stop if they clicked Cancel

    try {
      // 2. Update the Driver's Database Document
      const driverRef = doc(db, "drivers", driverId);
      
      await updateDoc(driverRef, {
        status: "busy", // Mark them as busy immediately
        currentMission: { // Add the mission details
          location: location,
          timestamp: serverTimestamp(),
          status: "pending" // Waiting for driver to accept
        }
      });

      alert(`🚨 Mission sent to ${driverName}!`);
    } catch (error) {
      console.error("Error dispatching:", error);
      alert("Failed to send mission.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-red-600">RAPID<span className="text-white">RESCUE</span></h1>
          <p className="text-gray-400 text-sm tracking-widest mt-1">COMMAND CENTER // ADMIN ACCESS</p>
        </div>
        <div className="flex gap-6 text-sm font-mono">
          <div className="text-center">
            <span className="block text-2xl font-bold text-green-500">{stats.online}</span>
            <span className="text-gray-500">ONLINE</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-yellow-500">{stats.busy}</span>
            <span className="text-gray-500">ON MISSION</span>
          </div>
        </div>
      </div>

      {/* DRIVER TABLE */}
      {/* 1. Added 'overflow-x-auto' here so you can scroll sideways on phone */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-2xl overflow-x-auto"> 
        
        {/* 2. Added 'min-w-[600px]' to force the table to stay wide enough to read */}
        <table className="w-full text-left min-w-[600px]"> 
          <thead className="bg-gray-800 text-gray-400 font-mono text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4">Pilot Name</th>
              <th className="p-4">Vehicle ID</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-800/50 transition duration-150">
                <td className="p-4 font-bold whitespace-nowrap">{driver.name || "Unknown Pilot"}</td>
                <td className="p-4 font-mono text-gray-400 whitespace-nowrap">{driver.vehicleNumber || "N/A"}</td>
                
                <td className="p-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${driver.status === 'online' ? 'bg-green-900 text-green-300 border border-green-700' : ''}
                    ${driver.status === 'busy' ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' : ''}
                    ${driver.status === 'offline' ? 'bg-gray-700 text-gray-400' : ''}
                  `}>
                    {driver.status || "OFFLINE"}
                  </span>
                </td>

                <td className="p-4 text-center whitespace-nowrap">
                  {driver.status === 'online' ? (
                    <button 
                      onClick={() => handleDispatch(driver.id, driver.name)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded shadow-[0_0_10px_rgba(220,38,38,0.5)] active:scale-95 transition-transform"
                    >
                      DISPATCH
                    </button>
                  ) : driver.status === 'busy' ? (
                    <span className="text-yellow-500 font-mono text-xs animate-pulse">MISSION ACTIVE</span>
                  ) : (
                    <span className="text-gray-600 text-xs">UNAVAILABLE</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>