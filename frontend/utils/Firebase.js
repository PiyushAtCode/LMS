import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY ,
  authDomain: "loginlms-cae59.firebaseapp.com",
  projectId: "loginlms-cae59",
  storageBucket: "loginlms-cae59.firebasestorage.app",
  messagingSenderId: "1066921135148",
  appId: "1:1066921135148:web:6c79d10f7d641e2e2ed589"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
export {auth,provider}