'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Attraction = {
  id: string;
  nama: string;
  lokasi: string;
  kapasitas: number;
  jadwal: string;
  hewan_terlibat: string[];
  pelatih: string[];
};

const dummyAttractions: Attraction[] = [
  {
    id: '1',
    nama: 'Pertunjukan Lumba-lumba',
    lokasi: 'Area Akuatik',
    kapasitas: 100,
    jadwal: '10:00',
    hewan_terlibat: ['Lumba-lumba'],
    pelatih: ['Budi']
  },
  {
    id: '2',
    nama: 'Feeding time harimau',
    lokasi: 'Zona Harimau',
    kapasitas: 75,
    jadwal: '11:30',
    hewan_terlibat: ['Harimau'],
    pelatih: ['Andi']
  },
  {
    id: '3',
    nama: 'Bird show',
    lokasi: 'Amphitheater utama',
    kapasitas: 150,
    jadwal: '09:30',
    hewan_terlibat: ['Kakatua', 'Parrot'],
    pelatih: ['Havana']
  }
];

export default function AttractionManagementPage() {
  const router = useRouter();
  const [attractions, setAttractions] = useState<Attraction[]>(dummyAttractions);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [attractionToDelete, setAttractionToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setAttractionToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (attractionToDelete) {
      setAttractions(attractions.filter(attraction => attraction.id !== attractionToDelete));
      setDeleteConfirmOpen(false);
      setAttractionToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/fasilitas')} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold">Manajemen Atraksi</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Data Atraksi</CardTitle>
            <CardDescription>
              Daftar atraksi dan pertunjukan hewan di kebun binatang
            </CardDescription>
          </div>
          <Button onClick={() => router.push('/protected/fasilitas/atraksi/create')}>
            <Plus size={16} className="mr-2" />
            Tambah Atraksi
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Atraksi</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead>Hewan yang Terlibat</TableHead>
                  <TableHead>Pelatih</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attractions.map((attraction) => (
                  <TableRow key={attraction.id}>
                    <TableCell className="font-medium">{attraction.nama}</TableCell>
                    <TableCell>{attraction.lokasi}</TableCell>
                    <TableCell>{attraction.kapasitas} orang</TableCell>
                    <TableCell>{attraction.jadwal}</TableCell>
                    <TableCell>{attraction.hewan_terlibat.join(', ')}</TableCell>
                    <TableCell>{attraction.pelatih.join(', ')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/protected/fasilitas/atraksi/update/${attraction.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only md:ml-2">Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(attraction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only md:ml-2">Hapus</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {attractions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada data atraksi
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Hapus Atraksi</h3>
            <p className="mb-6">Apakah anda yakin ingin menghapus atraksi ini?</p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                TIDAK
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                YA
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}