import { z } from 'zod';

export const inviteSchema = z.object({
  inviteEmail: z.string().min(1, 'Ingresá un correo').email('Ese correo no es válido'),
  relationship: z.string().min(1, 'Contá qué relación tienen').max(60, 'Máximo 60 caracteres'),
});

export type InviteInput = z.infer<typeof inviteSchema>;
