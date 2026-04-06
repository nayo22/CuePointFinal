import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'

type FirebaseWebConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function readWebConfig(): FirebaseWebConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
  const appId = import.meta.env.VITE_FIREBASE_APP_ID
  if (!apiKey || !projectId) return null
  return {
    apiKey,
    authDomain: authDomain ?? `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: storageBucket ?? `${projectId}.appspot.com`,
    messagingSenderId: messagingSenderId ?? '',
    appId: appId ?? '',
  }
}

let cached: FirebaseApp | null = null

export function isFirebaseConfigured(): boolean {
  return readWebConfig() != null
}

export function getFirebaseApp(): FirebaseApp {
  if (cached) return cached
  const config = readWebConfig()
  if (!config) {
    throw new Error(
      'Firebase is not configured. Add a .env file with VITE_FIREBASE_* keys (see .env.example).',
    )
  }
  cached = getApps().length > 0 ? getApps()[0] : initializeApp(config)
  return cached
}

export function initFirebaseIfConfigured(): FirebaseApp | null {
  try {
    if (!isFirebaseConfigured()) return null
    return getFirebaseApp()
  } catch {
    return null
  }
}
