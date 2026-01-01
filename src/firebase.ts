// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHLDJ_YhRRJoyosH4QSCKSQ0aij4-w52U",
  authDomain: "study-planner-app-beda6.firebaseapp.com",
  projectId: "study-planner-app-beda6",
  storageBucket: "study-planner-app-beda6.firebasestorage.app",
  messagingSenderId: "852263319218",
  appId: "1:852263319218:web:a71be851791de84bcd3bab",
  measurementId: "G-HT3GBDZKEC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
