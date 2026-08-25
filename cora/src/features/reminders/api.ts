import { supabase } from '@/lib/supabase';

export async function fetchReminders(userId: string) {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createReminder(input: {
  userId: string;
  title: string;
  hour: number;
  minute: number;
  notificationIdentifier: string;
}) {
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: input.userId,
      title: input.title,
      hour: input.hour,
      minute: input.minute,
      is_active: true,
      notification_identifier: input.notificationIdentifier,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReminderState(
  id: string,
  patch: { is_active: boolean; notification_identifier: string | null }
) {
  const { error } = await supabase.from('reminders').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteReminder(id: string) {
  const { error } = await supabase.from('reminders').delete().eq('id', id);
  if (error) throw error;
}
