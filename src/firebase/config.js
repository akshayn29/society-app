import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDV8tkbeW_vO6CruC2Ki_AOTEskCBk-cyg",
  authDomain: "society-app-ac3b6.firebaseapp.com",
  projectId: "society-app-ac3b6",
  storageBucket: "society-app-ac3b6.firebasestorage.app",
  messagingSenderId: "444593253824",
  appId: "1:444593253824:web:8ba6f20f43c46fa2b3ec25"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
