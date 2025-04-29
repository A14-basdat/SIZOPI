"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// Define user roles
type UserRole = "visitor" | "veterinarian" | "animalKeeper" | "adminStaff" | "showTrainer";

interface UserProfile {
  username: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;

  // Role-specific fields
  userRole: UserRole;
  fullAddress?: string;
  birthDate?: string;
  certificationNumber?: string;
  staffId?: string;
  specializations?: {
    largeMammals: boolean;
    reptiles: boolean;
    exoticBirds: boolean;
    primates: boolean;
    other: boolean;
    otherSpecialization?: string;
  };
}

export default function ProfilePage() {
  // Hardcoded profile data with complete details
  const profilesData: Record<UserRole, UserProfile> = {
    visitor: {
      username: "budisantoso",
      email: "budi.santoso@example.com",
      firstName: "Budi",
      middleName: "",
      lastName: "Santoso",
      phoneNumber: "081234567890",
      userRole: "visitor",
      fullAddress: "Jl. Mangga Besar No. 45, Jakarta Barat",
      birthDate: "1992-06-18"
    },
    veterinarian: {
      username: "drsiti",
      email: "dr.siti@example.com",
      firstName: "Siti",
      middleName: "",
      lastName: "Aminah",
      phoneNumber: "081345678901",
      userRole: "veterinarian",
      certificationNumber: "DH-2020-56789",
      specializations: {
        largeMammals: true,
        reptiles: false,
        exoticBirds: false,
        primates: true,
        other: false,
        otherSpecialization: ""
      }
    },
    animalKeeper: {
      username: "rudihartono",
      email: "rudi.hartono@example.com",
      firstName: "Rudi",
      middleName: "Putra",
      lastName: "Hartono",
      phoneNumber: "081456789012",
      userRole: "animalKeeper",
      staffId: "STF-2024-1122"
    },
    adminStaff: {
      username: "mayaindah",
      email: "maya.indah@example.com",
      firstName: "Maya",
      middleName: "",
      lastName: "Indah",
      phoneNumber: "081567890123",
      userRole: "adminStaff",
      staffId: "STF-2024-3344"
    },
    showTrainer: {
      username: "aguspratama",
      email: "agus.pratama@example.com",
      firstName: "Agus",
      middleName: "Budi",
      lastName: "Pratama",
      phoneNumber: "081678901234",
      userRole: "showTrainer",
      staffId: "STF-2024-5566"
    }
  };

  // State to control which profile to display
  const [selectedRole, setSelectedRole] = useState<UserRole>("visitor");
  const profileData = profilesData[selectedRole];

  // Helper function to get role name in Indonesian
  const getRoleName = (role: UserRole): string => {
    switch(role) {
      case "visitor": return "Pengunjung";
      case "veterinarian": return "Dokter Hewan";
      case "animalKeeper": return "Penjaga Hewan";
      case "adminStaff": return "Staf Administrasi";
      case "showTrainer": return "Pelatih Pertunjukan";
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      {/* Demo controls - allows switching between different user roles */}
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md mb-6">
        <p className="font-medium mb-2">Demo: Lihat Profil Berdasarkan Peran</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedRole === "visitor" ? "default" : "outline"}
            onClick={() => setSelectedRole("visitor")}
          >
            Pengunjung
          </Button>
          <Button
            size="sm"
            variant={selectedRole === "veterinarian" ? "default" : "outline"}
            onClick={() => setSelectedRole("veterinarian")}
          >
            Dokter Hewan
          </Button>
          <Button
            size="sm"
            variant={selectedRole === "animalKeeper" ? "default" : "outline"}
            onClick={() => setSelectedRole("animalKeeper")}
          >
            Penjaga Hewan
          </Button>
          <Button
            size="sm"
            variant={selectedRole === "adminStaff" ? "default" : "outline"}
            onClick={() => setSelectedRole("adminStaff")}
          >
            Staf Administrasi
          </Button>
          <Button
            size="sm"
            variant={selectedRole === "showTrainer" ? "default" : "outline"}
            onClick={() => setSelectedRole("showTrainer")}
          >
            Pelatih Pertunjukan
          </Button>
        </div>
      </div>

      {/* Profile information */}
      <div className="bg-card p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">PROFIL PENGGUNA</h2>

          <Button asChild>
            <Link href="/edit-profile">
              Edit Profil
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username:</Label>
            <div className="p-2 bg-muted rounded-md">{profileData.username}</div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email:</Label>
            <div className="p-2 bg-muted rounded-md">{profileData.email}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Nama Depan:</Label>
              <div className="p-2 bg-muted rounded-md">{profileData.firstName}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="middleName">Nama Tengah:</Label>
              <div className="p-2 bg-muted rounded-md">{profileData.middleName || "-"}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Nama Belakang:</Label>
              <div className="p-2 bg-muted rounded-md">{profileData.lastName}</div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">Nomor Telepon:</Label>
            <div className="p-2 bg-muted rounded-md">{profileData.phoneNumber}</div>
          </div>
        </div>

        {/* Visitor-specific fields */}
        {selectedRole === "visitor" && (
          <div className="space-y-4 pt-4 mt-4 border-t">
            <h3 className="text-lg font-semibold">Untuk Pengunjung</h3>

            <div className="grid gap-2">
              <Label htmlFor="fullAddress">Alamat Lengkap:</Label>
              <div className="p-2 bg-muted rounded-md">{profileData.fullAddress}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="birthDate">Tanggal Lahir:</Label>
              <div className="p-2 bg-muted rounded-md">
                {new Date(profileData.birthDate || "").toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </div>
            </div>
          </div>
        )}

        {/* Veterinarian-specific fields */}
        {selectedRole === "veterinarian" && (
          <div className="space-y-4 pt-4 mt-4 border-t">
            <h3 className="text-lg font-semibold">Untuk Dokter Hewan</h3>

            <div className="grid gap-2">
              <Label htmlFor="certificationNumber">Nomor Sertifikasi Profesional:</Label>
              <div className="p-2 bg-muted rounded-md">{profileData.certificationNumber}</div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Spesialisasi:</Label>

              <div className="p-2 bg-muted rounded-md">
                <ul className="list-disc pl-5 space-y-1">
                  {profileData.specializations?.largeMammals && <li>Mamalia Besar</li>}
                  {profileData.specializations?.reptiles && <li>Reptil</li>}
                  {profileData.specializations?.exoticBirds && <li>Burung Eksotis</li>}
                  {profileData.specializations?.primates && <li>Primata</li>}
                  {profileData.specializations?.other && (
                    <li>
                      Lainnya: {profileData.specializations.otherSpecialization || ""}
                    </li>
                  )}
                  {!profileData.specializations?.largeMammals &&
                   !profileData.specializations?.reptiles &&
                   !profileData.specializations?.exoticBirds &&
                   !profileData.specializations?.primates &&
                   !profileData.specializations?.other &&
                   <li>Tidak ada spesialisasi</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Staff-specific fields (Animal Keepers, Admin Staff, Show Trainers) */}
        {(selectedRole === "animalKeeper" || selectedRole === "adminStaff" || selectedRole === "showTrainer") && (
          <div className="space-y-4 pt-4 mt-4 border-t">
            <h3 className="text-lg font-semibold">
              {selectedRole === "animalKeeper" ? "Untuk Penjaga Hewan" :
               selectedRole === "adminStaff" ? "Untuk Staf Administrasi" :
               "Untuk Pelatih Pertunjukan"}
            </h3>

            <div className="grid gap-2">
              <Label htmlFor="staffId">ID Staf:</Label>
              <div className="p-2 bg-muted rounded-md">{profileData.staffId}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}