'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, ChevronLeft, Loader2, MapPin, Clock, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    id: '2',
    nama: 'Feeding time Harimau',
    lokasi: 'Zona Harimau',
    jadwal: '11:30',
    kapasitas: 75,
    tersedia: 20,
    deskripsi: 'Lihat harimau Sumatera saat waktu makan dengan panduan dari keeper berpengalaman.'
  },
  {
    id: '3',
    nama: 'Bird Show',
    lokasi: 'Amphitheater Utama',
    jadwal: '09:30',
    kapasitas: 150,
    tersedia: 80,
    deskripsi: 'Pertunjukan burung eksotis dengan berbagai atraksi menarik dan edukatif.'
  },
  {
    id: '4',
    nama: 'Gajah Safari',
    lokasi: 'Zona Gajah',
    jadwal: '14:00',
    kapasitas: 50,
    tersedia: 0,
    deskripsi: 'Berkeliling area safari dengan menunggangi gajah yang jinak dan bersahabat.'
  }
];

export default function CreateReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attractionId = searchParams.get('attraction');

  const [loading, setLoading] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<string | null>(attractionId);
  const [date, setDate] = useState<Date | undefined>();
  const [ticketCount, setTicketCount] = useState<string>("1");
  const [attraction, setAttraction] = useState<any>(null);

  useEffect(() => {
    if (selectedAttraction) {
      const found = mockAttractions.find(a => a.id === selectedAttraction);
      setAttraction(found || null);
    } else {
      setAttraction(null);
    }
  }, [selectedAttraction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAttraction || !date || !ticketCount) {
      alert("Harap lengkapi semua field formulir");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      router.push('/reservasi');
    } catch (error) {
      console.error("Error creating reservation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold">Reservasi Tiket Baru</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Reservasi</CardTitle>
          <CardDescription>
            Isi formulir di bawah ini untuk melakukan reservasi tiket
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="attraction">Nama Atraksi</Label>
              <Select
                value={selectedAttraction || ''}
                onValueChange={(value) => {
                  setSelectedAttraction(value);
                }}
                required
              >
                <SelectTrigger id="attraction" disabled={attractionId !== null}>
                  <SelectValue placeholder="Pilih atraksi" />
                </SelectTrigger>
                <SelectContent>
                  {mockAttractions.map((att) => (
                    <SelectItem
                      key={att.id}
                      value={att.id}
                      disabled={att.tersedia === 0}
                    >
                      {att.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              disabled={!selectedAttraction || !date || parseInt(ticketCount) < 1 || loading}
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