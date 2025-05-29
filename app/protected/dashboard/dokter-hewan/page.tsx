"use client";

import { useState, useEffect } from 'react';
import { Activity, Menu, Package, Map, Calendar, Users, AlertTriangle, Settings, Search, Bell, ChevronDown, Clipboard, LogOut } from 'lucide-react';
import { getCurrentSession, getVeterinarianProfile, getVeterinarianMedicalRecords, signOutAction } from '@/app/actions';
import { redirect } from 'next/navigation';

// TypeScript interfaces
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

interface MedicalRecordProps {
  id_hewan: string;
  animalName: string;
  tanggal_pemeriksaan: string;
  diagnosis: string;
  pengobatan: string;
  status_kesehatan: string;
  catatan_tindak_lanjut: string;
}

interface VeterinarianProfile {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  certificationNumber: string;
  specializations: string[];
  animalsTreated: number;
}

export default function VeterinarianDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<VeterinarianProfile | null>(null);
  const [recentMedicalRecords, setRecentMedicalRecords] = useState<MedicalRecordProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

// Update the useEffect in your dashboard component

useEffect(() => {
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in and has the correct role
      const session = await getCurrentSession();
      
      console.log('Current session:', session);
      
      if (!session) {
        redirect('/sign-in');
        return;
      }

      if (session.role !== 'dokter_hewan') {
        redirect('/protected'); // Redirect to general protected area
        return;
      }

      console.log('Fetching profile for username:', session.username);

      // Fetch complete veterinarian profile
      const profile = await getVeterinarianProfile(session.username);
      
      console.log('Fetched profile:', profile);
      
      if (!profile || profile.role !== 'dokter_hewan') {
        setError('Access denied. This page is only for veterinarians.');
        return;
      }

      // Transform profile data for display
      const veterinarianProfile: VeterinarianProfile = {
        fullName: profile.nama_tengah 
          ? `${profile.nama_depan} ${profile.nama_tengah} ${profile.nama_belakang}`
          : `${profile.nama_depan} ${profile.nama_belakang}`,
        username: profile.username,
        email: profile.email,
        phoneNumber: profile.no_telepon,
        role: 'Dokter Hewan',
        certificationNumber: profile.roleSpecificData?.no_str || 'N/A',
        specializations: profile.roleSpecificData?.spesialisasi || [],
        animalsTreated: profile.roleSpecificData?.totalAnimals || 0
      };

      console.log('Transformed veterinarian profile:', veterinarianProfile);
      setUserProfile(veterinarianProfile);

      // Fetch medical records
      console.log('Fetching medical records for:', session.username);
      const records = await getVeterinarianMedicalRecords(session.username);
      console.log('Fetched medical records:', records);
      
      setRecentMedicalRecords(records.slice(0, 5)); // Show only recent 5 records

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, []);

  const handleSignOut = async () => {
    try {
      await signOutAction();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.href = '/protected'}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load veterinarian profile.</p>
          <button 
            onClick={() => window.location.href = '/protected'}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg ${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b">
          {!sidebarCollapsed && <h1 className="text-2xl font-bold text-emerald-600">SIZOPI</h1>}
          {sidebarCollapsed && <div className="mx-auto text-2xl font-bold text-emerald-600">S</div>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded-full hover:bg-gray-100">
            <Menu size={20} />
          </button>
        </div>
        
        <div className="flex flex-col flex-grow p-4 space-y-4">
          <SidebarItem icon={<Activity size={20} />} label="Dashboard" active={true} collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Package size={20} />} label="Animal Records" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Map size={20} />} label="Zoo Map" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Calendar size={20} />} label="Appointment Schedule" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Users size={20} />} label="Team" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<AlertTriangle size={20} />} label="Medical Alerts" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" collapsed={sidebarCollapsed} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
              {userProfile.fullName.charAt(0)}
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="font-medium">{userProfile.fullName}</p>
                <p className="text-sm text-gray-500">{userProfile.role}</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button 
              onClick={handleSignOut}
              className="mt-4 w-full flex items-center justify-center p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} className="mr-2" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search medical records..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-emerald-600">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                {userProfile.fullName.charAt(0)}
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
        
        {/* Profile Dashboard Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Dokter Hewan Dashboard</h2>
          
          {/* Profile Card and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Profile Information */}
            <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start">
                <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 text-2xl font-bold mr-4">
                  {userProfile.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{userProfile.fullName}</h3>
                  <p className="text-emerald-600 font-medium">{userProfile.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{userProfile.username}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{userProfile.email}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Nomor Telepon</p>
                    <p className="font-medium">{userProfile.phoneNumber}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Peran</p>
                    <p className="font-medium">{userProfile.role}</p>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Nomor Sertifikasi Profesional</p>
                    <p className="font-medium">{userProfile.certificationNumber}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Daftar Spesialisasi</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {userProfile.specializations.length > 0 ? (
                        userProfile.specializations.map((spec, index) => (
                          <span key={index} className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full">
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">Belum ada spesialisasi</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Ringkasan Aktivitas</h3>
              
              <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Jumlah Hewan yang Ditangani</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-emerald-600">{userProfile.animalsTreated}</p>
                  <div className="text-emerald-500 flex items-center">
                    <Clipboard size={18} className="mr-1" />
                    <span className="text-sm">Total hewan</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Rekam Medis</h4>
                  <span className="text-sm text-emerald-600">{recentMedicalRecords.length} terbaru</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{width: recentMedicalRecords.length > 0 ? '75%' : '0%'}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Recent Medical Records */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Rekam Medis Terbaru</h3>
              <button className="text-sm text-emerald-600 hover:text-emerald-700">
                Lihat Semua Rekam Medis
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID Hewan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama Hewan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tanggal Pemeriksaan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Diagnosis</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pengobatan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status Kesehatan</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMedicalRecords.length > 0 ? (
                    recentMedicalRecords.map((record, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{record.id_hewan}</td>
                        <td className="px-4 py-3 text-sm font-medium">{record.animalName}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(record.tanggal_pemeriksaan).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-sm">{record.diagnosis || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{record.pengobatan || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            record.status_kesehatan === 'Sehat' ? 'bg-green-50 text-green-600' :
                            record.status_kesehatan === 'Sakit' ? 'bg-red-50 text-red-600' :
                            record.status_kesehatan === 'Dalam Perawatan' ? 'bg-yellow-50 text-yellow-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {record.status_kesehatan}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Clipboard className="h-12 w-12 text-gray-300 mb-2" />
                          <p>Belum ada rekam medis yang tersedia</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Rekam medis akan muncul setelah Anda melakukan pemeriksaan hewan
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component
function SidebarItem({ icon, label, active = false, collapsed = false }: SidebarItemProps) {
  return (
    <div className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
      active ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'
    }`}>
      <div className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}

