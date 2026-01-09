// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu_ULL6kehnqPG2wzHh2AXb7jcgrmNrC8",
  authDomain: "twitter-ef533.firebaseapp.com",
  projectId: "twitter-ef533",
  storageBucket: "twitter-ef533.firebasestorage.app",
  messagingSenderId: "734516680090",
  appId: "1:734516680090:web:696838e6d812bd1eee1623"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export default app;