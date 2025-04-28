"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { InfoIcon, Plus, Calendar, PlusCircle } from "lucide-react";
import { format, startOfYear, endOfYear } from "date-fns";

// Define proper TypeScript interfaces
interface Hewan {
  id: string; // UUID string
  nama: string;
  spesies: string;
}

interface JadwalPemeriksaan {
  id_hewan: string;
  tgl_pemeriksaan_selanjutnya: string;
  freq_pemeriksaan_rutin: number;
  hewan?: {
    nama: string;
    spesies: string;
  };
}

export default function JadwalPemeriksaanPage() {
  const [schedules, setSchedules] = useState<JadwalPemeriksaan[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAddExtraModalOpen, setIsAddExtraModalOpen] = useState<boolean>(false);
  const [selectedHewan, setSelectedHewan] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [hewan, setHewan] = useState<Hewan[]>([]);
  const [selectedAnimalForExtra, setSelectedAnimalForExtra] = useState<{
    id: string;
    nama: string;
    spesies: string;
    freq_pemeriksaan_rutin: number;
  } | null>(null);
  
  // Form state for new schedule
  const [newSchedule, setNewSchedule] = useState<{
    id_hewan: string;
    tgl_pemeriksaan_selanjutnya: string;
    freq_pemeriksaan_rutin: number;
  }>({
    id_hewan: "",
    tgl_pemeriksaan_selanjutnya: format(new Date(), "yyyy-MM-dd"),
    freq_pemeriksaan_rutin: 3, // Default to 3 months
  });

  // Form state for additional schedule
  const [extraSchedule, setExtraSchedule] = useState<{
    tgl_pemeriksaan_selanjutnya: string;
  }>({
    tgl_pemeriksaan_selanjutnya: format(new Date(), "yyyy-MM-dd"),
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

    fetchAnimals();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [selectedHewan]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("jadwal_pemeriksaan_kesehatan")
        .select(`
          *,
          hewan(nama, spesies)
        `)
        .order("tgl_pemeriksaan_selanjutnya", { ascending: true });

      if (selectedHewan) {
        query = query.eq("id_hewan", selectedHewan);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setSchedules(data as JadwalPemeriksaan[]);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if a schedule already exists for this animal and date
      const { data: existingSchedules, error: checkError } = await supabase
        .from("jadwal_pemeriksaan_kesehatan")
        .select("*")
        .eq("id_hewan", newSchedule.id_hewan)
        .eq("tgl_pemeriksaan_selanjutnya", newSchedule.tgl_pemeriksaan_selanjutnya);
  
      if (checkError) throw checkError;
  
      if (existingSchedules && existingSchedules.length > 0) {
        alert("Jadwal pemeriksaan pada tanggal tersebut sudah ada untuk hewan ini.");
        return;
      }
  
      // Insert with proper error handling
      const { error } = await supabase
        .from("jadwal_pemeriksaan_kesehatan")
        .insert({
          id_hewan: newSchedule.id_hewan,
          tgl_pemeriksaan_selanjutnya: newSchedule.tgl_pemeriksaan_selanjutnya,
          freq_pemeriksaan_rutin: newSchedule.freq_pemeriksaan_rutin
        });
  
      if (error) {
        console.error("Supabase error:", error);
        alert(`Error menambahkan jadwal: ${error.message}`);
        return;
      }
      
      // Refresh the schedules
      await fetchSchedules();
      setIsAddModalOpen(false);
      resetNewSchedule();
    } catch (error: any) {
      console.error("Error adding schedule:", error);
      alert(`Error menambahkan jadwal: ${error.message || "Unknown error"}`);
    }
  };

  const handleAddExtraSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAnimalForExtra) return;
    
    try {
      // Check if we need to verify yearly examination limits
      const currentYear = new Date().getFullYear();
      const startDate = startOfYear(new Date(currentYear, 0, 1));
      const endDate = endOfYear(new Date(currentYear, 11, 31));
      
      // Count existing schedules for this animal in the current year
      const { data: yearlySchedules, error: countError } = await supabase
        .from("jadwal_pemeriksaan_kesehatan")
        .select("*")
        .eq("id_hewan", selectedAnimalForExtra.id)
        .gte("tgl_pemeriksaan_selanjutnya", startDate.toISOString())
        .lte("tgl_pemeriksaan_selanjutnya", endDate.toISOString());
        
      if (countError) throw countError;
      
      // Calculate yearly limit based on frequency
      const yearlyLimit = 12 / selectedAnimalForExtra.freq_pemeriksaan_rutin;
      
      if (yearlySchedules && yearlySchedules.length >= yearlyLimit) {
        alert(`Tidak dapat menambahkan jadwal lagi. Batas maksimum pemeriksaan tahunan (${yearlyLimit} kali) telah tercapai.`);
        return;
      }
      
      // Check if a schedule already exists for this animal and date
      const { data: existingSchedules, error: checkError } = await supabase
        .from("jadwal_pemeriksaan_kesehatan")
        .select("*")
        .eq("id_hewan", selectedAnimalForExtra.id)
        .eq("tgl_pemeriksaan_selanjutnya", extraSchedule.tgl_pemeriksaan_selanjutnya);
  
      if (checkError) throw checkError;
  
      if (existingSchedules && existingSchedules.length > 0) {
        alert("Jadwal pemeriksaan pada tanggal tersebut sudah ada untuk hewan ini.");
        return;
      }
  
      // Insert the additional schedule
      const { error } = await supabase
        .from("jadwal_pemeriksaan_kesehatan")
        .insert({
          id_hewan: selectedAnimalForExtra.id,
          tgl_pemeriksaan_selanjutnya: extraSchedule.tgl_pemeriksaan_selanjutnya,
          freq_pemeriksaan_rutin: selectedAnimalForExtra.freq_pemeriksaan_rutin
        });
  
      if (error) {
        console.error("Supabase error:", error);
        alert(`Error menambahkan jadwal tambahan: ${error.message}`);
        return;
      }
      
      // Refresh the schedules
      await fetchSchedules();
      setIsAddExtraModalOpen(false);
      setSelectedAnimalForExtra(null);
    } catch (error: any) {
      console.error("Error adding extra schedule:", error);
      alert(`Error menambahkan jadwal tambahan: ${error.message || "Unknown error"}`);
    }
  };

  const resetNewSchedule = () => {
    setNewSchedule({
      id_hewan: "",
      tgl_pemeriksaan_selanjutnya: format(new Date(), "yyyy-MM-dd"),
      freq_pemeriksaan_rutin: 3,
    });
  };

  const formatFrequency = (freq: number) => {
    return `${freq} bulan sekali (${12/freq} kali dalam setahun)`;
  };

  // Group schedules by animal
  const schedulesByAnimal = schedules.reduce((acc, schedule) => {
    const animalId = schedule.id_hewan;
    if (!acc[animalId]) {
      acc[animalId] = {
        id: animalId,
        nama: schedule.hewan?.nama || '',
        spesies: schedule.hewan?.spesies || '',
        freq_pemeriksaan_rutin: schedule.freq_pemeriksaan_rutin,
        schedules: []
      };
    }
    acc[animalId].schedules.push(schedule);
    return acc;
  }, {} as Record<string, {
    id: string;
    nama: string;
    spesies: string;
    freq_pemeriksaan_rutin: number;
    schedules: JadwalPemeriksaan[];
  }>);

  // Convert to array for rendering
  const animalSchedules = Object.values(schedulesByAnimal);

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Halaman Jadwal Pemeriksaan Kesehatan - Sistem Informasi Zoologi dan Penitipan (SIZOPI)
        </div>
      </div>

      {/* Filter section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-3xl font-bold">Jadwal Pemeriksaan Kesehatan</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
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
              resetNewSchedule();
              setIsAddModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg text-sm"
          >
            <Plus size={16} />
            Tambah Jadwal Pemeriksaan
          </button>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p>Loading...</p>
          </div>
        ) : animalSchedules.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p>Tidak ada jadwal pemeriksaan kesehatan</p>
          </div>
        ) : (
          animalSchedules.map((animalData) => (
            <div key={animalData.id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold">{animalData.nama} ({animalData.spesies})</h3>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Frekuensi Pemeriksaan Rutin:</span>
                  <span className="font-medium">{animalData.freq_pemeriksaan_rutin} Bulan Sekali</span>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedAnimalForExtra({
                      id: animalData.id,
                      nama: animalData.nama,
                      spesies: animalData.spesies,
                      freq_pemeriksaan_rutin: animalData.freq_pemeriksaan_rutin
                    });
                    setExtraSchedule({
                      tgl_pemeriksaan_selanjutnya: format(new Date(), "yyyy-MM-dd")
                    });
                    setIsAddExtraModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-md"
                >
                  <PlusCircle size={14} />
                  Tambah Jadwal untuk Hewan Ini
                </button>
              </div>
              
              {/* List of scheduled examinations for this animal */}
              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">Jadwal Pemeriksaan:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {animalData.schedules.map((schedule) => (
                    <div 
                      key={schedule.tgl_pemeriksaan_selanjutnya} 
                      className="border border-gray-200 rounded-md p-3 bg-gray-50"
                    >
                      <span className="text-primary font-medium">
                        {new Date(schedule.tgl_pemeriksaan_selanjutnya).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Tambah Jadwal Pemeriksaan</h2>
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
                  {hewan.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.nama} - {animal.spesies}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tanggal Pemeriksaan Selanjutnya
                </label>
                <input
                  type="date"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSchedule.tgl_pemeriksaan_selanjutnya}
                  onChange={(e) => setNewSchedule({ ...newSchedule, tgl_pemeriksaan_selanjutnya: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Frekuensi Pemeriksaan Rutin (bulan)
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newSchedule.freq_pemeriksaan_rutin}
                  onChange={(e) => setNewSchedule({ ...newSchedule, freq_pemeriksaan_rutin: parseInt(e.target.value) })}
                  required
                >
                  <option value={1}>1 bulan sekali (12 kali/tahun)</option>
                  <option value={2}>2 bulan sekali (6 kali/tahun)</option>
                  <option value={3}>3 bulan sekali (4 kali/tahun)</option>
                  <option value={4}>4 bulan sekali (3 kali/tahun)</option>
                  <option value={6}>6 bulan sekali (2 kali/tahun)</option>
                  <option value={12}>12 bulan sekali (1 kali/tahun)</option>
                </select>
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

      {/* Add Extra Schedule Modal */}
      {isAddExtraModalOpen && selectedAnimalForExtra && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Tambah Jadwal Pemeriksaan untuk {selectedAnimalForExtra.nama}</h2>
            <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
              <p>Frekuensi pemeriksaan: {formatFrequency(selectedAnimalForExtra.freq_pemeriksaan_rutin)}</p>
              <p className="mt-1">Pastikan total jadwal tidak melebihi batas tahunan ({12 / selectedAnimalForExtra.freq_pemeriksaan_rutin} kali).</p>
            </div>
            <form onSubmit={handleAddExtraSchedule}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tanggal Pemeriksaan Selanjutnya
                </label>
                <input
                  type="date"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={extraSchedule.tgl_pemeriksaan_selanjutnya}
                  onChange={(e) => setExtraSchedule({ ...extraSchedule, tgl_pemeriksaan_selanjutnya: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex items-center justify-end mt-6 gap-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => {
                    setIsAddExtraModalOpen(false);
                    setSelectedAnimalForExtra(null);
                  }}
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
    </div>
  );
}