import { levelForPoints, pointsToNextLevel } from './level';

describe('levelForPoints', () => {
  it('nivel 1 (Semilla) de 0 a 19 puntos', () => {
    expect(levelForPoints(0)).toBe(1);
    expect(levelForPoints(19)).toBe(1);
  });

  it('frontera 19/20 sube a nivel 2 (Brote)', () => {
    expect(levelForPoints(19)).toBe(1);
    expect(levelForPoints(20)).toBe(2);
  });

  it('frontera 59/60 sube a nivel 3 (Cactus joven)', () => {
    expect(levelForPoints(59)).toBe(2);
    expect(levelForPoints(60)).toBe(3);
  });

  it('frontera 139/140 sube a nivel 4 (Cactus florecido)', () => {
    expect(levelForPoints(139)).toBe(3);
    expect(levelForPoints(140)).toBe(4);
  });

  it('frontera 279/280 sube a nivel 5 (Pitahaya)', () => {
    expect(levelForPoints(279)).toBe(4);
    expect(levelForPoints(280)).toBe(5);
  });

  it('nivel 5 no tiene techo', () => {
    expect(levelForPoints(1000)).toBe(5);
  });
});

describe('pointsToNextLevel', () => {
  it('a mitad del nivel 1 devuelve progreso 0.5 hacia el nivel 2', () => {
    const result = pointsToNextLevel(10);
    expect(result).toMatchObject({ nextLevel: 2, remaining: 10, progress: 0.5 });
  });

  it('en el nivel máximo devuelve null (no hay "siguiente")', () => {
    expect(pointsToNextLevel(280)).toBeNull();
    expect(pointsToNextLevel(500)).toBeNull();
  });

  it('justo al cruzar una frontera, el progreso arranca en 0', () => {
    const result = pointsToNextLevel(60);
    expect(result?.nextLevel).toBe(4);
    expect(result?.progress).toBe(0);
  });
});
