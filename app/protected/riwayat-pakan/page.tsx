"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { InfoIcon } from "lucide-react";

// Define proper TypeScript interfaces
interface SqlQueryRow {
    id_hewan: string;
    jadwal: string;
    username_jh: string;
    nama: string;
    spesies: string;
    asal_hewan: string;
    tanggal_lahir: string | null;
    nama_habitat: string | null;
    status_kesehatan: string;
    jenis: string;
    jumlah: number;
}

interface Hewan {
  id: string;
  nama: string;
  spesies: string;
  asal_hewan: string;
  tanggal_lahir: string | null;
  status_kesehatan: string;
  nama_habitat: string | null;
}

interface Pakan {
  jenis: string;
  jumlah: number;
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

export default function FeedingHistoryPage() {
  const [feedingHistory, setFeedingHistory] = useState<Memberi[]>([]);
  const [hewan, setHewan] = useState<Hewan[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

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
    fetchFeedingHistory();
  }, [selectedAnimal]);

  const fetchFeedingHistory = async () => {
    try {
      setLoading(true);
      
      // Direct SQL query approach - FIXED JOIN with pakan table
      let sql = `
        SELECT 
          m.id_hewan,
          m.jadwal,
          m.username_jh,
          h.nama,
          h.spesies,
          h.asal_hewan,
          h.tanggal_lahir,
          h.nama_habitat,
          h.status_kesehatan,
          p.jenis,
          p.jumlah
        FROM 
          memberi m
        JOIN 
          hewan h ON m.id_hewan = h.id
        LEFT JOIN 
          pakan p ON p.id_hewan = m.id_hewan AND p.jadwal = m.jadwal
      `;
      
      if (selectedAnimal) {
        sql += ` WHERE m.id_hewan = '${selectedAnimal}'`;
      }
      
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        throw error;
      }
      
      // Transform raw SQL results to our interface
      const transformedData = (data || []).map((row: SqlQueryRow) => ({
        id_hewan: row.id_hewan,
        jadwal: row.jadwal,
        username_jh: row.username_jh,
        hewan: {
          nama: row.nama,
          spesies: row.spesies,
          asal_hewan: row.asal_hewan,
          tanggal_lahir: row.tanggal_lahir,
          nama_habitat: row.nama_habitat,
          status_kesehatan: row.status_kesehatan
        },
        pakan: {
          jenis: row.jenis || "Tidak Ada Data",
          jumlah: row.jumlah || 0
        }
      }));
      
      setFeedingHistory(transformedData);
    } catch (error) {
      console.error("Error fetching feeding history:", error);
      
      // If SQL approach fails, try with standard Supabase queries
      try {
        // Query memberi first
        let query = supabase
          .from("memberi")
          .select("id_hewan, jadwal, username_jh");
        
        if (selectedAnimal) {
          query = query.eq("id_hewan", selectedAnimal);
        }
        
        const { data: memberiData, error: memberiError } = await query;
        
        if (memberiError) throw memberiError;
        
        // For each memberi record, get the hewan and pakan details
        const processedRecords = [];
        
        for (const record of memberiData || []) {
          // Get hewan details
          const { data: hewanData, error: hewanError } = await supabase
            .from("hewan")
            .select("nama, spesies, asal_hewan, tanggal_lahir, nama_habitat, status_kesehatan")
            .eq("id", record.id_hewan)
            .single();
          
          if (hewanError) {
            console.warn(`Error fetching hewan ${record.id_hewan}:`, hewanError);
            continue;
          }
          
          // Get pakan details - FIXED query
          const { data: pakanData, error: pakanError } = await supabase
            .from("pakan")
            .select("jenis, jumlah")
            .eq("id_hewan", record.id_hewan)
            .eq("jadwal", record.jadwal);
          
          // Get the first pakan record if there are multiple
          const firstPakanData = pakanData && pakanData.length > 0 ? pakanData[0] : { jenis: "Tidak Ada Data", jumlah: 0 };
          
          processedRecords.push({
            id_hewan: record.id_hewan,
            jadwal: record.jadwal,
            username_jh: record.username_jh,
            hewan: hewanData || undefined,
            pakan: firstPakanData || { jenis: "Tidak Ada Data", jumlah: 0 }
          });
        }
        
        setFeedingHistory(processedRecords);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Halaman Riwayat Pemberian Pakan - Sistem Informasi Zoologi dan Penitipan (SIZOPI)
        </div>
      </div>

      {/* Filter section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-3xl font-bold">Riwayat Pemberian Pakan</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <select
            className="bg-background border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
            value={selectedAnimal}
            onChange={(e) => setSelectedAnimal(e.target.value)}
          >
            <option value="">Semua Hewan</option>
            {hewan.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.nama} - {animal.spesies}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feeding History Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Individu
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spesies
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asal Hewan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Lahir
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Habitat
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Kesehatan
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
                  Tidak ada riwayat pemberian pakan
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
                    {record.pakan?.jenis || "Tidak Ada Data"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.pakan?.jumlah || 0}
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
    </div>
  );
}