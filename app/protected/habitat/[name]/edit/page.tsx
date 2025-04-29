"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getHabitatByName, updateHabitat } from '@/lib/api/habitat';
import { HabitatFormData } from '@/lib/types';
import { habitatSchema } from '@/lib/validation/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EditHabitatPage({ params }: { params: { name: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Decode URL parameter
  const habitatName = decodeURIComponent(params.name);
  
  const form = useForm<HabitatFormData>({
    resolver: zodResolver(habitatSchema),
    defaultValues: {
      nama: '',
      luas_area: 0,
      kapasitas: 0,
      status: '',
    }
  });
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch the habitat data
        const habitat = await getHabitatByName(habitatName);
        
        if (habitat) {
          // Reset form with habitat data
          form.reset({
            ...habitat,
          });
        }
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [habitatName, form]);
  
  async function onSubmit(data: HabitatFormData) {
    try {
      setSaveLoading(true);
      setError(null);
      
      await updateHabitat(habitatName, data);
      router.push('/protected/habitat');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan perubahan');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  }
  
  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Habitat</CardTitle>
          <CardDescription>Edit informasi habitat</CardDescription>
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
                disabled={saveLoading}
              >
                {saveLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
