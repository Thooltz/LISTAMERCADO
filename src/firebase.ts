import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC1pYXtEYxpTcx-fbpM9r6eRo8Sbflfd5s",
  authDomain: "listamercado-433c9.firebaseapp.com",
  projectId: "listamercado-433c9",
  storageBucket: "listamercado-433c9.firebasestorage.app",
  messagingSenderId: "940614097507",
  appId: "1:940614097507:web:fdf3a5f51d3a59d318b656"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
