import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import your pages
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import ControlRoom from './pages/ControlRoom';

// --- 1. SECURITY GATE (For Drivers) ---
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen bg-black text-red-600 flex items-center justify-center font-bold tracking-widest animate-pulse">
        INITIALIZING SYSTEM...
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// --- 2. ADMIN GATE (FIXED: Checks 'profile' instead of 'user') ---
const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth(); // <--- Get 'profile' too

  // A. Wait for loading
  if (loading) {
    return (
      <div className="h-screen bg-black text-red-600 flex items-center justify-center font-bold tracking-widest animate-pulse">
        VERIFYING CLEARANCE...
      </div>
    );
  }

  // B. Security Check
  // 1. Must be logged in (user)
  // 2. Must have a profile (profile)
  // 3. Role must be 'admin'
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/" />; // Access Denied -> Send to Dashboard
  }

  // C. Access Granted
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<SignIn />} />
          
          {/* Protected Driver Route */}
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* Protected Admin Route */}
          <Route path="/admin" element={
            <AdminRoute>
              <ControlRoom />
            </AdminRoute>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}