import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/database.types';

export type Adoption = {
  id_adopter: string;
  id_hewan: string;
  kontribusi_finansial: number;
  status_pembayaran: string;
  tgl_mulai_adopsi: string;
  tgl_berhenti_adopsi: string;
  animal_name: string;
  animal_species: string;
  animal_photo: string;
  adopter_name: string;
};

export class AdoptionManagementService {
  private supabase;
  
  constructor() {
    this.supabase = createClient();
  }
  
  /**
   * Check if user has permission to manage adoptions
   */
  async hasAdminPermission(userId: string): Promise<boolean> {
    try {
      const { data: userData } = await this.supabase
        .from('pengguna')
        .select('permission_level')
        .eq('id', userId)
        .single();
        
      // Admin level is 6 (highest)
      return userData?.permission_level === 6;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }
  
  /**
   * Get all adoptions with related information
   */
  async getAllAdoptions() {
    try {
      // First, get basic adoption data
      const { data: adoptionData, error } = await this.supabase
        .from('adopsi')
        .select(`
          id_adopter,
          id_hewan,
          kontribusi_finansial,
          status_pembayaran,
          tgl_mulai_adopsi,
          tgl_berhenti_adopsi
        `);
      
      if (error) throw error;
      
      // Further process data to get more adopter information
      const adoptionsWithDetails = await Promise.all(
        adoptionData.map(async (adoption) => {
          // Get animal details
          const { data: animalData } = await this.supabase
            .from('hewan')
            .select('id, nama, spesies, url_foto')
            .eq('id', adoption.id_hewan)
            .single();
          
          // Get adopter details
          const { data: adopterData } = await this.supabase
            .from('adopter')
            .select('id_adopter, username_adopter')
            .eq('id_adopter', adoption.id_adopter)
            .single();
            
          // Get pengunjung details if username_adopter exists
          let pengunjungData = null;
          if (adopterData?.username_adopter) {
            const { data: pengunjungResponse } = await this.supabase
              .from('pengunjung')
              .select('username_p')
              .eq('username_p', adopterData.username_adopter)
              .single();
              
            pengunjungData = pengunjungResponse;
          }
          
          // Get user details from pengguna table
          let userData = null;
          if (pengunjungData?.username_p) {
            const { data: user } = await this.supabase
              .from('pengguna')
              .select('nama_depan, nama_belakang')
              .eq('username', pengunjungData.username_p)
              .single();
              
            userData = user;
          }
          
          return {
            ...adoption,
            adopter_name: userData ? `${userData.nama_depan} ${userData.nama_belakang}` : 'Unknown',
            animal_name: animalData?.nama || 'Unknown',
            animal_species: animalData?.spesies || 'Unknown',
            animal_photo: animalData?.url_foto || '',
          };
        })
      );
      
      return adoptionsWithDetails;
    } catch (error) {
      console.error('Error fetching adoptions:', error);
      throw new Error('Failed to fetch adoptions');
    }
  }
  
  /**
   * Get adoptions for a specific user
   */
  async getUserAdoptions(userId: string) {
    try {
      // First, get the adopter_id for this user
      const { data: adopterData } = await this.supabase
        .from('pengunjung')
        .select('username_p')
        .eq('username_p', userId)
        .single();
        
      if (!adopterData) {
        throw new Error('User is not a pengunjung');
      }
      
      // Then get adopter record
      const { data: adopter } = await this.supabase
        .from('adopter')
        .select('id_adopter')
        .eq('username_adopter', adopterData.username_p)
        .single();
      
      if (!adopter) {
        return []; // User is not an adopter
      }
      
      // Get adoptions for this adopter
      const { data, error } = await this.supabase
        .from('adopsi')
        .select(`
          id_adopter,
          id_hewan,
          kontribusi_finansial,
          status_pembayaran,
          tgl_mulai_adopsi,
          tgl_berhenti_adopsi
        `)
        .eq('id_adopter', adopter.id_adopter);
        
      if (error) throw error;
      
      // Get animal details separately
      const adoptionsWithDetails = await Promise.all(
        data.map(async (adoption) => {
          const { data: animalData } = await this.supabase
            .from('hewan')
            .select('id, nama, spesies, url_foto')
            .eq('id', adoption.id_hewan)
            .single();
            
          return {
            ...adoption,
            animal_name: animalData?.nama || 'Unknown',
            animal_species: animalData?.spesies || 'Unknown',
            animal_photo: animalData?.url_foto || '',
          };
        })
      );
      
      return adoptionsWithDetails;
    } catch (error) {
      console.error('Error fetching user adoptions:', error);
      throw new Error('Failed to fetch user adoptions');
    }
  }
  
  /**
   * Create a new adoption
   */
  async createAdoption(adoptionData: {
    id_adopter: string;
    id_hewan: string;
    kontribusi_finansial: number;
    tgl_mulai_adopsi: string;
    tgl_berhenti_adopsi: string;
  }) {
    try {
      // Set initial status to "pending"
      const data = {
        ...adoptionData,
        status_pembayaran: 'pending'
      };
      
      const { error } = await this.supabase
        .from('adopsi')
        .insert(data);
        
      if (error) throw error;
      
      return { success: true, message: 'Adoption created successfully' };
    } catch (error) {
      console.error('Error creating adoption:', error);
      throw new Error('Failed to create adoption');
    }
  }
  
  /**
   * Update adoption payment status
   */
  async updateAdoptionStatus(
    adopterId: string, 
    hewanId: string, 
    status: 'Lunas' | 'Tertunda' | 'Dibatalkan' | 'Gagal'
  ) {
    try {
      const { error } = await this.supabase
        .from('adopsi')
        .update({ status_pembayaran: status })
        .match({ 
          id_adopter: adopterId,
          id_hewan: hewanId 
        });
        
      if (error) throw error;
      
      return { success: true, message: 'Adoption status updated' };
    } catch (error) {
      console.error('Error updating adoption status:', error);
      throw new Error('Failed to update adoption status');
    }
  }
  
  /**
   * Delete an adoption
   */
  async deleteAdoption(adopterId: string, hewanId: string) {
    try {
      const { error } = await this.supabase
        .from('adopsi')
        .delete()
        .match({ 
          id_adopter: adopterId,
          id_hewan: hewanId 
        });
        
      if (error) throw error;
      
      return { success: true, message: 'Adoption deleted successfully' };
    } catch (error) {
      console.error('Error deleting adoption:', error);
      throw new Error('Failed to delete adoption');
    }
  }
  
  /**
   * Get available animals for adoption
   */
  async getAvailableAnimals() {
    try {
      // Get all animals
      const { data: allAnimals, error } = await this.supabase
        .from('hewan')
        .select('id, nama, spesies, url_foto, status_kesehatan');
        
      if (error) throw error;
      
      // Get all adopted animals
      const { data: adoptedAnimals } = await this.supabase
        .from('adopsi')
        .select('id_hewan');
      
      if (error) throw error;
      else if (adoptedAnimals === null) throw error;
        
      // Filter out already adopted animals
      const adoptedIds = adoptedAnimals.map(a => a.id_hewan);
      const availableAnimals = allAnimals.filter(animal => 
        !adoptedIds.includes(animal.id) && 
        animal.status_kesehatan !== 'critical' // Exclude animals with critical health
      );
      
      return availableAnimals;
    } catch (error) {
      console.error('Error fetching available animals:', error);
      throw new Error('Failed to fetch available animals');
    }
  }
}