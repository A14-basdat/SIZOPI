'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, Plus, X } from 'lucide-react';
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

export default function CreateAttractionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    lokasi: '',
    kapasitas: '',
    jadwal: '',
    selectedAnimals: [] as string[],
    selectedTrainers: [] as string[],
  });

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

      router.push('/protected/fasilitas/atraksi');
    } catch (error) {
      console.error('Error creating attraction:', error);
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
        <h1 className="text-2xl font-bold">Tambah Atraksi Baru</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Form Tambah Atraksi</CardTitle>
            <CardDescription>
              Tambahkan atraksi atau pertunjukan baru ke kebun binatang
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
              SIMPAN
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}