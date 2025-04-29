"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { createSatwa } from '@/lib/api/satwa';
import { getHabitats } from '@/lib/api/habitat';
import { SatwaFormData, Habitat } from '@/lib/types';
import { satwaSchema } from '@/lib/validation/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function CreateSatwaPage() {
  const router = useRouter();
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<SatwaFormData>({
    resolver: zodResolver(satwaSchema),
    defaultValues: {
      nama: '',
      spesies: '',
      asal_hewan: '',
      tanggal_lahir: null,
      status_kesehatan: 'Sehat',
      nama_habitat: null,
      url_foto: '',
    }
  });
  
  useEffect(() => {
    async function fetchHabitats() {
      try {
        const data = await getHabitats();
        // Filter only habitats with status 'Tersedia'
        const availableHabitats = data.filter(h => h.status === 'Tersedia');
        setHabitats(availableHabitats);
      } catch (err) {
        console.error('Failed to load habitats:', err);
        setError('Gagal memuat data habitat');
      }
    }
    
    fetchHabitats();
  }, []);
  
  async function onSubmit(data: SatwaFormData) {
    try {
      setLoading(true);
      setError(null);
      
      // Process the form data before submission
      const processedData = {
        ...data,
        // Convert "none" back to null
        nama_habitat: data.nama_habitat === "none" ? null : data.nama_habitat
      };
      
      // Add id to the data
      const satwaData = {
        ...processedData,
        id: uuidv4(),
      };
      
      // Use satwaData instead of processedData to ensure the ID is included
      await createSatwa(satwaData);
      router.push('/protected/satwa');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tambah Satwa Baru</CardTitle>
          <CardDescription>Masukkan informasi satwa baru</CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Individu</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama individu (opsional)" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>Nama individu hewan (opsional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="spesies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spesies *</FormLabel>
                    <FormControl>
                      <Input placeholder="Spesies hewan" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="asal_hewan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asal Hewan *</FormLabel>
                    <FormControl>
                      <Input placeholder="Asal hewan" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tanggal_lahir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span className="text-muted-foreground">Pilih tanggal</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Tanggal lahir hewan (opsional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status_kesehatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Kesehatan *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status kesehatan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sehat">Sehat</SelectItem>
                          <SelectItem value="Sakit">Sakit</SelectItem>
                          <SelectItem value="Dalam Pemantauan">Dalam Pemantauan</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nama_habitat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habitat</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value === null ? "none" : field.value}
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih habitat (opsional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tidak ada</SelectItem>
                          {habitats.map((habitat) => (
                            <SelectItem key={habitat.nama} value={habitat.nama}>
                              {habitat.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="url_foto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Foto *</FormLabel>
                    <FormControl>
                      <Input placeholder="URL foto hewan" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="bg-[#229954] hover:bg-[#1e8449]"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
