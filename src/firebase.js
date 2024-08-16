import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCAHOofXjY0-uKtKZ5mxEIdgUvZTLv_DXM",
  authDomain: "chat-react-f03ec.firebaseapp.com",
  projectId: "chat-react-f03ec",
  storageBucket: "chat-react-f03ec.appspot.com",
  messagingSenderId: "555307885892",
  appId: "1:555307885892:web:a4197acd60cb422939e311",
  measurementId: "G-EVR37DPSED"
};

// Initialize Firebase with the provided configuration
export const app = initializeApp(firebaseConfig);

// Export instances of Firebase services
export const auth = getAuth(); // For authentication
export const storage = getStorage(); // For file storage
export const db = getFirestore(); // For Firestore database
