import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBbwA7bGZndjuKP6UUiaixg1ONxFUENVt0",
  authDomain: "unsch-marketplace.firebaseapp.com",
  projectId: "unsch-marketplace",
  storageBucket: "unsch-marketplace.firebasestorage.app",
  messagingSenderId: "897247292568",
  appId: "1:897247292568:web:e498e2d6a4e1fb4e3834ed"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
