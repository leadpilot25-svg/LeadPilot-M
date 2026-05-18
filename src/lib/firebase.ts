import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Ensure we have a valid config to prevent initializeApp from throwing
const getValidConfig = () => {
  if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
    console.warn('Firebase configuration is missing or invalid. Please run set_up_firebase.');
    return {
      apiKey: "placeholder",
      authDomain: "placeholder",
      projectId: "placeholder",
      storageBucket: "placeholder",
      messagingSenderId: "placeholder",
      appId: "placeholder"
    };
  }
  return firebaseConfig;
};

const firebaseConfigData = getValidConfig();
const app = initializeApp(firebaseConfigData);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfigData as any).firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  const stringified = JSON.stringify(errInfo, null, 2);
  console.error('Firestore Error:', stringified);
  throw new Error(stringified);
}

// Validation call to ensure connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Silently handle - rules might block it but it checks if server is reachable
  }
}

testConnection();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
