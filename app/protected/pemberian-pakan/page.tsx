"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { InfoIcon, Plus, FileEdit, Trash2, Search, CheckCircle } from "lucide-react";
import { format } from "date-fns";

// Define proper TypeScript interfaces to match the actual database schema
interface Hewan {
  id: string; // This should be a UUID string
  nama: string;
  spesies: string;
  asal_hewan: string;
  tanggal_lahir: string | null;
  status_kesehatan: string;
  nama_habitat: string | null;
  url_foto: string;
}

interface PenjagatHewan {
  username_jh: string;
  pengguna: {
    nama_depan: string;
    nama_belakang: string;
  };
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

interface Memberi {
  id_hewan: string;
  jadwal: string;
  username_jh: string;
  hewan?: {
    nama: string;
    spesies: string;
    asal_hewan: string;
    tanggal_lahir: string | null;
    nama_habitat: string | null;
    status_kesehatan: string;
  };
  pakan?: {
    jenis: string;
    jumlah: number;
  };
}

interface NewFeedSchedule {
  id_hewan: string;
  jadwal: string;
  jenis: string;
  jumlah: number;
  status: string;
}


export default function ProtectedPage() {
  const [feedSchedules, setFeedSchedules] = useState<Pakan[]>([]);
  const [feedingHistory, setFeedingHistory] = useState<Memberi[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Pakan | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [animals, setAnimals] = useState<Hewan[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [penjagaHewan, setPenjagaHewan] = useState<PenjagatHewan[]>([]);
  const [loggedInPenjaga, setLoggedInPenjaga] = useState<string>("username_jh_1"); // Mock logged in user

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

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const { data, error } = await supabase.from("hewan").select("id, nama, spesies, asal_hewan, tanggal_lahir, status_kesehatan, nama_habitat, url_foto");
        if (error) throw error;
        if (data) setAnimals(data as Hewan[]);
      } catch (error) {
        console.error("Error fetching animals:", error);
      }
    };

    const fetchPenjagaHewan = async () => {
      try {
        const { data, error } = await supabase
          .from("penjaga_hewan")
          .select(`
            username_jh,
            pengguna!inner(
              nama_depan,
              nama_belakang
            )
          `);
        
        if (error) throw error;
        if (data) {
          // Transform the data to match your interface
          const transformedData = data.map((item: any) => ({
            username_jh: item.username_jh,
            pengguna: item.pengguna
          }));
          setPenjagaHewan(transformedData as PenjagatHewan[]);
        }
      } catch (error) {
        console.error("Error fetching penjaga hewan:", error);
      }
    };

    fetchAnimals();
    fetchPenjagaHewan();
  }, []);

  useEffect(() => {
    fetchFeedSchedules();
  }, [selectedAnimal]);

  const fetchFeedSchedules = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("pakan")
        .select(`
          *,
          hewan(nama, spesies)
        `)
        .order("jadwal", { ascending: true });

      if (selectedAnimal) {
        query = query.eq("id_hewan", selectedAnimal);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setFeedSchedules(data as Pakan[]);
    } catch (error) {
      console.error("Error fetching feed schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = feedSchedules.filter((schedule) => {
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      (schedule.jenis && schedule.jenis.toLowerCase().includes(searchTermLower)) ||
      schedule.status.toLowerCase().includes(searchTermLower) ||
      (schedule.hewan?.nama && schedule.hewan.nama.toLowerCase().includes(searchTermLower)) ||
      (schedule.hewan?.spesies && schedule.hewan.spesies.toLowerCase().includes(searchTermLower))
    );
  });

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if the schedule already exists for this animal and time
      const { data: existingSchedules, error: checkError } = await supabase
        .from("pakan")
        .select("*")
        .eq("id_hewan", newSchedule.id_hewan)
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
          id_hewan: newSchedule.id_hewan,
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
      
      // Refresh the schedules
      await fetchFeedSchedules();
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
      if (!selectedSchedule) return;
      
      // Check if the new schedule time doesn't conflict with existing ones
      if (editSchedule.jadwal !== selectedSchedule.jadwal) {
        const { data: existingSchedules, error: checkError } = await supabase
          .from("pakan")
          .select("*")
          .eq("id_hewan", selectedSchedule.id_hewan)
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
      
      // Refresh the schedules
      await fetchFeedSchedules();
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
      
      // Refresh the schedules
      await fetchFeedSchedules();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Error deleting schedule. Please try again.");
    }
  };

  // 1. Fix the handleFeedAnimal function
  const handleFeedAnimal = async (schedule: Pakan) => {
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
          username_jh: loggedInPenjaga
        });
  
      if (memberError) throw memberError;
  
      // Refresh data
      await fetchFeedSchedules();
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

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Halaman Pemberian Pakan Hewan - Sistem Informasi Zoologi dan Penitipan (SIZOPI)
        </div>
      </div>

      {/* Filter and search section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-3xl font-bold">Pemberian Pakan</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="bg-background border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="bg-background border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
            value={selectedAnimal}
            onChange={(e) => setSelectedAnimal(e.target.value)}
          >
            <option value="">Semua Hewan</option>
            {animals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.nama} - {animal.spesies}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => {
              resetNewSchedule();
              setIsAddModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg text-sm"
          >
            <Plus size={16} />
            Tambah Jadwal Pemberian Pakan
          </button>
        </div>
      </div>

      {/* Feed Schedules Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hewan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis Pakan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah Pakan (gram)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jadwal
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
            ) : filteredSchedules.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Tidak ada data jadwal pemberian pakan
                </td>
              </tr>
            ) : (
              filteredSchedules.map((schedule, index) => (
                <tr key={`${schedule.id_hewan}-${schedule.jadwal}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {schedule.hewan?.nama} ({schedule.hewan?.spesies})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.jenis}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.jumlah}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(schedule.jadwal).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      schedule.status === "Menunggu Pemberian" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                    }`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-center gap-2">
                    {schedule.status === "Menunggu Pemberian" && (
                      <button
                        onClick={() => handleFeedAnimal(schedule)}
                        className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 p-2 rounded-full"
                      >
                        <CheckCircle size={16} />
                        <span className="sr-only">Beri Pakan</span>
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
                    >
                      <FileEdit size={16} />
                      <span className="sr-only">Edit</span>
                    </button>
                    <button
                      onClick={() => openDeleteModal(schedule)}
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Tambah Jadwal Pemberian Pakan</h2>
            <form onSubmit={handleAddSchedule}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Hewan
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSchedule.id_hewan}
                  onChange={(e) => setNewSchedule({ ...newSchedule, id_hewan: e.target.value })}
                  required
                >
                  <option value="">Pilih Hewan</option>
                  {animals.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.nama} - {animal.spesies}
                    </option>
                  ))}
                </select>
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
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Jumlah Pakan (gram)
                </label>
                <input
                  type="number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSchedule.jumlah}
                  onChange={(e) => setNewSchedule({ ...newSchedule, jumlah: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Jadwal
                </label>
                <input
                  type="datetime-local"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSchedule.jadwal}
                  onChange={(e) => setNewSchedule({ ...newSchedule, jadwal: e.target.value })}
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
      {/* Edit Modal */}
        {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Jadwal Pemberian Pakan</h2>
            <form onSubmit={handleEditSchedule}>
                <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Jenis Pakan Baru
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
                    Jumlah Pakan Baru (gram)
                </label>
                <input
                    type="number"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editSchedule.jumlah}
                    onChange={(e) => setEditSchedule({ ...editSchedule, jumlah: parseInt(e.target.value) })}
                    required
                    min="1"
                />
                </div>
                
                <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Jadwal Baru
                </label>
                <input
                    type="datetime-local"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editSchedule.jadwal}
                    onChange={(e) => setEditSchedule({ ...editSchedule, jadwal: e.target.value })}
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
        {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Hapus Pemberian Pakan</h2>
            <p className="mb-6">Apakah anda yakin ingin menghapus data pemberian pakan ini?</p>
            
            <div className="flex items-center justify-end gap-2">
                <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => setIsDeleteModalOpen(false)}
                >
                Tidak
                </button>
                <button
                type="button"
                onClick={handleDeleteSchedule}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                Ya
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}