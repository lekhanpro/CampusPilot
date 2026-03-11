"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getFirebaseClientAuth } from "@/services/firebase-client";

const auth = getFirebaseClientAuth();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth) {
      setError("Firebase environment variables are missing. Guest mode is still available.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <div>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Resume sync, keep guest mode, or move local data into your account.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>
            <Field label="Password"><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></Field>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full gap-2" disabled={loading}>{loading ? "Signing in..." : "Sign in"}<ArrowRight className="h-4 w-4" /></Button>
          </form>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/auth/signup" className="text-primary">Create an account</Link>
            <Link href="/dashboard">Continue as guest</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}