"use client";

import { useState, useEffect } from 'react';
import { Activity, Menu, Package, Map, Calendar, Users, AlertTriangle, Settings, Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { getCurrentSession, getAnimalKeeperProfile, getRecentlyFedAnimals, signOutAction } from '@/app/actions';
import { redirect } from 'next/navigation';

// TypeScript interfaces
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

interface AnimalFeedProps {
  animalId: string;
  animalName: string;
  type: string;
  lastFed: string;
}

interface AnimalKeeperProfile {
  username: string;
  email: string;
  nama_depan: string;
  nama_tengah?: string;
  nama_belakang: string;
  no_telepon: string;
  role: string;
  roleSpecificData: {
    id_staf: string;
    peran: string;
    totalAnimalsFed: number;
    totalFeedingRecords: number;
  };
}

export default function AnimalKeeperDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<AnimalKeeperProfile | null>(null);
  const [recentlyFedAnimals, setRecentlyFedAnimals] = useState<AnimalFeedProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in and has the correct role
        const session = await getCurrentSession();
        if (!session) {
          redirect('/sign-in');
          return;
        }

        // Verify user role - should be staff with role "Penjaga Hewan"
        if (session.role !== 'staff') {
          setError('Access denied. This page is only for Animal Keepers.');
          return;
        }

        // Fetch animal keeper profile
        const profile = await getAnimalKeeperProfile(session.username);
        if (!profile) {
          setError('Failed to load profile data.');
          return;
        }

        // Additional check to ensure this staff member is specifically a "Penjaga Hewan"
        if (profile.roleSpecificData.peran !== 'Penjaga Hewan') {
          setError('Access denied. This page is only for Animal Keepers.');
          return;
        }

        setUserProfile(profile);

        // Fetch recently fed animals
        const recentAnimals = await getRecentlyFedAnimals(session.username);
        setRecentlyFedAnimals(recentAnimals);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred while loading the dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
          <button 
            onClick={() => window.location.href = '/protected'}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile data available.</p>
        </div>
      </div>
    );
  }

  const fullName = userProfile.nama_tengah 
    ? `${userProfile.nama_depan} ${userProfile.nama_tengah} ${userProfile.nama_belakang}`
    : `${userProfile.nama_depan} ${userProfile.nama_belakang}`;

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
          <SidebarItem icon={<Package size={20} />} label="Animals" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Map size={20} />} label="Zoo Map" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Calendar size={20} />} label="Feeding Schedule" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Users size={20} />} label="Team" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<AlertTriangle size={20} />} label="Alerts" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" collapsed={sidebarCollapsed} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
              {userProfile.nama_depan.charAt(0)}
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="font-medium">{fullName}</p>
                <p className="text-sm text-gray-500">{userProfile.roleSpecificData.peran}</p>
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
              placeholder="Search..." 
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
                {userProfile.nama_depan.charAt(0)}
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
        
        {/* Profile Dashboard Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Penjaga Hewan Dashboard</h2>
          
          {/* Profile Card and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Profile Information */}
            <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start">
                <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 text-2xl font-bold mr-4">
                  {userProfile.nama_depan.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{fullName}</h3>
                  <p className="text-emerald-600 font-medium">{userProfile.roleSpecificData.peran}</p>
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
                    <p className="font-medium">{userProfile.no_telepon}</p>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">ID Staf</p>
                    <p className="font-medium">{userProfile.roleSpecificData.id_staf}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Peran</p>
                    <p className="font-medium">{userProfile.roleSpecificData.peran}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Statistik Aktivitas</h3>
              
              <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Total Hewan yang Diberi Pakan</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-emerald-600">{userProfile.roleSpecificData.totalAnimalsFed}</p>
                  <div className="text-emerald-500 flex items-center">
                    <Activity size={18} className="mr-1" />
                    <span className="text-sm">Hewan</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Pemberian Pakan</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-blue-600">{userProfile.roleSpecificData.totalFeedingRecords}</p>
                  <div className="text-blue-500 flex items-center">
                    <Package size={18} className="mr-1" />
                    <span className="text-sm">Kali</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recently Fed Animals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Hewan yang Baru Diberi Pakan</h3>
              <button className="text-sm text-emerald-600 hover:text-emerald-700">Lihat Semua</button>
            </div>
            
            {recentlyFedAnimals.length === 0 ? (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Belum ada data pemberian pakan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID Hewan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama Hewan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Spesies</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Terakhir Diberi Pakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentlyFedAnimals.map((animal, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono">{animal.animalId}</td>
                        <td className="px-4 py-3 font-medium">{animal.animalName}</td>
                        <td className="px-4 py-3 text-sm">{animal.type}</td>
                        <td className="px-4 py-3 text-sm">{animal.lastFed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component
function SidebarItem({ icon, label, active = false, collapsed = false }: SidebarItemProps) {
  return (
    <div className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'}`}>
      <div className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}

