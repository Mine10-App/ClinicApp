// firebase-service.js - Secondary (named) app
import { initializeApp } from "firebase/app";

const firebaseServiceConfig = {
  apiKey: "AIzaSyAdWuyx6tI0bu5FSJelSBTrCPzAEOqM8Sc",
  authDomain: "clinicappser.firebaseapp.com",
  projectId: "clinicappser",
  storageBucket: "clinicappser.firebasestorage.app",
  messagingSenderId: "1003991615080",
  appId: "1:1003991615080:web:8ec314b79ff20a86a89ddd",
  measurementId: "G-MHKJV1L1T6"
};


const serviceApp = initializeApp(firebaseServiceConfig, "serviceApp"); // Named app

export { serviceApp };
