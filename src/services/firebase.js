import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config"; // Importing from the secret file above

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);