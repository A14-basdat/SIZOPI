"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

// Types for our role-based registration
export type UserRole = 'pengunjung' | 'dokter_hewan' | 'staff' | 'adopter';

export interface BaseUserData {
  username: string;
  email: string;
  password: string;
  nama_depan: string;
  nama_tengah?: string;
  nama_belakang: string;
  no_telepon: string;
}

// Enhanced user profile interface for detailed information
export interface UserProfile extends BaseUserData {
  role: UserRole;
  roleSpecificData?: {
    // For pengunjung
    alamat?: string;
    tgl_lahir?: string;
    
    // For dokter_hewan
    no_str?: string;
    spesialisasi?: string[];
    
    // For staff
    id_staf?: string;
    peran?: string;
  };
}

// Generate UUID for staff ID
const generateStaffId = (): string => {
  return randomUUID();
};

// Enhanced session management with user data
const createSession = async (username: string, role: UserRole, userData?: any) => {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify({ 
    username, 
    role, 
    timestamp: Date.now(),
    userData: userData || null
  });
  cookieStore.set('session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  });
};

const destroySession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('session');
};

// Enhanced function to get complete user profile from database
export const getUserProfile = async (username: string): Promise<UserProfile | null> => {
  try {
    const supabase = await createClient();
    let role: UserRole = 'pengunjung'; // Initialize with default
    let roleSpecificData: any = {}; // Initialize empty object

    console.log('=== FETCHING USER PROFILE ===');
    console.log('Username:', username);

    // Get basic user data from pengguna table
    const { data: userData, error: userError } = await supabase
      .schema('sizopi')
      .from('pengguna')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      console.error('User data fetch error:', userError);
      return null;
    }

    console.log('Basic user data fetched:', userData);

    // Check pengunjung first
    const { data: pengunjungData, error: pengunjungError } = await supabase
      .schema('sizopi')
      .from('pengunjung')
      .select('*')
      .eq('username_p', username)
      .single();

    if (pengunjungData) {
      // Check adopter
      const { data: adopterData } = await supabase
        .schema('sizopi')
        .from('adopter')
        .select('*')
        .eq('username_adopter', username)
        .single();

      if (adopterData) role = 'adopter';
      else role = 'pengunjung';
      roleSpecificData = {
        alamat: pengunjungData.alamat,
        tgl_lahir: pengunjungData.tgl_lahir
      };
      console.log('Pengunjung data:', roleSpecificData);
    } else {
      // Check dokter_hewan
      const { data: dokterData } = await supabase
        .schema('sizopi')
        .from('dokter_hewan')
        .select('*')
        .eq('username_dh', username)
        .single();

      if (dokterData) {
        role = 'dokter_hewan';
        roleSpecificData = {
          no_str: dokterData.no_str
        };

        // Get specializations
        const { data: spesialisasiData } = await supabase
          .schema('sizopi')
          .from('spesialisasi')
          .select('nama_spesialisasi')
          .eq('username_sh', username);

        roleSpecificData.spesialisasi = spesialisasiData?.map(s => s.nama_spesialisasi) || [];
        console.log('Dokter data:', roleSpecificData);
      } else {
        // Check staff tables
        const { data: penjagaData } = await supabase
          .schema('sizopi')
          .from('penjaga_hewan')
          .select('*')
          .eq('username_jh', username)
          .single();

        const { data: adminData } = await supabase
          .schema('sizopi')
          .from('staf_admin')
          .select('*')
          .eq('username_sa', username)
          .single();

        const { data: pelatihData } = await supabase
          .schema('sizopi')
          .from('pelatih_hewan')
          .select('*')
          .eq('username_lh', username)
          .single();

        if (penjagaData) {
          role = 'staff';
          roleSpecificData = {
            id_staf: penjagaData.id_staf,
            peran: 'penjaga'
          };
        } else if (adminData) {
          role = 'staff';
          roleSpecificData = {
            id_staf: adminData.id_staf,
            peran: 'admin'
          };
        } else if (pelatihData) {
          role = 'staff';
          roleSpecificData = {
            id_staf: pelatihData.id_staf,
            peran: 'pelatih'
          };
        } else {
          console.error('No role found for user');
          return null;
        }
        console.log('Staff data:', roleSpecificData);
      }
    }

    const userProfile: UserProfile = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      nama_depan: userData.nama_depan,
      nama_tengah: userData.nama_tengah,
      nama_belakang: userData.nama_belakang,
      no_telepon: userData.no_telepon,
      role: role,
      roleSpecificData
    };

    console.log('✅ Complete user profile assembled:', userProfile);
    return userProfile;

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Function to get user role-specific information
export const getUserRoleInfo = async (username: string) => {
  const profile = await getUserProfile(username);
  if (!profile) return null;

  return {
    role: profile.role,
    displayName: profile.nama_tengah 
      ? `${profile.nama_depan} ${profile.nama_tengah} ${profile.nama_belakang}`
      : `${profile.nama_depan} ${profile.nama_belakang}`,
    roleSpecificData: profile.roleSpecificData
  };
};
export const signUpAction = async (formData: FormData) => {
  const supabase = await createClient();
  
  // Get basic user data
  const username = formData.get("username")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();
  const nama_depan = formData.get("nama_depan")?.toString();
  const nama_tengah = formData.get("nama_tengah")?.toString() || null;
  const nama_belakang = formData.get("nama_belakang")?.toString();
  const no_telepon = formData.get("no_telepon")?.toString();
  const role = formData.get("role")?.toString() as UserRole;

  console.log('=== REGISTRATION PROCESS START ===');
  console.log('User Data:', { username, email, role, nama_depan, nama_belakang });

  // Validation
  if (!username || !email || !password || !confirmPassword || !nama_depan || !nama_belakang || !no_telepon || !role) {
    return encodedRedirect("error", "/sign-up", "All required fields must be filled");
  }

  if (password !== confirmPassword) {
    return encodedRedirect("error", "/sign-up", "Passwords do not match");
  }

  if (password.length < 6) {
    return encodedRedirect("error", "/sign-up", "Password must be at least 6 characters");
  }

  try {
    console.log('=== PREPARING ROLE-SPECIFIC DATA ===');
    
    // Prepare role-specific data
    let roleData: any = {};
    
    switch (role) {
      case 'pengunjung':
        const alamat = formData.get("alamat")?.toString();
        const tgl_lahir = formData.get("tgl_lahir")?.toString();
        
        if (!alamat || !tgl_lahir) {
          return encodedRedirect("error", "/sign-up", "Address and birth date are required for visitors");
        }

        roleData = {
          alamat,
          tgl_lahir
        };
        break;

      case 'dokter_hewan':
        const no_str = formData.get("no_str")?.toString();
        const spesialisasiArray = formData.getAll("spesialisasi");
        
        if (!no_str || spesialisasiArray.length === 0) {
          return encodedRedirect("error", "/sign-up", "Professional certification number and specialization are required");
        }

        roleData = {
          no_str,
          spesialisasi: spesialisasiArray.filter(spec => spec && spec.toString().trim() !== '')
        };
        break;

      case 'staff':
        const peran = formData.get("peran")?.toString();
        
        if (!peran) {
          return encodedRedirect("error", "/sign-up", "Staff role is required");
        }

        // Generate UUID for staff ID
        const staffId = generateStaffId();
        roleData = {
          peran,
          id_staf: staffId
        };
        break;

      default:
        return encodedRedirect("error", "/sign-up", "Invalid role selected");
    }

    console.log('Role-specific data prepared:', roleData);

    console.log('=== CALLING STORED PROCEDURE FOR REGISTRATION ===');
    
    // Call the stored procedure for user registration with schema specification
    const { data, error } = await supabase
      .schema('sizopi')
      .rpc('register_user_with_role', {
        p_username: username,
        p_email: email,
        p_password: password,
        p_nama_depan: nama_depan,
        p_nama_tengah: nama_tengah,
        p_nama_belakang: nama_belakang,
        p_no_telepon: no_telepon,
        p_role: role,
        p_role_data: roleData
      });

    if (error) {
      console.error('=== STORED PROCEDURE ERROR ===', error);
      
      let errorMessage = error.message;
      
      console.log('=== RETURNING ERROR MESSAGE TO FRONTEND ===');
      console.log('Error message:', errorMessage);
      
      return encodedRedirect("error", "/sign-up", errorMessage);
    }

    console.log('=== REGISTRATION COMPLETED SUCCESSFULLY ===');
    console.log('Stored procedure result:', data);
    
    return encodedRedirect("success", "/sign-in", "Registration successful! Please sign in with your credentials.");

  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      console.log('=== REDIRECT INITIATED (Normal Next.js behavior) ===');
      throw error; 
    }
    
    console.error('=== REGISTRATION ERROR ===', error);
    
    // Handle any other errors
    if (error instanceof Error) {
      console.log('=== RETURNING CATCH ERROR MESSAGE TO FRONTEND ===');
      console.log('Error message:', error.message);
      return encodedRedirect("error", "/sign-up", error.message);
    }
    
    return encodedRedirect("error", "/sign-up", "Registration failed. Please try again.");
  }
};

