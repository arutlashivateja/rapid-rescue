import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebase'; // <--- MAKE SURE THIS PATH IS CORRECT for your project

export default function Dashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Load initial status from profile when page opens
  useEffect(() => {
    if (profile?.status === 'online') {
      setIsOnline(true);
    }
  }, [profile]);

  // 2. The function that actually updates the Database
  const toggleStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    const newStatus = !isOnline; // The status we want to switch to

    try {
      // Reference to the specific driver's document in the 'users' collection
      const driverRef = doc(db, "users", user.uid);

      // Update the status field in Firestore
      await updateDoc(driverRef, {
        status: newStatus ? 'online' : 'offline',
        lastUpdated: new Date()
      });

      // Update local state (UI) only after DB success
      setIsOnline(newStatus);
      
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Check your internet connection.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      // Optional: Set offline before logging out
      if (isOnline && user) {
        await updateDoc(doc(db, "users", user.uid), { status: 'offline' });
      }
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      
      <header className="w-full max-w-md flex justify-between items-center mb-10 border-b border-gray-700 pb-4">
        <h1 className="text-xl font-bold text-red-500 tracking-wider">RAPID RESCUE</h1>
        <div className="text-right">
          <div className="text-xs text-gray-400">DRIVER PILOT</div>
          <div className="text-sm font-semibold text-white">
            {profile?.name || user?.email}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center space-y-8">
        
        {/* Status Circle */}
        <div className={`w-56 h-56 rounded-full border-8 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-500 
          ${isOnline 
            ? 'border-green-500 bg-green-900/20 shadow-green-500/20' 
            : 'border-gray-700 bg-gray-800/50'
          }`}
        >
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-400">
              {loading ? 'Updating...' : (isOnline ? 'Scanning for Emergencies...' : 'Standby Mode')}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={toggleStatus}
          disabled={loading}
          className={`w-full py-4 rounded-lg font-bold text-xl tracking-widest transition-all transform active:scale-95 shadow-lg
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            ${isOnline 
              ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600' 
              : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/50'
            }`}
        >
          {loading ? 'CONNECTING...' : (isOnline ? 'GO OFFLINE' : 'START SHIFT')}
        </button>

      </main>

      <footer className="w-full max-w-md mt-10 text-center">
        <button