"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
// Remove bcrypt import since we're not hashing
// import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

// Types for our role-based registration
export type UserRole = 'pengunjung' | 'dokter_hewan' | 'staff';

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
    const supabaseDb = supabase.schema('sizopi');

    console.log('=== FETCHING USER PROFILE ===');
    console.log('Username:', username);

    // Get basic user data from pengguna table
    const { data: userData, error: userError } = await supabaseDb
      .from('pengguna')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      console.error('User data fetch error:', userError);
      return null;
    }

    console.log('Basic user data fetched:', userData);

    // Determine role and get role-specific data
    let role: UserRole;
    let roleSpecificData: any = {};

    // Check pengunjung
    const { data: pengunjungData } = await supabaseDb
      .from('pengunjung')
      .select('*')
      .eq('username_p', username)
      .single();

    if (pengunjungData) {
      role = 'pengunjung';
      roleSpecificData = {
        alamat: pengunjungData.alamat,
        tgl_lahir: pengunjungData.tgl_lahir
      };
      console.log('Pengunjung data:', roleSpecificData);
    } else {
      // Check dokter_hewan
      const { data: dokterData } = await supabaseDb
        .from('dokter_hewan')
        .select('*')
        .eq('username_dh', username)
        .single();

      if (dokterData) {
        role = 'dokter_hewan';
        roleSpecificData.no_str = dokterData.no_str;

        // Get specializations
        const { data: spesialisasiData } = await supabaseDb
          .from('spesialisasi')
          .select('nama_spesialisasi')
          .eq('username_sh', username);

        roleSpecificData.spesialisasi = spesialisasiData?.map(s => s.nama_spesialisasi) || [];
        console.log('Dokter data:', roleSpecificData);
      } else {
        // Check staff tables
        const { data: penjagaData } = await supabaseDb
          .from('penjaga_hewan')
          .select('*')
          .eq('username_jh', username)
          .single();

        const { data: adminData } = await supabaseDb
          .from('staf_admin')
          .select('*')
          .eq('username_sa', username)
          .single();

        const { data: pelatihData } = await supabaseDb
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
      password: userData.password, // Note: This should be handled carefully in production
      nama_depan: userData.nama_depan,
      nama_tengah: userData.nama_tengah,
      nama_belakang: userData.nama_belakang,
      no_telepon: userData.no_telepon,
      role: role!,
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
  const supabaseDb = supabase.schema('sizopi');
  
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
    console.log('=== DATABASE VALIDATION QUERIES ===');
    
    // Check if username already exists
    console.log('Checking username availability:', username);
    const { data: existingUser, error: checkError } = await supabaseDb
      .from('pengguna')
      .select('username')
      .eq('username', username)
      .single();

    console.log('Username check result:', { exists: !!existingUser, error: checkError?.message });

    if (existingUser) {
      return encodedRedirect("error", "/sign-up", "Username already exists");
    }

    // Check if email already exists
    console.log('Checking email availability:', email);
    const { data: existingEmail, error: emailCheckError } = await supabaseDb
      .from('pengguna')
      .select('email')
      .eq('email', email)
      .single();

    console.log('Email check result:', { exists: !!existingEmail, error: emailCheckError?.message });

    if (existingEmail) {
      return encodedRedirect("error", "/sign-up", "Email already exists");
    }

    // SECURITY WARNING: Storing password in plain text
    console.log('⚠️  WARNING: Storing password in plain text - this is insecure!');

    console.log('=== DATABASE INSERT OPERATIONS ===');

    // Insert into Pengguna table (Main User Table)
    console.log('Inserting into PENGGUNA table...');
    const penggunaData = {
      username,
      email,
      password, // Plain text password - INSECURE!
      nama_depan,
      nama_tengah,
      nama_belakang,
      no_telepon
    };
    console.log('PENGGUNA INSERT DATA:', penggunaData);

    const { error: penggunaError } = await supabaseDb
      .from('pengguna')
      .insert(penggunaData);

    if (penggunaError) {
      console.error('PENGGUNA INSERT ERROR:', penggunaError);
      return encodedRedirect("error", "/sign-up", "Failed to create user profile");
    }
    console.log('✅ PENGGUNA table insert successful');

    // Insert role-specific data
    console.log('=== ROLE-SPECIFIC DATABASE INSERTS ===');
    
    switch (role) {
      case 'pengunjung':
        const alamat = formData.get("alamat")?.toString();
        const tgl_lahir = formData.get("tgl_lahir")?.toString();
        
        if (!alamat || !tgl_lahir) {
          return encodedRedirect("error", "/sign-up", "Address and birth date are required for visitors");
        }

        console.log('Inserting into PENGUNJUNG table...');
        const pengunjungData = {
          username_p: username,
          alamat,
          tgl_lahir
        };
        console.log('PENGUNJUNG INSERT DATA:', pengunjungData);

        const { error: pengunjungError } = await supabaseDb
          .from('pengunjung')
          .insert(pengunjungData);

        if (pengunjungError) {
          console.error('PENGUNJUNG INSERT ERROR:', pengunjungError);
          return encodedRedirect("error", "/sign-up", "Failed to create visitor profile");
        }
        console.log('✅ PENGUNJUNG table insert successful');
        break;

      case 'dokter_hewan':
        const no_str = formData.get("no_str")?.toString();
        const spesialisasiArray = formData.getAll("spesialisasi");
        
        if (!no_str || spesialisasiArray.length === 0) {
          return encodedRedirect("error", "/sign-up", "Professional certification number and specialization are required");
        }

        // Insert into Dokter_Hewan
        console.log('Inserting into DOKTER_HEWAN table...');
        const dokterData = {
          username_dh: username,
          no_str
        };
        console.log('DOKTER_HEWAN INSERT DATA:', dokterData);

        const { error: dokterError } = await supabaseDb
          .from('dokter_hewan')
          .insert(dokterData);

        if (dokterError) {
          console.error('DOKTER_HEWAN INSERT ERROR:', dokterError);
          return encodedRedirect("error", "/sign-up", "Failed to create veterinarian profile");
        }
        console.log('✅ DOKTER_HEWAN table insert successful');

        // Insert specializations
        console.log('Inserting into SPESIALISASI table...');
        const spesialisasiInserts = spesialisasiArray
          .filter(spec => spec && spec.toString().trim() !== '')
          .map(spec => ({
            username_sh: username,
            nama_spesialisasi: spec.toString().trim()
          }));

        console.log('SPESIALISASI INSERT DATA:', spesialisasiInserts);

        if (spesialisasiInserts.length > 0) {
          const { error: spesialisasiError } = await supabaseDb
            .from('spesialisasi')
            .insert(spesialisasiInserts);

          if (spesialisasiError) {
            console.error('SPESIALISASI INSERT ERROR:', spesialisasiError);
            return encodedRedirect("error", "/sign-up", "Failed to create specialization records");
          }
          console.log('✅ SPESIALISASI table insert successful');
        }
        break;

      case 'staff':
        const peran = formData.get("peran")?.toString();
        
        if (!peran) {
          return encodedRedirect("error", "/sign-up", "Staff role is required");
        }

        // Generate UUID for staff ID
        const staffId = generateStaffId();
        let tableName = '';
        let usernameField = '';

        switch (peran) {
          case 'penjaga':
            tableName = 'penjaga_hewan';
            usernameField = 'username_jh';
            break;
          case 'admin':
            tableName = 'staf_admin';
            usernameField = 'username_sa';
            break;
          case 'pelatih':
            tableName = 'pelatih_hewan';
            usernameField = 'username_lh';
            break;
          default:
            return encodedRedirect("error", "/sign-up", "Invalid staff role");
        }

        console.log(`Inserting into ${tableName.toUpperCase()} table...`);
        const staffData = {
          [usernameField]: username,
          id_staf: staffId
        };
        console.log(`${tableName.toUpperCase()} INSERT DATA:`, staffData);
        console.log(`Generated UUID for staff: ${staffId}`);

        const { error: staffError } = await supabaseDb
          .from(tableName)
          .insert(staffData);

        if (staffError) {
          console.error(`${tableName.toUpperCase()} INSERT ERROR:`, staffError);
          return encodedRedirect("error", "/sign-up", "Failed to create staff profile");
        }
        console.log(`✅ ${tableName.toUpperCase()} table insert successful`);
        break;

      default:
        return encodedRedirect("error", "/sign-up", "Invalid role selected");
    }

    console.log('=== REGISTRATION COMPLETED SUCCESSFULLY ===');
    
    // Option 1: Redirect to sign-in with success message
    return encodedRedirect("success", "/sign-in", "Registration successful! Please sign in with your credentials.");

  } catch (error) {
    console.error('=== REGISTRATION ERROR ===', error);
    return encodedRedirect("error", "/sign-up", "Registration failed. Please try again.");
  }
};

