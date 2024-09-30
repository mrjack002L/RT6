// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE9lqvJFcnU2Jkd7n9Dq8iFFGajIlZf0g",
  authDomain: "todo-1266a.firebaseapp.com",
  projectId: "todo-1266a",
  storageBucket: "todo-1266a.appspot.com",
  messagingSenderId: "1064399887957",
  appId: "1:1064399887957:web:5b125ffa07bb555b81bedc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;
