import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import '@/lib/i18n';

import { signIn } from '@/features/auth/api';
import { ThemeProvider } from '@/ui/theme/ThemeContext';

import { LoginForm } from './LoginForm';

jest.mock('@/features/auth/api', () => ({
  signIn: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Nota de implementación (RNTL 14 + React 19.2 + react-hook-form/zodResolver):
// re-usar un campo que ya pasó por un ciclo de validación async con datos
// "sucios" para un SEGUNDO cambio de texto es inestable en esta combinación
// exacta de versiones (el segundo `changeText` deja de propagarse al
// TextInput). Se evita: cada test hace como mucho UN ciclo de
// cambiar-texto→enviar sobre un montaje fresco propio.
describe('LoginForm — validación de formulario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra errores de validación con campos vacíos al enviar', async () => {
    const { getByText } = await render(
      <ThemeProvider>
        <LoginForm />
      </ThemeProvider>
    );
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(getByText('Ingresá tu correo')).toBeTruthy();
      expect(getByText('Ingresá tu contraseña')).toBeTruthy();
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it('rechaza un correo con formato inválido', async () => {
    const { getByText, getByPlaceholderText } = await render(
      <ThemeProvider>
        <LoginForm />
      </ThemeProvider>
    );
    fireEvent.changeText(getByPlaceholderText('vos@correo.com'), 'no-es-un-correo');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'x');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(getByText('Ese correo no es válido')).toBeTruthy();
    });
    expect(signIn).not.toHaveBeenCalled();
  });
});
