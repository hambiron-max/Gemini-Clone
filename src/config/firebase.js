import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDz98__WgzCXJWVLj1UeN8Av_wQQ98mWwI",
  authDomain: "chat-app-9b1fc.firebaseapp.com",
  projectId: "chat-app-9b1fc",
  storageBucket: "chat-app-9b1fc.firebasestorage.app",
  messagingSenderId: "680072965133",
  appId: "1:680072965133:web:07d0b3239f3becb77fb944",
  measurementId: "G-TPZBV7X054"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
