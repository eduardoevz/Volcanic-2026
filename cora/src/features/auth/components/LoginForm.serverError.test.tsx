import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@/features/auth/api', () => ({
  signIn: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

import '@/lib/i18n';

import { signIn } from '@/features/auth/api';
import { ThemeProvider } from '@/ui/theme/ThemeContext';

import { LoginForm } from './LoginForm';

// Ver nota en LoginForm.submit.test.tsx sobre por qué este es su propio archivo.
it('LoginForm: muestra el mensaje de error del servidor cuando signIn falla', async () => {
  (signIn as jest.Mock).mockResolvedValue({ ok: false, error: 'Correo o contraseña incorrectos.' });
  const { getByText, getByPlaceholderText } = await render(
    <ThemeProvider>
      <LoginForm />
    </ThemeProvider>
  );

  fireEvent.changeText(getByPlaceholderText('vos@correo.com'), 'user@correo.com');
  fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
  fireEvent.press(getByText('Entrar'));

  await waitFor(() => {
    expect(getByText('Correo o contraseña incorrectos.')).toBeTruthy();
  });
});
