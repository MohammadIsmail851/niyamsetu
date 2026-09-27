import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './index';

const googleProvider = new GoogleAuthProvider();

export const registerWithEmail = async (email, password, profile) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email,
    role: profile.role || 'business_owner',
    name: profile.name || '',
    phone: profile.phone || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
  });
  return cred.user;
};

export const loginWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const loginWithGoogle = async (role = 'business_owner') => {
  const cred = await signInWithPopup(auth, googleProvider);
  const userRef = doc(db, 'users', cred.user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: cred.user.uid,
      email: cred.user.email,
      name: cred.user.displayName || '',
      role,
      photoURL: cred.user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    });
  }
  return cred.user;
};

export const logout = () => signOut(auth);

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const fetchUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
