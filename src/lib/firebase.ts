// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrdtRhP8ATIamusMIUYoyXzDdHGOmoSeY",
  authDomain: "aura-paste.firebaseapp.com",
  projectId: "aura-paste",
  storageBucket: "aura-paste.firebasestorage.app",
  messagingSenderId: "780572961913",
  appId: "1:780572961913:web:d136a44cb867d54a88f8a8",
  measurementId: "G-3CDS0QCHF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;