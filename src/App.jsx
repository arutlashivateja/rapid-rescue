import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import your pages
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import ControlRoom from './pages/ControlRoom'; // <--- 1. IMPORTED CONTROL ROOM

// --- SECURITY GATE ---
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen bg-black text-tesla-red flex items-center justify-center font-bold tracking-widest animate-pulse">
        INITIALIZING SECURE LINK...
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
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

          {/* 2. ADMIN ROUTE: THE CONTROL ROOM */}
          {/* You can access this by typing /admin at the end of your URL */}
          <Route path="/admin" element={<ControlRoom />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}