export const signInAction = async (formData: FormData) => {
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  console.log('=== LOGIN PROCESS START ===');
  console.log('Login attempt with identifier:', identifier);

  if (!identifier || !password) {
    return encodedRedirect("error", "/sign-in", "Username/Email and password are required");
  }

  try {
    console.log('=== DATABASE AUTHENTICATION QUERIES ===');
    
    let userData: any;
    let username: string;
    
    // Determine if identifier is email or username
    const isEmail = identifier.includes('@');
    console.log('Identifier type:', isEmail ? 'EMAIL' : 'USERNAME');

    if (isEmail) {
      // Login with email
      console.log('Querying PENGGUNA table by email...');
      const { data, error: userError } = await supabase
        .schema('sizopi')
        .from('pengguna')
        .select('username, email, password')
        .eq('email', identifier)
        .single();

      console.log('Email query result:', { found: !!data, error: userError?.message });

      if (userError || !data) {
        return encodedRedirect("error", "/sign-in", "Invalid email or password");
      }
      
      userData = data;
      username = userData.username;
    } else {
      // Login with username
      console.log('Querying PENGGUNA table by username...');
      const { data, error: userError } = await supabase
        .schema('sizopi')
        .from('pengguna')
        .select('username, email, password')
        .eq('username', identifier)
        .single();

      console.log('Username query result:', { found: !!data, error: userError?.message });

      if (userError || !data) {
        return encodedRedirect("error", "/sign-in", "Invalid username or password");
      }
      
      userData = data;
      username = userData.username;
    }

    console.log('=== LOGIN VERIFICATION SUCCESSFUL ===');
    console.log('User authenticated:', username);

    console.log('=== DETERMINING USER ROLE ===');
    
    // Get user role using stored procedure with schema specification
    const { data: roleData, error: roleError } = await supabase
      .schema('sizopi')
      .rpc('get_user_role', { p_username: username });

    if (roleError || !roleData || roleData.length === 0) {
      console.error('Role determination error:', roleError);
      return encodedRedirect("error", "/sign-in", "User role not found");
    }

    const roleInfo = roleData[0];
    const userRole = roleInfo.role_type as UserRole;
    const roleDetails = roleInfo.role_details;

    console.log('✅ User role identified:', userRole);
    console.log('Role details:', roleDetails);

    console.log('=== FETCHING COMPLETE USER PROFILE ===');
    // Get complete user profile for session
    const userProfile = await getUserProfile(username);
    
    console.log('=== CREATING USER SESSION ===');
    // Create session with user profile data
    await createSession(username, userRole, userProfile);
    console.log('✅ Session created successfully with user profile');

    console.log('=== LOGIN COMPLETED SUCCESSFULLY ===');
    console.log('✅ Determining redirect based on role...');

    // Role-based redirect logic
    let redirectPath = "/protected"; // Default fallback

    switch (userRole) {
      case 'pengunjung':
        redirectPath = "/protected/dashboard/pengunjung";
        break;
      case 'dokter_hewan':
        redirectPath = "/protected/dashboard/dokter-hewan";
        break;
      case 'staff':
        // For staff, we need to check their specific role
        const staffRole = roleDetails?.peran;
        console.log('Staff role detected:', staffRole);
        
        switch (staffRole) {
          case 'penjaga':
            redirectPath = "/protected/dashboard/penjaga-hewan";
            break;
          case 'admin':
            redirectPath = "/protected/dashboard/staf-administrasi";
            break;
          case 'pelatih':
            redirectPath = "/protected/dashboard/staf-pelatih";
            break;
          default:
            console.log('Unknown staff role, using default protected page');
            redirectPath = "/protected";
        }
        break;
      default:
        console.log('Unknown user role, using default protected page');
        redirectPath = "/protected";
    }

    console.log('Redirecting to:', redirectPath);
    return redirect(redirectPath);

  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      console.log('=== REDIRECT INITIATED (Normal Next.js behavior) ===');
      throw error; 
    }
    
    console.error('=== LOGIN ERROR ===', error);
    
    // Handle any other errors
    if (error instanceof Error) {
      console.log('=== RETURNING CATCH ERROR MESSAGE TO FRONTEND ===');
      console.log('Error message:', error.message);
      return encodedRedirect("error", "/sign-in", error.message);
    }
    
    return encodedRedirect("error", "/sign-in", "Sign in failed. Please try again.");
  }
};




