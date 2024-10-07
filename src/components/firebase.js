// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzrA6refwguySxSuExiIII0cLeBIG54xI",
  authDomain: "kitto-88ca6.firebaseapp.com",
  projectId: "kitto-88ca6",
  storageBucket: "kitto-88ca6.appspot.com",
  messagingSenderId: "135260959263",
  appId: "1:135260959263:web:563e27a39b52cdf41f9b2a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;
