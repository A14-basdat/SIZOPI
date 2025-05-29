"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { InfoIcon, Plus, FileEdit, Trash2, Search, ArrowLeft, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { getCurrentSession, getUserProfile } from "@/app/actions";

// Define proper TypeScript interfaces to match the actual database schema
interface Hewan {
  id: string;
  nama: string;
  spesies: string;
  url_foto: string;
  status_kesehatan: string;
  has_medical_records?: boolean;
}

interface Pengguna {
  nama_depan: string;
  nama_tengah: string | null;
  nama_belakang: string;
}

interface DokterHewan {
  username_dh: string;
  pengguna: Pengguna;
}

interface MedicalRecord {
  id_hewan: string;
  username_dh: string;
  tanggal_pemeriksaan: string;
  diagnosis: string | null;
  pengobatan: string | null;
  status_kesehatan: string;
  catatan_tindak_lanjut: string | null;
  hewan?: {
    nama: string;
    spesies: string;
  };
  dokter_hewan?: {
    username_dh: string;
    pengguna: {
      nama_depan: string;
      nama_tengah: string | null;
      nama_belakang: string;
    };
  };
}

interface NewMedicalRecord {
  id_hewan: string;
  username_dh: string;
  tanggal_pemeriksaan: string;
  diagnosis: string | null;
  pengobatan: string | null;
  status_kesehatan: string;
  catatan_tindak_lanjut: string | null;
}

interface EditMedicalRecord {
  catatan_tindak_lanjut: string;
  diagnosis: string;
  pengobatan: string;
}

interface UserProfile {
  username: string;
  nama_depan: string;
  nama_tengah: string | null;
  nama_belakang: string;
  role: string;
}

