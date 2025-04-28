import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/database.types';

export type Adopter = {
  id_adopter: string;
  username_adopter: string;
  total_kontribusi: number;
  email_adopter?: string; // Optional fields that might be useful
  no_telp_adopter?: string;
  jenis_adopter: 'individu' | 'organisasi';
  profile?: {
    nama_depan?: string;
    nama_belakang?: string;
    foto_profil?: string;
  };
  // Individual-specific fields
  nik?: string;
  nama?: string;
  // Organization-specific fields
  npp?: string;
  nama_organisasi?: string;
  // Additional calculated fields
  active_adoptions?: number;
};

export class AdopterManagementService {
  private supabase;

  constructor() {
    this.supabase = createClient<Database>();
  }

  /**
   * Get all adopters with full details
   */
  async getAllAdopters(): Promise<Adopter[]> {
    try {
      // Get basic adopter data
      const { data: adopterData, error } = await this.supabase
        .from('adopter')
        .select(`
          id_adopter,
          username_adopter,
          total_kontribusi
        `);
        
      if (error) throw error;
      
      // Enhance adopter data with details
      const adoptersWithDetails = await Promise.all(
        adopterData.map(async (adopter) => {
          let adopterWithDetails: Adopter = {
            ...adopter,
            jenis_adopter: 'individu', // Default, will be updated
            active_adoptions: 0
          };

          // Check if adopter is individual
          const { data: individuData } = await this.supabase
            .from('individu')
            .select('nik, nama')
            .eq('id_adopter', adopter.id_adopter)
            .single();
            
          if (individuData) {
            adopterWithDetails = {
              ...adopterWithDetails,
              jenis_adopter: 'individu',
              nik: individuData.nik,
              nama: individuData.nama
            };
          } else {
            // Check if adopter is organization
            const { data: orgData } = await this.supabase
              .from('organisasi')
              .select('npp, nama_organisasi')
              .eq('id_adopter', adopter.id_adopter)
              .single();
              
            if (orgData) {
              adopterWithDetails = {
                ...adopterWithDetails,
                jenis_adopter: 'organisasi',
                npp: orgData.npp,
                nama_organisasi: orgData.nama_organisasi
              };
            }
          }
          
          // Get related pengunjung data for contact information
          if (adopter.username_adopter) {
            const { data: pengunjungData } = await this.supabase
              .from('pengunjung')
              .select('username_p, email, no_telp')
              .eq('username_p', adopter.username_adopter)
              .single();
              
            if (pengunjungData) {
              adopterWithDetails = {
                ...adopterWithDetails,
                email_adopter: pengunjungData.email,
                no_telp_adopter: pengunjungData.no_telp
              };
              
              // Get user profile information
              const { data: userData } = await this.supabase
                .from('pengguna')
                .select('nama_depan, nama_belakang, foto_profil')
                .eq('username', pengunjungData.username_p)
                .single();
                
              if (userData) {
                adopterWithDetails.profile = {
                  nama_depan: userData.nama_depan,
                  nama_belakang: userData.nama_belakang,
                  foto_profil: userData.foto_profil
                };
              }
            }
          }
          
          // Get count of active adoptions
          const { count } = await this.supabase
            .from('adopsi')
            .select('id_adopter', { count: 'exact', head: true })
            .eq('id_adopter', adopter.id_adopter);
          
          adopterWithDetails.active_adoptions = count || 0;
          
          return adopterWithDetails;
        })
      );
      
      return adoptersWithDetails;
    } catch (error) {
      console.error('Error fetching adopters:', error);
      throw error;
    }
  }
  
