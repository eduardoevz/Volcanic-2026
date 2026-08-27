import { supabase } from '@/lib/supabase';

export async function fetchAppointments(userId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .order('scheduled_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createAppointment(input: {
  userId: string;
  title: string;
  specialistName: string | null;
  location: string | null;
  notes: string | null;
  scheduledAt: string;
  notificationIdentifier: string | null;
}) {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      user_id: input.userId,
      title: input.title,
      specialist_name: input.specialistName,
      location: input.location,
      notes: input.notes,
      scheduled_at: input.scheduledAt,
      notification_identifier: input.notificationIdentifier,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAppointmentStatus(
  id: string,
  patch: { status: 'completed' | 'cancelled'; notification_identifier: string | null }
) {
  const { error } = await supabase.from('appointments').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw error;
}
