import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA9YwDnZeC5erpCy6v-hmSIgwWaJFpM2c4",
  authDomain: "sourceasy-db126.firebaseapp.com",
  projectId: "sourceasy-db126",
  storageBucket: "sourceasy-db126.appspot.com",
  messagingSenderId: "169421443608",
  appId: "1:169421443608:web:3da825fa4dae36714ce96d",
  measurementId: "G-9208TSKP6T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); 