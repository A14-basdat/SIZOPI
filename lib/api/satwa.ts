import { createClient } from '@/utils/supabase/client';
import { Satwa, SatwaFormData } from '../types';

const supabase = createClient();

export async function getSatwas(): Promise<Satwa[]> {
  const { data, error } = await supabase
    .from('hewan')
    .select('*')
    .order('nama', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getSatwaById(id: string): Promise<Satwa> {
  const { data, error } = await supabase
    .from('hewan')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createSatwa(data: SatwaFormData): Promise<Satwa> {
  // Check for duplicates first
  const { data: existingData } = await supabase
    .from('hewan')
    .select('id')
    .eq('spesies', data.spesies)
    .eq('asal_hewan', data.asal_hewan)
    .eq('tanggal_lahir', data.tanggal_lahir)
    .single();

  if (existingData) {
    throw new Error('Hewan dengan spesies, asal, dan tanggal lahir yang sama sudah terdaftar');
  }

  const { data: newSatwa, error } = await supabase
    .from('hewan')
    .insert([data])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return newSatwa;
}

export async function updateSatwa(id: string, data: SatwaFormData): Promise<Satwa> {
  const { data: updatedSatwa, error } = await supabase
    .from('hewan')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updatedSatwa;
}

export async function deleteSatwa(id: string): Promise<void> {
  const { error } = await supabase
    .from('hewan')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
