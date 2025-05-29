'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, Plus, ChevronRight, Edit, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockAttractions = [
  {
    id: '1',
    nama: 'Pertunjukan Lumba-lumba',
    lokasi: 'Area Akuatik',
    jadwal: '10:00',
    kapasitas: 100,
    tersedia: 45,
    deskripsi: 'Saksikan aksi menakjubkan dari lumba-lumba yang pintar dan menggemaskan dalam pertunjukan interaktif.',
    image: 'https://images.unsplash.com/photo-1544906243-a69271f62a08'
  },
  {
    id: '2',
    nama: 'Feeding time Harimau',
    lokasi: 'Zona Harimau',
    jadwal: '11:30',
    kapasitas: 75,
    tersedia: 20,
    deskripsi: 'Lihat harimau Sumatera saat waktu makan dengan panduan dari keeper berpengalaman.',
    image: 'https://images.unsplash.com/photo-1590767600775-5d391d28589d'
  },
  {
    id: '3',
    nama: 'Bird Show',
    lokasi: 'Amphitheater Utama',
    jadwal: '09:30',
    kapasitas: 150,
    tersedia: 80,
    deskripsi: 'Pertunjukan burung eksotis dengan berbagai atraksi menarik dan edukatif.',
    image: 'https://images.unsplash.com/photo-1555110661-9886b08a4c1d'
  },
  {
    id: '4',
    nama: 'Gajah Safari',
    lokasi: 'Zona Gajah',
    jadwal: '14:00',
    kapasitas: 50,
    tersedia: 0,
    deskripsi: 'Berkeliling area safari dengan menunggangi gajah yang jinak dan bersahabat.',
    image: 'https://images.unsplash.com/photo-1585087905922-e9b69592a130'
  }
];

const mockUserReservations = [
  {
    id: '101',
    attraction_id: '1',
    nama_atraksi: 'Pertunjukan Lumba-lumba',
    lokasi: 'Area Akuatik',
    jadwal: '10:00',
    tanggal: '2025-05-12',
    jumlah_tiket: 3,
    status: 'Terjadwal'
  },
  {
    id: '102',
    attraction_id: '3',
    nama_atraksi: 'Bird Show',
    lokasi: 'Amphitheater Utama',
    jadwal: '09:30',
    tanggal: '2025-05-15',
    jumlah_tiket: 2,
    status: 'Terjadwal'
  }
];

export default function ReservasiPage() {
  const router = useRouter();
  const [upcomingReservations, setUpcomingReservations] = useState(mockUserReservations);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-2">Reservasi Tiket Atraksi</h1>
      <p className="text-muted-foreground mb-8">Pesan tiket untuk menyaksikan berbagai atraksi menarik di kebun binatang</p>

      {/* Upcoming Reservations Section */}
      {upcomingReservations.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Reservasi Anda</h2>
          <Card>
            <CardHeader>
              <CardTitle>Data Reservasi</CardTitle>
              <CardDescription>
                Daftar reservasi tiket atraksi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Atraksi</TableHead>
                      <TableHead>Tanggal Reservasi</TableHead>
                      <TableHead>Jumlah Tiket</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">{reservation.nama_atraksi}</TableCell>
                        <TableCell>
                          {new Date(reservation.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric'
                          })}
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
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => router.push(`/reservasi/edit/${reservation.id}`)}
                            >
                              [Edit]
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => router.push(`/reservasi/detail/${reservation.id}`)}
                            >
                              [Batalkan]
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Attractions Section */}
      <h2 className="text-2xl font-semibold mb-4">Atraksi Tersedia</h2>
      <Card>
        <CardHeader>
          <CardTitle>Data Atraksi</CardTitle>
          <CardDescription>
            Daftar atraksi tersedia untuk reservasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Atraksi</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Kapasitas Tersedia</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAttractions.map((attraction) => (
                  <TableRow key={attraction.id}>
                    <TableCell className="font-medium">{attraction.nama}</TableCell>
                    <TableCell>{attraction.lokasi}</TableCell>
                    <TableCell>{attraction.jadwal}</TableCell>
                    <TableCell>
                      {attraction.tersedia === 0
                        ? <span className="text-destructive font-medium">Tiket Habis</span>
                        : `${attraction.tersedia} dari ${attraction.kapasitas}`}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        className="w-[120px]"
                        size="sm"
                        disabled={attraction.tersedia === 0}
                        onClick={() => router.push(`/reservasi/create?attraction=${attraction.id}`)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Pesan Tiket
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}