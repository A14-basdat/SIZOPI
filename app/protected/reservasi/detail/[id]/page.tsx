'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, ChevronLeft, Edit, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const mockReservations = [
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

const getParams = (id: string): Promise<{ id: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id });
    }, 300);
  });
};

export default function ReservationDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [params, setParams] = useState<{ id: string } | null>(null);
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // First, resolve the params promise
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await paramsPromise;
        setParams(resolvedParams);
      } catch (error) {
        console.error('Error resolving params:', error);
        router.push('/reservasi');
      }
    };

    resolveParams();
  }, [paramsPromise, router]);

  // Then fetch reservation data once we have the params
  useEffect(() => {
    if (!params) return;

    const fetchReservation = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const found = mockReservations.find(r => r.id === params.id);
        setReservation(found || null);
      } catch (error) {
        console.error('Error fetching reservation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [params]);

  const handleCancelReservation = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/reservasi');
  };

  if (!params || loading) {
    return (
      <div className="container mx-auto py-6 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-t-primary border-r-primary border-b-primary/30 border-l-primary/30 rounded-full animate-spin"></div>
          <p className="mt-2 text-muted-foreground">Loading reservation data...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container mx-auto py-6 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Reservasi tidak ditemukan</h1>
        <p className="text-muted-foreground mb-6">Detail reservasi yang Anda cari tidak ditemukan atau telah dihapus</p>
        <Button onClick={() => router.push('/reservasi')}>
          Kembali ke Daftar Reservasi
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/reservasi')} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold">Detail Reservasi</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{reservation.nama_atraksi}</CardTitle>
              <CardDescription>
                Detail reservasi tiket atraksi
              </CardDescription>
            </div>
            <Badge
              variant={
                reservation.status === 'Terjadwal' ? 'default' :
                reservation.status === 'Dibatalkan' ? 'destructive' :
                'outline'
              }
              className="ml-2"
            >
              {reservation.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Nama Atraksi</h3>
                <p className="font-medium">{reservation.nama_atraksi}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Lokasi</h3>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{reservation.lokasi}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Jam</h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{reservation.jadwal} WIB</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Tanggal</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>
                    {new Date(reservation.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Jumlah Tiket</h3>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{reservation.jumlah_tiket} tiket</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p>{reservation.status}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {reservation.status === 'Terjadwal' && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/reservasi/edit/${reservation.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                EDIT
              </Button>
              <Button
                variant="destructive"
                onClick={() => setModalOpen(true)}
              >
                <X className="h-4 w-4 mr-2" />
                BATALKAN RESERVASI
              </Button>
            </>
          )}
        </CardFooter>
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