import { supabase } from '@/lib/supabase';
import type { Database } from '@/shared/types/database.types';

type HealthCenterType = Database['public']['Enums']['health_center_type'];

const HEALTH_CENTER_LIST_FIELDS =
  'id, name, type, department, municipality, address, phone, latitude, longitude, is_verified';

const SPECIALIST_LIST_FIELDS =
  'id, full_name, specialty, health_center_id, phone, email, is_verified, health_centers(name, department, municipality)';

export async function fetchHealthCenters({
  department,
  type,
}: {
  department?: string;
  type?: HealthCenterType;
} = {}) {
  let query = supabase.from('health_centers').select(HEALTH_CENTER_LIST_FIELDS).order('name');

  if (department) query = query.eq('department', department);
  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchHealthCenterById(id: string) {
  const { data, error } = await supabase
    .from('health_centers')
    .select('*, specialists(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchSpecialists({
  specialty,
  healthCenterId,
}: {
  specialty?: string;
  healthCenterId?: string;
} = {}) {
  let query = supabase.from('specialists').select(SPECIALIST_LIST_FIELDS).order('full_name');

  if (specialty) query = query.eq('specialty', specialty);
  if (healthCenterId) query = query.eq('health_center_id', healthCenterId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
