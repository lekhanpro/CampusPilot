import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { env, hasFirebaseClientEnv } from "@/lib/env";

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

export function getFirebaseClientApp() {
  if (!hasFirebaseClientEnv()) {
    return null;
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length
      ? getApp()
      : initializeApp({
          apiKey: env.firebaseApiKey,
          authDomain: env.firebaseAuthDomain,
          projectId: env.firebaseProjectId,
          storageBucket: env.firebaseStorageBucket,
          messagingSenderId: env.firebaseMessagingSenderId,
          appId: env.firebaseAppId,
          measurementId: env.firebaseMeasurementId || undefined
        });
  }

  return firebaseApp;
}

export function getFirebaseClientAuth() {
  const app = getFirebaseClientApp();
  if (!app) {
    return null;
  }

  if (!firebaseAuth) {
    firebaseAuth = getAuth(app);
  }

  return firebaseAuth;
}