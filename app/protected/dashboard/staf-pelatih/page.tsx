"use client";

import { useState } from 'react';
import { Activity, Menu, Package, Map, Calendar, Users, AlertTriangle, Settings, Search, Bell, ChevronDown, Award } from 'lucide-react';

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
}

interface ShowProps {
  id: number;
  title: string;
  time: string;
  location: string;
  animals: string[];
  status: string;
}

// Sample data
const trainedAnimals: TrainedAnimalProps[] = [
  { animalId: "A042", animalName: "Max", species: "Dolphin", trainingStatus: "Advanced", lastTraining: "Today, 9:00 AM" },
  { animalId: "A078", animalName: "Luna", species: "Sea Lion", trainingStatus: "Intermediate", lastTraining: "Today, 10:30 AM" },
  { animalId: "A103", animalName: "Oscar", species: "Parrot", trainingStatus: "Beginner", lastTraining: "Yesterday, 3:00 PM" },
  { animalId: "A056", animalName: "Ruby", species: "Elephant", trainingStatus: "Advanced", lastTraining: "Yesterday, 1:15 PM" },
];

const todaysShows: ShowProps[] = [
  { 
    id: 1, 
    title: "Marine Mammals Spectacular", 
    time: "11:00 AM", 
    location: "Aquatic Arena", 
    animals: ["Max", "Luna"], 
    status: "Upcoming" 
  },
  { 
    id: 2, 
    title: "Birds of Paradise Show", 
    time: "2:00 PM", 
    location: "Aviary Theater", 
    animals: ["Oscar"], 
    status: "Upcoming" 
  },
  { 
    id: 3, 
    title: "Elephant Encounter", 
    time: "4:30 PM", 
    location: "Safari Stage", 
    animals: ["Ruby"], 
    status: "Upcoming" 
  }
];

export default function TrainerDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // User profile data
  const userProfile = {
    fullName: "Michael Chen",
    username: "michael_trainer",
    email: "michael.chen@sizopi.com",
    phoneNumber: "+1 (555) 234-5678",
    role: "Performance Trainer",
    staffId: "TR-2024-0087"
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
              M
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
          <h2 className="text-2xl font-bold mb-6">Staff Pelatih Hewan Dashboard</h2>
          
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start">
              <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 text-2xl font-bold mr-4">
                {userProfile.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{userProfile.fullName}</h3>
                <p className="text-emerald-600 font-medium">{userProfile.role}</p>
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
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{userProfile.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Staff ID</p>
                <p className="font-medium">{userProfile.staffId}</p>
              </div>
            </div>
          </div>
          
          {/* Today's Shows */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Today's Show Schedule</h3>
              <button className="text-sm text-emerald-600">View Full Schedule</button>
            </div>
            
            <div className="space-y-4">
              {todaysShows.map(show => (
                <div key={show.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-lg flex flex-col items-center justify-center mr-4">
                    <span className="text-xs">Today</span>
                    <span className="font-bold">{show.time}</span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{show.title}</p>
                    <p className="text-sm text-gray-500">
                      <span>{show.location}</span>
                      <span className="mx-2">•</span>
                      <span>Animals: {show.animals.join(", ")}</span>
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
          </div>
          
          {/* Trained Animals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Trained Animals</h3>
              <button className="text-sm text-emerald-600">View All Animals</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Species</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Training Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Last Training</th>
                  </tr>
                </thead>
                <tbody>
                  {trainedAnimals.map((animal, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{animal.animalId}</td>
                      <td className="px-4 py-3 font-medium">{animal.animalName}</td>
                      <td className="px-4 py-3 text-sm">{animal.species}</td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={animal.trainingStatus} />
                      </td>
                      <td className="px-4 py-3 text-sm">{animal.lastTraining}</td>
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

// Status Badge Helper Component
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

// Helper Component
function SidebarItem({ icon, label, active = false, collapsed = false }: SidebarItemProps) {
  return (
    <div className={`flex items-center p-3 rounded-lg ${active ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'}`}>
      <div className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}