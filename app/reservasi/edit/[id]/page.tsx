'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, ChevronLeft, Loader2, MapPin, Clock, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const mockAttractions = [
  {
    id: '1',
    nama: 'Pertunjukan Lumba-lumba',
    lokasi: 'Area Akuatik',
    jadwal: '10:00',
    kapasitas: 100,
    tersedia: 45,
    deskripsi: 'Saksikan aksi menakjubkan dari lumba-lumba yang pintar dan menggemaskan dalam pertunjukan interaktif.'
  },
  {
    id: '3',
    nama: 'Bird Show',
    lokasi: 'Amphitheater Utama',
    jadwal: '09:30',
    kapasitas: 150,
    tersedia: 80,
    deskripsi: 'Pertunjukan burung eksotis dengan berbagai atraksi menarik dan edukatif.'
  }
];

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

export default function EditReservationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingReservation, setLoadingReservation] = useState(true);

  const [ticketCount, setTicketCount] = useState<string>("1");
  const [date, setDate] = useState<Date | undefined>();
  const [attraction, setAttraction] = useState<any>(null);

  useEffect(() => {
    const fetchReservationData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      const reservation = mockReservations.find(r => r.id === params.id);
      if (reservation) {
        setTicketCount(reservation.jumlah_tiket.toString());
        setDate(new Date(reservation.tanggal));

        const attractionData = mockAttractions.find(a => a.id === reservation.attraction_id);
        if (attractionData) {
          setAttraction(attractionData);
        }
      } else {
        router.push('/reservasi');
      }

      setLoadingReservation(false);
    };

    fetchReservationData();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !ticketCount) {
      alert("Harap lengkapi semua field formulir");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      router.push(`/reservasi/detail/${params.id}`);
    } catch (error) {
      console.error("Error updating reservation:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingReservation) {
    return (
      <div className="container mx-auto py-6 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading reservation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold">Edit Reservasi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Edit Reservasi</CardTitle>
          <CardDescription>
            Update detail reservasi tiket atraksi
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Non-editable attraction details */}
            <div className="space-y-2">
              <Label>Nama Atraksi</Label>
              <div className="p-2 border rounded-md bg-muted/30 h-10 flex items-center">
                {attraction?.nama || 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                Nama atraksi tidak dapat diubah
              </p>
            </div>

            {attraction && (
              <>
                <div className="grid grid-cols-1 gap-4 py-4">
                  <div className="flex items-center gap-4 rounded-md border p-4 bg-muted/50">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center text-sm">
                        <MapPin size={16} className="mr-2 text-muted-foreground" />
                        <p className="text-sm font-medium leading-none">Lokasi</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {attraction.lokasi}
                      </p>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center text-sm">
                        <Clock size={16} className="mr-2 text-muted-foreground" />
                        <p className="text-sm font-medium leading-none">Jadwal</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {attraction.jadwal} WIB
                      </p>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center text-sm">
                        <Users size={16} className="mr-2 text-muted-foreground" />
                        <p className="text-sm font-medium leading-none">Kapasitas Tersisa</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {attraction.tersedia} dari {attraction.kapasitas}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                          format(date, "EEEE, dd MMMM yyyy", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        locale={id}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket-count">Jumlah Tiket</Label>
                  <Input
                    id="ticket-count"
                    type="number"
                    min="1"
                    max={attraction?.tersedia || 1}
                    value={ticketCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1 && val <= attraction.tersedia) {
                        setTicketCount(e.target.value);
                      } else if (val > attraction.tersedia) {
                        setTicketCount(attraction.tersedia.toString());
                      }
                    }}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Maksimal {attraction.tersedia} tiket
                  </p>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              BATAL
            </Button>
            <Button
              type="submit"
              disabled={!date || parseInt(ticketCount) < 1 || loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              SIMPAN
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}