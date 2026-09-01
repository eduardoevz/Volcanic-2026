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
it('RegisterForm: rechaza una contraseña de menos de 8 caracteres', async () => {
  const { getByText, getByPlaceholderText } = await render(
    <ThemeProvider>
      <RegisterForm />
    </ThemeProvider>
  );

  fireEvent.changeText(getByPlaceholderText('vos@correo.com'), 'nueva@correo.com');
  fireEvent.changeText(getByPlaceholderText('mínimo 8 caracteres'), '1234567');
  fireEvent.press(getByText('Registrarme'));

  await waitFor(() => {
    expect(getByText('La contraseña debe tener al menos 8 caracteres')).toBeTruthy();
  });
  expect(signUp).not.toHaveBeenCalled();
});
