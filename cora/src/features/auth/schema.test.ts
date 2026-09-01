import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './schema';

describe('loginSchema', () => {
  it('acepta correo y contraseña válidos', () => {
    expect(loginSchema.safeParse({ email: 'a@correo.com', password: 'x' }).success).toBe(true);
  });

  it('rechaza correo vacío', () => {
    expect(loginSchema.safeParse({ email: '', password: 'x' }).success).toBe(false);
  });

  it('rechaza correo con formato inválido', () => {
    expect(loginSchema.safeParse({ email: 'no-es-correo', password: 'x' }).success).toBe(false);
  });

  it('rechaza contraseña vacía', () => {
    expect(loginSchema.safeParse({ email: 'a@correo.com', password: '' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('acepta correo válido y contraseña de 8+ caracteres', () => {
    expect(registerSchema.safeParse({ email: 'a@correo.com', password: '12345678' }).success).toBe(true);
  });

  it('rechaza contraseña con menos de 8 caracteres', () => {
    expect(registerSchema.safeParse({ email: 'a@correo.com', password: '1234567' }).success).toBe(false);
  });

  it('rechaza correo inválido', () => {
    expect(registerSchema.safeParse({ email: 'no-es-correo', password: '12345678' }).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('acepta un correo válido', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@correo.com' }).success).toBe(true);
  });

  it('rechaza correo vacío', () => {
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('acepta cuando ambas contraseñas coinciden y cumplen el mínimo', () => {
    const result = resetPasswordSchema.safeParse({ password: '12345678', confirmPassword: '12345678' });
    expect(result.success).toBe(true);
  });

  it('rechaza cuando las contraseñas no coinciden', () => {
    const result = resetPasswordSchema.safeParse({ password: '12345678', confirmPassword: '87654321' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });

  it('rechaza contraseña por debajo del mínimo aunque coincidan', () => {
    const result = resetPasswordSchema.safeParse({ password: '123', confirmPassword: '123' });
    expect(result.success).toBe(false);
  });
});
