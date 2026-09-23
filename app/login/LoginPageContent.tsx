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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
            <Package2 className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Product Admin</CardTitle>
            <CardDescription className="mt-1">
              Sign in to manage your product catalog
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {sessionExpired && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Your session has expired. Please sign in again.</span>
              </div>
            )}

            {loginError && (
              <div
                className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{loginError.message}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
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
              />
              {validationErrors.username && (
                <p id="username-error" className="text-sm text-red-600" role="alert">
                  {validationErrors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
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
