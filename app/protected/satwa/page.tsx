"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSatwas, deleteSatwa } from '@/lib/api/satwa';
import { Satwa } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

export default function SatwaListPage() {
  const router = useRouter();
  const [animals, setAnimals] = useState<Satwa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [animalToDelete, setAnimalToDelete] = useState<Satwa | null>(null);
  
  useEffect(() => {
    loadAnimals();
  }, []);
  
  async function loadAnimals() {
    try {
      setLoading(true);
      const data = await getSatwas();
      setAnimals(data);
      setError(null);
    } catch (err) {
      setError('Failed to load animals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  const filteredAnimals = animals
    .filter(animal => 
      (searchTerm === '' || 
        animal.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        animal.spesies.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || animal.status_kesehatan === statusFilter)
    );
    
  const handleEdit = (id: string) => {
    router.push(`/protected/satwa/${id}/edit`);
  };
  
  const confirmDelete = (animal: Satwa) => {
    setAnimalToDelete(animal);
  };
  
  const handleDelete = async () => {
    if (!animalToDelete) return;
    
    try {
      await deleteSatwa(animalToDelete.id);
      await loadAnimals();
      alert('Hewan berhasil dihapus');
    } catch (err) {
      alert('Gagal menghapus hewan');
      console.error(err);
    } finally {
      setAnimalToDelete(null);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Data Satwa</h1>
        <Button 
          className="bg-[#229954] hover:bg-[#1e8449]" 
          onClick={() => router.push('/protected/satwa/create')}
        >
          Tambah Satwa
        </Button>
      </div>
      
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Cari berdasarkan nama atau spesies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Sehat">Sehat</SelectItem>
            <SelectItem value="Sakit">Sakit</SelectItem>
            <SelectItem value="Dalam Pemantauan">Dalam Pemantauan</SelectItem>
            <SelectItem value="Lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Spesies</TableHead>
                <TableHead>Asal Hewan</TableHead>
                <TableHead>Tanggal Lahir</TableHead>
                <TableHead>Status Kesehatan</TableHead>
                <TableHead>Habitat</TableHead>
                <TableHead>Foto</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnimals.length > 0 ? (
                filteredAnimals.map((animal) => (
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
                    <TableCell>{animal.nama_habitat || '-'}</TableCell>
                    <TableCell>
                      <img 
                        src={animal.url_foto} 
                        alt={animal.nama || animal.spesies} 
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(animal.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete(animal)}
                      >
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Tidak ada data satwa
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      <AlertDialog open={!!animalToDelete} onOpenChange={() => setAnimalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus satwa {animalToDelete?.nama || animalToDelete?.spesies}?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
