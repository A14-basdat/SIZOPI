'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Ride = {
  id: string;
  nama: string;
  kapasitas: number;
  jadwal: string;
  peraturan: string[];
};

const dummyRides: Ride[] = [
  {
    id: '1',
    nama: 'Taman Air Mini',
    kapasitas: 100,
    jadwal: '10:00',
    peraturan: ['Dilarang Berenang.', 'Dilarang membawa makanan']
  },
  {
    id: '2',
    nama: 'Area Petualangan Anak',
    kapasitas: 75,
    jadwal: '11:30',
    peraturan: ['Dilarang memanjat pagar']
  }
];

export default function RideManagementPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>(dummyRides);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rideToDelete, setRideToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setRideToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (rideToDelete) {
      setRides(rides.filter(ride => ride.id !== rideToDelete));
      setDeleteConfirmOpen(false);
      setRideToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/fasilitas')} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold">Manajemen Wahana</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Data Wahana</CardTitle>
            <CardDescription>
              Daftar wahana dan fasilitas pengunjung di kebun binatang
            </CardDescription>
          </div>
          <Button onClick={() => router.push('/protected/fasilitas/wahana/create')}>
            <Plus size={16} className="mr-2" />
            Tambah Wahana
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Wahana</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead>Peraturan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rides.map((ride) => (
                  <TableRow key={ride.id}>
                    <TableCell className="font-medium">{ride.nama}</TableCell>
                    <TableCell>{ride.kapasitas} orang</TableCell>
                    <TableCell>{ride.jadwal}</TableCell>
                    <TableCell>
                      <ul className="list-decimal list-inside text-sm">
                        {ride.peraturan.map((rule, index) => (
                          <li key={index}>{rule}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/protected/fasilitas/wahana/update/${ride.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only md:ml-2">Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(ride.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only md:ml-2">Hapus</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {rides.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Tidak ada data wahana
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
            <h3 className="text-lg font-bold mb-4">Hapus Wahana</h3>
            <p className="mb-6">Apakah anda yakin ingin menghapus wahana ini?</p>
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