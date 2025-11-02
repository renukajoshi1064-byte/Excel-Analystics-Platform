// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth ,Auth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries




// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3NmNXRIB6hD_MMHfnLQoLIzNB07AWCeg",
  authDomain: "otplogin-68759.firebaseapp.com",
  projectId: "otplogin-68759",
  storageBucket: "otplogin-68759.firebasestorage.app",
  messagingSenderId: "752197275351",
  appId: "1:752197275351:web:275732bfa7fa7a6345aa92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth : Auth  = getAuth(app);