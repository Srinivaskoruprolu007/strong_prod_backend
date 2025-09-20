import {z} from 'zod';

export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(255, 'Name must be less than 255 characters')
    .trim()
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
  email: z.string()
    .email('Please provide a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  role: z.enum(['user', 'admin'], {
    errorMap: () => ({ message: 'Role must be either "user" or "admin"' })
  }).default('user'),
});

export const signinSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters')
});
