import { err, ok } from '@/shared/utils/result';

describe('Result', () => {
  it('ok() produce un resultado exitoso', () => {
    const result = ok(42);
    expect(result).toEqual({ ok: true, value: 42 });
  });

  it('err() produce un resultado fallido', () => {
    const result = err('algo salió mal');
    expect(result).toEqual({ ok: false, error: 'algo salió mal' });
  });
});
