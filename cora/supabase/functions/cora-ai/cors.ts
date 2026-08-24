// CORS restringido a lo necesario para invocar la función desde el cliente
// (docs/PLAN_DE_IMPLEMENTACION.md §7: "CORS restringido; sin * en producción").
// La app móvil no depende de CORS (no es un navegador), pero se deja
// correctamente configurado por si alguna vez se llama desde Expo Web.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function handleCorsPreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}
