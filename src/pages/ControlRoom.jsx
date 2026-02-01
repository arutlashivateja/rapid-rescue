import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase'; // Adjust path if needed
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function ControlRoom() {
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0, busy: 0 });

  // --- REAL-TIME DATABASE LISTENER ---
  useEffect(() => {
    // Connect to the 'drivers' collection
    const q = query(collection(db, "drivers"), orderBy("createdAt", "desc"));

    // onSnapshot listens for updates 24/7
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driverList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setDrivers(driverList);

      // Calculate quick stats
      const online = driverList.filter(d => d.status === 'online').length;
      const busy = driverList.filter(d => d.status === 'busy').length;
      setStats({ total: driverList.length, online, busy });
    });

    // Cleanup listener when you leave the page
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-red-600">RAPID<span className="text-white">RESCUE</span></h1>
          <p className="text-gray-400 text-sm tracking-widest mt-1">COMMAND CENTER // ADMIN ACCESS</p>
        </div>
        <div className="flex gap-6 text-sm font-mono">
          <div className="text-center">
            <span className="block text-2xl font-bold">{stats.total}</span>
            <span className="text-gray-500">FLEET SIZE</span>
          </div>
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
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-gray-400 font-mono text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4">Pilot Name</th>
              <th className="p-4">Vehicle ID</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Missions</th>
              <th className="p-4 text-right">Join Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-800/50 transition duration-150">
                <td className="p-4 font-bold">{driver.name || "Unknown Pilot"}</td>
                <td className="p-4 font-mono text-gray-400">{driver.vehicleNumber || "N/A"}</td>
                <td className="p-4">
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${driver.status === 'online' ? 'bg-green-900 text-green-300 border border-green-700' : ''}
                    ${driver.status === 'busy' ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' : ''}
                    ${driver.status === 'offline' ? 'bg-gray-700 text-gray-400' : ''}
                  `}>
                    {driver.status || "OFFLINE"}
                  </span>
                </td>
                <td className="p-4 text-right font-mono text-red-400">{driver.totalRescues || 0}</td>
                <td className="p-4 text-right text-sm text-gray-500">
                  {driver.createdAt?.toDate ? driver.createdAt.toDate().toLocaleDateString() : "Just Now"}
                </td>
              </tr>
            ))}
            
            {drivers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 italic">
                  No pilots found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}