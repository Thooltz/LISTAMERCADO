import { initializeApp, getApp } from 'firebase/app'
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

// Log Firebase config completo para validação
console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'N/A',
})

// Log projectId usando getApp() (útil para validar em produção/Vercel)
console.log('🔥 Firebase projectId:', getApp().options.projectId)
console.log('🔥 Firebase authDomain:', getApp().options.authDomain)
console.log('🔥 Firebase projectId (config):', firebaseConfig.projectId)

export default app
