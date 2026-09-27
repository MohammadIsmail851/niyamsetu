import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy,
  limit, serverTimestamp, onSnapshot, Timestamp,
} from 'firebase/firestore';
import { db } from './index';

// ── Generic helpers ──────────────────────────────────────────────────────────

export const addDocument = async (collectionName, data) => {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const setDocument = async (collectionName, id, data) => {
  await setDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getDocument = async (collectionName, id) => {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getDocuments = async (collectionName, constraints = []) => {
  const q = constraints.length
    ? query(collection(db, collectionName), ...constraints)
    : collection(db, collectionName);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateDocument = async (collectionName, id, data) => {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (collectionName, id) => {
  await deleteDoc(doc(db, collectionName, id));
};

export const subscribeToCollection = (collectionName, constraints, callback) => {
  const q = constraints.length
    ? query(collection(db, collectionName), ...constraints)
    : collection(db, collectionName);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// ── ID Generator ─────────────────────────────────────────────────────────────

export const generateId = async (prefix, collectionName) => {
  const snap = await getDocs(collection(db, collectionName));
  const num = String(snap.size + 1).padStart(6, '0');
  return `${prefix}-${new Date().getFullYear()}-${num}`;
};

// Re-export Firestore helpers for use in services
export { where, orderBy, limit, serverTimestamp, Timestamp };
