"use client";

import { useState, useEffect } from 'react';
import { Calendar, User, Mail, Phone, Home, Clock, Ticket, ChevronDown, Search, Bell, Menu, LogOut } from 'lucide-react';
import React, { ReactNode } from 'react';
import { JSX } from 'react/jsx-runtime';
import { getCurrentSession, getUserProfile, signOutAction, UserProfile, getVisitHistory, getPurchasedTickets } from '@/app/actions';
import { useRouter } from 'next/navigation';

// TypeScript interfaces
interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

interface VisitHistory {
  id: number;
  nama_fasilitas: string;
  tanggal_kunjungan: string;
  jumlah_tiket: number;
  status: string;
  jadwal?: string;
  kapasitas_max?: number;
}

interface PurchasedTicket {
  id: number;
  nama_fasilitas: string;
  tanggal_kunjungan: string;
  jumlah_tiket: number;
  status: string;
  jadwal?: string;
  kapasitas_max?: number;
}

interface SessionData {
  username: string;
  role: 'pengunjung' | 'dokter_hewan' | 'staff';
  userData: UserProfile | null;
}

export default function VisitorDashboard(): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndLoadProfile = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const session = await getCurrentSession();
        
        if (!session) {
          console.log('No session found, redirecting to sign-in');
          router.push('/sign-in');
          return;
        }

        // Check if user role is pengunjung
        if (session.role !== 'pengunjung') {
          console.log('User is not a pengunjung, access denied');
          setError('Access denied. This page is only for visitors.');
          // Redirect to appropriate dashboard based on role
          if (session.role === 'dokter_hewan') {
            router.push('/protected/dashboard/dokter');
          } else if (session.role === 'staff') {
            router.push('/protected/dashboard/staff');
          } else {
            router.push('/protected');
          }
          return;
        }

        setSessionData(session);

        // Get fresh user profile data
        const profile = await getUserProfile(session.username);
        
        if (!profile) {
          setError('Failed to load user profile');
          return;
        }

        // Verify the profile role matches session role
        if (profile.role !== 'pengunjung') {
          setError('Profile role mismatch. Access denied.');
          return;
        }

        setUserProfile(profile);
        console.log('✅ User profile loaded successfully:', profile);

        // Load visit history and purchased tickets
        await loadUserData(session.username);

      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    checkSessionAndLoadProfile();
  }, [router]);

  const loadUserData = async (username: string) => {
    try {
      setDataLoading(true);
      
      // Load visit history and purchased tickets
      const [historyData, ticketsData] = await Promise.all([
        getVisitHistory(username),
        getPurchasedTickets(username)
      ]);

      setVisitHistory(historyData);
      setPurchasedTickets(ticketsData);
      
      console.log('✅ User data loaded:', { historyData, ticketsData });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutAction();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const formatFullName = (profile: UserProfile): string => {
    return profile.nama_tengah 
      ? `${profile.nama_depan} ${profile.nama_tengah} ${profile.nama_belakang}`
      : `${profile.nama_depan} ${profile.nama_belakang}`;
  };

  const formatDateOfBirth = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatVisitDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatSchedule = (jadwalString: string): string => {
    try {
      const date = new Date(jadwalString);
      return date.toLocaleString('id-ID', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return jadwalString;
    }
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'completed':
      case 'used':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button 
            onClick={() => router.push('/protected')}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Go to Main Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile || !sessionData) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No user data available</p>
          <button 
            onClick={() => router.push('/sign-in')}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const fullName = formatFullName(userProfile);
  const userInitial = fullName.charAt(0).toUpperCase();

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
          <SidebarItem icon={<User size={20} />} label="My Profile" active={true} collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Ticket size={20} />} label="My Tickets" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Clock size={20} />} label="Visit History" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Calendar size={20} />} label="Book a Visit" collapsed={sidebarCollapsed} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
              {userInitial}
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="font-medium">{fullName}</p>
                <p className="text-sm text-gray-500 capitalize">{userProfile.role}</p>
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
                {userInitial}
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Visitor Dashboard</h2>
          
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 text-2xl font-bold mr-4">
                {userInitial}
              </div>
              <div>
                <h3 className="text-xl font-bold">{fullName}</h3>
                <p className="text-emerald-600 capitalize">{userProfile.role}</p>
              </div>
              <button className="ml-auto px-4 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition">
                Edit Profile
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="text-emerald-600 mt-1 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{userProfile.username}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="text-emerald-600 mt-1 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{userProfile.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="text-emerald-600 mt-1 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Nomor Telepon</p>
                    <p className="font-medium">{userProfile.no_telepon}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Home className="text-emerald-600 mt-1 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Alamat Lengkap</p>
                    <p className="font-medium">
                      {userProfile.roleSpecificData?.alamat || 'Alamat tidak tersedia'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="text-emerald-600 mt-1 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Lahir</p>
                    <p className="font-medium">
                      {userProfile.roleSpecificData?.tgl_lahir 
                        ? formatDateOfBirth(userProfile.roleSpecificData.tgl_lahir)
                        : 'Tanggal lahir tidak tersedia'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Visit History */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Riwayat Kunjungan</h3>
              <button className="text-sm text-emerald-600 hover:text-emerald-700">View All</button>
            </div>
            
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : visitHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Nama Fasilitas</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Tanggal Kunjungan</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Jumlah Tiket</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Jadwal</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {visitHistory.map((visit) => (
                      <tr key={visit.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{visit.nama_fasilitas}</td>
                        <td className="py-3 px-4 text-sm">{formatVisitDate(visit.tanggal_kunjungan)}</td>
                        <td className="py-3 px-4 text-sm">{visit.jumlah_tiket} tiket</td>
                        <td className="py-3 px-4 text-sm">
                          {visit.jadwal ? formatSchedule(visit.jadwal) : 'Jadwal tidak tersedia'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(visit.status)}`}>
                            {visit.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">Tidak ada riwayat kunjungan</p>
                <p className="text-gray-400 text-sm">Anda belum memiliki riwayat kunjungan ke fasilitas manapun.</p>
              </div>
            )}
          </div>
          
          {/* Purchased Tickets */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tiket yang Telah Dibeli</h3>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                Beli Tiket Baru
              </button>
            </div>
            
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : purchasedTickets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Nama Fasilitas</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Tanggal Kunjungan</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Jumlah Tiket</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Kapasitas Max</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Jadwal</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {purchasedTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{ticket.nama_fasilitas}</td>
                        <td className="py-3 px-4 text-sm">{formatVisitDate(ticket.tanggal_kunjungan)}</td>
                        <td className="py-3 px-4 text-sm">{ticket.jumlah_tiket} tiket</td>
                        <td className="py-3 px-4 text-sm">
                          {ticket.kapasitas_max ? `${ticket.kapasitas_max} orang` : 'Tidak tersedia'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {ticket.jadwal ? formatSchedule(ticket.jadwal) : 'Jadwal tidak tersedia'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Ticket className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">Tidak ada tiket yang dibeli</p>
                <p className="text-gray-400 text-sm">Anda belum membeli tiket untuk fasilitas manapun.</p>
                <button className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                  Beli Tiket Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component
function SidebarItem({ icon, label, active = false, collapsed = false }: SidebarItemProps): JSX.Element {
  return (
    <div className={`flex items-center p-3 rounded-lg cursor-pointer ${active ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'}`}>
      <div className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}
