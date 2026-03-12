"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onIdTokenChanged, signOut as firebaseSignOut } from "firebase/auth";
import { getFirebaseClientAuth } from "@/services/firebase-client";
import { adoptGuestData, ensurePreferences } from "@/services/local-store";
import { getLocalUserId, setLocalUserId } from "@/services/identity";

type AuthContextValue = {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  localUserId: string;
  isGuest: boolean;
  firebaseAvailable: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const firebaseAuth = getFirebaseClientAuth();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [localUserId, setLocalUserIdState] = useState("guest_boot");

  useEffect(() => {
    const guestId = getLocalUserId();
    setLocalUserIdState(guestId);
    ensurePreferences(guestId).finally(() => undefined);

    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(firebaseAuth, async (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        const token = await nextUser.getIdToken();
        setIdToken(token);
        await adoptGuestData(getLocalUserId(), nextUser.uid);
        setLocalUserId(nextUser.uid);
        setLocalUserIdState(nextUser.uid);
        await ensurePreferences(nextUser.uid);
      } else {
        setIdToken(null);
        const guestIdFromStorage = getLocalUserId();
        setLocalUserIdState(guestIdFromStorage);
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      idToken,
      loading,
      localUserId,
      isGuest: !user,
      firebaseAvailable: Boolean(firebaseAuth),
      signOut: async () => {
        if (firebaseAuth) {
          await firebaseSignOut(firebaseAuth);
        }
      }
    }),
    [idToken, loading, localUserId, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}