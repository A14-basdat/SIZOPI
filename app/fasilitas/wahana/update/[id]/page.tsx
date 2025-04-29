'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const dummyRides = [
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

export default function UpdateRidePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    nama: '',
    kapasitas: '',
    jadwal: '',
    peraturan: ['']
  });

  useEffect(() => {
    const fetchRideData = async () => {
      setLoadingData(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const ride = dummyRides.find(r => r.id === params.id);

        if (ride) {
          setFormData({
            nama: ride.nama,
            kapasitas: ride.kapasitas.toString(),
            jadwal: ride.jadwal,
            peraturan: [...ride.peraturan]
          });
        } else {
          console.error('Ride not found');
          router.push('/fasilitas/wahana');
        }
      } catch (error) {
        console.error('Error fetching ride data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchRideData();
  }, [params.id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRuleChange = (index: number, value: string) => {
    const updatedRules = [...formData.peraturan];
    updatedRules[index] = value;
    setFormData({
      ...formData,
      peraturan: updatedRules
    });
  };

  const addRule = () => {
    setFormData({
      ...formData,
      peraturan: [...formData.peraturan, '']
    });
  };

  const removeRule = (index: number) => {
    const updatedRules = formData.peraturan.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      peraturan: updatedRules
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const filteredRules = formData.peraturan.filter(rule => rule.trim() !== '');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push('/fasilitas/wahana');
    } catch (error) {
      console.error('Error updating ride:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="container mx-auto py-6 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading wahana data...</p>
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
        <h1 className="text-2xl font-bold">Edit Wahana</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Form Edit Wahana</CardTitle>
            <CardDescription>
              Update informasi wahana atau fasilitas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Wahana</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama wahana"
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Peraturan</Label>
              </div>

              {formData.peraturan.map((rule, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    placeholder={`Peraturan ${index + 1}`}
                  />
                  {formData.peraturan.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRule(index)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addRule}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Peraturan
              </Button>
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