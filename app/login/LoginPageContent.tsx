'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Package2, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggingIn, isAuthenticated, isLoading, loginError } = useAuth();

  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string }>({});

  const sessionExpired = searchParams.get('reason') === 'session_expired';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/products');
    }
  }, [isAuthenticated, isLoading, router]);

  function validate(): boolean {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) errors.username = 'Username is required';
    if (!password.trim()) errors.password = 'Password is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLoggingIn) return;
    if (!validate()) return;

    try {
      await login(username.trim(), password);
      toast.success('Login successful', { description: 'Welcome back!' });
    } catch {
      toast.error('Login failed', {
        description: 'Please check your credentials and try again.',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-soft">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          <span className="text-sm font-medium text-slate-600">Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.09),transparent_32%)]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-slate-200/60 to-transparent" />

      <Card className="relative w-full max-w-md border-slate-200 bg-white/90 shadow-elevated backdrop-blur-sm">
        <CardHeader className="space-y-4 px-6 pt-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_18px_35px_rgba(15,23,42,0.28)] ring-4 ring-slate-100">
            <Package2 className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-[-0.04em] text-slate-900">Product Admin</CardTitle>
            <CardDescription className="mt-2 text-sm text-slate-500">
              Sign in to manage your product catalog
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-5 px-6 pb-6 pt-0">
            {sessionExpired && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Your session has expired. Please sign in again.</span>
              </div>
            )}

            {loginError && (
              <div
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{loginError.message}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-slate-700">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (validationErrors.username) {
                    setValidationErrors((p) => ({ ...p, username: undefined }));
                  }
                }}
                disabled={isLoggingIn}
                aria-invalid={!!validationErrors.username}
                aria-describedby={validationErrors.username ? 'username-error' : undefined}
                placeholder="Enter your username"
                className="transition-all duration-200"
              />
              {validationErrors.username && (
                <p id="username-error" className="text-sm text-red-600" role="alert">
                  {validationErrors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors((p) => ({ ...p, password: undefined }));
                    }
                  }}
                  disabled={isLoggingIn}
                  aria-invalid={!!validationErrors.password}
                  aria-describedby={validationErrors.password ? 'password-error' : undefined}
                  placeholder="Enter your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p id="password-error" className="text-sm text-red-600" role="alert">
                  {validationErrors.password}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-slate-200/80 px-6 py-4">
            <Button
              type="submit"
              className="w-full shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
              disabled={isLoggingIn}
              aria-busy={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            <p className="text-center text-xs text-slate-500">
              Demo credentials are pre-filled for convenience.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
