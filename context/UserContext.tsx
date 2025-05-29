// context/UserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserData {
  username: string;
  email: string;
  nama_depan: string;
  nama_tengah?: string;
  nama_belakang: string;
  no_telepon: string;
  role?: 'pengunjung' | 'dokter_hewan' | 'staff';
  roleData?: any;
}

interface UserContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUserData = async (userEmail: string) => {
    try {
      const { data: penggunaData, error } = await supabase
        .schema('sizopi')
        .from('Pengguna')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      // Determine user role by checking which role table has this username
      let role: 'pengunjung' | 'dokter_hewan' | 'staff' | undefined;
      let roleData = null;

      // Check if user is a pengunjung
      const { data: pengunjungData } = await supabase
        .schema('sizopi')
        .from('Pengunjung')
        .select('*')
        .eq('username_p', penggunaData.username)
        .single();

      if (pengunjungData) {
        role = 'pengunjung';
        roleData = pengunjungData;
      } else {
        // Check if user is a dokter hewan
        const { data: dokterData } = await supabase
          .schema('sizopi')
          .from('Dokter_Hewan')
          .select(`
            *,
            Spesialisasi (
              nama_spesialisasi
            )
          `)
          .eq('username_dh', penggunaData.username)
          .single();

        if (dokterData) {
          role = 'dokter_hewan';
          roleData = dokterData;
        } else {
          // Check staff tables
          const staffTables = [
            { table: 'Penjaga_Hewan', field: 'username_jh', type: 'penjaga' },
            { table: 'Staf_Admin', field: 'username_sa', type: 'admin' },
            { table: 'Pelatih_Hewan', field: 'username_lh', type: 'pelatih' }
          ];

          for (const staffTable of staffTables) {
            const { data: staffData } = await supabase
              .schema('sizopi')
              .from(staffTable.table)
              .select('*')
              .eq(staffTable.field, penggunaData.username)
              .single();

            if (staffData) {
              role = 'staff';
              roleData = { ...staffData, staff_type: staffTable.type };
              break;
            }
          }
        }
      }

      return {
        ...penggunaData,
        role,
        roleData
      };
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    if (user?.email) {
      const data = await fetchUserData(user.email);
      setUserData(data);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
  };

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        const data = await fetchUserData(session.user.email);
        setUserData(data);
      }
      
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          const data = await fetchUserData(session.user.email);
          setUserData(data);
        } else {
          setUserData(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      signOut, 
      refreshUserData 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
