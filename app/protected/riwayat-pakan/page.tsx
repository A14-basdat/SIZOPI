"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { InfoIcon, Search, ArrowLeft } from "lucide-react";
import { getCurrentSession } from "@/app/actions";

// Define proper TypeScript interfaces
interface Hewan {
  id: string;
  nama: string;
  spesies: string;
  asal_hewan: string;
  tanggal_lahir: string | null;
  status_kesehatan: string;
  nama_habitat: string | null;
  url_foto: string;
}

interface FeedingHistory {
  id_hewan: string;
  jadwal: string;
  username_jh: string;
  jenis: string;
  jumlah: number;
  hewan?: {
    nama: string;
    spesies: string;
    asal_hewan: string;
    tanggal_lahir: string | null;
    nama_habitat: string | null;
    status_kesehatan: string;
  };
}

interface UserProfile {
  username: string;
  nama_depan: string;
  nama_tengah: string | null;
  nama_belakang: string;
  role: string;
}

export default function RiwayatPakanPage() {
  const [feedingHistory, setFeedingHistory] = useState<FeedingHistory[]>([]);
  const [animalsWithFeedingHistory, setAnimalsWithFeedingHistory] = useState<Hewan[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Hewan | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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
    if (userProfile) {
      fetchAnimalsWithFeedingHistory();
    }
  }, [userProfile]);

  useEffect(() => {
    if (selectedAnimal && userProfile) {
      fetchFeedingHistory();
    }
  }, [selectedAnimal, userProfile]);

  const fetchAnimalsWithFeedingHistory = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      
      // First, get all unique animal IDs that this keeper has fed
      const { data: memberiData, error: memberiError } = await supabase
        .from("memberi")
        .select("id_hewan")
        .eq("username_jh", userProfile.username);

      if (memberiError) throw memberiError;

      if (!memberiData || memberiData.length === 0) {
        setAnimalsWithFeedingHistory([]);
        return;
      }

      // Get unique animal IDs
      const uniqueAnimalIds = Array.from(new Set(memberiData.map(record => record.id_hewan)));

      // Fetch animal details for these IDs
      const { data: animalData, error: animalError } = await supabase
        .from("hewan")
        .select("*")
        .in("id", uniqueAnimalIds);

      if (animalError) throw animalError;

      setAnimalsWithFeedingHistory(animalData as Hewan[] || []);
      
    } catch (error) {
      console.error("Error fetching animals with feeding history:", error);
      setAnimalsWithFeedingHistory([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchFeedingHistory = async () => {
    if (!selectedAnimal || !userProfile) return;
    
    try {
      setLoading(true);
      
      // Fetch feeding history from memberi table with joins to pakan and hewan
      const { data, error } = await supabase
        .from("memberi")
        .select(`
          id_hewan,
          jadwal,
          username_jh,
          pakan!inner(jenis, jumlah),
          hewan!inner(nama, spesies, asal_hewan, tanggal_lahir, nama_habitat, status_kesehatan)
        `)
        .eq("id_hewan", selectedAnimal.id)
        .eq("username_jh", userProfile.username)
        .order("jadwal", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((item: any) => ({
        id_hewan: item.id_hewan,
        jadwal: item.jadwal,
        username_jh: item.username_jh,
        jenis: item.pakan?.jenis || "Unknown",
        jumlah: item.pakan?.jumlah || 0,
        hewan: {
          nama: item.hewan?.nama || "Unknown",
          spesies: item.hewan?.spesies || "Unknown",
          asal_hewan: item.hewan?.asal_hewan || "Unknown",
          tanggal_lahir: item.hewan?.tanggal_lahir,
          nama_habitat: item.hewan?.nama_habitat,
          status_kesehatan: item.hewan?.status_kesehatan || "Unknown"
        }
      }));
      
      setFeedingHistory(transformedData);
    } catch (error) {
      console.error("Error fetching feeding history:", error);
      
      // Fallback: try with manual joins if the above fails
      try {
        const { data: memberiData, error: memberiError } = await supabase
          .from("memberi")
          .select("*")
          .eq("id_hewan", selectedAnimal.id)
          .eq("username_jh", userProfile.username)
          .order("jadwal", { ascending: false });

        if (memberiError) throw memberiError;

        const processedRecords = [];
        
        for (const record of memberiData || []) {
          // Get pakan details
          const { data: pakanData, error: pakanError } = await supabase
            .from("pakan")
            .select("jenis, jumlah")
            .eq("id_hewan", record.id_hewan)
            .eq("jadwal", record.jadwal)
            .single();
          
          // Get hewan details
          const { data: hewanData, error: hewanError } = await supabase
            .from("hewan")
            .select("nama, spesies, asal_hewan, tanggal_lahir, nama_habitat, status_kesehatan")
            .eq("id", record.id_hewan)
            .single();
          
          if (!pakanError && !hewanError && pakanData && hewanData) {
            processedRecords.push({
              id_hewan: record.id_hewan,
              jadwal: record.jadwal,
              username_jh: record.username_jh,
              jenis: pakanData.jenis,
              jumlah: pakanData.jumlah,
              hewan: hewanData
            });
          }
        }
        
        setFeedingHistory(processedRecords);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = animalsWithFeedingHistory.filter((animal) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      animal.nama.toLowerCase().includes(searchTermLower) ||
      animal.spesies.toLowerCase().includes(searchTermLower)
    );
  });

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
          Halaman Riwayat Pemberian Pakan - Sistem Informasi Zoologi dan Penitipan (SIZOPI)
        </div>
      </div>

      {/* Main content */}
      {!selectedAnimal ? (
        // Animal selection view - only animals that have been fed by this keeper
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Riwayat Pemberian Pakan</h1>
              <p className="text-gray-600 mt-2">Pilih hewan yang pernah Anda beri pakan untuk melihat riwayat lengkap</p>
            </div>
            
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

          {/* Animals Table - Only animals with feeding history by this keeper */}
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
                    Status Kesehatan
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
                      {animalsWithFeedingHistory.length === 0 
                        ? "Anda belum pernah memberi pakan kepada hewan manapun"
                        : "Tidak ada hewan ditemukan dengan kata kunci tersebut"
                      }
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
                          animal.status_kesehatan === "Sehat" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {animal.status_kesehatan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnimal(animal);
                          }}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-xs font-medium"
                        >
                          Lihat Riwayat
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Information */}
          {!loading && animalsWithFeedingHistory.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Ringkasan Aktivitas Pemberian Pakan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-800 font-medium">Total Hewan yang Pernah Diberi Pakan:</span>
                  <span className="ml-2 text-gray-700">{animalsWithFeedingHistory.length} hewan</span>
                </div>
                <div>
                  <span className="text-blue-800 font-medium">Penjaga:</span>
                  <span className="ml-2 text-gray-700">
                    {userProfile.nama_tengah 
                      ? `${userProfile.nama_depan} ${userProfile.nama_tengah} ${userProfile.nama_belakang}`
                      : `${userProfile.nama_depan} ${userProfile.nama_belakang}`
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // Feeding history view for selected animal
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
              <div>
                <h1 className="text-3xl font-bold">
                  Riwayat Pemberian Pakan - {selectedAnimal.nama} ({selectedAnimal.spesies})
                </h1>
                <p className="text-gray-600 mt-1">
                  Riwayat pemberian pakan yang dilakukan oleh Anda
                </p>
              </div>
            </div>
          </div>

          {/* Feeding History Table */}
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Individu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spesies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asal Hewan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Lahir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Habitat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Kesehatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis Pakan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Pakan (gram)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu Pemberian
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : feedingHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada riwayat pemberian pakan untuk hewan ini
                    </td>
                  </tr>
                ) : (
                  feedingHistory.map((record, index) => (
                    <tr key={`${record.id_hewan}-${record.jadwal}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.hewan?.nama || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.hewan?.spesies || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.hewan?.asal_hewan || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.hewan?.tanggal_lahir ? new Date(record.hewan.tanggal_lahir).toLocaleDateString('id-ID') : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.hewan?.nama_habitat || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.hewan?.status_kesehatan === "Sehat" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {record.hewan?.status_kesehatan || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.jenis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.jumlah}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.jadwal).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Feeding Statistics for Selected Animal */}
          {!loading && feedingHistory.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Statistik Pemberian Pakan - {selectedAnimal.nama}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-800 font-medium">Total Pemberian:</span>
                  <span className="ml-2 text-gray-700">{feedingHistory.length} kali</span>
                </div>
                <div>
                  <span className="text-green-800 font-medium">Total Pakan:</span>
                  <span className="ml-2 text-gray-700">
                    {feedingHistory.reduce((total, record) => total + record.jumlah, 0)} gram
                  </span>
                </div>
                <div>
                  <span className="text-green-800 font-medium">Pemberian Terakhir:</span>
                  <span className="ml-2 text-gray-700">
                    {feedingHistory.length > 0 
                      ? new Date(feedingHistory[0].jadwal).toLocaleDateString('id-ID')
                      : "-"
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
