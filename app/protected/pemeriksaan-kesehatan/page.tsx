"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { InfoIcon, Plus, FileEdit, Trash2, Search, ArrowLeft, Calendar, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { getCurrentSession, getUserProfile } from "@/app/actions";

// Define proper TypeScript interfaces
interface Hewan {
  id: string;
  nama: string;
  spesies: string;
  url_foto: string;
  status_kesehatan: string;
  has_schedule?: boolean;
}

interface ExaminationSchedule {
  id_hewan: string;
  tgl_pemeriksaan_selanjutnya: string;
  freq_pemeriksaan_rutin: number;
  hewan?: {
    nama: string;
    spesies: string;
  };
}

interface UserProfile {
  username: string;
  nama_depan: string;
  nama_tengah: string | null;
  nama_belakang: string;
  role: string;
}

export default function HealthExaminationPage() {
  const [schedules, setSchedules] = useState<ExaminationSchedule[]>([]);
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState<boolean>(false);
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState<boolean>(false);
  const [isEditFrequencyModalOpen, setIsEditFrequencyModalOpen] = useState<boolean>(false);
  const [isDeleteScheduleModalOpen, setIsDeleteScheduleModalOpen] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ExaminationSchedule | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Hewan | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hewan, setHewan] = useState<Hewan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Add new state for trigger messages
  const [triggerMessage, setTriggerMessage] = useState<string>("");
  const [showTriggerMessage, setShowTriggerMessage] = useState<boolean>(false);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Form states for schedule modals
  const [newScheduleDate, setNewScheduleDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [currentFrequency, setCurrentFrequency] = useState<number>(3);
  const [animalFrequency, setAnimalFrequency] = useState<number>(3);

  const supabase = createClient().schema('sizopi');

  // Fetch user profile and check if user is dokter_hewan
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('=== FETCHING USER PROFILE FROM SESSION ===');
        
        const session = await getCurrentSession();
        
        if (!session) {
          console.error("No session found");
          return;
        }

        console.log('Session found:', { username: session.username, role: session.role });

        const userProfileData = await getUserProfile(session.username);
        
        if (!userProfileData) {
          console.error('Failed to fetch user profile');
          return;
        }

        console.log('User profile fetched:', userProfileData);

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
    fetchAnimalsWithScheduleStatus();
  }, []);

  useEffect(() => {
    if (selectedAnimal) {
      fetchSchedules();
    }
  }, [selectedAnimal]);

  const fetchAnimalsWithScheduleStatus = async () => {
    try {
      setLoading(true);
      
      const { data: animalsData, error: animalsError } = await supabase
        .from("hewan")
        .select("*");

      if (animalsError) throw animalsError;

      if (animalsData) {
        const animalsWithScheduleStatus = await Promise.all(
          animalsData.map(async (animal) => {
            const { data: scheduleData } = await supabase
              .from("jadwal_pemeriksaan_kesehatan")
              .select("id_hewan")
              .eq("id_hewan", animal.id)
              .limit(1);

            return {
              ...animal,
              has_schedule: scheduleData && scheduleData.length > 0
            };
          })
        );

        setHewan(animalsWithScheduleStatus);
      }
    } catch (error) {
      console.error("Error fetching animals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    if (!selectedAnimal) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jadwal_pemeriksaan_kesehatan")
        .select(`
          *,
          hewan(nama, spesies)
        `)
        .eq("id_hewan", selectedAnimal.id)
        .order("tgl_pemeriksaan_selanjutnya", { ascending: true });

      if (error) throw error;
      if (data) {
        setSchedules(data as ExaminationSchedule[]);
        // Set the frequency from the first schedule if available
        if (data.length > 0) {
          setAnimalFrequency(data[0].freq_pemeriksaan_rutin);
        }
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
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

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;

    try {
      console.log('=== ADDING NEW EXAMINATION SCHEDULE ===');
      
      // Check if schedule already exists for this date
      const { data: existingSchedules, error: checkError } = await supabase
        .from("jadwal_pemeriksaan_kesehatan")
        .select("*")
        .eq("id_hewan", selectedAnimal.id)
        .eq("tgl_pemeriksaan_selanjutnya", newScheduleDate);

      if (checkError) throw checkError;

      if (existingSchedules && existingSchedules.length > 0) {
        alert("Jadwal pemeriksaan untuk tanggal ini sudah ada.");
        return;
      }

      // Use the current animal's frequency or default to 3
      const frequencyToUse = animalFrequency || 3;

      console.log('Calling stored procedure with trigger...');

      const { data, error } = await supabase.rpc('insert_examination_schedule_with_trigger', {
        p_id_hewan: selectedAnimal.id,
        p_tgl_pemeriksaan_selanjutnya: newScheduleDate,
        p_freq_pemeriksaan_rutin: frequencyToUse
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
      
      console.log('✅ Examination schedule added successfully');
      await fetchSchedules();
      await fetchAnimalsWithScheduleStatus();
      setIsAddScheduleModalOpen(false);
      resetScheduleForm();
    } catch (error: any) {
      console.error("Error adding schedule:", error);
      setTriggerMessage(`Error adding schedule: ${error.message || "Unknown error"}`);
      setMessageType('error');
      setShowTriggerMessage(true);
      setTimeout(() => setShowTriggerMessage(false), 5000);
    }
  };

  const handleEditSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    
    try {
      const { error } = await supabase
        .from("jadwal_pemeriksaan_kesehatan")
        .update({
          tgl_pemeriksaan_selanjutnya: newScheduleDate
        })
        .eq("id_hewan", selectedSchedule.id_hewan)
        .eq("tgl_pemeriksaan_selanjutnya", selectedSchedule.tgl_pemeriksaan_selanjutnya);

      if (error) throw error;
      
      await fetchSchedules();
      setIsEditScheduleModalOpen(false);
      setTriggerMessage("Jadwal pemeriksaan berhasil diperbarui.");
      setMessageType('success');
      setShowTriggerMessage(true);
      setTimeout(() => setShowTriggerMessage(false), 3000);
    } catch (error: any) {
      console.error("Error updating schedule:", error);
      setTriggerMessage(`Error updating schedule: ${error.message || "Unknown error"}`);
      setMessageType('error');
      setShowTriggerMessage(true);
      setTimeout(() => setShowTriggerMessage(false), 5000);
    }
  };

  const handleEditFrequency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;
    
    try {
      // Update all schedules for this animal with new frequency
      const { error } = await supabase
        .from("jadwal_pemeriksaan_kesehatan")
        .update({
          freq_pemeriksaan_rutin: currentFrequency
        })
        .eq("id_hewan", selectedAnimal.id);

      if (error) throw error;
      
      setAnimalFrequency(currentFrequency);
      await fetchSchedules();
      setIsEditFrequencyModalOpen(false);
      setTriggerMessage("Frekuensi pemeriksaan berhasil diperbarui.");
      setMessageType('success');
      setShowTriggerMessage(true);
      setTimeout(() => setShowTriggerMessage(false), 3000);
    } catch (error: any) {
      console.error("Error updating frequency:", error);
      setTriggerMessage(`Error updating frequency: ${error.message || "Unknown error"}`);
      setMessageType('error');
      setShowTriggerMessage(true);
      setTimeout(() => setShowTriggerMessage(false), 5000);
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      if (!selectedSchedule) return;
      
      const { error } = await supabase
        .from("jadwal_pemeriksaan_kesehatan")
        .delete()
        .eq("id_hewan", selectedSchedule.id_hewan)
        .eq("tgl_pemeriksaan_selanjutnya", selectedSchedule.tgl_pemeriksaan_selanjutnya);

      if (error) throw error;
      
      await fetchSchedules();
      await fetchAnimalsWithScheduleStatus();
      setIsDeleteScheduleModalOpen(false);
      setTriggerMessage("Jadwal pemeriksaan berhasil dihapus.");
      setMessageType('success');
      setShowTriggerMessage(true);
      setTimeout(() => setShowTriggerMessage(false), 3000);
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      setTriggerMessage(`Error deleting schedule: ${error.message || "Unknown error"}`);
      setMessageType('error');
      setShowTriggerMessage(true);
      setTimeout(() => setShowTriggerMessage(false), 5000);
    }
  };

  const openEditScheduleModal = (schedule: ExaminationSchedule) => {
    setSelectedSchedule(schedule);
    setNewScheduleDate(schedule.tgl_pemeriksaan_selanjutnya);
    setIsEditScheduleModalOpen(true);
  };

  const openEditFrequencyModal = () => {
    setCurrentFrequency(animalFrequency);
    setIsEditFrequencyModalOpen(true);
  };

  const openDeleteScheduleModal = (schedule: ExaminationSchedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteScheduleModalOpen(true);
  };

  const resetScheduleForm = () => {
    setNewScheduleDate(format(new Date(), "yyyy-MM-dd"));
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
          Halaman Jadwal Pemeriksaan Kesehatan - Sistem Informasi Zoologi dan Penitipan (SIZOPI)
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
            <h1 className="text-3xl font-bold">Daftar Hewan - Jadwal Pemeriksaan Kesehatan</h1>
            
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
                    Status Jadwal
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
                          animal.has_schedule 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {animal.has_schedule ? "Sudah Ada Jadwal" : "Belum Ada Jadwal"}
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
                          <Calendar size={16} />
                          <span className="text-xs">Lihat Jadwal</span>
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
        // Examination schedules view for selected animal
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
                Jadwal Pemeriksaan Kesehatan - {selectedAnimal.nama} ({selectedAnimal.spesies})
              </h1>
            </div>
          </div>

          {/* Frequency and Add Schedule Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Frekuensi Pemeriksaan Rutin:</h2>
                <span className="text-lg font-medium text-blue-600">
                  {animalFrequency} bulan sekali
                </span>
                <button
                  onClick={openEditFrequencyModal}
                  className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
                  title="Edit Frekuensi"
                >
                  <FileEdit size={16} />
                </button>
              </div>
              
              <button
                onClick={() => {
                  resetScheduleForm();
                  setIsAddScheduleModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg text-sm"
              >
                <Plus size={16} />
                Tambah Jadwal Pemeriksaan
              </button>
            </div>

            {/* Schedules Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Pemeriksaan Selanjutnya
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : schedules.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                        Tidak ada jadwal pemeriksaan untuk hewan ini
                      </td>
                    </tr>
                  ) : (
                    schedules.map((schedule, index) => (
                      <tr key={`${schedule.id_hewan}-${schedule.tgl_pemeriksaan_selanjutnya}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(schedule.tgl_pemeriksaan_selanjutnya).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium flex justify-center gap-2">
                          <button
                            onClick={() => openEditScheduleModal(schedule)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
                            title="Edit Jadwal"
                          >
                            <FileEdit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteScheduleModal(schedule)}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-full"
                            title="Hapus Jadwal"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Schedule Modal */}
      {isAddScheduleModalOpen && selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Tambah Jadwal</h2>
            <p className="text-sm mb-4 text-gray-600">
              Hewan: <strong>{selectedAnimal.nama} ({selectedAnimal.spesies})</strong>
            </p>
            
            <form onSubmit={handleAddSchedule}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tanggal Pemeriksaan Selanjutnya
                </label>
                <input
                  type="date"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center justify-end mt-6 gap-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => setIsAddScheduleModalOpen(false)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {isEditScheduleModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Jadwal</h2>
            <p className="text-sm mb-4 text-gray-600">
              Jadwal saat ini: <strong>{new Date(selectedSchedule.tgl_pemeriksaan_selanjutnya).toLocaleDateString('id-ID')}</strong>
            </p>
            
            <form onSubmit={handleEditSchedule}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tanggal Pemeriksaan Selanjutnya
                </label>
                <input
                  type="date"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center justify-end mt-6 gap-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => setIsEditScheduleModalOpen(false)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Frequency Modal */}
      {isEditFrequencyModalOpen && selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Frekuensi</h2>
            <p className="text-sm mb-4 text-gray-600">
              Hewan: <strong>{selectedAnimal.nama} ({selectedAnimal.spesies})</strong>
            </p>
            
            <form onSubmit={handleEditFrequency}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Frekuensi pemeriksaan rutin (x bulan sekali)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={currentFrequency}
                  onChange={(e) => setCurrentFrequency(parseInt(e.target.value))}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan angka 1-12 (bulan)
                </p>
              </div>
              
              <div className="flex items-center justify-end mt-6 gap-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => setIsEditFrequencyModalOpen(false)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Schedule Modal */}
      {isDeleteScheduleModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Hapus Jadwal</h2>
            <p className="text-gray-700 mb-6">
              Apakah anda yakin ingin menghapus jadwal pemeriksaan ini?
            </p>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="text-sm text-gray-600">
                <strong>Tanggal:</strong> {new Date(selectedSchedule.tgl_pemeriksaan_selanjutnya).toLocaleDateString('id-ID')}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Hewan:</strong> {selectedAnimal?.nama} ({selectedAnimal?.spesies})
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => setIsDeleteScheduleModalOpen(false)}
              >
                TIDAK
              </button>
              <button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleDeleteSchedule}
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


