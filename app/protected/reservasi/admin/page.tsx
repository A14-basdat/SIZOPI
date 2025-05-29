'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight, Edit, Search, X, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockAllReservations = [
  {
    id: '101',
    username: 'arif123',
    attraction_id: '1',
    nama_atraksi: 'Pertunjukan Lumba-lumba',
    lokasi: 'Area Akuatik',
    jadwal: '10:00',
    tanggal: '2025-05-12',
    jumlah_tiket: 10,
    status: 'Terjadwal'
  },
  {
    id: '102',
    username: 'winnie456',
    attraction_id: '2',
    nama_atraksi: 'Feeding time harimau',
    lokasi: 'Zona Harimau',
    jadwal: '11:30',
    tanggal: '2025-05-11',
    jumlah_tiket: 3,
    status: 'Dibatalkan'
  },
  {
    id: '103',
    username: 'diana789',
    attraction_id: '3',
    nama_atraksi: 'Bird Show',
    lokasi: 'Amphitheater Utama',
    jadwal: '09:30',
    tanggal: '2025-05-10',
    jumlah_tiket: 5,
    status: 'Terjadwal'
  },
  {
    id: '104',
    username: 'johndoe',
    attraction_id: '1',
    nama_atraksi: 'Pertunjukan Lumba-lumba',
    lokasi: 'Area Akuatik',
    jadwal: '10:00',
    tanggal: '2025-05-15',
    jumlah_tiket: 2,
    status: 'Terjadwal'
  },
  {
    id: '105',
    username: 'maria22',
    attraction_id: '3',
    nama_atraksi: 'Bird Show',
    lokasi: 'Amphitheater Utama',
    jadwal: '09:30',
    tanggal: '2025-05-09',
    jumlah_tiket: 4,
    status: 'Dibatalkan'
  }
];

export default function AdminReservationPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState(mockAllReservations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reservation.nama_atraksi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || statusFilter === "all" || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCancelReservation = () => {
    if (reservationToCancel) {
      setReservations(reservations.map(res =>
        res.id === reservationToCancel ? { ...res, status: 'Dibatalkan' } : res
      ));
      setModalOpen(false);
      setReservationToCancel(null);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/reservasi')} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold">Data Reservasi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manajemen Reservasi</CardTitle>
          <CardDescription>
            Kelola reservasi dari semua pengunjung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari username atau atraksi..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value || undefined)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Terjadwal">Terjadwal</SelectItem>
                  <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Nama Atraksi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah Tiket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.username}</TableCell>
                      <TableCell>{reservation.nama_atraksi}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {new Date(reservation.tanggal).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>{reservation.jumlah_tiket}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            reservation.status === 'Terjadwal' ? 'default' :
                            reservation.status === 'Dibatalkan' ? 'destructive' :
                            'outline'
                          }
                        >
                          {reservation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/reservasi/edit/${reservation.id}`)}
                            disabled={reservation.status === 'Dibatalkan'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setReservationToCancel(reservation.id);
                              setModalOpen(true);
                            }}
                            disabled={reservation.status === 'Dibatalkan'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Tidak ada reservasi yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={true}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={true}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Batalkan Reservasi</h3>
            <p className="mb-6">Apakah anda yakin ingin membatalkan reservasi ini?</p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                TIDAK
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelReservation}
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