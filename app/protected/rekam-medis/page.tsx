"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { InfoIcon, Plus, FileEdit, Trash2, Search } from "lucide-react";
import { format } from "date-fns";

// Define proper TypeScript interfaces to match the actual database schema
interface Hewan {
  id: string; // This should be a UUID string
  nama: string;
  spesies: string;
}

interface Pengguna {
  nama_depan: string;
  nama_belakang: string;
}

interface DokterHewan {
  username_dh: string;
  pengguna: Pengguna;
}

interface MedicalRecord {
  id_hewan: string; // This should be a UUID string
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
  diagnosis: string;
  pengobatan: string;
  catatan_tindak_lanjut: string;
}

export default function ProtectedPage() {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hewan, setHewan] = useState<Hewan[]>([]);
  const [selectedHewan, setSelectedHewan] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [dokterHewan, setDokterHewan] = useState<DokterHewan[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");

  // Form states for add modal
  const [newRecord, setNewRecord] = useState<NewMedicalRecord>({
    id_hewan: "",
    username_dh: "",
    tanggal_pemeriksaan: format(new Date(), "yyyy-MM-dd"),
    diagnosis: null,
    pengobatan: null,
    status_kesehatan: "Sehat",
    catatan_tindak_lanjut: null,
  });

  // Form states for edit modal
  const [editRecord, setEditRecord] = useState<EditMedicalRecord>({
    diagnosis: "",
    pengobatan: "",
    catatan_tindak_lanjut: "",
  });

  const supabase = createClient().schema('sizopi');

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const { data, error } = await supabase.from("hewan").select("id, nama, spesies");
        if (error) throw error;
        if (data) setHewan(data as Hewan[]);
      } catch (error) {
        console.error("Error fetching animals:", error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from("dokter_hewan")
          .select(`
            username_dh,
            pengguna!inner(
              nama_depan,
              nama_belakang
            )
          `);
        
        if (error) throw error;
        if (data) {
          // Transform the data to match your interface
          const transformedData = data.map((item: any) => ({
            username_dh: item.username_dh,
            pengguna: item.pengguna
          }));
          setDokterHewan(transformedData as DokterHewan[]);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchAnimals();
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchMedicalRecords();
  }, [selectedHewan]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("catatan_medis")
        .select(`
          *,
          hewan(nama, spesies),
          dokter_hewan(username_dh, pengguna(nama_depan, nama_belakang))
        `)
        .order("tanggal_pemeriksaan", { ascending: false });

      if (selectedHewan) {
        query = query.eq("id_hewan", selectedHewan);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setMedicalRecords(data as MedicalRecord[]);
    } catch (error) {
      console.error("Error fetching medical records:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = medicalRecords.filter((record) => {
    const dokterName = record.dokter_hewan?.pengguna
      ? `${record.dokter_hewan.pengguna.nama_depan} ${record.dokter_hewan.pengguna.nama_belakang}`
      : "";
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      dokterName.toLowerCase().includes(searchTermLower) ||
      record.status_kesehatan.toLowerCase().includes(searchTermLower) ||
      (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTermLower)) ||
      (record.pengobatan && record.pengobatan.toLowerCase().includes(searchTermLower)) ||
      (record.catatan_tindak_lanjut && record.catatan_tindak_lanjut.toLowerCase().includes(searchTermLower)) ||
      (record.hewan?.nama && record.hewan.nama.toLowerCase().includes(searchTermLower))
    );
  });

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if the examination date is unique for this animal
      const { data: existingRecords, error: checkError } = await supabase
        .from("catatan_medis")
        .select("*")
        .eq("id_hewan", newRecord.id_hewan)
        .eq("tanggal_pemeriksaan", newRecord.tanggal_pemeriksaan);
  
      if (checkError) throw checkError;
  
      if (existingRecords && existingRecords.length > 0) {
        alert("Tanggal pemeriksaan harus unik untuk setiap hewan.");
        return;
      }
  
      // Insert with proper error handling
      const { error } = await supabase
        .from("catatan_medis")
        .insert({
          id_hewan: newRecord.id_hewan,
          username_dh: newRecord.username_dh,
          tanggal_pemeriksaan: newRecord.tanggal_pemeriksaan,
          diagnosis: newRecord.diagnosis,
          pengobatan: newRecord.pengobatan,
          status_kesehatan: newRecord.status_kesehatan,
          catatan_tindak_lanjut: newRecord.catatan_tindak_lanjut
        });
  
      if (error) {
        console.error("Supabase error:", error);
        alert(`Error adding record: ${error.message}`);
        return;
      }
      
      // Refresh the records
      await fetchMedicalRecords();
      setIsAddModalOpen(false);
      resetNewRecord();
    } catch (error: any) {
      console.error("Error adding record:", error);
      alert(`Error adding record: ${error.message || "Unknown error"}`);
    }
  };

  const handleEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedRecord) return;
      
      // Get current date for the updated examination date
      const currentDate = format(new Date(), "yyyy-MM-dd");
      
      // Prepare data for update using the correct schema
      const updateData = {
        diagnosis: editRecord.diagnosis,
        pengobatan: editRecord.pengobatan,
        catatan_tindak_lanjut: editRecord.catatan_tindak_lanjut,
        // Update the examination date to the current date
        tanggal_pemeriksaan: currentDate
      };
      
      // First delete the old record
      const { error: deleteError } = await supabase
        .from("catatan_medis")
        .delete()
        .match({ 
          id_hewan: selectedRecord.id_hewan,
          tanggal_pemeriksaan: selectedRecord.tanggal_pemeriksaan
        });
        
      if (deleteError) {
        console.error("Supabase delete error:", deleteError);
        alert(`Error updating record: ${deleteError.message}`);
        return;
      }
      
      // Then insert a new record with the updated examination date
      const { error: insertError } = await supabase
        .from("catatan_medis")
        .insert({
          id_hewan: selectedRecord.id_hewan,
          username_dh: selectedRecord.username_dh,
          tanggal_pemeriksaan: currentDate,
          diagnosis: editRecord.diagnosis,
          pengobatan: editRecord.pengobatan,
          status_kesehatan: selectedRecord.status_kesehatan,
          catatan_tindak_lanjut: editRecord.catatan_tindak_lanjut
        });
  
      if (insertError) {
        console.error("Supabase insert error:", insertError);
        alert(`Error updating record: ${insertError.message}`);
        return;
      }
      
      // Refresh the records
      await fetchMedicalRecords();
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error("Error updating record:", error);
      alert(`Error updating record: ${error.message || "Unknown error"}`);
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
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record. Please try again.");
    }
  };

  const openEditModal = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setEditRecord({
      diagnosis: record.diagnosis || "",
      pengobatan: record.pengobatan || "",
      catatan_tindak_lanjut: record.catatan_tindak_lanjut || "",
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
      diagnosis: null,
      pengobatan: null,
      status_kesehatan: "Sehat",
      catatan_tindak_lanjut: null,
    });
    setSelectedDoctor("");
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNewRecord((prev) => ({
      ...prev,
      status_kesehatan: value,
      // Clear diagnosis, treatment, and follow-up notes if status is "Sehat"
      diagnosis: value === "Sehat" ? null : prev.diagnosis,
      pengobatan: value === "Sehat" ? null : prev.pengobatan,
      catatan_tindak_lanjut: value === "Sehat" ? null : prev.catatan_tindak_lanjut,
    }));
  };

  const getDoctorFullName = (username: string) => {
    const doctor = dokterHewan.find(doc => doc.username_dh === username);
    if (doctor && doctor.pengguna) {
      return `${doctor.pengguna.nama_depan} ${doctor.pengguna.nama_belakang}`;
    }
    return "";
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Halaman Rekam Medis Hewan - Sistem Informasi Zoologi dan Penitipan (SIZOPI)
        </div>
      </div>

      {/* Filter and search section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-3xl font-bold">Catatan Medis Hewan</h1>
        
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
            value={selectedHewan}
            onChange={(e) => setSelectedHewan(e.target.value)}
          >
            <option value="">Semua Hewan</option>
            {hewan.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.nama} - {animal.spesies}
              </option>
            ))}
          </select>
          
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
      </div>

      {/* Medical Records Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hewan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Pemeriksaan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Dokter
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Kesehatan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diagnosa
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pengobatan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catatan Tindak Lanjut
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  Tidak ada data rekam medis
                </td>
              </tr>
            ) : (
              filteredRecords.map((record, index) => (
                <tr key={`${record.id_hewan}-${record.tanggal_pemeriksaan}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.hewan?.nama} ({record.hewan?.spesies})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.tanggal_pemeriksaan).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.dokter_hewan?.pengguna ? 
                      `${record.dokter_hewan.pengguna.nama_depan} ${record.dokter_hewan.pengguna.nama_belakang}` : 
                      'Unknown'}
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
                    {record.status_kesehatan === "Sakit" && (
                      <button
                        onClick={() => openEditModal(record)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Tambah Rekam Medis</h2>
            <form onSubmit={handleAddRecord}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Hewan
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newRecord.id_hewan}
                  onChange={(e) => setNewRecord({ ...newRecord, id_hewan: e.target.value })}
                  required
                >
                  <option value="">Pilih Hewan</option>
                  {hewan.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.nama} - {animal.spesies}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Dokter Hewan
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newRecord.username_dh}
                  onChange={(e) => setNewRecord({ ...newRecord, username_dh: e.target.value })}
                  required
                >
                  <option value="">Pilih Dokter Hewan</option>
                  {dokterHewan.map((dokter) => (
                    <option key={dokter.username_dh} value={dokter.username_dh}>
                      {dokter.pengguna.nama_depan} {dokter.pengguna.nama_belakang}
                    </option>
                  ))}
                </select>
              </div>
              
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
                  Status Kesehatan
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
              
              {newRecord.status_kesehatan === "Sakit" && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Diagnosa
                    </label>
                    <input
                      type="text"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={newRecord.diagnosis || ""}
                      onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                      required={newRecord.status_kesehatan === "Sakit"}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Pengobatan
                    </label>
                    <input
                      type="text"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={newRecord.pengobatan || ""}
                      onChange={(e) => setNewRecord({ ...newRecord, pengobatan: e.target.value })}
                      required={newRecord.status_kesehatan === "Sakit"}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Catatan Tindak Lanjut
                    </label>
                    <textarea
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={newRecord.catatan_tindak_lanjut || ""}
                      onChange={(e) => setNewRecord({ ...newRecord, catatan_tindak_lanjut: e.target.value })}
                      rows={3}
                    />
                  </div>
                </>
              )}
              
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
      {isEditModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Rekam Medis</h2>
            <p className="text-sm mb-4 bg-yellow-100 p-2 rounded">
              Tanggal pemeriksaan akan diperbarui ke tanggal hari ini: {format(new Date(), "dd/MM/yyyy")}
            </p>
            <form onSubmit={handleEditRecord}>
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
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Catatan Tindak Lanjut
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editRecord.catatan_tindak_lanjut}
                  onChange={(e) => setEditRecord({ ...editRecord, catatan_tindak_lanjut: e.target.value })}
                  rows={3}
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
                  type="submit"className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
              <p className="mb-6">Apakah anda yakin ingin menghapus rekam medis ini?</p>
              
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