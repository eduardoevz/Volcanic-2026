import { inviteSchema } from './schema';

describe('inviteSchema', () => {
  it('acepta un correo y relación válidos', () => {
    const result = inviteSchema.safeParse({ inviteEmail: 'mama@correo.com', relationship: 'mi mamá' });
    expect(result.success).toBe(true);
  });

  it('rechaza un correo inválido', () => {
    const result = inviteSchema.safeParse({ inviteEmail: 'no-es-correo', relationship: 'mi mamá' });
    expect(result.success).toBe(false);
  });

  it('rechaza una relación vacía', () => {
    const result = inviteSchema.safeParse({ inviteEmail: 'mama@correo.com', relationship: '' });
    expect(result.success).toBe(false);
  });

  it('rechaza una relación mayor a 60 caracteres', () => {
    const result = inviteSchema.safeParse({
      inviteEmail: 'mama@correo.com',
      relationship: 'x'.repeat(61),
    });
    expect(result.success).toBe(false);
  });
});
