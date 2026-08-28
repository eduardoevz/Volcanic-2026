// Idéntico a supabase/functions/cora-ai/cors.ts — cada Edge Function se
// empaqueta y despliega de forma aislada, así que el archivo se duplica en
// vez de compartirse entre carpetas (mismo criterio ya aplicado en Fase 7).
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-admin-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function handleCorsPreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}
