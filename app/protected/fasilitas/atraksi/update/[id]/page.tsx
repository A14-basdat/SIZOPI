'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const trainers = [
  { id: '1', name: 'Budi' },
  { id: '2', name: 'Andi' },
  { id: '3', name: 'Havana' },
  { id: '4', name: 'Diana' },
  { id: '5', name: 'Eko' },
];

const animals = [
  { id: '1', name: 'Lumba-lumba' },
  { id: '2', name: 'Harimau' },
  { id: '3', name: 'Kakatua' },
  { id: '4', name: 'Parrot' },
  { id: '5', name: 'Gajah' },
  { id: '6', name: 'Beruang' },
];

const dummyAttractions = [
  {
    id: '1',
    nama: 'Pertunjukan Lumba-lumba',
    lokasi: 'Area Akuatik',
    kapasitas: 100,
    jadwal: '10:00',
    hewan_terlibat: ['1'],
    pelatih: ['1'],
  },
  {
    id: '2',
    nama: 'Feeding time harimau',
    lokasi: 'Zona Harimau',
    kapasitas: 75,
    jadwal: '11:30',
    hewan_terlibat: ['2'],
    pelatih: ['2'],
  },
  {
    id: '3',
    nama: 'Bird show',
    lokasi: 'Amphitheater utama',
    kapasitas: 150,
    jadwal: '09:30',
    hewan_terlibat: ['3', '4'],
    pelatih: ['3'],
  }
];

export default function UpdateAttractionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    nama: '',
    lokasi: '',
    kapasitas: '',
    jadwal: '',
    selectedAnimals: [] as string[],
    selectedTrainers: [] as string[],
  });

  useEffect(() => {
    const fetchAttractionData = async () => {
      setLoadingData(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const attraction = dummyAttractions.find(a => a.id === params.id);

        if (attraction) {
          setFormData({
            nama: attraction.nama,
            lokasi: attraction.lokasi,
            kapasitas: attraction.kapasitas.toString(),
            jadwal: attraction.jadwal,
            selectedAnimals: attraction.hewan_terlibat,
            selectedTrainers: attraction.pelatih,
          });
        } else {
          console.error('Attraction not found');
          router.push('/fasilitas/atraksi');
        }
      } catch (error) {
        console.error('Error fetching attraction:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAttractionData();
  }, [params.id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const toggleAnimal = (animalId: string) => {
    setFormData(prev => {
      if (prev.selectedAnimals.includes(animalId)) {
        return {
          ...prev,
          selectedAnimals: prev.selectedAnimals.filter(id => id !== animalId)
        };
      } else {
        return {
          ...prev,
          selectedAnimals: [...prev.selectedAnimals, animalId]
        };
      }
    });
  };

  const toggleTrainer = (trainerId: string) => {
    setFormData(prev => {
      if (prev.selectedTrainers.includes(trainerId)) {
        return {
          ...prev,
          selectedTrainers: prev.selectedTrainers.filter(id => id !== trainerId)
        };
      } else {
        return {
          ...prev,
          selectedTrainers: [...prev.selectedTrainers, trainerId]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push('/fasilitas/atraksi');
    } catch (error) {
      console.error('Error updating attraction:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="container mx-auto py-6 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading attraction data...</p>
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
        <h1 className="text-2xl font-bold">Edit Atraksi</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Form Edit Atraksi</CardTitle>
            <CardDescription>
              Update informasi atraksi atau pertunjukan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Atraksi</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama atraksi"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lokasi">Lokasi</Label>
                <Input
                  id="lokasi"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleInputChange}
                  placeholder="Masukkan lokasi atraksi"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kapasitas">Kapasitas Maksimum</Label>
                <div className="flex items-center">
                  <Input
                    id="kapasitas"
                    name="kapasitas"
                    type="number"
                    value={formData.kapasitas}
                    onChange={handleInputChange}
                    placeholder="Masukkan jumlah kapasitas"
                    min="1"
                    required
                  />
                  <span className="ml-2">orang</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jadwal">Jadwal</Label>
                <Input
                  id="jadwal"
                  name="jadwal"
                  type="time"
                  value={formData.jadwal}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hewan yang Terlibat</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {animals.map((animal) => (
                  <div
                    key={animal.id}
                    onClick={() => toggleAnimal(animal.id)}
                    className={`
                      flex items-center p-2 rounded-md border cursor-pointer
                      ${formData.selectedAnimals.includes(animal.id)
                        ? 'bg-primary/10 border-primary'
                        : 'bg-background border-input hover:bg-muted/50'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedAnimals.includes(animal.id)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span>{animal.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pelatih Pertunjukan</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {trainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    onClick={() => toggleTrainer(trainer.id)}
                    className={`
                      flex items-center p-2 rounded-md border cursor-pointer
                      ${formData.selectedTrainers.includes(trainer.id)
                        ? 'bg-primary/10 border-primary'
                        : 'bg-background border-input hover:bg-muted/50'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedTrainers.includes(trainer.id)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span>{trainer.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              BATAL
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              SIMPAN PERUBAHAN
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}