export const signInAction = async (formData: FormData) => {
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();
  const supabaseDb = supabase.schema('sizopi');

  console.log('=== LOGIN PROCESS START ===');
  console.log('Login attempt with identifier:', identifier);

  if (!identifier || !password) {
    return encodedRedirect("error", "/sign-in", "Username/Email and password are required");
  }

  try {
    console.log('=== DATABASE AUTHENTICATION QUERIES ===');
    
    let userData;
    let userRole: UserRole;
    
    // Determine if identifier is email or username
    const isEmail = identifier.includes('@');
    console.log('Identifier type:', isEmail ? 'EMAIL' : 'USERNAME');

    if (isEmail) {
      // Login with email
      console.log('Querying PENGGUNA table by email...');
      const { data, error: userError } = await supabaseDb
        .from('pengguna')
        .select('username, email, password')
        .eq('email', identifier)
        .single();

      console.log('Email query result:', { found: !!data, error: userError?.message });

      if (userError || !data) {
        return encodedRedirect("error", "/sign-in", "Invalid email or password");
      }
      
      userData = data;
    } else {
      // Login with username
      console.log('Querying PENGGUNA table by username...');
      const { data, error: userError } = await supabaseDb
        .from('pengguna')
        .select('username, email, password')
        .eq('username', identifier)
        .single();

      console.log('Username query result:', { found: !!data, error: userError?.message });

      if (userError || !data) {
        return encodedRedirect("error", "/sign-in", "Invalid username or password");
      }
      
      userData = data;
    }

    console.log('=== PASSWORD VERIFICATION ===');
    // Simple string comparison for plain text passwords
    const isPasswordValid = password === userData.password;
    console.log('Password verification result:', isPasswordValid);
    
    if (!isPasswordValid) {
      return encodedRedirect("error", "/sign-in", "Invalid credentials");
    }

    console.log('=== DETERMINING USER ROLE ===');
    // Determine user role by checking role-specific tables
    const username = userData.username;
    
    // Check PENGUNJUNG table
    console.log('Checking PENGUNJUNG table...');
    const { data: pengunjungData } = await supabaseDb
      .from('pengunjung')
      .select('username_p')
      .eq('username_p', username)
      .single();

    if (pengunjungData) {
      userRole = 'pengunjung';
      console.log('✅ User role identified: PENGUNJUNG');
    } else {
      // Check DOKTER_HEWAN table
      console.log('Checking DOKTER_HEWAN table...');
      const { data: dokterData } = await supabaseDb
        .from('dokter_hewan')
        .select('username_dh')
        .eq('username_dh', username)
        .single();

      if (dokterData) {
        userRole = 'dokter_hewan';
        console.log('✅ User role identified: DOKTER_HEWAN');
      } else {
        // Check staff tables
        console.log('Checking STAFF tables...');
        const { data: penjagaData } = await supabaseDb
          .from('penjaga_hewan')
          .select('username_jh')
          .eq('username_jh', username)
          .single();

        const { data: adminData } = await supabaseDb
          .from('staf_admin')
          .select('username_sa')
          .eq('username_sa', username)
          .single();

        const { data: pelatihData } = await supabaseDb
          .from('pelatih_hewan')
          .select('username_lh')
          .eq('username_lh', username)
          .single();

        if (penjagaData || adminData || pelatihData) {
          userRole = 'staff';
          console.log('✅ User role identified: STAFF');
        } else {
          console.log('❌ User role could not be determined');
          return encodedRedirect("error", "/sign-in", "User role not found");
        }
      }
    }

    console.log('=== FETCHING COMPLETE USER PROFILE ===');
    // Get complete user profile for session
    const userProfile = await getUserProfile(username);
    
    console.log('=== CREATING USER SESSION ===');
    // Create session with user profile data
    await createSession(username, userRole, userProfile);
    console.log('✅ Session created successfully with user profile');

    console.log('=== LOGIN COMPLETED SUCCESSFULLY ===');
    console.log('✅ Redirecting to protected area...');

    // The redirect will throw NEXT_REDIRECT internally - this is normal behavior
    return redirect("/protected");

  } catch (error) {
    // Only log actual errors, not Next.js redirects
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // This is expected behavior for redirects, don't log as error
      throw error; // Re-throw to let Next.js handle the redirect
    }
    
    console.error('=== LOGIN ERROR ===', error);
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