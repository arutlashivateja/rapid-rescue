import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  // State to track if driver is ready for duty
  const [isOnline, setIsOnline] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      
      {/* --- HEADER --- */}
      <header className="w-full max-w-md flex justify-between items-center mb-10 border-b border-gray-700 pb-4">
        <h1 className="text-xl font-bold text-red-500 tracking-wider">RAPID RESCUE</h1>
        <div className="text-right">
          <div className="text-xs text-gray-400">DRIVER PILOT</div>
          <div className="text-sm font-semibold text-white">
            {profile?.name || user?.email || "Unknown Driver"}
          </div>
        </div>
      </header>

      {/* --- MAIN CONTROLS --- */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center space-y-8">
        
        {/* Status Circle Indicator */}
        <div className={`w-56 h-56 rounded-full border-8 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-500 
          ${isOnline 
            ? 'border-green-500 bg-green-900/20 shadow-green-500/20' 
            : 'border-gray-700 bg-gray-800/50'
          }`}
        >
          <div className="text-center animate-fade-in">
            <div className={`text-4xl font-bold mb-2 ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-400">
              {isOnline ? 'Scanning for Emergencies...' : 'Standby Mode'}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full py-4 rounded-lg font-bold text-xl tracking-widest transition-all transform active:scale-95 shadow-lg
            ${isOnline 
              ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600' 
              : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/50'
            }`}
        >
          {isOnline ? 'GO OFFLINE' : 'START SHIFT'}
        </button>

      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full max-w-md mt-10 text-center">
        <button 
          onClick={handleLogout}
          className="px-6 py-2 text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
        >
          End Shift & Logout
        </button>
      </footer>
    </div>
  );
}