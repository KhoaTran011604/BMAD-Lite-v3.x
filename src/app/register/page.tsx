'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { FormFieldItem } from '@/components/FormFieldItem';
import { GenericForm } from '@/components/GenericForm';
import { useAuth } from '@/context/auth';
import { registerSchema, type RegisterFormValues } from '@/shemas/registerSchema';

interface RegisterPayload {
  username: string;
  password: string;
  role: 'Manager' | 'Worker';
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formMessage, setFormMessage] = useState<string>('');

  const handleSubmit = async (values: RegisterFormValues): Promise<void> => {
    setFormMessage('');

    const requestBody: RegisterPayload = {
      username: values.username,
      password: values.password,
      role: values.role,
    };

    const result = await register(requestBody);

    if (result.success) {
      router.push('/login');
      return;
    }

    setFormMessage(result.error ?? 'Unable to register user. Please try again.');
  };

  return (
    <section className="auth-page" aria-labelledby="register-title">
      <div className="auth-page-gradient" aria-hidden="true" />
      <div className="auth-card glass-panel glass-glow-primary">
        <header className="auth-header">
          <p className="auth-eyebrow">AgriKeep Onboarding</p>
          <h1 id="register-title">Create Account</h1>
          <p className="auth-subtitle">Register a user profile and role to access inventory modules.</p>
        </header>

        <GenericForm<RegisterFormValues>
          schema={registerSchema}
          defaultValues={{
            username: '',
            password: '',
            confirmPassword: '',
            role: 'Worker',
          }}
          onSubmit={handleSubmit}
          className="auth-form"
        >
          {(form) => (
            <>
              <FormFieldItem
                label="Username"
                name="username"
                placeholder="Choose a username"
                autoComplete="username"
                required
                register={form.register('username')}
                error={form.formState.errors.username?.message}
              />

              <FormFieldItem
                label="Password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                register={form.register('password')}
                error={form.formState.errors.password?.message}
              />

              <FormFieldItem
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
                register={form.register('confirmPassword')}
                error={form.formState.errors.confirmPassword?.message}
              />

              <FormFieldItem
                label="Role"
                name="role"
                as="select"
                required
                register={form.register('role')}
                error={form.formState.errors.role?.message}
              >
                <option value="Worker">Worker</option>
                <option value="Manager">Manager</option>
              </FormFieldItem>

              {formMessage && (
                <p className="auth-feedback auth-feedback-error" role="alert" aria-live="polite">
                  {formMessage}
                </p>
              )}

              <button type="submit" className="glass-btn glass-btn-primary auth-submit-btn" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <p className="auth-switch">
                Already have an account?{' '}
                <Link href="/login" className="auth-switch-link">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </GenericForm>
      </div>
    </section>
  );
}
