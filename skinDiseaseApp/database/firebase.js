import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBezcWCQasNQx6L7_fjRUof__tp3l8voxE",
  authDomain: "skincancerapp-5b2c2.firebaseapp.com",
  projectId: "skincancerapp-5b2c2",
  storageBucket: "skincancerapp-5b2c2.appspot.com",
  messagingSenderId: "803641139761",
  appId: "1:803641139761:web:d98d9e580219be61a86b10",
  measurementId: "G-07GCCWLGS1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };