'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { FormFieldItem } from '@/components/FormFieldItem';
import { GenericForm } from '@/components/GenericForm';
import { useAuth } from '@/context/auth';
import { loginSchema, type LoginFormValues } from '@/shemas/loginSchema';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formMessage, setFormMessage] = useState<string>('');

  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    setFormMessage('');

    const result = await login(values);

    if (result.success) {
      router.push('/');
      router.refresh();
      return;
    }

    setFormMessage(result.error ?? 'Unable to sign in. Please try again.');
  };

  return (
    <section className="auth-page" aria-labelledby="login-title">
      <div className="auth-page-gradient" aria-hidden="true" />
      <div className="auth-card glass-panel glass-glow-primary">
        <header className="auth-header">
          <p className="auth-eyebrow">AgriKeep Portal</p>
          <h1 id="login-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue managing your inventory operations.</p>
        </header>

        <GenericForm<LoginFormValues>
          schema={loginSchema}
          defaultValues={{ username: '', password: '' }}
          onSubmit={handleSubmit}
          className="auth-form"
        >
          {(form) => (
            <>
              <FormFieldItem
                label="Username"
                name="username"
                placeholder="Enter your username"
                autoComplete="username"
                required
                register={form.register('username')}
                error={form.formState.errors.username?.message}
              />

              <FormFieldItem
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                register={form.register('password')}
                error={form.formState.errors.password?.message}
              />

              {formMessage && (
                <p className="auth-feedback auth-feedback-error" role="alert" aria-live="polite">
                  {formMessage}
                </p>
              )}

              <button type="submit" className="glass-btn glass-btn-primary auth-submit-btn" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <p className="auth-switch">
                Need an account?{' '}
                <Link href="/register" className="auth-switch-link">
                  Create one
                </Link>
              </p>
            </>
          )}
        </GenericForm>
      </div>
    </section>
  );
}