export const signOutAction = async () => {
  console.log('=== LOGOUT PROCESS START ===');
  await destroySession();
  console.log('✅ Session destroyed successfully');
  console.log('Redirecting to sign-in page...');
  return redirect("/sign-in");
};

// Enhanced session function with user data
export const getCurrentSession = async () => {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - sessionData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionAge > maxAge) {
      await destroySession();
      return null;
    }

    return {
      username: sessionData.username,
      role: sessionData.role as UserRole,
      userData: sessionData.userData || null
    };
  } catch (error) {
    console.error('Session parsing error:', error);
    return null;
  }
};

// Function to refresh user data in session (useful after profile updates)
export const refreshUserSession = async (username: string) => {
  const currentSession = await getCurrentSession();
  if (!currentSession) return false;

  const updatedProfile = await getUserProfile(username);
  if (!updatedProfile) return false;

  await createSession(username, updatedProfile.role, updatedProfile);
  return true;
};

// Function to get visit history for a pengunjung from reservasi table
export const getVisitHistory = async (username: string) => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching visit history for:', username);
    
    // First, get reservations for the user
    const { data: reservations, error: reservasiError } = await supabase
      .schema('sizopi')
      .from('reservasi')
      .select('*')
      .eq('username_p', username)
      .order('tanggal_kunjungan', { ascending: false });

    if (reservasiError) {
      console.error('Error fetching reservations:', reservasiError);
      return [];
    }

    if (!reservations || reservations.length === 0) {
      console.log('No visit history found for user:', username);
      return [];
    }

    // Get unique facility names using Array.from instead of spread operator
    const facilityNames = Array.from(new Set(reservations.map(r => r.nama_fasilitas)));
    
    // Get facility details
    const { data: facilities, error: fasilitasError } = await supabase
      .schema('sizopi')
      .from('fasilitas')
      .select('nama, jadwal, kapasitas_max')
      .in('nama', facilityNames);

    if (fasilitasError) {
      console.error('Error fetching facilities:', fasilitasError);
    }

    // Create a map for quick lookup
    const facilityMap = new Map();
    if (facilities) {
      facilities.forEach(facility => {
        facilityMap.set(facility.nama, {
          jadwal: facility.jadwal,
          kapasitas_max: facility.kapasitas_max
        });
      });
    }

    // Transform reservations to visit history format
    const visitHistory = reservations.map((reservation, index) => {
      const facilityInfo = facilityMap.get(reservation.nama_fasilitas);
      return {
        id: index + 1,
        nama_fasilitas: reservation.nama_fasilitas,
        tanggal_kunjungan: reservation.tanggal_kunjungan,
        jumlah_tiket: reservation.jumlah_tiket,
        status: reservation.status,
        jadwal: facilityInfo?.jadwal || null,
        kapasitas_max: facilityInfo?.kapasitas_max || null
      };
    });

    console.log('✅ Visit history fetched successfully:', visitHistory);
    return visitHistory;
    
  } catch (error) {
    console.error('Error fetching visit history:', error);
    return [];
  }
};
// Function to get purchased tickets for a pengunjung from reservasi table
export const getPurchasedTickets = async (username: string) => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching purchased tickets for:', username);
    
    // First, get reservations for the user
    const { data: reservations, error: reservasiError } = await supabase
      .schema('sizopi')
      .from('reservasi')
      .select('*')
      .eq('username_p', username)
      .order('tanggal_kunjungan', { ascending: false });

    if (reservasiError) {
      console.error('Error fetching reservations:', reservasiError);
      return [];
    }

    if (!reservations || reservations.length === 0) {
      console.log('No purchased tickets found for user:', username);
      return [];
    }

    // Get unique facility names using Array.from instead of spread operator
    const facilityNames = Array.from(new Set(reservations.map(r => r.nama_fasilitas)));
    
    // Get facility details
    const { data: facilities, error: fasilitasError } = await supabase
      .schema('sizopi')
      .from('fasilitas')
      .select('nama, jadwal, kapasitas_max')
      .in('nama', facilityNames);

    if (fasilitasError) {
      console.error('Error fetching facilities:', fasilitasError);
    }

    // Create a map for quick lookup
    const facilityMap = new Map();
    if (facilities) {
      facilities.forEach(facility => {
        facilityMap.set(facility.nama, {
          jadwal: facility.jadwal,
          kapasitas_max: facility.kapasitas_max
        });
      });
    }

    // Transform reservations to purchased tickets format
    const purchasedTickets = reservations.map((reservation, index) => {
      const facilityInfo = facilityMap.get(reservation.nama_fasilitas);
      return {
        id: index + 1,
        nama_fasilitas: reservation.nama_fasilitas,
        tanggal_kunjungan: reservation.tanggal_kunjungan,
        jumlah_tiket: reservation.jumlah_tiket,
        status: reservation.status,
        jadwal: facilityInfo?.jadwal || null,
        kapasitas_max: facilityInfo?.kapasitas_max || null
      };
    });

    console.log('✅ Purchased tickets fetched successfully:', purchasedTickets);
    return purchasedTickets;
    
  } catch (error) {
    console.error('Error fetching purchased tickets:', error);
    return [];
  }
};


