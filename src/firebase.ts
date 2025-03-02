// Import the required Firebase functions and types
import { initializeApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDY7gf8JsVwRwq3OC5UcP-ID_qK-f0Y5tk",
  authDomain: "taskmanager-1404c.firebaseapp.com",
  projectId: "taskmanager-1404c",
  storageBucket: "taskmanager-1404c.appspot.com", // Ensure this matches Firebase Storage
  messagingSenderId: "349988629200",
  appId: "1:349988629200:web:684eedbb889e5952e90cd5",
  measurementId: "G-V910SPH76G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

// Initialize Analytics only in browser
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Export instances for use in other files
export { app, analytics, db, auth };
