import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string({ required_error: 'Username is required' })
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string({ required_error: 'Please confirm your password' })
      .min(1, 'Please confirm your password'),
    role: z.enum(['Manager', 'Worker'], {
      errorMap: () => ({ message: 'Role must be Manager or Worker' }),
    }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Confirm password must match password',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
