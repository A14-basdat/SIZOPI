'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateRidePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    kapasitas: '',
    jadwal: '',
    peraturan: ['']
  });

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
      console.error('Error creating ride:', error);
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
        <h1 className="text-2xl font-bold">Tambah Wahana Baru</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Form Tambah Wahana</CardTitle>
            <CardDescription>
              Tambahkan wahana atau fasilitas baru ke kebun binatang
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
              SIMPAN
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}