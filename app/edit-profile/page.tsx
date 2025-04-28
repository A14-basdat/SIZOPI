"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordChangeForm from "@/components/password-change-form";
import Link from "next/link";

// Define user roles
type UserRole = "visitor" | "veterinarian" | "animalKeeper" | "adminStaff" | "showTrainer";

// Define the possible views for the profile page
type ProfileView = "edit" | "password";

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

export default function EditProfilePage() {
  // State to control which view to display (profile edit or password change)
  const [currentView, setCurrentView] = useState<ProfileView>("edit");

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

  // State for edited profile data
  const [selectedRole, setSelectedRole] = useState<UserRole>("visitor");
  const [formData, setFormData] = useState<UserProfile>(profilesData[selectedRole]);

  // Update form data when role changes
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setFormData(profilesData[role]);
  };

  // State for notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Function to handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('specializations.')) {
      const specializationKey = name.split('.')[1] as keyof typeof formData.specializations;
      setFormData({
        ...formData,
        specializations: {
          ...formData.specializations,
          [specializationKey]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // In a real application, this would call an API to update the profile
    console.log("Saving profile data:", formData);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show success message
    setNotification({
      type: "success",
      message: "Profil berhasil diperbarui!"
    });

    // Clear notification after a delay
    setTimeout(() => setNotification(null), 3000);
  };

  // Function to handle password change submission
  const handlePasswordChange = async (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    // In a real application, this would call an API to change the password
    console.log("Changing password:", data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show success message
    setNotification({
      type: "success",
      message: "Password berhasil diubah!"
    });

    // Go back to profile view
    setCurrentView("edit");

    // Clear notification after a delay
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      {/* Notification display */}
      {notification && (
        <div
          className={`mb-6 px-4 py-3 rounded ${
            notification.type === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Back to profile link */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/profile">
            ← Kembali ke Profil
          </Link>
        </Button>
      </div>

      {/* Demo controls - allows switching between different user roles */}
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md mb-6">
        <p className="font-medium mb-2">Demo: Ubah Peran Pengguna</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedRole === "visitor" ? "default" : "outline"}
            onClick={() => handleRoleChange("visitor")}
          >
            Pengunjung
          </Button>
          <Button
            size="sm"
            variant={selectedRole === "veterinarian" ? "default" : "outline"}
            onClick={() => handleRoleChange("veterinarian")}
          >
            Dokter Hewan
          </Button>
          <Button
            size="sm"
            variant={selectedRole === "animalKeeper" ? "default" : "outline"}
            onClick={() => handleRoleChange("animalKeeper")}
          >
            Penjaga Hewan
          </Button>
          <Button
            size="sm"
            variant={selectedRole === "adminStaff" ? "default" : "outline"}
            onClick={() => handleRoleChange("adminStaff")}
          >
            Staf Administrasi
          </Button>
          <Button
            size="sm"
            variant={selectedRole === "showTrainer" ? "default" : "outline"}
            onClick={() => handleRoleChange("showTrainer")}
          >
            Pelatih Pertunjukan
          </Button>
        </div>
      </div>

      {/* Conditional rendering based on the current view */}
      {currentView === "edit" ? (
        /* Profile edit form */
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6">PENGATURAN PROFIL</h2>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username: (tidak dapat diubah)</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email:</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nama Depan:</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="middleName">Nama Tengah: (opsional)</Label>
                <Input
                  id="middleName"
                  name="middleName"
                  value={formData.middleName || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastName">Nama Belakang:</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Nomor Telepon:</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Visitor-specific fields */}
          {selectedRole === "visitor" && (
            <div className="space-y-4 pt-4 mt-4 border-t">
              <h3 className="text-lg font-semibold">Untuk Pengunjung</h3>

              <div className="grid gap-2">
                <Label htmlFor="fullAddress">Alamat Lengkap:</Label>
                <Input
                  id="fullAddress"
                  name="fullAddress"
                  value={formData.fullAddress || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="birthDate">Tanggal Lahir:</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate || ""}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* Veterinarian-specific fields */}
          {selectedRole === "veterinarian" && (
            <div className="space-y-4 pt-4 mt-4 border-t">
              <h3 className="text-lg font-semibold">Untuk Dokter Hewan</h3>

              <div className="grid gap-2">
                <Label htmlFor="certificationNumber">Nomor Sertifikasi Profesional: (tidak dapat diubah)</Label>
                <Input
                  id="certificationNumber"
                  name="certificationNumber"
                  value={formData.certificationNumber || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label>Spesialisasi:</Label>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="largeMammals"
                      name="specializations.largeMammals"
                      checked={formData.specializations?.largeMammals || false}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          specializations: {
                            ...formData.specializations,
                            largeMammals: !formData.specializations?.largeMammals
                          }
                        })
                      }
                    />
                    <Label htmlFor="largeMammals" className="cursor-pointer">
                      Mamalia Besar
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reptiles"
                      name="specializations.reptiles"
                      checked={formData.specializations?.reptiles || false}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          specializations: {
                            ...formData.specializations,
                            reptiles: !formData.specializations?.reptiles
                          }
                        })
                      }
                    />
                    <Label htmlFor="reptiles" className="cursor-pointer">
                      Reptil
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="exoticBirds"
                      name="specializations.exoticBirds"
                      checked={formData.specializations?.exoticBirds || false}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          specializations: {
                            ...formData.specializations,
                            exoticBirds: !formData.specializations?.exoticBirds
                          }
                        })
                      }
                    />
                    <Label htmlFor="exoticBirds" className="cursor-pointer">
                      Burung Eksotis
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="primates"
                      name="specializations.primates"
                      checked={formData.specializations?.primates || false}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          specializations: {
                            ...formData.specializations,
                            primates: !formData.specializations?.primates
                          }
                        })
                      }
                    />
                    <Label htmlFor="primates" className="cursor-pointer">
                      Primata
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="other"
                      name="specializations.other"
                      checked={formData.specializations?.other || false}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          specializations: {
                            ...formData.specializations,
                            other: !formData.specializations?.other
                          }
                        })
                      }
                    />
                    <Label htmlFor="other" className="cursor-pointer">
                      Lainnya:
                    </Label>
                    <Input
                      id="otherSpecialization"
                      name="specializations.otherSpecialization"
                      value={formData.specializations?.otherSpecialization || ""}
                      onChange={handleChange}
                      className="w-60"
                      disabled={!formData.specializations?.other}
                    />
                  </div>
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
                <Label htmlFor="staffId">ID Staf: (tidak dapat diubah)</Label>
                <Input
                  id="staffId"
                  name="staffId"
                  value={formData.staffId || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-4 pt-6 mt-4">
            <Button type="submit">
              SIMPAN
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentView("password")}
            >
              UBAH PASSWORD
            </Button>
          </div>
        </form>
      ) : currentView === "password" ? (
        /* Password change view */
        <PasswordChangeForm
          onSubmit={handlePasswordChange}
          onCancel={() => setCurrentView("edit")}
        />
      ) : null}
    </div>
  );
}