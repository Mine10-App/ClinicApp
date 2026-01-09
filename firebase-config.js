// firebase-config.js
// IMPORTANT: Replace this configuration with your actual Firebase config
// This file should contain ONLY the configuration object

const firebaseConfig = {
    apiKey: "AIzaSyC5G36djlzBuhNEzKzrvcJ_1-qvrTm1bOs",
    authDomain: "qr-scanner-live-5b385.firebaseapp.com",
    projectId: "qr-scanner-live-5b385",
    storageBucket: "qr-scanner-live-5b385.firebasestorage.app",
    messagingSenderId: "260207453177",
    appId: "1:260207453177:web:ea438ade7b1b56270e1328",
    measurementId: "G-WQEEHEPWG3"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);
const auth = firebase.auth(app);

// Firebase Firestore rules (as per your requirement)
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /scans/{docId} {
//       allow read, write: if request.auth != null;
//     }
//   }
// }
