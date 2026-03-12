import type { FirebaseError } from "firebase/app";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/configuration-not-found": "Email/password auth is not configured in Firebase. Enable it in Firebase Console > Authentication > Sign-in method.",
  "auth/operation-not-allowed": "Email/password auth is disabled. Enable it in Firebase Console > Authentication > Sign-in method.",
  "auth/unauthorized-domain": "This domain is not authorized for Firebase Auth. Add it in Firebase Console > Authentication > Settings > Authorized domains.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-disabled": "This account is disabled.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/invalid-login-credentials": "Invalid email or password.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
  "auth/network-request-failed": "Network request failed. Check your connection and try again.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/missing-password": "Enter your password."
};

export function getFirebaseAuthErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as FirebaseError).code;
    if (code && AUTH_ERROR_MESSAGES[code]) {
      return AUTH_ERROR_MESSAGES[code];
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
