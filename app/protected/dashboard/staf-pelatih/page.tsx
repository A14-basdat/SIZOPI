"use client";

import { useState, useEffect } from 'react';
import { Activity, Menu, Package, Map, Calendar, Users, AlertTriangle, Settings, Search, Bell, ChevronDown, Award, LogOut } from 'lucide-react';
import { getCurrentSession, getAnimalTrainerProfile, getTodayShowSchedule, getTrainedAnimalsByTrainer, isAnimalTrainer, signOutAction } from '@/app/actions';
import { redirect } from 'next/navigation';

// TypeScript interfaces
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

interface TrainedAnimalProps {
  animalId: string;
  animalName: string;
  species: string;
  trainingStatus: string;
  lastTraining: string;
  attraction?: string;
  healthStatus?: string;
}

interface ShowProps {
  id: string;
  title: string;
  time: string;
  location: string;
  animals: string[];
  animalDetails?: Array<{
    id: string;
    name: string;
    species: string;
  }>;
  status: string;
  capacity?: number;
}

interface UserProfile {
  username: string;
  email: string;
  nama_depan: string;
  nama_tengah?: string;
  nama_belakang: string;
  no_telepon: string;
  role: string;
  roleSpecificData?: {
    id_staf: string;
    peran: string;
    totalShows?: number;
    totalAnimals?: number;
  };
}

export default function TrainerDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [todaysShows, setTodaysShows] = useState<ShowProps[]>([]);
  const [trainedAnimals, setTrainedAnimals] = useState<TrainedAnimalProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        console.log('=== INITIALIZING TRAINER DASHBOARD ===');

        // Check if user is logged in
        const session = await getCurrentSession();
        if (!session) {
          console.log('No session found, redirecting to sign-in');
          redirect('/sign-in');
          return;
        }

        console.log('Session found:', session);

        // Check if user is an animal trainer
        const isTrainer = await isAnimalTrainer(session.username);
        if (!isTrainer) {
          console.log('User is not an animal trainer, redirecting to main dashboard');
          redirect('/protected');
          return;
        }

        console.log('User verified as animal trainer');

        // Get trainer profile
        const profile = await getAnimalTrainerProfile(session.username);
        if (!profile) {
          setError('Failed to load trainer profile');
          return;
        }

        console.log('Trainer profile loaded:', profile);
        setUserProfile(profile);

        // Get today's show schedule
        const shows = await getTodayShowSchedule(session.username);
        console.log('Today\'s shows loaded:', shows);
        setTodaysShows(shows);

        // Get trained animals
        const animals = await getTrainedAnimalsByTrainer(session.username);
        console.log('Trained animals loaded:', animals);
        setTrainedAnimals(animals);

        console.log('✅ Dashboard initialization complete');

      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
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
          <p className="mt-4 text-gray-600">Loading trainer dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Access denied. You are not authorized to view this page.</p>
        </div>
      </div>
    );
  }

  // Create full name
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
          <SidebarItem icon={<Package size={20} />} label="My Animals" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Map size={20} />} label="Zoo Map" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Calendar size={20} />} label="Show Schedule" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Users size={20} />} label="Team" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Award size={20} />} label="Training Plans" collapsed={sidebarCollapsed} />
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
                <p className="text-sm text-gray-500">{userProfile.roleSpecificData?.peran}</p>
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
        
        {/* Dashboard Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Staff Pelatih Hewan Dashboard</h2>
          
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start">
              <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 text-2xl font-bold mr-4">
                {userProfile.nama_depan.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{fullName}</h3>
                <p className="text-emerald-600 font-medium">{userProfile.roleSpecificData?.peran}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{userProfile.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nomor Telepon</p>
                <p className="font-medium">{userProfile.no_telepon}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID Staf</p>
                <p className="font-medium">{userProfile.roleSpecificData?.id_staf}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pertunjukan</p>
                <p className="font-medium">{userProfile.roleSpecificData?.totalShows || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Hewan Dilatih</p>
                <p className="font-medium">{userProfile.roleSpecificData?.totalAnimals || 0}</p>
              </div>
            </div>
          </div>
          
          {/* Today's Shows */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Jadwal Pertunjukan Hari Ini</h3>
              <button className="text-sm text-emerald-600">Lihat Jadwal Lengkap</button>
            </div>
            
            {todaysShows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Tidak ada pertunjukan yang dijadwalkan hari ini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysShows.map(show => (
                  <div key={show.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-lg flex flex-col items-center justify-center mr-4">
                      <span className="text-xs">Hari Ini</span>
                      <span className="font-bold">{show.time}</span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">{show.title}</p>
                      <p className="text-sm text-gray-500">
                        <span>{show.location}</span>
                        <span className="mx-2">•</span>
                        <span>Hewan: {show.animals.length > 0 ? show.animals.join(", ") : "Belum ada hewan"}</span>
                        {show.capacity && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Kapasitas: {show.capacity}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                        {show.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Trained Animals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Daftar Hewan yang Dilatih</h3>
              <button className="text-sm text-emerald-600">Lihat Semua Hewan</button>
            </div>
            
            {trainedAnimals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Belum ada hewan yang ditugaskan untuk dilatih</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID Hewan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Spesies</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status Latihan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Latihan Terakhir</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Atraksi</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status Kesehatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainedAnimals.map((animal, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono">{animal.animalId}</td>
                        <td className="px-4 py-3 font-medium">{animal.animalName}</td>
                        <td className="px-4 py-3 text-sm">{animal.species}</td>
                        <td className="px-4 py-3 text-sm">
                          <StatusBadge status={animal.trainingStatus} />
                        </td>
                        <td className="px-4 py-3 text-sm">{animal.lastTraining}</td>
                        <td className="px-4 py-3 text-sm">{animal.attraction || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <HealthStatusBadge status={animal.healthStatus || 'Unknown'} />
                        </td>
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

// Status Badge Helper Component
function StatusBadge({ status }: { status: "Advanced" | "Intermediate" | "Beginner" | string }) {
  let color = "";
  
  switch(status) {
    case "Advanced":
      color = "bg-green-50 text-green-600";
      break;
    case "Intermediate":
      color = "bg-blue-50 text-blue-600";
      break;
    case "Beginner":
      color = "bg-amber-50 text-amber-600";
      break;
    default:
      color = "bg-gray-50 text-gray-600";
  }
  
  return (
    <span className={`px-2 py-1 ${color} text-xs rounded-full`}>
      {status}
    </span>
  );
}

// Health Status Badge Helper Component
function HealthStatusBadge({ status }: { status: string }) {
  let color = "";
  
  switch(status) {
    case "Sehat":
      color = "bg-green-50 text-green-600";
      break;
    case "Sakit":
      color = "bg-red-50 text-red-600";
      break;
    case "Dalam Perawatan":
      color = "bg-yellow-50 text-yellow-600";
      break;
    default:
      color = "bg-gray-50 text-gray-600";
  }
  
  return (
    <span className={`px-2 py-1 ${color} text-xs rounded-full`}>
      {status}
    </span>
  );
}

// Helper Component
function SidebarItem({ icon, label, active = false, collapsed = false }: SidebarItemProps) {
  return (
    <div className={`flex items-center p-3 rounded-lg cursor-pointer ${active ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'}`}>
      <div className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}

