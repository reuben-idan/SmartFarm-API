import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAx4cWyRyQc762CWg8nbuEEL7kecOpu38w",
  authDomain: "smartfarm-api-e7b4d.firebaseapp.com",
  projectId: "smartfarm-api-e7b4d",
  storageBucket: "smartfarm-api-e7b4d.firebasestorage.app",
  messagingSenderId: "713358372669",
  appId: "1:713358372669:web:27c0f7b527db9f98615f54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export the Firebase services
export { app, auth, db };
export default app;