export default function ProtectedPage() {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Hewan | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hewan, setHewan] = useState<Hewan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Add new state for trigger messages
  const [triggerMessage, setTriggerMessage] = useState<string>("");
  const [showTriggerMessage, setShowTriggerMessage] = useState<boolean>(false);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Form states for add modal
  const [newRecord, setNewRecord] = useState<NewMedicalRecord>({
    id_hewan: "",
    username_dh: "",
    tanggal_pemeriksaan: format(new Date(), "yyyy-MM-dd"),
    diagnosis: "",
    pengobatan: "",
    status_kesehatan: "Sehat",
    catatan_tindak_lanjut: null,
  });

  // Form states for edit modal - catatan_tindak_lanjut, diagnosis, and pengobatan
  const [editRecord, setEditRecord] = useState<EditMedicalRecord>({
    catatan_tindak_lanjut: "",
    diagnosis: "",
    pengobatan: "",
  });

  const supabase = createClient().schema('sizopi');

  // Updated fetchUserProfile function using actions.ts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('=== FETCHING USER PROFILE FROM SESSION ===');
        
        // Get current session using the function from actions.ts
        const session = await getCurrentSession();
        
        if (!session) {
          console.error("No session found");
          return;
        }

        console.log('Session found:', { username: session.username, role: session.role });

        // Get complete user profile using the function from actions.ts
        const userProfileData = await getUserProfile(session.username);
        
        if (!userProfileData) {
          console.error('Failed to fetch user profile');
          return;
        }

        console.log('User profile fetched:', userProfileData);

        // Check if user is dokter_hewan
        if (userProfileData.role !== 'dokter_hewan') {
          console.error('User is not a dokter_hewan');
          return;
        }

        setUserProfile({
          username: userProfileData.username,
          nama_depan: userProfileData.nama_depan,
          nama_tengah: userProfileData.nama_tengah || null,
          nama_belakang: userProfileData.nama_belakang,
          role: userProfileData.role
        });

        console.log('✅ User profile set successfully');

      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchAnimals();
  }, []);

  useEffect(() => {
    if (selectedAnimal) {
      fetchMedicalRecords();
    }
  }, [selectedAnimal]);

  const fetchAnimals = async () => {
    try {
      // Fetch all animals
      const { data: animalsData, error: animalsError } = await supabase
        .from("hewan")
        .select("*");
      
      if (animalsError) throw animalsError;
      
      if (animalsData) {
        // Check which animals have medical records
        const animalsWithRecordStatus = await Promise.all(
          animalsData.map(async (animal) => {
            const { data: recordsData, error: recordsError } = await supabase
              .from("catatan_medis")
              .select("id_hewan")
              .eq("id_hewan", animal.id)
              .limit(1);
            
            if (recordsError) {
              console.error("Error checking medical records:", recordsError);
              return { ...animal, has_medical_records: false };
            }
            
            return {
              ...animal,
              has_medical_records: recordsData && recordsData.length > 0
            };
          })
        );
        
        setHewan(animalsWithRecordStatus);
      }
    } catch (error) {
      console.error("Error fetching animals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async () => {
    if (!selectedAnimal) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("catatan_medis")
        .select(`
          *,
          hewan(nama, spesies),
          dokter_hewan(username_dh, pengguna(nama_depan, nama_tengah, nama_belakang))
        `)
        .eq("id_hewan", selectedAnimal.id)
        .order("tanggal_pemeriksaan", { ascending: false });

      if (error) throw error;
      if (data) setMedicalRecords(data as MedicalRecord[]);
    } catch (error) {
      console.error("Error fetching medical records:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = hewan.filter((animal) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      animal.nama.toLowerCase().includes(searchTermLower) ||
      animal.spesies.toLowerCase().includes(searchTermLower)
    );
  });

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !selectedAnimal) return;

    try {
      console.log('=== ADDING NEW MEDICAL RECORD ===');
      
      // Check if the examination date is unique for this animal
      const { data: existingRecords, error: checkError } = await supabase
        .from("catatan_medis")
        .select("*")
        .eq("id_hewan", selectedAnimal.id)
        .eq("tanggal_pemeriksaan", newRecord.tanggal_pemeriksaan);

      if (checkError) throw checkError;

      if (existingRecords && existingRecords.length > 0) {
        alert("Tanggal pemeriksaan harus unik untuk setiap hewan.");
        return;
      }

      console.log('Calling stored procedure with trigger...');

      // Use the stored procedure that handles triggers
      const { data, error } = await supabase.rpc('insert_medical_record_with_trigger', {
        p_id_hewan: selectedAnimal.id,
        p_username_dh: userProfile.username,
        p_tanggal_pemeriksaan: newRecord.tanggal_pemeriksaan,
        p_diagnosis: newRecord.status_kesehatan === "Sakit" ? newRecord.diagnosis : null,
        p_pengobatan: newRecord.status_kesehatan === "Sakit" ? newRecord.pengobatan : null,
        p_status_kesehatan: newRecord.status_kesehatan,
        p_catatan_tindak_lanjut: null // Always null for new records
      });

      if (error) {
        console.error("Supabase error:", error);
        setTriggerMessage(`Error: ${error.message}`);
        setMessageType('error');
        setShowTriggerMessage(true);
        setTimeout(() => setShowTriggerMessage(false), 5000);
        return;
      }
      
      console.log('Stored procedure response:', data);
      
      // Handle the response from stored procedure
      if (data) {
        if (data.success) {
          setTriggerMessage(data.message);
          setMessageType('success');
        } else {
          setTriggerMessage(data.message);
          setMessageType('error');
        }
        setShowTriggerMessage(true);
        setTimeout(() => setShowTriggerMessage(false), 5000);
      }
      
      console.log('✅ Medical record added successfully');
      // Refresh the records
      await fetchMedicalRecords();
      await fetchAnimals(); // Refresh animals list to update medical record status
      setIsAddModalOpen(false);
      resetNewRecord();
    } catch (error: any) {
      console.error("Error adding record:", error);
      setTriggerMessage(`Error adding record: ${error.message || "Unknown error"}`);
      setMessageType('error');
      setShowTriggerMessage(true);
      setTimeout(() => setShowTriggerMessage(false), 5000);
    }
  };

  const handleEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !userProfile) return;
    
    try {
      console.log('=== UPDATING MEDICAL RECORD ===');
      
      // Update catatan_tindak_lanjut, diagnosis, and pengobatan
      const { error } = await supabase
        .from("catatan_medis")
        .update({ 
          catatan_tindak_lanjut: editRecord.catatan_tindak_lanjut || null,
          diagnosis: editRecord.diagnosis,
          pengobatan: editRecord.pengobatan
        })
        .eq("id_hewan", selectedRecord.id_hewan)
        .eq("tanggal_pemeriksaan", selectedRecord.tanggal_pemeriksaan);

      if (error) {
        console.error("Supabase update error:", error);
        setTriggerMessage(`Error updating record: ${error.message}`);
        setMessageType('error');
        setShowTriggerMessage(true);
        setTimeout(() => setShowTriggerMessage(false), 5000);
        return;
      }
      
      setTriggerMessage("Rekam medis berhasil diperbarui!");
      setMessageType('success');
      setShowTriggerMessage(true);
      setTimeout(() => setShowTriggerMessage(false), 5000);
      
      // Refresh the records
      await fetchMedicalRecords();
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error("Error updating record:", error);
      setTriggerMessage(`Error updating record: ${error.message || "Unknown error"}`);
      setMessageType('error');
      setShowTriggerMessage(true);
      setTimeout(() => setShowTriggerMessage(false), 5000);
    }
  };

  const handleDeleteRecord = async () => {
    try {
      if (!selectedRecord) return;
      
      const { error } = await supabase
        .from("catatan_medis")
        .delete()
        .eq("id_hewan", selectedRecord.id_hewan)
        .eq("tanggal_pemeriksaan", selectedRecord.tanggal_pemeriksaan);

      if (error) throw error;
      
      // Refresh the records
      await fetchMedicalRecords();
      await fetchAnimals(); // Refresh animals list to update medical record status
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record. Please try again.");
    }
  };

  const openEditModal = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setEditRecord({
      catatan_tindak_lanjut: record.catatan_tindak_lanjut || "",
      diagnosis: record.diagnosis || "",
      pengobatan: record.pengobatan || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const resetNewRecord = () => {
    setNewRecord({
      id_hewan: "",
      username_dh: "",
      tanggal_pemeriksaan: format(new Date(), "yyyy-MM-dd"),
      diagnosis: "",
      pengobatan: "",
      status_kesehatan: "Sehat",
      catatan_tindak_lanjut: null,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNewRecord((prev) => ({
      ...prev,
      status_kesehatan: value,
      // Clear diagnosis and treatment if status is "Sehat"
      diagnosis: value === "Sehat" ? "" : prev.diagnosis,
      pengobatan: value === "Sehat" ? "" : prev.pengobatan,
    }));
  };

  const getDoctorFullName = (dokter: any) => {
    if (!dokter?.pengguna) return 'Unknown';
    const { nama_depan, nama_tengah, nama_belakang } = dokter.pengguna;
    return nama_tengah 
      ? `${nama_depan} ${nama_tengah} ${nama_belakang}`
      : `${nama_depan} ${nama_belakang}`;
  };

  const getCurrentDoctorName = () => {
    if (!userProfile) return '';
    return userProfile.nama_tengah 
      ? `${userProfile.nama_depan} ${userProfile.nama_tengah} ${userProfile.nama_belakang}`
      : `${userProfile.nama_depan} ${userProfile.nama_belakang}`;
  };

  // Check if user is authorized (dokter_hewan)
  if (!userProfile || userProfile.role !== 'dokter_hewan') {
    return (
      <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          <p className="font-semibold">Akses Ditolak</p>
          <p>Halaman ini hanya dapat diakses oleh Dokter Hewan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Halaman Rekam Medis Hewan - Sistem Informasi Zoologi dan Penitipan (SIZOPI)
        </div>
      </div>

      {/* Trigger Message */}
      {showTriggerMessage && (
        <div className={`border px-4 py-3 rounded relative ${
          messageType === 'success' 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            {messageType === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{triggerMessage}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      {!selectedAnimal ? (
        // Animal selection view
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <h1 className="text-3xl font-bold">Daftar Hewan</h1>
            
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                className="bg-background border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
                placeholder="Cari hewan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Animals Table */}
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Hewan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spesies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Catatan Medis
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredAnimals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada hewan ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredAnimals.map((animal, index) => (
                    <tr 
                      key={animal.id} 
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 cursor-pointer`}
                      onClick={() => setSelectedAnimal(animal)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {animal.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {animal.spesies}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          animal.has_medical_records 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {animal.has_medical_records ? "Ada Catatan" : "Belum Ada Catatan"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnimal(animal);
                          }}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-full inline-flex items-center gap-1"
                        >
                          <Eye size={16} />
                          <span className="text-xs">Lihat Rekam Medis</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        // Medical records view for selected animal
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedAnimal(null)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft size={20} />
                Kembali
              </button>
              <h1 className="text-3xl font-bold">
                Rekam Medis - {selectedAnimal.nama} ({selectedAnimal.spesies})
              </h1>
            </div>
            
            <button
              onClick={() => {
                resetNewRecord();
                setIsAddModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg text-sm"
            >
              <Plus size={16} />
              Tambah Rekam Medis
            </button>
          </div>

          {/* Medical Records Table */}
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Pemeriksaan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Dokter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Kesehatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengobatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catatan Tindak Lanjut
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : medicalRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada rekam medis untuk hewan ini
                    </td>
                  </tr>
                ) : (
                  medicalRecords.map((record, index) => (
                    <tr key={`${record.id_hewan}-${record.tanggal_pemeriksaan}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.tanggal_pemeriksaan).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getDoctorFullName(record.dokter_hewan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status_kesehatan === "Sehat" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {record.status_kesehatan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.diagnosis || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.pengobatan || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.catatan_tindak_lanjut || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-center gap-2">
                        {/* Edit button only shown for "Sakit" status */}
                        {record.status_kesehatan === "Sakit" && (
                          <button
                            onClick={() => openEditModal(record)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
                            title="Edit Rekam Medis"
                          >
                            <FileEdit size={16} />
                            <span className="sr-only">Edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(record)}
                          className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-full"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Modal */}
      {isAddModalOpen && selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Tambah Rekam Medis</h2>
            <p className="text-sm mb-4 text-gray-600">
              Hewan: <strong>{selectedAnimal.nama} ({selectedAnimal.spesies})</strong>
            </p>
            
            <form onSubmit={handleAddRecord}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tanggal Pemeriksaan
                </label>
                <input
                  type="date"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newRecord.tanggal_pemeriksaan}
                  onChange={(e) => setNewRecord({ ...newRecord, tanggal_pemeriksaan: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nama Dokter
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100"
                  value={getCurrentDoctorName()}
                  readOnly
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Status
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newRecord.status_kesehatan}
                  onChange={handleStatusChange}
                  required
                >
                  <option value="Sehat">Sehat</option>
                  <option value="Sakit">Sakit</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Diagnosa {newRecord.status_kesehatan === "Sehat" && "(opsional)"}
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newRecord.diagnosis || ""}
                  onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                  required={newRecord.status_kesehatan === "Sakit"}
                  disabled={newRecord.status_kesehatan === "Sehat"}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Pengobatan {newRecord.status_kesehatan === "Sehat" && "(opsional)"}
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newRecord.pengobatan || ""}
                  onChange={(e) => setNewRecord({ ...newRecord, pengobatan: e.target.value })}
                  required={newRecord.status_kesehatan === "Sakit"}
                  disabled={newRecord.status_kesehatan === "Sehat"}
                />
              </div>
              
              <div className="flex items-center justify-end mt-6 gap-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal - For catatan_tindak_lanjut, diagnosis, and pengobatan */}
      {isEditModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Rekam Medis</h2>
            <div className="text-sm mb-4 bg-blue-100 p-3 rounded">
              <p><strong>Tanggal:</strong> {new Date(selectedRecord.tanggal_pemeriksaan).toLocaleDateString('id-ID')}</p>
              <p><strong>Status:</strong> {selectedRecord.status_kesehatan}</p>
              <p><strong>Dokter:</strong> {getDoctorFullName(selectedRecord.dokter_hewan)}</p>
            </div>
            
            <form onSubmit={handleEditRecord}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Catatan Tindak Lanjut (opsional)
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editRecord.catatan_tindak_lanjut}
                  onChange={(e) => setEditRecord({ ...editRecord, catatan_tindak_lanjut: e.target.value })}
                  rows={3}
                  placeholder="Masukkan catatan tindak lanjut..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Diagnosa Baru
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editRecord.diagnosis}
                  onChange={(e) => setEditRecord({ ...editRecord, diagnosis: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Pengobatan Baru
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editRecord.pengobatan}
                  onChange={(e) => setEditRecord({ ...editRecord, pengobatan: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex items-center justify-end mt-6 gap-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Hapus Rekam Medis</h2>
            <p className="text-gray-700 mb-6">
              Apakah anda yakin ingin menghapus rekam medis ini?
            </p>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="text-sm text-gray-600">
                <strong>Tanggal:</strong> {new Date(selectedRecord.tanggal_pemeriksaan).toLocaleDateString('id-ID')}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> {selectedRecord.status_kesehatan}
              </p>
              {selectedRecord.diagnosis && (
                <p className="text-sm text-gray-600">
                  <strong>Diagnosa:</strong> {selectedRecord.diagnosis}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                TIDAK
              </button>
              <button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleDeleteRecord}
              >
                YA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


