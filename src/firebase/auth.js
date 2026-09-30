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
  const PROVISION_CODES = [
    'auth/user-not-found',
    'auth/invalid-credential',
    'auth/invalid-login-credentials',
  ];

  const inferRole = (email) => {
    if (email.startsWith('lmo'))   return 'lmo';
    if (email.startsWith('gatc'))  return 'gatc';
    if (email.startsWith('admin')) return 'admin';
    return 'business_owner';
  };

  const inferName = (role) => {
    const names = { lmo: 'LM Officer', gatc: 'GATC Lab', admin: 'Administrator', business_owner: 'Business Owner' };
    return names[role] || 'User';
  };

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Ensure Firestore users doc exists (may be missing for re-created accounts)
    const userRef = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const role = inferRole(email);
      await setDoc(userRef, {
        uid:  cred.user.uid,
        email,
        role,
        name:         inferName(role),
        businessName: role === 'business_owner' ? 'Demo Business' : '',
        state:        'Telangana',
        district:     'Hyderabad',
        createdAt:    serverTimestamp(),
        updatedAt:    serverTimestamp(),
        isActive:     true,
      });
    }
    return cred.user;
  } catch (err) {
    // Auto-provision demo accounts that don't exist yet
    if (PROVISION_CODES.includes(err.code)) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const role = inferRole(email);
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid:          cred.user.uid,
          email,
          role,
          name:         inferName(role),
          businessName: role === 'business_owner' ? 'Demo Business' : '',
          state:        'Telangana',
          district:     'Hyderabad',
          createdAt:    serverTimestamp(),
          updatedAt:    serverTimestamp(),
          isActive:     true,
        });
        return cred.user;
      } catch (provisionErr) {
        // If the account already exists but wrong password, rethrow original
        if (provisionErr.code === 'auth/email-already-in-use') throw err;
        throw provisionErr;
      }
    }
    throw err;
  }
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
