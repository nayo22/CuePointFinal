import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'

type FirebaseWebConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function trimEnv(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readWebConfig(): FirebaseWebConfig | null {
  const apiKey = trimEnv(import.meta.env.VITE_FIREBASE_API_KEY)
  const authDomain = trimEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
  const projectId = trimEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID)
  const messagingSenderId = trimEnv(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  )
  const appId = trimEnv(import.meta.env.VITE_FIREBASE_APP_ID)
  if (!apiKey || !projectId || !appId) return null
  return {
    apiKey,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: `${projectId}.appspot.com`,
    messagingSenderId,
    appId,
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
      'Firebase is not configured. Copy .env.example to .env and set VITE_FIREBASE_* values.',
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
