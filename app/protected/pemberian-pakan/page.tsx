"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { InfoIcon, Plus, FileEdit, Trash2, Search, CheckCircle, ArrowLeft, History, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { getCurrentSession } from "@/app/actions";
import { useRouter } from "next/navigation";

// Define proper TypeScript interfaces to match the actual database schema
interface Hewan {
  id: string;
  nama: string;
  spesies: string;
  asal_hewan: string;
  tanggal_lahir: string | null;
  status_kesehatan: string;
  nama_habitat: string | null;
  url_foto: string;
  has_feeding_schedule?: boolean;
  next_feeding?: string | null;
  pending_feedings?: number;
}

interface Pakan {
  id_hewan: string;
  jadwal: string;
  jenis: string;
  jumlah: number;
  status: string;
  hewan?: {
    nama: string;
    spesies: string;
  };
}

interface NewFeedSchedule {
  id_hewan: string;
  jadwal: string;
  jenis: string;
  jumlah: number;
  status: string;
}

interface UserProfile {
  username: string;
  nama_depan: string;
  nama_tengah: string | null;
  nama_belakang: string;
  role: string;
}

export default function PemberianPakanPage() {
  const [feedSchedules, setFeedSchedules] = useState<Pakan[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Pakan | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Hewan | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [animals, setAnimals] = useState<Hewan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'with_schedule' | 'without_schedule'>('all');

  const router = useRouter();

  // Form states for add modal
  const [newSchedule, setNewSchedule] = useState<NewFeedSchedule>({
    id_hewan: "",
    jadwal: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    jenis: "",
    jumlah: 0,
    status: "Menunggu Pemberian"
  });

  // Form states for edit modal
  const [editSchedule, setEditSchedule] = useState<{
    jenis: string;
    jumlah: number;
    jadwal: string;
  }>({
    jenis: "",
    jumlah: 0,
    jadwal: ""
  });

  const supabase = createClient().schema('sizopi');

  // Fetch user profile and check if user is penjaga_hewan
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('=== FETCHING USER SESSION ===');
        const session = await getCurrentSession();
        
        if (!session) {
          console.error("No session found");
          return;
        }

        if (session.role !== 'staff') {
          console.error('User is not staff, role:', session.role);
          return;
        }

        const userData = session.userData;
        if (!userData || !userData.roleSpecificData || userData.roleSpecificData.peran !== 'penjaga') {
          console.error('User is not a penjaga hewan');
          return;
        }

        setUserProfile({
          username: userData.username,
          nama_depan: userData.nama_depan,
          nama_tengah: userData.nama_tengah,
          nama_belakang: userData.nama_belakang,
          role: 'penjaga_hewan'
        });

        console.log('✅ User profile set successfully');

      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchAnimalsWithScheduleInfo();
  }, []);

  useEffect(() => {
    if (selectedAnimal) {
      fetchFeedSchedules();
    }
  }, [selectedAnimal]);

  const fetchAnimalsWithScheduleInfo = async () => {
    try {
      setLoading(true);
      
      // Get all animals
      const { data: animalsData, error: animalsError } = await supabase
        .from("hewan")
        .select("*");

      if (animalsError) throw animalsError;

      if (!animalsData) {
        setAnimals([]);
        return;
      }

      // Get feeding schedule info for each animal
      const animalsWithScheduleInfo = await Promise.all(
        animalsData.map(async (animal) => {
          // Check if animal has any feeding schedules
          const { data: scheduleData, error: scheduleError } = await supabase
            .from("pakan")
            .select("jadwal, status")
            .eq("id_hewan", animal.id)
            .order("jadwal", { ascending: true });

          if (scheduleError) {
            console.error(`Error fetching schedule for animal ${animal.id}:`, scheduleError);
            return {
              ...animal,
              has_feeding_schedule: false,
              next_feeding: null,
              pending_feedings: 0
            };
          }

          const hasSchedule = scheduleData && scheduleData.length > 0;
          const pendingFeedings = scheduleData?.filter(s => s.status === "Menunggu Pemberian").length || 0;
          const nextFeeding = scheduleData?.find(s => s.status === "Menunggu Pemberian")?.jadwal || null;

          return {
            ...animal,
            has_feeding_schedule: hasSchedule,
            next_feeding: nextFeeding,
            pending_feedings: pendingFeedings
          };
        })
      );

      setAnimals(animalsWithScheduleInfo as Hewan[]);
    } catch (error) {
      console.error("Error fetching animals with schedule info:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedSchedules = async () => {
    if (!selectedAnimal) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pakan")
        .select(`
          *,
          hewan(nama, spesies)
        `)
        .eq("id_hewan", selectedAnimal.id)
        .order("jadwal", { ascending: true });

      if (error) throw error;
      if (data) setFeedSchedules(data as Pakan[]);
    } catch (error) {
      console.error("Error fetching feed schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = animals.filter((animal) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (
      animal.nama.toLowerCase().includes(searchTermLower) ||
      animal.spesies.toLowerCase().includes(searchTermLower)
    );

    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'with_schedule' && animal.has_feeding_schedule) ||
      (filterType === 'without_schedule' && !animal.has_feeding_schedule);

    return matchesSearch && matchesFilter;
  });

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;

    try {
      // Check if the schedule already exists for this animal and time
      const { data: existingSchedules, error: checkError } = await supabase
        .from("pakan")
        .select("*")
        .eq("id_hewan", selectedAnimal.id)
        .eq("jadwal", newSchedule.jadwal);
  
      if (checkError) throw checkError;
  
      if (existingSchedules && existingSchedules.length > 0) {
        alert("Jadwal pemberian pakan harus unik untuk setiap hewan.");
        return;
      }
  
      // Insert with proper error handling
      const { error } = await supabase
        .from("pakan")
        .insert({
          id_hewan: selectedAnimal.id,
          jadwal: newSchedule.jadwal,
          jenis: newSchedule.jenis,
          jumlah: newSchedule.jumlah,
          status: "Menunggu Pemberian"
        });
  
      if (error) {
        console.error("Supabase error:", error);
        alert(`Error adding feed schedule: ${error.message}`);
        return;
      }
      
      // Refresh the schedules and animals list
      await fetchFeedSchedules();
      await fetchAnimalsWithScheduleInfo();
      setIsAddModalOpen(false);
      resetNewSchedule();
    } catch (error: any) {
      console.error("Error adding feed schedule:", error);
      alert(`Error adding feed schedule: ${error.message || "Unknown error"}`);
    }
  };

  const handleEditSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedSchedule || !selectedAnimal) return;
      
      // Check if the new schedule time doesn't conflict with existing ones
      if (editSchedule.jadwal !== selectedSchedule.jadwal) {
        const { data: existingSchedules, error: checkError } = await supabase
          .from("pakan")
          .select("*")
          .eq("id_hewan", selectedAnimal.id)
          .eq("jadwal", editSchedule.jadwal);
    
        if (checkError) throw checkError;
    
        if (existingSchedules && existingSchedules.length > 0) {
          alert("Jadwal pemberian pakan harus unik untuk setiap hewan.");
          return;
        }
      }
      
      // First delete the old record
      const { error: deleteError } = await supabase
        .from("pakan")
        .delete()
        .match({ 
          id_hewan: selectedSchedule.id_hewan,
          jadwal: selectedSchedule.jadwal
        });
        
      if (deleteError) {
        console.error("Supabase delete error:", deleteError);
        alert(`Error updating schedule: ${deleteError.message}`);
        return;
      }
      
      // Then insert a new record with the updated data
      const { error: insertError } = await supabase
        .from("pakan")
        .insert({
          id_hewan: selectedSchedule.id_hewan,
          jadwal: editSchedule.jadwal,
          jenis: editSchedule.jenis,
          jumlah: editSchedule.jumlah,
          status: selectedSchedule.status
        });
  
      if (insertError) {
        console.error("Supabase insert error:", insertError);
        alert(`Error updating schedule: ${insertError.message}`);
        return;
      }
      
      // Refresh the schedules and animals list
      await fetchFeedSchedules();
      await fetchAnimalsWithScheduleInfo();
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error("Error updating feed schedule:", error);
      alert(`Error updating schedule: ${error.message || "Unknown error"}`);
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      if (!selectedSchedule) return;
      
      const { error } = await supabase
        .from("pakan")
        .delete()
        .eq("id_hewan", selectedSchedule.id_hewan)
        .eq("jadwal", selectedSchedule.jadwal);

      if (error) throw error;
      
      // Refresh the schedules and animals list
      await fetchFeedSchedules();
      await fetchAnimalsWithScheduleInfo();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Error deleting schedule. Please try again.");
    }
  };

  const handleFeedAnimal = async (schedule: Pakan) => {
    if (!userProfile) return;
    
    try {
      // Update the feed status to "Selesai Diberikan"
      const { error: updateError } = await supabase
        .from("pakan")
        .update({ status: "Selesai Diberikan" })
        .eq("id_hewan", schedule.id_hewan)
        .eq("jadwal", schedule.jadwal);
  
      if (updateError) throw updateError;
  
      // Add a record to the "memberi" table
      const { error: memberError } = await supabase
        .from("memberi")
        .upsert({
          id_hewan: schedule.id_hewan,
          jadwal: schedule.jadwal,
          username_jh: userProfile.username
        });
  
      if (memberError) throw memberError;
  
      // Refresh data
      await fetchFeedSchedules();
      await fetchAnimalsWithScheduleInfo();
    } catch (error) {
      console.error("Error feeding animal:", error);
      alert("Error updating feeding status. Please try again.");
    }
  };

  const openEditModal = (schedule: Pakan) => {
    setSelectedSchedule(schedule);
    setEditSchedule({
      jenis: schedule.jenis,
      jumlah: schedule.jumlah,
      jadwal: schedule.jadwal
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (schedule: Pakan) => {
    setSelectedSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  const resetNewSchedule = () => {
    setNewSchedule({
      id_hewan: "",
      jadwal: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      jenis: "",
      jumlah: 0,
      status: "Menunggu Pemberian"
    });
  };

  const handleGoToHistory = () => {
    router.push('/protected/riwayat-pakan');
  };

  // Check if user is authorized (penjaga_hewan)
  if (!userProfile || userProfile.role !== 'penjaga_hewan') {
    return (
      <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          <p className="font-semibold">Akses Ditolak</p>
          <p>Halaman ini hanya dapat diakses oleh Penjaga Hewan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Halaman Pemberian Pakan Hewan - Sistem Informasi Zoologi dan Penitipan (SIZOPI)
        </div>
      </div>

      {/* Main content */}
      {!selectedAnimal ? (
        // Animal selection view with schedule status
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <h1 className="text-3xl font-bold">Manajemen Pemberian Pakan</h1>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
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
              
              <select
                className="bg-background border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'with_schedule' | 'without_schedule')}
              >
                <option value="all">Semua Hewan</option>
                <option value="with_schedule">Ada Jadwal Pakan</option>
                <option value="without_schedule">Belum Ada Jadwal</option>
              </select>

              <button
                onClick={handleGoToHistory}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm whitespace-nowrap"
              >
                <History size={16} />
                Riwayat Pakan Saya
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Hewan</p>
                  <p className="text-2xl font-bold text-blue-900">{animals.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Ada Jadwal Pakan</p>
                  <p className="text-2xl font-bold text-green-900">
                    {animals.filter(a => a.has_feeding_schedule).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">Belum Ada Jadwal</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {animals.filter(a => !a.has_feeding_schedule).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Animals Table with Schedule Status */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jadwal Berikutnya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pakan Tertunda
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredAnimals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
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
                          animal.has_feeding_schedule 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          {animal.has_feeding_schedule ? "Ada Jadwal" : "Belum Ada Jadwal"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {animal.next_feeding 
                          ? new Date(animal.next_feeding).toLocaleString('id-ID')
                          : "-"
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {(animal.pending_feedings ?? 0) > 0 ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {animal.pending_feedings}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnimal(animal);
                          }}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-xs font-medium"
                        >
                          Kelola Pakan
                        </button>
                      </td>
                    </tr>
                  ))                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        // Feed schedule management view for selected animal
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
                Jadwal Pakan - {selectedAnimal.nama} ({selectedAnimal.spesies})
              </h1>
            </div>
            
            <button
              onClick={() => {
                resetNewSchedule();
                setIsAddModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg text-sm"
            >
              <Plus size={16} />
              Tambah Jadwal Pakan
            </button>
          </div>

          {/* Feed Schedules Table */}
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jadwal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis Pakan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah (gram)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : feedSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Belum ada jadwal pakan untuk hewan ini
                    </td>
                  </tr>
                ) : (
                  feedSchedules.map((schedule, index) => (
                    <tr key={`${schedule.id_hewan}-${schedule.jadwal}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(schedule.jadwal).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.jenis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.jumlah}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          schedule.status === "Selesai Diberikan" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {schedule.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium flex justify-center gap-2">
                        {schedule.status === "Menunggu Pemberian" && (
                          <>
                            <button
                              onClick={() => handleFeedAnimal(schedule)}
                              className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 p-2 rounded-full"
                              title="Beri Pakan"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => openEditModal(schedule)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
                              title="Edit Jadwal"
                            >
                              <FileEdit size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openDeleteModal(schedule)}
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
        </>
      )}

      {/* Add Modal */}
      {isAddModalOpen && selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Tambah Jadwal Pakan</h2>
            <p className="text-sm mb-4 text-gray-600">
              Hewan: <strong>{selectedAnimal.nama} ({selectedAnimal.spesies})</strong>
            </p>
            
            <form onSubmit={handleAddSchedule}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Jadwal Pemberian
                </label>
                <input
                  type="datetime-local"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSchedule.jadwal}
                  onChange={(e) => setNewSchedule({ ...newSchedule, jadwal: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Jenis Pakan
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSchedule.jenis}
                  onChange={(e) => setNewSchedule({ ...newSchedule, jenis: e.target.value })}
                  placeholder="Contoh: Daging sapi, Sayuran, Buah-buahan"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Jumlah (gram)
                </label>
                <input
                  type="number"
                  min="1"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSchedule.jumlah}
                  onChange={(e) => setNewSchedule({ ...newSchedule, jumlah: parseInt(e.target.value) || 0 })}
                  required
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

      {/* Edit Modal */}
      {isEditModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Jadwal Pakan</h2>
            
            <form onSubmit={handleEditSchedule}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Jadwal Pemberian
                </label>
                <input
                  type="datetime-local"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editSchedule.jadwal}
                  onChange={(e) => setEditSchedule({ ...editSchedule, jadwal: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Jenis Pakan
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editSchedule.jenis}
                  onChange={(e) => setEditSchedule({ ...editSchedule, jenis: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Jumlah (gram)
                </label>
                <input
                  type="number"
                  min="1"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editSchedule.jumlah}
                  onChange={(e) => setEditSchedule({ ...editSchedule, jumlah: parseInt(e.target.value) || 0 })}
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
      {isDeleteModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Hapus Jadwal Pakan</h2>
            <p className="text-gray-700 mb-6">
              Apakah anda yakin ingin menghapus jadwal pakan ini?
            </p>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="text-sm text-gray-600">
                <strong>Jadwal:</strong> {new Date(selectedSchedule.jadwal).toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Jenis Pakan:</strong> {selectedSchedule.jenis}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Jumlah:</strong> {selectedSchedule.jumlah} gram
              </p>
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


