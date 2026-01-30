import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // If logged in, fetch their Driver Profile
        const docRef = doc(db, "drivers", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // --- ACTIONS ---

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

 // Updated Signup: Now accepts 'vehicleNumber'
  const signup = async (email, password, name, vehicleNumber) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Save all details to the database immediately
    await setDoc(doc(db, "drivers", userCredential.user.uid), {
      email: email,
      name: name,
      vehicleNumber: vehicleNumber, // <--- SAVING IT HERE
      totalRescues: 0,              // <--- Starting at 0
      status: "offline",
      createdAt: new Date()
    });
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if this Google user already has a profile
    const docRef = doc(db, "drivers", result.user.uid);
    const docSnap = await getDoc(docRef);
    
    // If first time logging in, create their profile automatically
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        email: result.user.email,
        name: result.user.displayName,
        status: "offline",
        createdAt: new Date()
      });
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, signup, googleLogin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};