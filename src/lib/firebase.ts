import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, onSnapshot, orderBy, limit, deleteDoc } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Helper to get user doc
export const getUserRef = (uid: string) => doc(db, "users", uid);

// Helper to get history ref
export const getHistoryRef = (uid: string, date: string) => doc(db, "users", uid, "history", date);

// Helper to get history collection
export const getHistoryCollection = (uid: string) => collection(db, "users", uid, "history");

// Helper to delete history
export const deleteHistoryDoc = (uid: string, date: string) => deleteDoc(getHistoryRef(uid, date));
