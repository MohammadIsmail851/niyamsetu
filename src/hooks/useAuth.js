import { useEffect, useState } from 'react';
import { onAuthChange, fetchUserProfile } from '@/firebase/auth';
import { useAuthStore } from '@/store';

export const useAuth = () => {
  const { user, profile, loading, setUser, setProfile, setLoading, reset } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profile = await fetchUserProfile(firebaseUser.uid);
        setProfile(profile);
      } else {
        reset();
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, profile, loading };
};
