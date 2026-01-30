import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Ambulance, Lock, Mail, User, AlertCircle, ArrowRight, Truck } from 'lucide-react';

export default function SignIn() {
  const { login, signup, googleLogin, user } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  
  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/'); 
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name, vehicleNumber);
      }
    } catch (err) {
      setError(err.message.replace("Firebase:", "").trim());
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await googleLogin();
    } catch (err) {
      setError("Google Sign-In Failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-tesla-black flex flex-col items-center justify-center p-6 text-tesla-silver">
      <div className="flex flex-col items-center mb-8 animate-pulse-slow">
        <div className="bg-tesla-gray p-5 rounded-2xl border border-neutral-800 mb-4 shadow-2xl shadow-tesla-red/20">
          <Ambulance className="w-12 h-12 text-tesla-red" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
          Rapid<span className="text-tesla-red">Rescue</span>
        </h1>
        <p className="text-[10px] font-bold tracking-[0.4em] text-neutral-500 mt-2 uppercase">
          {isLogin ? 'Driver Authentication' : 'New Pilot Registration'}
        </p>
      </div>

      <div className="w-full max-w-md bg-tesla-gray/50 p-8 rounded-3xl border border-neutral-800 backdrop-blur-sm">
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-900/50 text-red-500 p-3 rounded-xl flex items-center text-sm font-bold">
            <AlertCircle className="w-4 h-4 mr-2" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* REGISTRATION FIELDS */}
          {!isLogin && (
            <>
              <div className="relative group">
                <User className="absolute left-4 top-4 text-neutral-500 w-5 h-5 group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full bg-black/50 border border-neutral-700 text-white p-4 pl-12 rounded-xl focus:outline-none focus:border-tesla-red transition-all placeholder:text-neutral-600"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <Truck className="absolute left-4 top-4 text-neutral-500 w-5 h-5 group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="Vehicle Number (e.g., TS-09-AB-1234)" 
                  className="w-full bg-black/50 border border-neutral-700 text-white p-4 pl-12 rounded-xl focus:outline-none focus:border-tesla-red transition-all placeholder:text-neutral-600 uppercase"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* STANDARD FIELDS */}
          <div className="relative group">
            <Mail className="absolute left-4 top-4 text-neutral-500 w-5 h-5 group-focus-within:text-white transition-colors" />
            <input 
              type="email" 
              placeholder="Email ID" 
              className="w-full bg-black/50 border border-neutral-700 text-white p-4 pl-12 rounded-xl focus:outline-none focus:border-tesla-red transition-all placeholder:text-neutral-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-4 text-neutral-500 w-5 h-5 group-focus-within:text-white transition-colors" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-black/50 border border-neutral-700 text-white p-4 pl-12 rounded-xl focus:outline-none focus:border-tesla-red transition-all placeholder:text-neutral-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-tesla-red hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center group"
          >
            {loading ? 'Processing...' : (isLogin ? 'Initialize System' : 'Create Access ID')}
            {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        {/* --- GOOGLE BUTTON (RESTORED) --- */}
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-neutral-800"></div>
          <span className="mx-4 text-neutral-600 text-xs font-bold uppercase">Or connect via</span>
          <div className="flex-grow border-t border-neutral-800"></div>
        </div>

        <button 
          onClick={handleGoogle}
          type="button"
          className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-all active:scale-[0.98] flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google Account
        </button>
        {/* ------------------------------- */}

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-neutral-500 text-xs hover:text-white transition-colors underline decoration-neutral-800 underline-offset-4"
          >
            {isLogin ? "New Personnel? Register Here" : "Already have an ID? Login"}
          </button>
        </div>

      </div>
    </div>
  );
}