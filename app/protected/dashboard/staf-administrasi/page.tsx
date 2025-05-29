"use client";

import { useState, useEffect } from 'react';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import { User, Mail, Phone, Calendar, Search, Bell, Menu, LogOut, Ticket, Users, DollarSign, FileText, Settings, ChevronDown, Shield } from 'lucide-react';
import React, { ReactNode } from 'react';
import { JSX } from 'react/jsx-runtime';
import { getCurrentSession, getStaffAdminProfile, getStaffAdminStats, signOutAction } from '@/app/actions';
import { redirect } from 'next/navigation';

// TypeScript interfaces
interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
  iconColor: string;
  bgColor: string;
}

interface TicketSale {
  id: number;
  facilityName: string;
  visitorUsername: string;
  ticketCount: number;
  visitDate: string;
  status: string;
  facilitySchedule?: string;
  facilityCapacity?: number;
}

interface WeeklyRevenue {
  day: string;
  amount: number;
  date?: string;
}

interface StaffAdminProfile {
  username: string;
  email: string;
  nama_depan: string;
  nama_tengah?: string;
  nama_belakang: string;
  no_telepon: string;
  roleSpecificData?: {
    id_staf: string;
    peran: string;
  };
}

interface DashboardStats {
  todayTicketSales: TicketSale[];
  totalTicketSalesToday: number;
  totalVisitorsToday: number;
  weeklyRevenueData: WeeklyRevenue[];
  totalWeeklyRevenue: number;
}

export default function StaffAdministrasiDashboard(): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [staffProfile, setStaffProfile] = useState<StaffAdminProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todayTicketSales: [],
    totalTicketSalesToday: 0,
    totalVisitorsToday: 0,
    weeklyRevenueData: [],
    totalWeeklyRevenue: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check session and role
        const session = await getCurrentSession();
        if (!session) {
          redirect('/sign-in');
          return;
        }

        // Verify user role - check if user is staff admin
        const profile = await getStaffAdminProfile(session.username);
        if (!profile || profile.roleSpecificData?.peran !== 'Staf Administrasi') {
          setError('Access denied. This dashboard is only for Staff Administration.');
          return;
        }

        setStaffProfile(profile);

        // Fetch dashboard statistics
        const stats = await getStaffAdminStats();
        setDashboardStats(stats);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.href = '/protected'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!staffProfile) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Profile not found</div>
          <button 
            onClick={() => window.location.href = '/protected'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const fullName = staffProfile.nama_tengah 
    ? `${staffProfile.nama_depan} ${staffProfile.nama_tengah} ${staffProfile.nama_belakang}`
    : `${staffProfile.nama_depan} ${staffProfile.nama_belakang}`;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg ${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b">
          {!sidebarCollapsed && <h1 className="text-2xl font-bold text-blue-600">SIZOPI</h1>}
          {sidebarCollapsed && <div className="mx-auto text-2xl font-bold text-blue-600">S</div>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded-full hover:bg-gray-100">
            <Menu size={20} />
          </button>
        </div>
        
        <div className="flex flex-col flex-grow p-4 space-y-4">
          <SidebarItem icon={<User size={20} />} label="My Profile" active={true} collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Ticket size={20} />} label="Ticket Sales" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Users size={20} />} label="Visitors" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<DollarSign size={20} />} label="Revenue" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<FileText size={20} />} label="Reports" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" collapsed={sidebarCollapsed} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">
              {staffProfile.nama_depan.charAt(0)}
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="font-medium">{fullName}</p>
                <p className="text-sm text-gray-500">{staffProfile.roleSpecificData?.peran}</p>
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
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-blue-600">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">
                {staffProfile.nama_depan.charAt(0)}
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Staff Administration Dashboard</h2>
          
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 text-2xl font-bold mr-4">
                {staffProfile.nama_depan.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{fullName}</h3>
                <div className="flex items-center">
                  <Shield className="text-blue-600 mr-2" size={16} />
                  <span className="text-blue-600">{staffProfile.roleSpecificData?.peran}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-500">ID: {staffProfile.roleSpecificData?.id_staf}</span>
                </div>
              </div>
              <button className="ml-auto px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                Edit Profile
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <User className="text-blue-600 mt-1 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{staffProfile.username}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="text-blue-600 mt-1 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{staffProfile.email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="text-blue-600 mt-1 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{staffProfile.no_telepon}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard 
              title="Today's Ticket Sales" 
              value={`${dashboardStats.totalTicketSalesToday}`} 
              change="" 
              icon={<Ticket size={24} />}
              iconColor="text-purple-500" 
              bgColor="bg-purple-100" 
            />
            <StatCard 
              title="Today's Visitors" 
              value={dashboardStats.totalVisitorsToday.toString()} 
              change="" 
              icon={<Users size={24} />}
              iconColor="text-blue-500" 
              bgColor="bg-blue-100" 
            />
            <StatCard 
              title="Weekly Revenue" 
              value={`Rp ${dashboardStats.totalWeeklyRevenue.toLocaleString('id-ID')}`} 
              change="" 
              icon={<DollarSign size={24} />}
              iconColor="text-green-500" 
              bgColor="bg-green-100" 
            />
          </div>
          
          {/* Weekly Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Weekly Revenue Report (Adoption Contributions)</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg">This Week</button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg">Last Week</button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardStats.weeklyRevenueData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                  <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Revenue']} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Today's Ticket Sales */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Today's Ticket Sales</h3>
              <button className="text-sm text-blue-600">View All Sales</button>
            </div>
            
            <div className="overflow-x-auto">
              {dashboardStats.todayTicketSales.length > 0 ? (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Facility Name</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Visitor</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Tickets</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Visit Date</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboardStats.todayTicketSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{sale.facilityName}</td>
                        <td className="py-3 px-4 text-sm">{sale.visitorUsername}</td>
                        <td className="py-3 px-4 text-sm font-medium">{sale.ticketCount}</td>
                        <td className="py-3 px-4 text-sm">{new Date(sale.visitDate).toLocaleDateString('id-ID')}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            sale.status === 'Confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="py-3 px-4 text-sm font-bold text-right">Total Tickets</td>
                      <td className="py-3 px-4 text-sm font-bold">{dashboardStats.totalTicketSalesToday}</td>
                      <td colSpan={2} className="py-3 px-4"></td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Ticket size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No ticket sales found for today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function SidebarItem({ icon, label, active = false, collapsed = false }: SidebarItemProps): JSX.Element {
  return (
    <div className={`flex items-center p-3 rounded-lg cursor-pointer ${active ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
      <div className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}

function StatCard({ title, value, change, icon, iconColor, bgColor }: StatCardProps): JSX.Element {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

