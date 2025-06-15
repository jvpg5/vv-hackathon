"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const currentUser = auth.getUser();
    const authenticated = auth.isAuthenticated();
    setUser(currentUser);
    setIsAuthenticated(authenticated);
  }, []);

  const handleGoToScanner = () => {
    router.push("/scanner");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/signin");
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Welcome to VV Scanner
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Your all-in-one solution for document scanning and management. 
            Quick, efficient, and reliable scanning at your fingertips.
          </p>
        </header>

        <main className="max-w-lg mx-auto">
          {isAuthenticated && user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-green-800 mb-2">Welcome back, {user.username}!</h2>
              <p className="text-green-700 text-sm">You are successfully logged in.</p>
            </div>
          )}

          <div className="bg-card rounded-lg border p-8 shadow-sm text-center">
            <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-16 h-16 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4M4 8h4m4 0V4m0 0h4m0 0v4m0 0h-4m0 0v4"
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Access our powerful document scanner to digitize your documents instantly.
            </p>
            
            <Button 
              onClick={handleGoToScanner}
              className="w-full mb-4"
              size="lg"
            >
              Go to Scanner
            </Button>

            {!isAuthenticated ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground mb-4">
                  Sign in for a personalized experience
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handleLogin}
                    variant="outline"
                    size="sm"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={handleSignup}
                    variant="outline"
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground mb-4">
                  Signed in as {user?.email}
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-lg border p-4 text-center">
              <h3 className="font-semibold mb-2">Fast Scanning</h3>
              <p className="text-sm text-muted-foreground">
                Quick and efficient document processing
              </p>
            </div>
            <div className="bg-card rounded-lg border p-4 text-center">
              <h3 className="font-semibold mb-2">High Quality</h3>
              <p className="text-sm text-muted-foreground">
                Crystal clear scans every time
              </p>
            </div>
          </div>
        </main>

        <footer className="text-center mt-16">
          <p className="text-sm text-muted-foreground">
            © 2025 VV Hackathon Scanner. Built with Next.js & Tailwind CSS.
          </p>
        </footer>
      </div>
    </div>
  );
}