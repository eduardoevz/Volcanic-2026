import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@/features/auth/api', () => ({
  signUp: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

import '@/lib/i18n';

import { signUp } from '@/features/auth/api';
import { ThemeProvider } from '@/ui/theme/ThemeContext';

import { RegisterForm } from './RegisterForm';

// Un solo test por archivo — ver nota en LoginForm.submit.test.tsx.
it('RegisterForm: con datos válidos llama a signUp y muestra el mensaje de éxito', async () => {
  (signUp as jest.Mock).mockResolvedValue({ ok: true, value: null });
  const { getByText, getByPlaceholderText } = await render(
    <ThemeProvider>
      <RegisterForm />
    </ThemeProvider>
  );

  fireEvent.changeText(getByPlaceholderText('vos@correo.com'), 'nueva@correo.com');
  fireEvent.changeText(getByPlaceholderText('mínimo 8 caracteres'), 'password123');
  fireEvent.press(getByText('Registrarme'));

  await waitFor(() => {
    expect(signUp).toHaveBeenCalledWith({ email: 'nueva@correo.com', password: 'password123' });
    expect(getByText('Cuenta creada. Iniciando sesión...')).toBeTruthy();
  });
});
