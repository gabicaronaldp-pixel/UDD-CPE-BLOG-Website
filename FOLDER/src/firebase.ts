// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKq5qygiRv8cocm8wHK5aqyQyEUR3Kdl8",
  authDomain: "udd-cpe-blog.firebaseapp.com",
  databaseURL: "https://udd-cpe-blog-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "udd-cpe-blog",
  storageBucket: "udd-cpe-blog.firebasestorage.app",
  messagingSenderId: "1061674319265",
  appId: "1:1061674319265:web:1f04ee6b05574273689fe0",
  measurementId: "G-1REMCKSVQ8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
