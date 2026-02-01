import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase'; // Make sure this path points to your firebase file
import { collection, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Activity, Radio, ShieldAlert, MapPin, Truck, User, Zap } from 'lucide-react';

export default function Dashboard() {
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0, busy: 0 });

  // --- REAL-TIME LISTENER ---
  useEffect(() => {
    // 1. Connects to the 'drivers' collection in your Firestore
    // 2. Orders them by who joined most recently
    const q = query(collection(db, "drivers"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driverList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDrivers(driverList);
      
      // Calculate Live Stats
      const online = driverList.filter(d => d.status === 'online').length;
      const busy = driverList.filter(d => d.status === 'busy').length;
      setStats({ total: driverList.length, online, busy });
    });

    return () => unsubscribe();
  }, []);

  // --- DISPATCH FUNCTION ---
  const handleDispatch = async (driverId, driverName) => {
    const location = window.prompt(`Enter Emergency Location for ${driverName}:`);
    if (!location) return;

    try {
      const driverRef = doc(db, "drivers", driverId);
      await updateDoc(driverRef, {
        status: "busy",
        currentMission: {
          location: location,
          timestamp: serverTimestamp(),
          status: "pending"
        }
      });
      alert(`🚨 Mission sent to ${driverName}!`);
    } catch (error) {
      console.error("Error dispatching:", error);
      alert("Failed to send mission.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-red-900 selection:text-white">
      
      {/* --- HEADER --- */}
      <div className="border-b border-gray-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3">
             <div className="bg-red-900/20 p-2 rounded-lg border border-red-900/50">
                <Activity className="text-red-600 w-6 h-6 animate-pulse" />
             </div>
             <div>
                <h1 className="text-2xl font-black tracking-tighter text-white uppercase">
                  Rapid<span className="text-red-600">Rescue</span>
                </h1>
                <p className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase">
                  Central Command
                </p>
             </div>
          </div>

          {/* HUD Stats Cards */}
          <div className="flex gap-4">
             <StatCard 
                label="FLEET" 
                value={stats.total} 
                icon={<Truck className="w-4 h-4" />} 
                color="text-white" 
             />
             <StatCard 
                label="ONLINE" 
                value={stats.online} 
                icon={<Radio className="w-4 h-4" />} 
                color="text-green-500" 
                borderColor="border-green-900/50"
             />
             <StatCard 
                label="ACTIVE" 
                value={stats.busy} 
                icon={<Zap className="w-4 h-4" />} 
                color="text-yellow-500" 
                borderColor="border-yellow-900/50"
             />
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Table Container */}
        <div className="bg-gray-900/30 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-sm overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Table Head */}
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50 text-xs uppercase tracking-widest text-gray-500 font-bold">
                  <th className="p-6">Pilot Identity</th>
                  <th className="p-6">Vehicle Unit</th>
                  <th className="p-6">Live Status</th>
                  <th className="p-6 text-right">Command</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-800">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="group hover:bg-white/5 transition-colors duration-200">
                    
                    {/* Name Column */}
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 group-hover:border-gray-500 transition-colors">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{driver.name || "Unknown Pilot"}</div>
                          <div className="text-xs text-gray-600 font-mono">{driver.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Vehicle Column */}
                    <td className="p-6">
                       <div className="flex items-center gap-2 font-mono text-sm text-gray-400 bg-black/40 px-3 py-1.5 rounded w-fit border border-gray-800">
                          <Truck className="w-3 h-3" />
                          {driver.vehicleNumber || "NO-ID"}
                       </div>
                    </td>

                    {/* Status Badge Column */}
                    <td className="p-6">
                      <span className={`
                        inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                        ${driver.status === 'online' ? 'bg-green-900/20 text-green-400 border-green-900/50' : ''}
                        ${driver.status === 'busy' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50' : ''}
                        ${!driver.status || driver.status === 'offline' ? 'bg-gray-800/50 text-gray-500 border-gray-700' : ''}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${driver.status === 'online' ? 'bg-green-500 animate-pulse' : driver.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
                        {driver.status || "OFFLINE"}
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="p-6 text-right">
                      {driver.status === 'online' ? (
                        <button 
                          onClick={() => handleDispatch(driver.id, driver.name)}
                          className="group/btn relative inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-red-900/20"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>DISPATCH</span>
                        </button>
                      ) : driver.status === 'busy' ? (
                        <div className="inline-flex items-center gap-2 text-yellow-500 text-xs font-mono animate-pulse">
                           <MapPin className="w-3 h-3" />
                           ON MISSION
                        </div>
                      ) : (
                        <span className="text-gray-700 text-xs font-bold uppercase tracking-widest">Unavailable</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State Message */}
          {drivers.length === 0 && (
             <div className="p-12 text-center flex flex-col items-center justify-center opacity-40">
                <Activity className="w-12 h-12 mb-4 text-gray-500" />
                <p className="text-sm font-mono uppercase tracking-widest">System Standby... Waiting for Data</p>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}

// --- HELPER COMPONENT (For the Header Stats) ---
function StatCard({ label, value, icon, color, borderColor = "border-gray-800" }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gray-900/50 border ${borderColor} p-3 rounded-xl min-w-[80px]`}>
      <div className={`flex items-center gap-2 ${color} mb-1`}>
         {icon}
         <span className="text-xl font-bold">{value}</span>
      </div>
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  )
}