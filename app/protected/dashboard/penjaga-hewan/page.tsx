"use client";

import { useState } from 'react';
import { Activity, Menu, Package, Map, Calendar, Users, AlertTriangle, Settings, Search, Bell, ChevronDown } from 'lucide-react';

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

// Sample data
const recentlyFedAnimals: AnimalFeedProps[] = [
  { animalId: "A001", animalName: "Leo", type: "Lion", lastFed: "Today, 9:30 AM" },
  { animalId: "A052", animalName: "Bella", type: "Elephant", lastFed: "Today, 10:15 AM" },
  { animalId: "A124", animalName: "Charlie", type: "Chimpanzee", lastFed: "Today, 11:00 AM" },
  { animalId: "A089", animalName: "Daisy", type: "Giraffe", lastFed: "Today, 12:30 PM" },
];

export default function AnimalKeeperDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // User profile data
  const userProfile = {
    fullName: "Alice Johnson",
    username: "alice_keeper",
    email: "alice.johnson@sizopi.com",
    phoneNumber: "+1 (555) 123-4567",
    role: "Animal Keeper",
    staffId: "SK-2023-0042",
    animalsFed: 127
  };

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
              A
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="font-medium">{userProfile.fullName}</p>
                <p className="text-sm text-gray-500">{userProfile.role}</p>
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
                {userProfile.fullName.charAt(0)}
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
                </div>
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{userProfile.phoneNumber}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Staff ID</p>
                    <p className="font-medium">{userProfile.staffId}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
              
              <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Animals Fed</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-emerald-600">{userProfile.animalsFed}</p>
                  <div className="text-emerald-500 flex items-center">
                    <Activity size={18} className="mr-1" />
                    <span className="text-sm">+12 today</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Daily Goal</h4>
                  <span className="text-sm text-emerald-600">80%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{width: '80%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recently Fed Animals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recently Fed Animals</h3>
              <button className="text-sm text-emerald-600">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Animal</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Last Fed</th>
                  </tr>
                </thead>
                <tbody>
                  {recentlyFedAnimals.map((animal, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{animal.animalId}</td>
                      <td className="px-4 py-3 font-medium">{animal.animalName}</td>
                      <td className="px-4 py-3 text-sm">{animal.type}</td>
                      <td className="px-4 py-3 text-sm">{animal.lastFed}</td>
                    </tr>
                  ))}
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
    <div className={`flex items-center p-3 rounded-lg ${active ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'}`}>
      <div className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}