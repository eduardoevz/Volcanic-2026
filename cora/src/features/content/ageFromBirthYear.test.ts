jest.mock('@/lib/supabase', () => ({ supabase: {} }));

import { ageFromBirthYear } from './api';

describe('ageFromBirthYear', () => {
  const currentYear = new Date().getFullYear();

  it('calcula la edad a partir del año de nacimiento', () => {
    expect(ageFromBirthYear(currentYear - 25)).toBe(25);
  });

  it('sin año de nacimiento devuelve 99 (se trata como adulta, sin restricción de min_age)', () => {
    expect(ageFromBirthYear(null)).toBe(99);
    expect(ageFromBirthYear(undefined)).toBe(99);
  });

  it('con año de nacimiento 0 (falsy) también devuelve 99', () => {
    expect(ageFromBirthYear(0)).toBe(99);
  });
});
