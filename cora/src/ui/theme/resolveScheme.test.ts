import { resolveScheme } from './resolveScheme';

describe('resolveScheme', () => {
  it('resuelve "system" a "light" cuando el sistema está en claro', () => {
    expect(resolveScheme('system', 'light')).toBe('light');
  });

  it('resuelve "system" a "dark" cuando el sistema está en oscuro', () => {
    expect(resolveScheme('system', 'dark')).toBe('dark');
  });

  it('resuelve "system" a "light" cuando el sistema no reporta esquema (null/undefined)', () => {
    expect(resolveScheme('system', null)).toBe('light');
    expect(resolveScheme('system', undefined)).toBe('light');
  });

  it('ignora el esquema del sistema cuando el modo es "light" fijo', () => {
    expect(resolveScheme('light', 'dark')).toBe('light');
  });

  it('ignora el esquema del sistema cuando el modo es "dark" fijo', () => {
    expect(resolveScheme('dark', 'light')).toBe('dark');
  });
});
