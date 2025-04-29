import { createClient } from '@/utils/supabase/client';
import { Habitat, HabitatFormData, Satwa } from '../types';

const supabase = createClient();

export async function getHabitats(): Promise<Habitat[]> {
  const { data, error } = await supabase
    .from('habitat')
    .select('*')
    .order('nama');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getHabitatByName(nama: string): Promise<Habitat> {
  const { data, error } = await supabase
    .from('habitat')
    .select('*')
    .eq('nama', nama)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createHabitat(data: HabitatFormData): Promise<Habitat> {
  const { data: newHabitat, error } = await supabase
    .from('habitat')
    .insert([data])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Habitat dengan nama tersebut sudah terdaftar');
    }
    throw new Error(error.message);
  }
  return newHabitat;
}

export async function updateHabitat(nama: string, data: HabitatFormData): Promise<Habitat> {
  const { data: updatedHabitat, error } = await supabase
    .from('habitat')
    .update(data)
    .eq('nama', nama)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updatedHabitat;
}

export async function deleteHabitat(nama: string): Promise<void> {
  // Check if there are animals in this habitat
  const { data: animals } = await supabase
    .from('hewan')
    .select('id')
    .eq('nama_habitat', nama);

  if (animals && animals.length > 0) {
    throw new Error('Tidak dapat menghapus habitat yang masih memiliki hewan');
  }

  const { error } = await supabase
    .from('habitat')
    .delete()
    .eq('nama', nama);

  if (error) throw new Error(error.message);
}

export async function getSatwasByHabitat(habitatName: string): Promise<Satwa[]> {
  const { data, error } = await supabase
    .from('hewan')
    .select('*')
    .eq('nama_habitat', habitatName)
    .order('nama');

  if (error) throw new Error(error.message);
  return data || [];
}
