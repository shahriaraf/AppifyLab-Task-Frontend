// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDa4lrdbXBr-niQ6IQLHkhYuu9TpGYK-c",
  authDomain: "ecoistic-eb5cb.firebaseapp.com",
  projectId: "ecoistic-eb5cb",
  storageBucket: "ecoistic-eb5cb.firebasestorage.app",
  messagingSenderId: "1030972459152",
  appId: "1:1030972459152:web:f16b475893c6c11d65f015"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Create Google Auth Provider
const provider = new GoogleAuthProvider();

// EXPORT these
export { auth, provider };