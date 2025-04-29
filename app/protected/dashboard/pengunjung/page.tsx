"use client";

import { useState } from 'react';
import { Calendar, User, Mail, Phone, Home, Clock, Ticket, ChevronDown, Search, Bell, Menu, LogOut } from 'lucide-react';
import React, { ReactNode } from 'react';
import { JSX } from 'react/jsx-runtime';

// TypeScript interfaces
interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

interface VisitHistory {
  id: number;
  date: string;
  entranceTime: string;
  exitTime: string;
}

interface PurchasedTicket {
  id: number;
  ticketType: string;
  purchaseDate: string;
  visitDate: string;
  price: string;
  status: string;
}

// Sample visitor data
const visitorData = {
  fullName: "Sarah Johnson",
  username: "sarahj",
  email: "sarah.johnson@example.com",
  phoneNumber: "+1 (555) 123-4567",
  role: "Visitor",
  fullAddress: "123 Park Avenue, Greenville, CA 94582, United States",
  dateOfBirth: "May 15, 1990"
};

// Sample visit history
const visitHistoryData: VisitHistory[] = [
  { id: 1, date: "April 25, 2025", entranceTime: "10:30 AM", exitTime: "4:15 PM" },
  { id: 2, date: "March 12, 2025", entranceTime: "11:00 AM", exitTime: "3:45 PM" },
  { id: 3, date: "February 5, 2025", entranceTime: "9:15 AM", exitTime: "2:30 PM" },
  { id: 4, date: "January 18, 2025", entranceTime: "1:30 PM", exitTime: "5:20 PM" },
];

// Sample purchased tickets
const purchasedTicketsData: PurchasedTicket[] = [
  { id: 1, ticketType: "Adult Full Day Pass", purchaseDate: "April 20, 2025", visitDate: "April 25, 2025", price: "$24.99", status: "Used" },
  { id: 2, ticketType: "Adult Full Day Pass + Safari Experience", purchaseDate: "March 5, 2025", visitDate: "March 12, 2025", price: "$39.99", status: "Used" },
  { id: 3, ticketType: "Family Pass (2 Adults, 2 Children)", purchaseDate: "April 22, 2025", visitDate: "May 5, 2025", price: "$79.99", status: "Active" },
  { id: 4, ticketType: "Night Safari Special", purchaseDate: "April 24, 2025", visitDate: "May 10, 2025", price: "$34.99", status: "Active" },
];

export default function VisitorDashboard(): JSX.Element {
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
          <SidebarItem icon={<Ticket size={20} />} label="My Tickets" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Clock size={20} />} label="Visit History" collapsed={sidebarCollapsed} />
          <SidebarItem icon={<Calendar size={20} />} label="Book a Visit" collapsed={sidebarCollapsed} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
              {visitorData.fullName.charAt(0)}
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="font-medium">{visitorData.fullName}</p>
                <p className="text-sm text-gray-500">{visitorData.role}</p>
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
                {visitorData.fullName.charAt(0)}
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
                {visitorData.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{visitorData.fullName}</h3>
                <p className="text-emerald-600">{visitorData.role}</p>
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
                    <p className="font-medium">{visitorData.username}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="text-emerald-600 mt-1 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{visitorData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="text-emerald-600 mt-1 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{visitorData.phoneNumber}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Home className="text-emerald-600 mt-1 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Full Address</p>
                    <p className="font-medium">{visitorData.fullAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="text-emerald-600 mt-1 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{visitorData.dateOfBirth}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Visit History */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Visit History</h3>
              <button className="text-sm text-emerald-600">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Entrance Time</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Exit Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visitHistoryData.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{visit.date}</td>
                      <td className="py-3 px-4 text-sm">{visit.entranceTime}</td>
                      <td className="py-3 px-4 text-sm">{visit.exitTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Purchased Tickets */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Purchased Tickets</h3>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                Buy New Ticket
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Ticket Type</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Purchase Date</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Visit Date</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Price</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchasedTicketsData.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{ticket.ticketType}</td>
                      <td className="py-3 px-4 text-sm">{ticket.purchaseDate}</td>
                      <td className="py-3 px-4 text-sm">{ticket.visitDate}</td>
                      <td className="py-3 px-4 text-sm">{ticket.price}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ticket.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status}
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
function SidebarItem({ icon, label, active = false, collapsed = false }: SidebarItemProps): JSX.Element {
  return (
    <div className={`flex items-center p-3 rounded-lg ${active ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'}`}>
      <div className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}