/**
 * Firebase / Firestore config for local emulator
 * Set VITE_USE_FIRESTORE_EMULATOR=true and run Firebase emulator for local dev
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-msil'
const useEmulator = import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true'

const firebaseConfig = {
  projectId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: `${projectId}.firebaseapp.com`,
  storageBucket: `${projectId}.appspot.com`,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

if (useEmulator) {
  connectFirestoreEmulator(db, 'localhost', 8080)
}

export const SERVICE_STATION_ID = import.meta.env.VITE_SERVICE_STATION_ID || 'SS001'
export const SUB_STATION_ID = import.meta.env.VITE_SUB_STATION_ID || 'SUB001'