  /**
   * Get a single adopter by ID
   */
  async getAdopter(id: string): Promise<Adopter | null> {
    try {
      const { data: adopter, error } = await this.supabase
        .from('adopter')
        .select('id_adopter, username_adopter, total_kontribusi')
        .eq('id_adopter', id)
        .single();
        
      if (error) throw error;
      if (!adopter) return null;
      
      let adopterDetails: Adopter = {
        ...adopter,
        jenis_adopter: 'individu', // Default, will be updated
        active_adoptions: 0
      };
      
      // Check if individual
      const { data: individuData } = await this.supabase
        .from('individu')
        .select('nik, nama')
        .eq('id_adopter', id)
        .single();
        
      if (individuData) {
        adopterDetails = {
          ...adopterDetails,
          jenis_adopter: 'individu',
          nik: individuData.nik,
          nama: individuData.nama
        };
      } else {
        // Check if organization
        const { data: orgData } = await this.supabase
          .from('organisasi')
          .select('npp, nama_organisasi')
          .eq('id_adopter', id)
          .single();
          
        if (orgData) {
          adopterDetails = {
            ...adopterDetails,
            jenis_adopter: 'organisasi',
            npp: orgData.npp,
            nama_organisasi: orgData.nama_organisasi
          };
        }
      }
      
      // Get related pengunjung data
      if (adopter.username_adopter) {
        const { data: pengunjungData } = await this.supabase
          .from('pengunjung')
          .select('username_p, email, no_telp')
          .eq('username_p', adopter.username_adopter)
          .single();
          
        if (pengunjungData) {
          adopterDetails = {
            ...adopterDetails,
            email_adopter: pengunjungData.email,
            no_telp_adopter: pengunjungData.no_telp
          };
          
          // Get user profile information
          const { data: userData } = await this.supabase
            .from('pengguna')
            .select('nama_depan, nama_belakang, foto_profil')
            .eq('username', pengunjungData.username_p)
            .single();
            
          if (userData) {
            adopterDetails.profile = {
              nama_depan: userData.nama_depan,
              nama_belakang: userData.nama_belakang,
              foto_profil: userData.foto_profil
            };
          }
        }
      }
      
      // Get count of active adoptions
      const { count } = await this.supabase
        .from('adopsi')
        .select('id_adopter', { count: 'exact', head: true })
        .eq('id_adopter', id);
      
      adopterDetails.active_adoptions = count || 0;
      
      return adopterDetails;
    } catch (error) {
      console.error(`Error fetching adopter with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new individual adopter
   */
  async createIndividualAdopter(
    username_adopter: string,
    nik: string,
    nama: string,
    total_kontribusi: number = 0
  ) {
    try {
      // Verify pengunjung exists
      const { data: pengunjung, error: pengunjungError } = await this.supabase
        .from('pengunjung')
        .select('username_p')
        .eq('username_p', username_adopter)
        .single();
        
      if (pengunjungError || !pengunjung) {
        throw new Error(`Pengunjung with username ${username_adopter} not found`);
      }
      
      // Create adopter base record
      const { data: adopter, error: adopterError } = await this.supabase
        .from('adopter')
        .insert({
          username_adopter,
          total_kontribusi
        })
        .select()
        .single();
        
      if (adopterError) throw adopterError;
      
      // Create individu record
      const { error: individuError } = await this.supabase
        .from('individu')
        .insert({
          nik,
          nama,
          id_adopter: adopter.id_adopter
        });
        
      if (individuError) {
        // Rollback adopter creation if individu creation fails
        await this.supabase
          .from('adopter')
          .delete()
          .eq('id_adopter', adopter.id_adopter);
          
        throw individuError;
      }
      
      return { id_adopter: adopter.id_adopter };
    } catch (error) {
      console.error('Error creating individual adopter:', error);
      throw error;
    }
  }
  
  /**
   * Create a new organization adopter
   */
  async createOrganizationAdopter(
    username_adopter: string,
    npp: string,
    nama_organisasi: string,
    total_kontribusi: number = 0
  ) {
    try {
      // Verify pengunjung exists
      const { data: pengunjung, error: pengunjungError } = await this.supabase
        .from('pengunjung')
        .select('username_p')
        .eq('username_p', username_adopter)
        .single();
        
      if (pengunjungError || !pengunjung) {
        throw new Error(`Pengunjung with username ${username_adopter} not found`);
      }
      
      // Create adopter base record
      const { data: adopter, error: adopterError } = await this.supabase
        .from('adopter')
        .insert({
          username_adopter,
          total_kontribusi
        })
        .select()
        .single();
        
      if (adopterError) throw adopterError;
      
      // Create organisasi record
      const { error: orgError } = await this.supabase
        .from('organisasi')
        .insert({
          npp,
          nama_organisasi,
          id_adopter: adopter.id_adopter
        });
        
      if (orgError) {
        // Rollback adopter creation if organisasi creation fails
        await this.supabase
          .from('adopter')
          .delete()
          .eq('id_adopter', adopter.id_adopter);
          
        throw orgError;
      }
      
      return { id_adopter: adopter.id_adopter };
    } catch (error) {
      console.error('Error creating organization adopter:', error);
      throw error;
    }
  }
  
  /**
   * Update an individual adopter
   */
  async updateIndividualAdopter(
    id_adopter: string,
    data: {
      total_kontribusi?: number;
      nama?: string;
    }
  ) {
    try {
      // Verify this is an individual adopter
      const { data: individu, error: individuError } = await this.supabase
        .from('individu')
        .select('nik')
        .eq('id_adopter', id_adopter)
        .single();
        
      if (individuError || !individu) {
        throw new Error(`Individual adopter with ID ${id_adopter} not found`);
      }
      
      const updates = [];
      
      // Update adopter base record if needed
      if (data.total_kontribusi !== undefined) {
        const { error: updateError } = await this.supabase
          .from('adopter')
          .update({ total_kontribusi: data.total_kontribusi })
          .eq('id_adopter', id_adopter);
          
        if (updateError) throw updateError;
        updates.push('total_kontribusi');
      }
      
      // Update individu record if needed
      if (data.nama !== undefined) {
        const { error: updateError } = await this.supabase
          .from('individu')
          .update({ nama: data.nama })
          .eq('id_adopter', id_adopter);
          
        if (updateError) throw updateError;
        updates.push('nama');
      }
      
      return { id_adopter, updated: updates };
    } catch (error) {
      console.error(`Error updating individual adopter with ID ${id_adopter}:`, error);
      throw error;
    }
  }
  
  /**
   * Update an organization adopter
   */
  async updateOrganizationAdopter(
    id_adopter: string,
    data: {
      total_kontribusi?: number;
      nama_organisasi?: string;
    }
  ) {
    try {
      // Verify this is an organization adopter
      const { data: org, error: orgError } = await this.supabase
        .from('organisasi')
        .select('npp')
        .eq('id_adopter', id_adopter)
        .single();
        
      if (orgError || !org) {
        throw new Error(`Organization adopter with ID ${id_adopter} not found`);
      }
      
      const updates = [];
      
      // Update adopter base record if needed
      if (data.total_kontribusi !== undefined) {
        const { error: updateError } = await this.supabase
          .from('adopter')
          .update({ total_kontribusi: data.total_kontribusi })
          .eq('id_adopter', id_adopter);
          
        if (updateError) throw updateError;
        updates.push('total_kontribusi');
      }
      
      // Update organisasi record if needed
      if (data.nama_organisasi !== undefined) {
        const { error: updateError } = await this.supabase
          .from('organisasi')
          .update({ nama_organisasi: data.nama_organisasi })
          .eq('id_adopter', id_adopter);
          
        if (updateError) throw updateError;
        updates.push('nama_organisasi');
      }
      
      return { id_adopter, updated: updates };
    } catch (error) {
      console.error(`Error updating organization adopter with ID ${id_adopter}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete an adopter (and related individu/organisasi record)
   */
  async deleteAdopter(id_adopter: string) {
    try {
      // Check if adopter has active adoptions
      const { count } = await this.supabase
        .from('adopsi')
        .select('id_adopter', { count: 'exact', head: true })
        .eq('id_adopter', id_adopter);
        
      if (count && count > 0) {
        throw new Error('Cannot delete adopter with active adoptions');
      }
      
      // Check if individual or organization
      const { data: individu } = await this.supabase
        .from('individu')
        .select('nik')
        .eq('id_adopter', id_adopter)
        .single();
        
      if (individu) {
        // Delete individu record first
        const { error } = await this.supabase
          .from('individu')
          .delete()
          .eq('id_adopter', id_adopter);
          
        if (error) throw error;
      } else {
        // Try deleting organisasi record
        const { error } = await this.supabase
          .from('organisasi')
          .delete()
          .eq('id_adopter', id_adopter);
          
        if (error) throw error;
      }
      
      // Delete adopter base record
      const { error } = await this.supabase
        .from('adopter')
        .delete()
        .eq('id_adopter', id_adopter);
        
      if (error) throw error;
      
      return { success: true, message: 'Adopter deleted successfully' };
    } catch (error) {
      console.error(`Error deleting adopter with ID ${id_adopter}:`, error);
      throw error;
    }
  }

  /**
   * Get adopter's total adoptions
   */
  async getAdopterAdoptionsCount(id_adopter: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('adopsi')
        .select('id_adopter', { count: 'exact', head: true })
        .eq('id_adopter', id_adopter);
        
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error(`Error getting adoption count for adopter ${id_adopter}:`, error);
      throw error;
    }
  }
}