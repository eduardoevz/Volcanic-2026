// 15 departamentos + 2 regiones autónomas de Nicaragua — lista estática, no
// hay tabla propia: sirve para que el filtro tenga opciones útiles aunque
// algún departamento todavía no tenga centros sembrados.
export const NICARAGUA_DEPARTMENTS = [
  'Boaco',
  'Carazo',
  'Chinandega',
  'Chontales',
  'Estelí',
  'Granada',
  'Jinotega',
  'León',
  'Madriz',
  'Managua',
  'Masaya',
  'Matagalpa',
  'Nueva Segovia',
  'Río San Juan',
  'Rivas',
  'Costa Caribe Norte',
  'Costa Caribe Sur',
] as const;

export function useDepartments() {
  return NICARAGUA_DEPARTMENTS;
}