export const getVeterinarianMedicalRecords = async (username: string) => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching medical records for veterinarian:', username);
    
    // First verify the user is a veterinarian
    const { data: vetData, error: vetError } = await supabase
      .schema('sizopi')
      .from('dokter_hewan')
      .select('username_dh')
      .eq('username_dh', username)
      .single();

    if (vetError || !vetData) {
      console.error('User is not a veterinarian:', vetError);
      return [];
    }

    // Get medical records for this veterinarian
    const { data: medicalRecords, error: recordsError } = await supabase
      .schema('sizopi')
      .from('catatan_medis')
      .select('*')
      .eq('username_dh', username)
      .order('tanggal_pemeriksaan', { ascending: false });

    if (recordsError) {
      console.error('Error fetching medical records:', recordsError);
      return [];
    }

    if (!medicalRecords || medicalRecords.length === 0) {
      console.log('No medical records found for veterinarian:', username);
      return [];
    }

    console.log('Raw medical records:', medicalRecords);

    // Get unique animal IDs
    const animalIds = Array.from(new Set(medicalRecords.map(record => record.id_hewan)));
    
    // Fetch animal information separately
    const { data: animals, error: animalError } = await supabase
      .schema('sizopi')
      .from('hewan')
      .select('id, nama')
      .in('id', animalIds);

    if (animalError) {
      console.error('Error fetching animal data:', animalError);
    }

    console.log('Animal data:', animals);

    // Create a map for quick animal lookup
    const animalMap = new Map();
    if (animals) {
      animals.forEach(animal => {
        animalMap.set(animal.id, animal.nama);
      });
    }

    // Transform the data to match our interface
    const transformedRecords = medicalRecords.map(record => ({
      id_hewan: record.id_hewan,
      animalName: animalMap.get(record.id_hewan) || 'Unknown Animal',
      tanggal_pemeriksaan: record.tanggal_pemeriksaan,
      diagnosis: record.diagnosis,
      pengobatan: record.pengobatan,
      status_kesehatan: record.status_kesehatan,
      catatan_tindak_lanjut: record.catatan_tindak_lanjut
    }));

    console.log('✅ Medical records fetched successfully:', transformedRecords.length, 'records');
    console.log('Transformed records:', transformedRecords);
    return transformedRecords;
    
  } catch (error) {
    console.error('Error fetching veterinarian medical records:', error);
    return [];
  }
};

// Function to get veterinarian statistics

export const getVeterinarianStats = async (username: string) => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching veterinarian statistics for:', username);
    
    // Get all medical records for this veterinarian
    const { data: medicalRecords, error: countError } = await supabase
      .schema('sizopi')
      .from('catatan_medis')
      .select('id_hewan')
      .eq('username_dh', username);

    if (countError) {
      console.error('Error fetching medical records for stats:', countError);
      return { totalAnimals: 0, totalRecords: 0 };
    }

    console.log('Medical records for stats:', medicalRecords);

    if (!medicalRecords || medicalRecords.length === 0) {
      console.log('No medical records found for statistics');
      return { totalAnimals: 0, totalRecords: 0 };
    }

    // Count unique animals
    const uniqueAnimals = new Set(medicalRecords.map(record => record.id_hewan));
    const totalAnimals = uniqueAnimals.size;
    const totalRecords = medicalRecords.length;

    console.log('✅ Veterinarian statistics:', { 
      totalAnimals, 
      totalRecords,
      uniqueAnimalIds: Array.from(uniqueAnimals)
    });
    
    return { totalAnimals, totalRecords };
    
  } catch (error) {
    console.error('Error fetching veterinarian statistics:', error);
    return { totalAnimals: 0, totalRecords: 0 };
  }
};


// Function to get veterinarian specializations
export const getVeterinarianSpecializations = async (username: string) => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching specializations for veterinarian:', username);
    
    const { data: specializations, error: specError } = await supabase
      .schema('sizopi')
      .from('spesialisasi')
      .select('nama_spesialisasi')
      .eq('username_sh', username);

    if (specError) {
      console.error('Error fetching specializations:', specError);
      return [];
    }

    const specList = specializations?.map(spec => spec.nama_spesialisasi) || [];
    
    console.log('✅ Specializations fetched:', specList);
    return specList;
    
  } catch (error) {
    console.error('Error fetching veterinarian specializations:', error);
    return [];
  }
};

