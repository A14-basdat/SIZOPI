"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getHabitatByName } from '@/lib/api/habitat';
import { Habitat, Satwa } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { createClient } from '@/utils/supabase/client';

export default function HabitatDetailPage({ params }: { params: { name: string } }) {
  const router = useRouter();
  const [habitat, setHabitat] = useState<Habitat | null>(null);
  const [animals, setAnimals] = useState<Satwa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Decode URL parameter
  const habitatName = decodeURIComponent(params.name);
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch habitat details
        const habitatData = await getHabitatByName(habitatName);
        setHabitat(habitatData);
        
        // Fetch animals in this habitat - use the simple query here too
        const { data: animalsData, error: animalsError } = await supabase
          .from('hewan')  // Changed from 'Hewan' to 'hewan'
          .select('*')
          .eq('nama_habitat', habitatName)
          .order('nama');
          
        if (animalsError) throw new Error(animalsError.message);
        
        setAnimals(animalsData || []);
        
        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [habitatName]);
  
  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }
  
  if (error || !habitat) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-red-500">{error || 'Habitat tidak ditemukan'}</p>
        <Button 
          className="mt-4"
          onClick={() => router.back()}
        >
          Kembali
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Detail Habitat: {habitat.nama}</CardTitle>
              <CardDescription>Informasi mendetail tentang habitat</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => router.push(`/protected/habitat/${encodeURIComponent(habitat.nama)}/edit`)}
              >
                Edit Habitat
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/protected/habitat')}
              >
                Kembali
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Informasi Umum</h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">Nama Habitat:</span>
                  <span>{habitat.nama}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">Luas Area:</span>
                  <span>{habitat.luas_area} m²</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">Kapasitas Maksimal:</span>
                  <span>{habitat.kapasitas} ekor</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    habitat.status === 'Tersedia' ? 'bg-green-100 text-green-800' : 
                    habitat.status === 'Penuh' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {habitat.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Jumlah Hewan</h3>
              <div className="text-3xl font-bold">{animals.length} / {habitat.kapasitas}</div>
              <div className="mt-4 h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-2 rounded-full ${
                    animals.length >= habitat.kapasitas ? 'bg-red-500' :
                    animals.length >= habitat.kapasitas * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(animals.length / habitat.kapasitas * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {animals.length >= habitat.kapasitas ? 'Habitat penuh' :
                 animals.length >= habitat.kapasitas * 0.8 ? 'Hampir penuh' : 'Masih tersedia'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Satwa di Habitat Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {animals.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Spesies</TableHead>
                    <TableHead>Asal Hewan</TableHead>
                    <TableHead>Tanggal Lahir</TableHead>
                    <TableHead>Status Kesehatan</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animals.map((animal) => (
                    <TableRow key={animal.id}>
                      <TableCell>{animal.nama || '-'}</TableCell>
                      <TableCell>{animal.spesies}</TableCell>
                      <TableCell>{animal.asal_hewan}</TableCell>
                      <TableCell>
                        {animal.tanggal_lahir ? format(new Date(animal.tanggal_lahir), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          animal.status_kesehatan === 'Sehat' ? 'bg-green-100 text-green-800' : 
                          animal.status_kesehatan === 'Sakit' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {animal.status_kesehatan}
                        </span>
                      </TableCell>
                      <TableCell>
                        <img 
                          src={animal.url_foto} 
                          alt={animal.nama || animal.spesies} 
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/protected/satwa/${animal.id}/edit`)}
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada satwa di habitat ini
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
