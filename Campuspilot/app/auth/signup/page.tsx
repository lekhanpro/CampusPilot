"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";
import { getFirebaseClientAuth } from "@/services/firebase-client";

const auth = getFirebaseClientAuth();

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth) {
      setError("Firebase environment variables are missing. Configure them to enable sign-up.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Account created successfully.");
      router.push("/dashboard");
    } catch (authError) {
      setError(getFirebaseAuthErrorMessage(authError, "Sign-up failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <div>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Enable authenticated cloud sync on top of your offline workspace.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>
            <Field label="Password"><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} /></Field>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-success">{message}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account..." : "Create account"}</Button>
          </form>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-primary">Already have an account?</Link>
            <Link href="/dashboard">Continue as guest</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