// Enhanced function to get complete veterinarian profile
export const getVeterinarianProfile = async (username: string) => {
  try {
    const supabase = await createClient();

    console.log('=== FETCHING VETERINARIAN PROFILE ===');
    console.log('Username:', username);

    // Get basic user data
    const { data: userData, error: userError } = await supabase
      .schema('sizopi')
      .from('pengguna')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      console.error('User data fetch error:', userError);
      return null;
    }

    // Get veterinarian-specific data
    const { data: vetData, error: vetError } = await supabase
      .schema('sizopi')
      .from('dokter_hewan')
      .select('no_str')
      .eq('username_dh', username)
      .single();

    if (vetError || !vetData) {
      console.error('Veterinarian data fetch error:', vetError);
      return null;
    }

    // Get specializations
    const specializations = await getVeterinarianSpecializations(username);

    // Get statistics
    const stats = await getVeterinarianStats(username);

    const veterinarianProfile = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      nama_depan: userData.nama_depan,
      nama_tengah: userData.nama_tengah,
      nama_belakang: userData.nama_belakang,
      no_telepon: userData.no_telepon,
      role: 'dokter_hewan' as UserRole,
      roleSpecificData: {
        no_str: vetData.no_str,
        spesialisasi: specializations,
        totalAnimals: stats.totalAnimals,
        totalRecords: stats.totalRecords
      }
    };

    console.log('✅ Complete veterinarian profile assembled:', veterinarianProfile);
    return veterinarianProfile;

  } catch (error) {
    console.error('Error fetching veterinarian profile:', error);
    return null;
  }
};


// Function to get animal keeper profile with feeding statistics
export const getAnimalKeeperProfile = async (username: string) => {
  try {
    const supabase = await createClient();

    console.log('=== FETCHING ANIMAL KEEPER PROFILE ===');
    console.log('Username:', username);

    // Get basic user data
    const { data: userData, error: userError } = await supabase
      .schema('sizopi')
      .from('pengguna')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      console.error('User data fetch error:', userError);
      return null;
    }

    // Get animal keeper specific data
    const { data: keeperData, error: keeperError } = await supabase
      .schema('sizopi')
      .from('penjaga_hewan')
      .select('id_staf')
      .eq('username_jh', username)
      .single();

    if (keeperError || !keeperData) {
      console.error('Animal keeper data fetch error:', keeperError);
      return null;
    }

    // Get feeding statistics
    const feedingStats = await getAnimalKeeperFeedingStats(username);

    const animalKeeperProfile = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      nama_depan: userData.nama_depan,
      nama_tengah: userData.nama_tengah,
      nama_belakang: userData.nama_belakang,
      no_telepon: userData.no_telepon,
      role: 'staff' as UserRole,
      roleSpecificData: {
        id_staf: keeperData.id_staf,
        peran: 'Penjaga Hewan',
        totalAnimalsFed: feedingStats.totalAnimalsFed,
        totalFeedingRecords: feedingStats.totalFeedingRecords
      }
    };

    console.log('✅ Complete animal keeper profile assembled:', animalKeeperProfile);
    return animalKeeperProfile;

  } catch (error) {
    console.error('Error fetching animal keeper profile:', error);
    return null;
  }
};

// Function to get animal keeper feeding statistics
export const getAnimalKeeperFeedingStats = async (username: string) => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching feeding statistics for animal keeper:', username);
    
    // Get all feeding records for this keeper
    const { data: feedingRecords, error: feedingError } = await supabase
      .schema('sizopi')
      .from('memberi')
      .select('id_hewan, jadwal')
      .eq('username_jh', username);

    if (feedingError) {
      console.error('Error fetching feeding records:', feedingError);
      return { totalAnimalsFed: 0, totalFeedingRecords: 0 };
    }

    if (!feedingRecords || feedingRecords.length === 0) {
      console.log('No feeding records found for animal keeper');
      return { totalAnimalsFed: 0, totalFeedingRecords: 0 };
    }

    // Count unique animals fed
    const uniqueAnimals = new Set(feedingRecords.map(record => record.id_hewan));
    const totalAnimalsFed = uniqueAnimals.size;
    const totalFeedingRecords = feedingRecords.length;

    console.log('✅ Feeding statistics:', { 
      totalAnimalsFed, 
      totalFeedingRecords,
      uniqueAnimalIds: Array.from(uniqueAnimals)
    });
    
    return { totalAnimalsFed, totalFeedingRecords };
    
  } catch (error) {
    console.error('Error fetching feeding statistics:', error);
    return { totalAnimalsFed: 0, totalFeedingRecords: 0 };
  }
};

// Function to get recently fed animals by this keeper
export const getRecentlyFedAnimals = async (username: string) => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching recently fed animals for keeper:', username);
    
    // Get feeding records for this keeper
    const { data: feedingRecords, error: feedingError } = await supabase
      .schema('sizopi')
      .from('memberi')
      .select('id_hewan, jadwal')
      .eq('username_jh', username)
      .order('jadwal', { ascending: false })
      .limit(10);

    if (feedingError) {
      console.error('Error fetching feeding records:', feedingError);
      return [];
    }

    if (!feedingRecords || feedingRecords.length === 0) {
      console.log('No feeding records found');
      return [];
    }

    console.log('Feeding records found:', feedingRecords);

    // Get unique animal IDs
    const animalIds = Array.from(new Set(feedingRecords.map(record => record.id_hewan)));
    
    // Fetch animal information
    const { data: animals, error: animalError } = await supabase
      .schema('sizopi')
      .from('hewan')
      .select('id, nama, spesies')
      .in('id', animalIds);

    if (animalError) {
      console.error('Error fetching animal data:', animalError);
      return [];
    }

    console.log('Animal data found:', animals);

    // Create a map for quick animal lookup
    const animalMap = new Map();
    if (animals) {
      animals.forEach(animal => {
        animalMap.set(animal.id, {
          nama: animal.nama,
          spesies: animal.spesies
        });
      });
    }

    // Transform the data to match the interface
    const recentlyFedAnimals = feedingRecords.map(feeding => {
      const animalInfo = animalMap.get(feeding.id_hewan);
      return {
        animalId: feeding.id_hewan,
        animalName: animalInfo?.nama || 'Unknown Animal',
        type: animalInfo?.spesies || 'Unknown Species',
        lastFed: new Date(feeding.jadwal).toLocaleString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    });

    console.log('✅ Recently fed animals transformed:', recentlyFedAnimals);
    return recentlyFedAnimals;
    
  } catch (error) {
    console.error('Error fetching recently fed animals:', error);
    return [];
  }
};


