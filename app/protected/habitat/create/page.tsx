"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHabitat } from '@/lib/api/habitat';
import { HabitatFormData } from '@/lib/types';
import { habitatSchema } from '@/lib/validation/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateHabitatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<HabitatFormData>({
    resolver: zodResolver(habitatSchema),
    defaultValues: {
      nama: '',
      luas_area: 0,
      kapasitas: 0,
      status: 'Tersedia',
    }
  });
  
  async function onSubmit(data: HabitatFormData) {
    try {
      setLoading(true);
      setError(null);
      
      await createHabitat(data);
      router.push('/protected/habitat');
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
          <CardTitle className="text-2xl font-bold">Tambah Habitat Baru</CardTitle>
          <CardDescription>Masukkan informasi habitat baru</CardDescription>
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
                    <FormLabel>Nama Habitat *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama habitat" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="luas_area"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Luas Area (m²) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Luas area dalam meter persegi" 
                        required 
                        value={value.toString()}
                        onChange={(e) => onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        {...fieldProps}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="kapasitas"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Kapasitas Maksimal (ekor) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Kapasitas maksimal hewan" 
                        required 
                        value={value.toString()}
                        onChange={(e) => onChange(e.target.value === '' ? 0 : parseInt(e.target.value))}
                        {...fieldProps}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Lingkungan *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi status lingkungan habitat"
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Contoh: Tersedia, Penuh, Dalam Perbaikan, atau deskripsi lainnya
                    </FormDescription>
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
