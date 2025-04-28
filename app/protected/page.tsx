"use client";

import { useState } from 'react';
import { BarChart, LineChart, PieChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Menu, Activity, Calendar, Users, Map, AlertTriangle, Settings, Package, Search, Bell, ChevronDown } from 'lucide-react';
import React, { ReactNode } from 'react';
import { JSX } from 'react/jsx-runtime';

// TypeScript interfaces
interface VisitorData {
  name: string;
  visitors: number;
}

interface AnimalDistribution {
  name: string;
  value: number;
}

interface Alert {
  id: number;
  type: string;
  message: string;
  time: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  attendees: number;
}

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
  iconColor: string;
  bgColor: string;
}

// Sample data
const visitorsData: VisitorData[] = [
  { name: 'Jan', visitors: 4000 },
  { name: 'Feb', visitors: 3000 },
  { name: 'Mar', visitors: 5000 },
  { name: 'Apr', visitors: 7000 },
  { name: 'May', visitors: 6000 },
  { name: 'Jun', visitors: 8000 },
];

const animalDistribution: AnimalDistribution[] = [
  { name: 'Mammals', value: 45 },
  { name: 'Birds', value: 30 },
  { name: 'Reptiles', value: 15 },
  { name: 'Amphibians', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const recentAlerts: Alert[] = [
  { id: 1, type: 'Maintenance', message: 'Aquarium filter needs replacement', time: '35 min ago' },
  { id: 2, type: 'Health', message: 'Bengal tiger scheduled for checkup', time: '2 hours ago' },
  { id: 3, type: 'Feeding', message: 'Elephant section feeding time alert', time: '5 hours ago' },
];

const upcomingEvents: Event[] = [
  { id: 1, title: 'Wildlife Photo Exhibition', date: 'May 5, 2025', attendees: 120 },
  { id: 2, title: 'Zoo Conservation Talk', date: 'May 12, 2025', attendees: 85 },
];

export default function SIZOPIDashboard(): JSX.Element {
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
          <SidebarItem icon={<Activity size={20} />} label="Dashboard" active={true} collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Package size={20} />} label="Animals" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Map size={20} />} label="Zoo Map" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Calendar size={20} />} label="Events" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Users size={20} />} label="Staff" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<AlertTriangle size={20} />} label="Alerts" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" collapsed={sidebarCollapsed} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
              A
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="font-medium">Admin User</p>
                <p className="text-sm text-gray-500">Zoo Manager</p>
              </div>
            )}
          </div>
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
                A
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Zoo Dashboard Overview</h2>
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Animals" value="543" change="+12" iconColor="text-blue-500" bgColor="bg-blue-100" />
            <StatCard title="Daily Visitors" value="1,245" change="+28%" iconColor="text-emerald-500" bgColor="bg-emerald-100" />
            <StatCard title="Active Exhibits" value="32" change="-2" iconColor="text-amber-500" bgColor="bg-amber-100" />
            <StatCard title="Staff On Duty" value="87" change="+5" iconColor="text-purple-500" bgColor="bg-purple-100" />
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Monthly Visitors</h3>
                <select className="text-sm border rounded-md px-2 py-1">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={visitorsData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="visitors" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Animal Distribution</h3>
                <button className="text-sm text-emerald-600">View Details</button>
              </div>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={animalDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: { name: string; percent: number }) => 
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {animalDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Alert & Events Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Recent Alerts</h3>
                <button className="text-sm text-emerald-600">View All</button>
              </div>
              <div className="space-y-4">
                {recentAlerts.map(alert => (
                  <div key={alert.id} className="flex items-start p-3 border-l-4 border-amber-500 bg-amber-50 rounded-r">
                    <div className="ml-2">
                      <p className="font-medium">{alert.type}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Upcoming Events</h3>
                <button className="text-sm text-emerald-600">Add Event</button>
              </div>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex flex-col items-center justify-center mr-4">
                      <span className="text-xs">{event.date.split(',')[0].split(' ')[0]}</span>
                      <span className="font-bold">{event.date.split(',')[0].split(' ')[1]}</span>
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        <span>{event.date}</span>
                        <span className="mx-2">•</span>
                        <span>{event.attendees} attendees</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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

function StatCard({ title, value, change, iconColor, bgColor }: StatCardProps): JSX.Element {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center ${iconColor}`}>
          <Activity size={24} />
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
        <span className="text-sm text-gray-500 ml-1">from last period</span>
      </div>
    </div>
  );
}