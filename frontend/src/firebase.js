import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Sonex Enterprises Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7DlkRy2Z8i8KNDC5eJix9S7n1thNZGBQ",
  authDomain: "sonex-enterprices.firebaseapp.com",
  projectId: "sonex-enterprices",
  storageBucket: "sonex-enterprices.firebasestorage.app",
  messagingSenderId: "394646360871",
  appId: "1:394646360871:web:5a76c1255efb8ed5904f02",
  measurementId: "G-HZCQ5X7JHR"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics safely for browser environment
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn("Firebase Analytics not supported in this environment:", err);
    });
}

export default app;