// Function to get staff admin profile
export const getStaffAdminProfile = async (username: string) => {
  try {
    const supabase = await createClient();

    console.log('=== FETCHING STAFF ADMIN PROFILE ===');
    console.log('Username:', username);

    // Get basic user data
    const { data: userData, error: userError } = await supabase
      .schema('sizopi')
      .from('pengguna')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      console.error('User data fetch error:', userError);
      return null;
    }

    // Get staff admin specific data
    const { data: staffData, error: staffError } = await supabase
      .schema('sizopi')
      .from('staf_admin')
      .select('id_staf')
      .eq('username_sa', username)
      .single();

    if (staffError || !staffData) {
      console.error('Staff admin data fetch error:', staffError);
      return null;
    }

    const staffAdminProfile = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      nama_depan: userData.nama_depan,
      nama_tengah: userData.nama_tengah,
      nama_belakang: userData.nama_belakang,
      no_telepon: userData.no_telepon,
      role: 'staff' as UserRole,
      roleSpecificData: {
        id_staf: staffData.id_staf,
        peran: 'Staf Administrasi'
      }
    };

    console.log('✅ Complete staff admin profile assembled:', staffAdminProfile);
    return staffAdminProfile;

  } catch (error) {
    console.error('Error fetching staff admin profile:', error);
    return null;
  }
};

// Function to get today's ticket sales from reservasi table
export const getTodayTicketSales = async () => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching today\'s ticket sales...');
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get reservations for today
    const { data: reservations, error: reservationError } = await supabase
      .schema('sizopi')
      .from('reservasi')
      .select(`
        *,
        fasilitas!inner(nama, jadwal, kapasitas_max)
      `)
      .eq('tanggal_kunjungan', today)
      .eq('status', 'Confirmed');

    if (reservationError) {
      console.error('Error fetching today\'s reservations:', reservationError);
      return [];
    }

    if (!reservations || reservations.length === 0) {
      console.log('No ticket sales found for today');
      return [];
    }

    // Transform reservations to ticket sales format
    const ticketSales = reservations.map((reservation, index) => ({
      id: index + 1,
      facilityName: reservation.nama_fasilitas,
      visitorUsername: reservation.username_p,
      ticketCount: reservation.jumlah_tiket,
      visitDate: reservation.tanggal_kunjungan,
      status: reservation.status,
      facilitySchedule: reservation.fasilitas.jadwal,
      facilityCapacity: reservation.fasilitas.kapasitas_max
    }));

    console.log('✅ Today\'s ticket sales fetched:', ticketSales);
    return ticketSales;
    
  } catch (error) {
    console.error('Error fetching today\'s ticket sales:', error);
    return [];
  }
};

// Function to get today's visitor count
export const getTodayVisitorCount = async () => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching today\'s visitor count...');
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get unique visitors for today from reservasi
    const { data: reservations, error: reservationError } = await supabase
      .schema('sizopi')
      .from('reservasi')
      .select('username_p, jumlah_tiket')
      .eq('tanggal_kunjungan', today)
      .eq('status', 'Confirmed');

    if (reservationError) {
      console.error('Error fetching today\'s visitor count:', reservationError);
      return 0;
    }

    if (!reservations || reservations.length === 0) {
      console.log('No visitors found for today');
      return 0;
    }

    // Sum up all ticket counts (total visitors including group bookings)
    const totalVisitors = reservations.reduce((sum, reservation) => sum + reservation.jumlah_tiket, 0);

    console.log('✅ Today\'s visitor count:', totalVisitors);
    return totalVisitors;
    
  } catch (error) {
    console.error('Error fetching today\'s visitor count:', error);
    return 0;
  }
};

// Function to get weekly revenue from adoption contributions
export const getWeeklyAdoptionRevenueForAdmin = async () => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching weekly adoption revenue for admin...');
    
    // Get dates for the past 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const weeklyData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const date of dates) {
      // Get adoptions for this date
      const { data: adoptions, error: adoptionError } = await supabase
        .schema('sizopi')
        .from('adopsi')
        .select('kontribusi_finansial')
        .eq('tgl_mulai_adopsi', date)
        .eq('status_pembayaran', 'Lunas');

      if (adoptionError) {
        console.error(`Error fetching adoptions for ${date}:`, adoptionError);
        continue;
      }

      // Calculate revenue from adoption contributions
      const revenue = adoptions?.reduce((sum, adoption) => sum + adoption.kontribusi_finansial, 0) || 0;

      const dayOfWeek = new Date(date).getDay();
      weeklyData.push({
        day: dayNames[dayOfWeek],
        amount: revenue,
        date: date
      });
    }

    console.log('✅ Weekly adoption revenue data for admin fetched:', weeklyData);
    return weeklyData;
    
  } catch (error) {
    console.error('Error fetching weekly adoption revenue for admin:', error);
    return [];
  }
};

// Function to get staff admin dashboard stats
export const getStaffAdminStats = async () => {
  try {
    console.log('Fetching staff admin dashboard stats...');
    
    const [ticketSales, visitorCount, weeklyRevenue] = await Promise.all([
      getTodayTicketSales(),
      getTodayVisitorCount(),
      getWeeklyAdoptionRevenueForAdmin()
    ]);

    // Calculate today's total ticket sales count
    const totalTicketSalesToday = ticketSales.reduce((sum, sale) => sum + sale.ticketCount, 0);

    // Calculate weekly total revenue
    const totalWeeklyRevenue = weeklyRevenue.reduce((sum, day) => sum + day.amount, 0);

    const stats = {
      todayTicketSales: ticketSales,
      totalTicketSalesToday,
      totalVisitorsToday: visitorCount,
      weeklyRevenueData: weeklyRevenue,
      totalWeeklyRevenue
    };

    console.log('✅ Staff admin stats compiled:', stats);
    return stats;
    
  } catch (error) {
    console.error('Error fetching staff admin stats:', error);
    return {
      todayTicketSales: [],
      totalTicketSalesToday: 0,
      totalVisitorsToday: 0,
      weeklyRevenueData: [],
      totalWeeklyRevenue: 0
    };
  }
};

