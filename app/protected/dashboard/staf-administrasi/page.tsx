"use client";

import { useState } from 'react';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import { User, Mail, Phone, Calendar, Search, Bell, Menu, LogOut, Ticket, Users, DollarSign, FileText, Settings, ChevronDown } from 'lucide-react';
import React, { ReactNode } from 'react';
import { JSX } from 'react/jsx-runtime';

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
  type: string;
  time: string;
  price: string;
  quantity: number;
}

interface WeeklyRevenue {
  day: string;
  amount: number;
}

// Sample admin staff data
const staffData = {
  fullName: "Michael Rodriguez",
  username: "michael.admin",
  email: "m.rodriguez@sizopi.com",
  phoneNumber: "+1 (555) 987-6543",
  role: "Staff Administration",
  staffID: "STAFF-2025-0042"
};

// Sample ticket sales data
const todayTicketSales: TicketSale[] = [
  { id: 1, type: "Adult Full Day Pass", time: "10:15 AM", price: "$24.99", quantity: 2 },
  { id: 2, type: "Child Full Day Pass", time: "10:15 AM", price: "$14.99", quantity: 1 },
  { id: 3, type: "Family Pack (2+2)", time: "11:30 AM", price: "$69.99", quantity: 1 },
  { id: 4, type: "Senior Citizen Pass", time: "12:45 PM", price: "$18.99", quantity: 2 },
  { id: 5, type: "Safari Experience Add-on", time: "1:20 PM", price: "$15.00", quantity: 3 },
];

// Sample weekly revenue data
const weeklyRevenueData: WeeklyRevenue[] = [
  { day: "Mon", amount: 1250 },
  { day: "Tue", amount: 1420 },
  { day: "Wed", amount: 1650 },
  { day: "Thu", amount: 1800 },
  { day: "Fri", amount: 2100 },
  { day: "Sat", amount: 2850 },
  { day: "Sun", amount: 2500 },
];

// Calculate today's totals
const totalSalesToday = todayTicketSales.reduce((sum, sale) => sum + parseFloat(sale.price.replace('$', '')) * sale.quantity, 0);
const totalVisitorsToday = todayTicketSales.reduce((sum, sale) => sum + sale.quantity, 0);
const totalSalesWeekly = weeklyRevenueData.reduce((sum, day) => sum + day.amount, 0);

export default function StaffAdminDashboard(): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

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
          <SidebarItem icon={<Ticket size={20} />} label="Ticket Sales" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Users size={20} />} label="Visitors" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<DollarSign size={20} />} label="Revenue" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<FileText size={20} />} label="Reports" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" collapsed={sidebarCollapsed} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
              {staffData.fullName.charAt(0)}
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="font-medium">{staffData.fullName}</p>
                <p className="text-sm text-gray-500">{staffData.role}</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button className="mt-4 w-full flex items-center justify-center p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
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
                {staffData.fullName.charAt(0)}
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
              <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 text-2xl font-bold mr-4">
                {staffData.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{staffData.fullName}</h3>
                <div className="flex items-center">
                  <span className="text-emerald-600">{staffData.role}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-500">ID: {staffData.staffID}</span>
                </div>
              </div>
              <button className="ml-auto px-4 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition">
                Edit Profile
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <User className="text-emerald-600 mt-1 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{staffData.username}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="text-emerald-600 mt-1 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{staffData.email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="text-emerald-600 mt-1 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{staffData.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard 
              title="Today's Ticket Sales" 
              value={`$${totalSalesToday.toFixed(2)}`} 
              change="+12.5% from yesterday" 
              icon={<Ticket size={24} />}
              iconColor="text-blue-500" 
              bgColor="bg-blue-100" 
            />
            <StatCard 
              title="Today's Visitors" 
              value={totalVisitorsToday.toString()} 
              change="+8% from yesterday" 
              icon={<Users size={24} />}
              iconColor="text-emerald-500" 
              bgColor="bg-emerald-100" 
            />
            <StatCard 
              title="Weekly Revenue" 
              value={`$${totalSalesWeekly.toFixed(2)}`} 
              change="+15.2% from last week" 
              icon={<DollarSign size={24} />}
              iconColor="text-amber-500" 
              bgColor="bg-amber-100" 
            />
          </div>
          
          {/* Weekly Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Weekly Revenue Report</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg">This Week</button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg">Last Week</button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyRevenueData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Today's Ticket Sales */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Today's Ticket Sales</h3>
              <button className="text-sm text-emerald-600">View All Sales</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Ticket Type</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Time</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Price</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Quantity</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todayTicketSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{sale.type}</td>
                      <td className="py-3 px-4 text-sm">{sale.time}</td>
                      <td className="py-3 px-4 text-sm">{sale.price}</td>
                      <td className="py-3 px-4 text-sm">{sale.quantity}</td>
                      <td className="py-3 px-4 text-sm font-medium">
                        ${(parseFloat(sale.price.replace('$', '')) * sale.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="py-3 px-4 text-sm font-bold text-right">Total</td>
                    <td className="py-3 px-4 text-sm font-bold">${totalSalesToday.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
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
    <div className={`flex items-center p-3 rounded-lg ${active ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'}`}>
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