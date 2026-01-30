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

// --- 2. ADMIN GATE (New Security Check) ---
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // A. Wait for Firebase to finish loading
  if (loading) {
    return (
      <div className="h-screen bg-black text-red-600 flex items-center justify-center font-bold tracking-widest animate-pulse">
        VERIFYING CLEARANCE...
      </div>
    );
  }

  // B. Check if User exists AND has 'admin' role
  // Note: We check user.role (from database) or user.customClaims if you used that.
  // Assuming your AuthContext merges DB data into 'user'.
  if (!user || user.role !== 'admin') {
    console.warn("Access Denied: User is not Admin");
    return <Navigate to="/" />; // Kick them back to dashboard if not admin
  }

  // C. Access Granted
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route: Login/Signup */}
          <Route path="/login" element={<SignIn />} />
          
          {/* Protected Route: Driver Cockpit (Home Page) */}
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* Protected Admin Route: Control Room */}
          <Route path="/admin" element={
            <AdminRoute>
              <ControlRoom />
            </AdminRoute>
          } />

        </Routes>
      </Router>                      // Force update v1
    </AuthProvider>
  );
}