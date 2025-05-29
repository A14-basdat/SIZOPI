"use client";

import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, use } from "react";

interface SignupProps {
  searchParams?: Promise<Message>;
}

export default function Signup({ searchParams }: SignupProps) {
  // Unwrap searchParams using React.use()
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;
  
  const [selectedRole, setSelectedRole] = useState<'pengunjung' | 'dokter_hewan' | 'staff' | ''>('');
  const [selectedStaffRole, setSelectedStaffRole] = useState<'penjaga' | 'admin' | 'pelatih' | ''>('');
  const [selectedSpesialisasi, setSelectedSpesialisasi] = useState<string[]>([]);
  const [customSpesialisasi, setCustomSpesialisasi] = useState('');

  // Debug: Log the search params to see what we're getting
  console.log('Sign-up page search params:', resolvedSearchParams);

  const handleSpesialisasiChange = (spesialisasi: string, checked: boolean) => {
    if (checked) {
      setSelectedSpesialisasi([...selectedSpesialisasi, spesialisasi]);
    } else {
      setSelectedSpesialisasi(selectedSpesialisasi.filter(s => s !== spesialisasi));
    }
  };

  const generateStaffId = (peran: string): string => {
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const paddedNum = randomNum.toString().padStart(3, '0');
    
    switch (peran) {
      case 'penjaga':
        return `PJH${paddedNum}`;
      case 'admin':
        return `ADM${paddedNum}`;
      case 'pelatih':
        return `PLP${paddedNum}`;
      default:
        return `STF${paddedNum}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link className="font-medium text-indigo-600 hover:text-indigo-500 underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6">
          {/* Display error/success messages from stored procedures and triggers */}
          {resolvedSearchParams && (
            <div className="mb-6">
              <FormMessage message={resolvedSearchParams} />
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium text-gray-900">Select Your Role</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="pengunjung"
                    checked={selectedRole === 'pengunjung'}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="mr-2"
                  />
                  <span>Pengunjung (Visitor)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="dokter_hewan"
                    checked={selectedRole === 'dokter_hewan'}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="mr-2"
                  />
                  <span>Dokter Hewan (Veterinarian)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="staff"
                    checked={selectedRole === 'staff'}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="mr-2"
                  />
                  <span>Staff</span>
                </label>
              </div>
            </div>
          </div>

          {selectedRole && (
            <>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input 
                    name="username" 
                    required 
                    className={`mt-1 ${resolvedSearchParams && 'error' in resolvedSearchParams ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input name="email" type="email" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input name="password" type="password" minLength={6} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input name="confirmPassword" type="password" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="nama_depan">First Name *</Label>
                  <Input name="nama_depan" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="nama_tengah">Middle Name</Label>
                  <Input name="nama_tengah" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="nama_belakang">Last Name *</Label>
                  <Input name="nama_belakang" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="no_telepon">Phone Number *</Label>
                  <Input name="no_telepon" required className="mt-1" />
                </div>
              </div>

              {/* Role-specific fields */}
              {selectedRole === 'pengunjung' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Visitor Information</h3>
                  <div>
                    <Label htmlFor="alamat">Full Address *</Label>
                    <textarea
                      name="alamat"
                      required
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Enter your complete address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tgl_lahir">Date of Birth *</Label>
                    <Input name="tgl_lahir" type="date" required className="mt-1" />
                  </div>
                </div>
              )}

              {selectedRole === 'dokter_hewan' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Veterinarian Information</h3>
                  <div>
                    <Label htmlFor="no_str">Professional Certification Number *</Label>
                    <Input name="no_str" required className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-base font-medium text-gray-900">Specialization *</Label>
                    <div className="mt-2 space-y-2">
                      {['Mamalia Besar', 'Reptil', 'Burung Eksotis', 'Primata'].map((spec) => (
                        <label key={spec} className="flex items-center">
                          <input
                            type="checkbox"
                            name="spesialisasi"
                            value={spec}
                            checked={selectedSpesialisasi.includes(spec)}
                            onChange={(e) => handleSpesialisasiChange(spec, e.target.checked)}
                            className="mr-2"
                          />
                          <span>{spec}</span>
                        </label>
                      ))}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSpesialisasi.includes(customSpesialisasi) && customSpesialisasi !== ''}
                          onChange={(e) => {
                            if (e.target.checked && customSpesialisasi) {
                              handleSpesialisasiChange(customSpesialisasi, true);
                            } else {
                              setSelectedSpesialisasi(prev => prev.filter(s => s !== customSpesialisasi));
                            }
                          }}
                          className="mr-2"
                        />
                        <span>Other:</span>
                        <Input
                          value={customSpesialisasi}
                          onChange={(e) => setCustomSpesialisasi(e.target.value)}
                          placeholder="Specify other specialization"
                          className="ml-2 flex-1"
                        />
                        {customSpesialisasi && (
                          <input type="hidden" name="spesialisasi" value={customSpesialisasi} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'staff' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Staff Information</h3>
                  <div>
                    <Label className="text-base font-medium text-gray-900">Staff Role *</Label>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="peran"
                          value="penjaga"
                          checked={selectedStaffRole === 'penjaga'}
                          onChange={(e) => setSelectedStaffRole(e.target.value as any)}
                          className="mr-2"
                        />
                        <span>Penjaga Hewan (Animal Keeper) - {generateStaffId('penjaga')}</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="peran"
                          value="admin"
                          checked={selectedStaffRole === 'admin'}
                          onChange={(e) => setSelectedStaffRole(e.target.value as any)}
                          className="mr-2"
                        />
                        <span>Staf Administrasi (Administrative Staff) - {generateStaffId('admin')}</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="peran"
                          value="pelatih"
                          checked={selectedStaffRole === 'pelatih'}
                          onChange={(e) => setSelectedStaffRole(e.target.value as any)}
                          className="mr-2"
                        />
                        <span>Pelatih Pertunjukan (Show Trainer) - {generateStaffId('pelatih')}</span>
                      </label>
                    </div>
                  </div>
                  {selectedStaffRole && (
                    <div>
                      <Label htmlFor="id_staf_display">Staff ID</Label>
                      <Input 
                        value={generateStaffId(selectedStaffRole)} 
                        disabled 
                        className="mt-1 bg-gray-100"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <SubmitButton 
                  formAction={signUpAction}
                  pendingText="Creating Account..."
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Account
                </SubmitButton>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
