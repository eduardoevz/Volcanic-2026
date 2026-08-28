// supabase/functions/send-push/index.ts
// Fase 19 — CORA-113. Envía un push remoto real (Expo Push API → FCM) al
// dueño de un círculo familiar cuando alguien acepta su invitación
// (src/features/family/hooks/useAcceptInvite.ts). Best-effort: la usuaria
// que acepta ya vio la confirmación en su propia pantalla, así que un fallo
// acá nunca debe bloquear ese flujo (mismo criterio que
// awardConversationPoints en cora-ai/index.ts).
//
// Diseño de seguridad: el contrato es { membershipId }, nunca un
// targetUserId directo. La función verifica con service_role que quien
// llama (JWT) es exactamente member_user_id de esa membresía y que su
// estado ya es 'accepted' — así ninguna usuaria puede disparar un push
// hacia una cuenta ajena con un membershipId inventado o ajeno.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@4';

import { corsHeaders, handleCorsPreflight } from './cors.ts';

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

const RequestSchema = z.object({
  membershipId: z.string().uuid(),
});

// Ver la misma nota en supabase/functions/embed-content/index.ts: este
// proyecto nunca definió SUPABASE_SERVICE_ROLE_KEY como secreto propio, y el
// runtime moderno ya no la auto-inyecta — el reemplazo auto-inyectado es
// SUPABASE_SECRET_KEYS (JSON, campo "default").
function getServiceRoleKey(): string {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacy) return legacy;
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeys) {
    const parsed = JSON.parse(secretKeys);
    if (parsed.default) return parsed.default;
  }
  throw new Error('no_service_role_key_available');
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();
  if (userError || !user) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }
  const parsed = RequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonResponse({ error: 'invalid_body', details: parsed.error.issues }, 400);
  }

  // service_role: necesario para leer la membresía y los tokens del OWNER,
  // que no es la usuaria autenticada — RLS normal se lo bloquearía. La
  // verificación de identidad de abajo reemplaza a RLS acá.
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, getServiceRoleKey());

  const { data: membership, error: membershipError } = await admin
    .from('family_circle_members')
    .select('id, owner_id, member_user_id, status')
    .eq('id', parsed.data.membershipId)
    .single();

  if (membershipError || !membership) {
    return jsonResponse({ error: 'not_found' }, 404);
  }
  if (membership.member_user_id !== user.id || membership.status !== 'accepted') {
    return jsonResponse({ error: 'forbidden' }, 403);
  }

  const { data: tokens } = await admin
    .from('device_push_tokens')
    .select('id, expo_push_token')
    .eq('user_id', membership.owner_id);

  if (!tokens || tokens.length === 0) {
    return jsonResponse({ sent: 0 }, 200);
  }

  try {
    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: tokens.map((t) => t.expo_push_token),
        title: 'Cora',
        body: 'Alguien se unió a tu círculo de acompañamiento.',
        sound: 'default',
      }),
    });

    const result = await response.json();
    const tickets: { status: string; details?: { error?: string } }[] = result?.data ?? [];

    // Limpieza best-effort: un token que Expo ya marcó como no registrado
    // (desinstaló la app, etc.) no debe seguir intentándose en cada evento.
    const staleTokenIds = tickets
      .map((ticket, i) => (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered' ? tokens[i]?.id : null))
      .filter((id): id is string => id !== null);
    if (staleTokenIds.length > 0) {
      await admin.from('device_push_tokens').delete().in('id', staleTokenIds);
    }

    return jsonResponse({ sent: tickets.filter((t) => t.status === 'ok').length }, 200);
  } catch {
    // Best-effort: nunca tumba el flujo de aceptar la invitación.
    return jsonResponse({ sent: 0 }, 200);
  }
});
