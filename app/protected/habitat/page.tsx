"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getHabitats, deleteHabitat } from '@/lib/api/habitat';
import { Habitat } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function HabitatListPage() {
  const router = useRouter();
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [habitatToDelete, setHabitatToDelete] = useState<Habitat | null>(null);
  
  useEffect(() => {
    loadHabitats();
  }, []);
  
  async function loadHabitats() {
    try {
      setLoading(true);
      const data = await getHabitats();
      setHabitats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load habitats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  const filteredHabitats = habitats
    .filter(habitat => 
      searchTerm === '' || 
      habitat.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
  const handleView = (name: string) => {
    router.push(`/protected/habitat/${name}`);
  };
  
  const handleEdit = (name: string) => {
    router.push(`/protected/habitat/${name}/edit`);
  };
  
  const confirmDelete = (habitat: Habitat) => {
    setHabitatToDelete(habitat);
  };
  
  const handleDelete = async () => {
    if (!habitatToDelete) return;
    
    try {
      await deleteHabitat(habitatToDelete.nama);
      await loadHabitats();
      alert('Habitat berhasil dihapus');
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus habitat');
      console.error(err);
    } finally {
      setHabitatToDelete(null);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Data Habitat</h1>
        <Button 
          className="bg-[#229954] hover:bg-[#1e8449]" 
          onClick={() => router.push('/protected/habitat/create')}
        >
          Tambah Habitat
        </Button>
      </div>
      
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Cari habitat berdasarkan nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
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
                <TableHead>Nama Habitat</TableHead>
                <TableHead>Luas Area (m²)</TableHead>
                <TableHead>Kapasitas Maksimal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHabitats.length > 0 ? (
                filteredHabitats.map((habitat) => (
                  <TableRow key={habitat.nama}>
                    <TableCell className="font-medium">{habitat.nama}</TableCell>
                    <TableCell>{habitat.luas_area}</TableCell>
                    <TableCell>{habitat.kapasitas} ekor</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        habitat.status === 'Tersedia' ? 'bg-green-100 text-green-800' : 
                        habitat.status === 'Penuh' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {habitat.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm"
                        onClick={() => handleView(habitat.nama)}
                      >
                        Lihat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(habitat.nama)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete(habitat)}
                      >
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Tidak ada data habitat
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      <AlertDialog open={!!habitatToDelete} onOpenChange={() => setHabitatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus habitat {habitatToDelete?.nama}?
              Habitat yang masih berisi hewan tidak dapat dihapus.
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