// Function to get animal trainer profile
export const getAnimalTrainerProfile = async (username: string) => {
  try {
    const supabase = await createClient();

    console.log('=== FETCHING ANIMAL TRAINER PROFILE ===');
    console.log('Username:', username);

    // Get basic user data
    const { data: userData, error: userError } = await supabase
      .schema('sizopi')
      .from('pengguna')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      console.error('User data fetch error:', userError);
      return null;
    }

    // Get animal trainer specific data
    const { data: trainerData, error: trainerError } = await supabase
      .schema('sizopi')
      .from('pelatih_hewan')
      .select('id_staf')
      .eq('username_lh', username)
      .single();

    if (trainerError || !trainerData) {
      console.error('Animal trainer data fetch error:', trainerError);
      return null;
    }

    // Get trainer statistics
    const trainerStats = await getAnimalTrainerStats(username);

    const animalTrainerProfile = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      nama_depan: userData.nama_depan,
      nama_tengah: userData.nama_tengah,
      nama_belakang: userData.nama_belakang,
      no_telepon: userData.no_telepon,
      role: 'staff' as UserRole,
      roleSpecificData: {
        id_staf: trainerData.id_staf,
        peran: 'Pelatih Hewan',
        totalShows: trainerStats.totalShows,
        totalAnimals: trainerStats.totalAnimals
      }
    };

    console.log('✅ Complete animal trainer profile assembled:', animalTrainerProfile);
    return animalTrainerProfile;

  } catch (error) {
    console.error('Error fetching animal trainer profile:', error);
    return null;
  }
};

// Function to get trainer statistics
export const getAnimalTrainerStats = async (username: string) => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching trainer statistics for:', username);
    
    // Get all assignments for this trainer
    const { data: assignments, error: assignmentError } = await supabase
      .schema('sizopi')
      .from('jadwal_penugasan')
      .select('nama_atraksi')
      .eq('username_lh', username);

    if (assignmentError) {
      console.error('Error fetching assignments:', assignmentError);
      return { totalShows: 0, totalAnimals: 0 };
    }

    const totalShows = assignments?.length || 0;

    // Get animals participating in trainer's attractions
    if (assignments && assignments.length > 0) {
      const attractionNames = assignments.map(a => a.nama_atraksi);
      
      const { data: participations, error: participationError } = await supabase
        .schema('sizopi')
        .from('berpartisipasi')
        .select('id_hewan')
        .in('nama_fasilitas', attractionNames);

      if (participationError) {
        console.error('Error fetching animal participations:', participationError);
        return { totalShows, totalAnimals: 0 };
      }

      const uniqueAnimals = new Set(participations?.map(p => p.id_hewan) || []);
      const totalAnimals = uniqueAnimals.size;

      return { totalShows, totalAnimals };
    }

    return { totalShows, totalAnimals: 0 };
    
  } catch (error) {
    console.error('Error fetching trainer statistics:', error);
    return { totalShows: 0, totalAnimals: 0 };
  }
};

// Function to get today's show schedule for trainer
export const getTodayShowSchedule = async (username: string) => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching today\'s show schedule for trainer:', username);
    
    // Get today's date range
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    console.log('Date range:', { todayStart: todayStart.toISOString(), todayEnd: todayEnd.toISOString() });

    // Get trainer's assignments for today
    const { data: assignments, error: assignmentError } = await supabase
      .schema('sizopi')
      .from('jadwal_penugasan')
      .select('nama_atraksi, tgl_penugasan')
      .eq('username_lh', username)
      .gte('tgl_penugasan', todayStart.toISOString())
      .lt('tgl_penugasan', todayEnd.toISOString())
      .order('tgl_penugasan', { ascending: true });

    if (assignmentError) {
      console.error('Error fetching today\'s assignments:', assignmentError);
      return [];
    }

    if (!assignments || assignments.length === 0) {
      console.log('No shows scheduled for today');
      return [];
    }

    console.log('Found assignments:', assignments);

    // Get attraction details for each assignment
    const showsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        // Get attraction details
        const { data: atraksiData, error: atraksiError } = await supabase
          .schema('sizopi')
          .from('atraksi')
          .select('nama_atraksi, lokasi')
          .eq('nama_atraksi', assignment.nama_atraksi)
          .single();

        if (atraksiError) {
          console.error('Error fetching attraction details:', atraksiError);
        }

        // Get facility details
        const { data: fasilitasData, error: fasilitasError } = await supabase
          .schema('sizopi')
          .from('fasilitas')
          .select('nama, jadwal, kapasitas_max')
          .eq('nama', assignment.nama_atraksi)
          .single();

        if (fasilitasError) {
          console.error('Error fetching facility details:', fasilitasError);
        }

        // Get animals for this attraction
        const { data: participations, error: participationError } = await supabase
          .schema('sizopi')
          .from('berpartisipasi')
          .select('id_hewan')
          .eq('nama_fasilitas', assignment.nama_atraksi);

        if (participationError) {
          console.error('Error fetching animals for attraction:', participationError);
        }

        // Get animal details
        let animals: Array<{ id: string; name: string; species: string }> = [];
        if (participations && participations.length > 0) {
          const animalIds = participations.map(p => p.id_hewan);
          
          const { data: animalData, error: animalError } = await supabase
            .schema('sizopi')
            .from('hewan')
            .select('id, nama, spesies')
            .in('id', animalIds);

          if (animalError) {
            console.error('Error fetching animal details:', animalError);
          } else if (animalData) {
            animals = animalData.map(animal => ({
              id: animal.id,
              name: animal.nama,
              species: animal.spesies
            }));
          }
        }

        return {
          id: assignment.nama_atraksi,
          title: assignment.nama_atraksi,
          time: fasilitasData ? new Date(fasilitasData.jadwal).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          }) : 'TBA',
          location: atraksiData?.lokasi || 'Unknown Location',
          animals: animals.map(a => a.name),
          animalDetails: animals,
          status: 'Upcoming',
          capacity: fasilitasData?.kapasitas_max || 0
        };
      })
    );

    console.log('✅ Today\'s show schedule fetched:', showsWithDetails);
    return showsWithDetails;
    
  } catch (error) {
    console.error('Error fetching today\'s show schedule:', error);
    return [];
  }
};

