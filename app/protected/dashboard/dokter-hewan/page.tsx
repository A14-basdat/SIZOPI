"use client";

import { useState } from 'react';
import { Activity, Menu, Package, Map, Calendar, Users, AlertTriangle, Settings, Search, Bell, ChevronDown, Clipboard } from 'lucide-react';

// TypeScript interfaces
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

interface MedicalRecordProps {
  animalId: string;
  animalName: string;
  species: string;
  lastTreated: string;
  condition: string;
}

// Sample data
const recentMedicalRecords: MedicalRecordProps[] = [
  { animalId: "A001", animalName: "Leo", species: "Lion", lastTreated: "April 24, 2025", condition: "Routine check-up" },
  { animalId: "A052", animalName: "Bella", species: "Elephant", lastTreated: "April 22, 2025", condition: "Wound treatment" },
  { animalId: "A124", animalName: "Charlie", species: "Chimpanzee", lastTreated: "April 20, 2025", condition: "Dietary issues" },
  { animalId: "A089", animalName: "Daisy", species: "Giraffe", lastTreated: "April 18, 2025", condition: "Annual check-up" },
];

export default function VeterinarianDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // User profile data
  const userProfile = {
    fullName: "Dr. Sarah Miller",
    username: "dr_miller",
    email: "sarah.miller@sizopi.com",
    phoneNumber: "+1 (555) 987-6543",
    role: "Veterinarian",
    certificationNumber: "VET-2023-1587",
    specializations: ["Large Mammals", "Wildlife Medicine", "Exotic Species"],
    animalsTreated: 243
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
              S
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
                {userProfile.fullName.split(' ')[0][0]}
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
                  {userProfile.fullName.split(' ')[0][0]}
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
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{userProfile.phoneNumber}</p>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Certification Number</p>
                    <p className="font-medium">{userProfile.certificationNumber}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Specializations</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {userProfile.specializations.map((spec, index) => (
                        <span key={index} className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
              
              <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Animals Treated</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-emerald-600">{userProfile.animalsTreated}</p>
                  <div className="text-emerald-500 flex items-center">
                    <Clipboard size={18} className="mr-1" />
                    <span className="text-sm">+8 this week</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Medical Records</h4>
                  <span className="text-sm text-emerald-600">243 records</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{width: '75%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Last updated: April 27, 2025</p>
              </div>
            </div>
          </div>
          
          {/* Recent Medical Records */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Medical Records</h3>
              <button className="text-sm text-emerald-600">View All Records</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Animal</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Species</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Last Treated</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMedicalRecords.map((record, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{record.animalId}</td>
                      <td className="px-4 py-3 font-medium">{record.animalName}</td>
                      <td className="px-4 py-3 text-sm">{record.species}</td>
                      <td className="px-4 py-3 text-sm">{record.lastTreated}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                          {record.condition}
                        </span>
                      </td>
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