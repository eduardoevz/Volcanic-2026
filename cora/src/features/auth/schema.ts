import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Ingresá tu correo').email('Ese correo no es válido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().min(1, 'Ingresá tu correo').email('Ese correo no es válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Ingresá tu correo').email('Ese correo no es válido'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmá tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
