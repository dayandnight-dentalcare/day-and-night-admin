"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Mock authentication: hardcoded password "admin123"
    setTimeout(() => {
      if (password === "admin123") {
        localStorage.setItem("adminAuth", "true");
        router.push("/dashboard/bookings");
      } else {
        setError("Invalid admin secret.");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-3 flex flex-col items-center text-center pb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Day & Night Dental
          </CardTitle>
          <CardDescription className="text-slate-500">
            Enter your admin secret to access the management portal.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Admin Secret</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                required
              />
              {error && <p className="text-sm text-destructive font-medium mt-1">{error}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base py-5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Mock hint */}
      <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow border text-xs text-slate-500">
        Hint: Password is <strong>admin123</strong>
      </div>
    </div>
  );
}
