import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

// Define types for the user profile
type UserRole = "visitor" | "veterinarian" | "animalKeeper" | "adminStaff" | "showTrainer";

interface ProfileFormData {
  username: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;

  // Visitor fields
  fullAddress?: string;
  birthDate?: string;

  // Veterinarian fields
  certificationNumber?: string;
  specializations?: {
    largeMammals: boolean;
    reptiles: boolean;
    exoticBirds: boolean;
    primates: boolean;
    other: boolean;
    otherSpecialization?: string;
  };

  // Staff fields
  staffId?: string;
}

interface ProfileEditFormProps {
  initialData: ProfileFormData;
  userRole: UserRole;
  onSubmit: (data: ProfileFormData) => void;
}

export default function ProfileEditForm({ initialData, userRole, onSubmit }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Success notification could be added here
    } catch (error) {
      console.error("Error updating profile:", error);
      // Error handling could be added here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">PENGATURAN PROFIL</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Common fields for all users */}
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
        {userRole === "visitor" && (
          <div className="space-y-4 pt-4 border-t">
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
        {userRole === "veterinarian" && (
          <div className="space-y-4 pt-4 border-t">
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

            <div className="space-y-2">
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
        {(userRole === "animalKeeper" || userRole === "adminStaff" || userRole === "showTrainer") && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">
              {userRole === "animalKeeper" ? "Untuk Penjaga Hewan" :
               userRole === "adminStaff" ? "Untuk Staf Administrasi" :
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

        <div className="flex space-x-4 pt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "MENYIMPAN..." : "SIMPAN"}
          </Button>

          <Button type="button" variant="outline" asChild>
            <Link href="/protected/reset-password">
              UBAH PASSWORD
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}