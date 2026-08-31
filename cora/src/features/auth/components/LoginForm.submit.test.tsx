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

// Un solo test por archivo a propósito — ver la nota en LoginForm.test.tsx:
// más de un montaje de LoginForm por archivo, tras un `fireEvent.press` de
// envío, es inestable con esta combinación exacta de versiones (RNTL 14 +
// React 19.2 + react-hook-form). Separar en archivos da a cada test su
// propio registro de módulos de Jest.
it('LoginForm: con datos válidos llama a signIn con el correo y la contraseña ingresados', async () => {
  (signIn as jest.Mock).mockResolvedValue({ ok: true, value: null });
  const { getByText, getByPlaceholderText } = await render(
    <ThemeProvider>
      <LoginForm />
    </ThemeProvider>
  );

  fireEvent.changeText(getByPlaceholderText('vos@correo.com'), 'user@correo.com');
  fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
  fireEvent.press(getByText('Entrar'));

  await waitFor(() => {
    expect(signIn).toHaveBeenCalledWith({ email: 'user@correo.com', password: 'password123' });
  });
});
