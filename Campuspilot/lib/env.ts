export const env = {
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  firebaseMessagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  firebaseMeasurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
  firebaseAdminProjectId: process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  firebaseAdminClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebaseAdminPrivateKey: process.env.FIREBASE_PRIVATE_KEY ?? "",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
};

export function hasFirebaseClientEnv() {
  return Boolean(env.firebaseApiKey && env.firebaseAuthDomain && env.firebaseProjectId && env.firebaseAppId);
}

export function hasFirebaseAdminEnv() {
  return Boolean(env.firebaseAdminProjectId && env.firebaseAdminClientEmail && env.firebaseAdminPrivateKey);
}

export function hasGroqEnv() {
  return Boolean(env.groqApiKey);
}