// Function to get trained animals by trainer
export const getTrainedAnimalsByTrainer = async (username: string) => {
  try {
    const supabase = await createClient();
    
    console.log('Fetching trained animals for trainer:', username);
    
    // Get trainer's attractions
    const { data: assignments, error: assignmentError } = await supabase
      .schema('sizopi')
      .from('jadwal_penugasan')
      .select('nama_atraksi, tgl_penugasan')
      .eq('username_lh', username)
      .order('tgl_penugasan', { ascending: false });

    if (assignmentError) {
      console.error('Error fetching trainer assignments:', assignmentError);
      return [];
    }

    if (!assignments || assignments.length === 0) {
      console.log('No assignments found for trainer');
      return [];
    }

    console.log('Found assignments:', assignments);

    const attractionNames = Array.from(new Set(assignments.map(a => a.nama_atraksi)));

    // Get animals participating in these attractions
    const { data: participations, error: participationError } = await supabase
      .schema('sizopi')
      .from('berpartisipasi')
      .select('id_hewan, nama_fasilitas')
      .in('nama_fasilitas', attractionNames);

    if (participationError) {
      console.error('Error fetching animal participations:', participationError);
      return [];
    }

    if (!participations || participations.length === 0) {
      console.log('No animals found for trainer\'s attractions');
      return [];
    }

    console.log('Found participations:', participations);

    // Get animal details
    const animalIds = Array.from(new Set(participations.map(p => p.id_hewan)));
    
    const { data: animals, error: animalError } = await supabase
      .schema('sizopi')
      .from('hewan')
      .select('id, nama, spesies, status_kesehatan')
      .in('id', animalIds);

    if (animalError) {
      console.error('Error fetching animal details:', animalError);
      return [];
    }

    if (!animals || animals.length === 0) {
      console.log('No animal details found');
      return [];
    }

    console.log('Found animals:', animals);

    // Create a map of latest training dates for each attraction
    const latestTrainingMap = new Map();
    assignments.forEach(assignment => {
      if (!latestTrainingMap.has(assignment.nama_atraksi)) {
        latestTrainingMap.set(assignment.nama_atraksi, assignment.tgl_penugasan);
      }
    });

    // Create a map of animal to attraction
    const animalAttractionMap = new Map();
    participations.forEach(participation => {
      animalAttractionMap.set(participation.id_hewan, participation.nama_fasilitas);
    });

    // Transform data to match interface
    const trainedAnimals = animals.map(animal => {
      const attraction = animalAttractionMap.get(animal.id);
      const latestTraining = latestTrainingMap.get(attraction);
      const trainingDate = latestTraining ? new Date(latestTraining) : new Date();
      
      // Determine training status based on health and recent activity
      let trainingStatus = 'Beginner';
      if (animal.status_kesehatan === 'Sehat') {
        const daysSinceTraining = Math.floor((Date.now() - trainingDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceTraining <= 7) {
          trainingStatus = 'Advanced';
        } else if (daysSinceTraining <= 30) {
          trainingStatus = 'Intermediate';
        }
      }

      return {
        animalId: animal.id,
        animalName: animal.nama || 'Unknown',
        species: animal.spesies,
        trainingStatus: trainingStatus,
        lastTraining: trainingDate.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        attraction: attraction || 'Unknown',
        healthStatus: animal.status_kesehatan
      };
    });

    console.log('✅ Trained animals fetched:', trainedAnimals);
    return trainedAnimals;
    
  } catch (error) {
    console.error('Error fetching trained animals:', error);
    return [];
  }
};
// Function to check if user is an animal trainer
export const isAnimalTrainer = async (username: string): Promise<boolean> => {
  try {
    const supabase = await createClient();
    
    const { data: trainerData, error } = await supabase
      .schema('sizopi')
      .from('pelatih_hewan')
      .select('username_lh')
      .eq('username_lh', username)
      .single();

    return !error && !!trainerData;
  } catch (error) {
    console.error('Error checking trainer status:', error);
    return false;
  }
};


// Function to handle forgotten password
export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  
  console.log('=== FORGOT PASSWORD PROCESS START ===');
  console.log('Email provided:', email);

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  try {
    const supabase = await createClient();
    const supabaseDb = supabase.schema('sizopi');
    
    // Check if the email exists in our database
    console.log('Checking if email exists in database...');
    const { data: userData, error: userError } = await supabaseDb
      .from('pengguna')
      .select('username, email')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.log('❌ Email not found in database');
      // We don't want to reveal if an email exists in our system for security
      return encodedRedirect("success", "/forgot-password", "If your email exists in our system, you'll receive reset instructions shortly.");
    }

    console.log('✅ Email found in database:', userData.email);
    
    // In a real app, you would:
    // 1. Generate a secure token
    // 2. Store it in the database with an expiry
    // 3. Send an email with a reset link

    // For this implementation, we'll simulate the process
    console.log('Password reset process would be initiated here in production');
    
    // Return success message
    return encodedRedirect("success", "/forgot-password", "Password reset instructions have been sent to your email.");
    
  } catch (error) {
    console.error('=== FORGOT PASSWORD ERROR ===', error);
    return encodedRedirect("error", "/forgot-password", "Failed to process request. Please try again later.");
  }
};