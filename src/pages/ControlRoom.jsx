import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Activity, Signal, Shield } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- LEAFLET ICON FIX ---
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// ------------------------

export default function ControlRoom() {
  const [drivers, setDrivers] = useState([]);

  // 1. LISTEN TO DATABASE
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "drivers"), (snapshot) => {
      const driverList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDrivers(driverList);
    });
    return () => unsubscribe();
  }, []);

  // 2. DISPATCH FUNCTION
  const sendDispatch = async (driverId) => {
    const confirmDispatch = window.confirm("🚨 ALERT: Send Emergency Signal to this Unit?");
    if (confirmDispatch) {
        try {
            await updateDoc(doc(db, "drivers", driverId), {
                currentAlert: {
                    patientLocation: { lat: 17.4065, lng: 78.4772 }, // Fake location (Charminar)
                    timestamp: new Date()
                }
            });
            alert("Signal Sent! Check Driver Dashboard.");
        } catch (error) {
            console.error("Dispatch Failed:", error);
            alert("Error sending signal.");
        }
    }
  };

  const onlineCount = drivers.filter(d => d.status === 'online').length;

  return (
    <div className="flex h-screen bg-neutral-900 text-white font-sans overflow-hidden">
      
      {/* --- LEFT: MAP --- */}
      <div className="flex-grow relative z-0">
        <MapContainer center={[17.3850, 78.4867]} zoom={12} className="h-full w-full grayscale contrast-125 invert">
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Plot Drivers */}
          {drivers.map(driver => (
            driver.location && driver.status === 'online' ? (
              <Marker key={driver.id} position={[driver.location.lat, driver.location.lng]}>
                <Popup>
                  <div className="text-black font-bold min-w-[150px]">
                    <p className="text-lg">{driver.name}</p>
                    <p className="text-xs text-gray-500 mb-3">{driver.vehicleNumber}</p>
                    
                    {/* DISPATCH BUTTON */}
                    <button 
                      onClick={() => sendDispatch(driver.id)}
                      className="w-full bg-red-600 text-white text-xs font-bold py-2 rounded hover:bg-red-700 uppercase tracking-wider shadow-lg"
                    >
                      🚨 Dispatch Unit
                    </button>
                  </div>
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>

        {/* HUD Overlay */}
        <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur p-4 rounded-xl border border-neutral-700 shadow-2xl">
          <h1 className="text-xl font-black text-white tracking-widest flex items-center">
            RAPID<span className="text-tesla-red">RESCUE</span>
            <span className="ml-2 text-[10px] bg-red-600 px-2 rounded text-white">LIVE</span>
          </h1>
          <div className="flex items-center mt-2 space-x-4 text-xs text-neutral-400 font-bold uppercase tracking-wider">
            <span className="flex items-center"><Activity className="w-3 h-3 mr-1 text-green-500" /> Systems Normal</span>
            <span className="flex items-center"><Signal className="w-3 h-3 mr-1 text-blue-500" /> {onlineCount} Active</span>
          </div>
        </div>
      </div>

      {/* --- RIGHT: SIDEBAR --- */}
      <div className="w-96 bg-tesla-black border-l border-neutral-800 flex flex-col z-10 shadow-2xl">
        <div className="p-6 border-b border-neutral-800 bg-neutral-900">
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4">Active Units</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black p-3 rounded-lg border border-neutral-800">
              <p className="text-2xl font-black text-white">{drivers.length}</p>
              <p className="text-[10px] text-neutral-500 uppercase">Total Fleet</p>
            </div>
            <div className="bg-black p-3 rounded-lg border border-neutral-800">
              <p className="text-2xl font-black text-green-500">{onlineCount}</p>
              <p className="text-[10px] text-neutral-500 uppercase">Online</p>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {drivers.map(driver => (
            <div key={driver.id} className={`p-4 rounded-xl border transition-all ${driver.status === 'online' ? 'bg-neutral-800 border-l-4 border-l-green-500 border-neutral-700' : 'bg-black/50 border-neutral-900 opacity-50'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-sm">{driver.name || 'Unknown Pilot'}</h3>
                  <p className="text-xs text-neutral-500 mt-1 flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    {driver.vehicleNumber || 'No ID'}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${driver.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-900'}`}></div>
              </div>
              
              {/* Sidebar Dispatch Button */}
              {driver.status === 'online' && (
                  <button 
                    onClick={() => sendDispatch(driver.id)}
                    className="mt-3 w-full bg-red-900/30 border border-red-900 text-red-500 hover:bg-red-900 hover:text-white text-[10px] font-bold py-1 rounded uppercase transition-colors"
                  >
                    Send Signal
                  </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}