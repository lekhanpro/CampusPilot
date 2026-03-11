import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { env, hasFirebaseAdminEnv } from "@/lib/env";

export function getFirebaseAdmin() {
  if (!hasFirebaseAdminEnv()) {
    return null;
  }

  const privateKey = env.firebaseAdminPrivateKey.replace(/\\n/g, "\n");

  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: env.firebaseAdminProjectId,
          clientEmail: env.firebaseAdminClientEmail,
          privateKey
        }),
        storageBucket: env.firebaseStorageBucket || undefined
      });

  return {
    auth: getAuth(app),
    db: getFirestore(app)
  };
}