'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdoptionManagementService } from '@/services/adoption/adoption-management/services';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AlertCircle, CalendarIcon, ChevronLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Adoption from '@/services/adoption/adoption-management/types';

// Define form schema with zod
const formSchema = z.object({
  kontribusi_finansial: z.coerce.number().min(0, {
    message: 'Contribution must be a positive number.',
  }),
  tgl_mulai_adopsi: z.date({
    required_error: 'Please select a start date.',
  }),
  tgl_berhenti_adopsi: z.date({
    required_error: 'Please select an end date.',
  }),
  status_pembayaran: z.enum(['Tertunda', 'Lunas', 'Dibatalkan', 'Gagal'], {
    required_error: 'Please select a payment status.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function UpdateAdoptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [adoption, setAdoption] = useState<Adoption | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();
  const adoptionService = new AdoptionManagementService();

  // Initialize form with empty values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kontribusi_finansial: 0,
      tgl_mulai_adopsi: new Date(),
      tgl_berhenti_adopsi: new Date(),
      status_pembayaran: 'Tertunda',
    }
  });

  useEffect(() => {
    async function fetchAdoption() {
      if (!id) {
        setError('No adoption ID provided');
        setLoadingData(false);
        return;
      }

      try {
        // Parse the composite ID from URL
        const [adopterId, animalId] = id.split('-');
        
        if (!adopterId || !animalId) {
          setError('Invalid adoption ID format');
          setLoadingData(false);
          return;
        }
        
        // Fetch adoption
        const adoptionData = await adoptionService.getAdoption(adopterId, animalId);
        
        if (!adoptionData) {
          setError('Adoption not found');
          setLoadingData(false);
          return;
        }
        
        setAdoption(adoptionData);
        
        // Set form values
        form.reset({
          kontribusi_finansial: adoptionData.kontribusi_finansial,
          tgl_mulai_adopsi: new Date(adoptionData.tgl_mulai_adopsi),
          tgl_berhenti_adopsi: new Date(adoptionData.tgl_berhenti_adopsi),
          status_pembayaran: adoptionData.status_pembayaran as any,
        });
      } catch (err: any) {
        console.error('Error fetching adoption:', err);
        setError(err.message || 'Failed to load adoption');
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchAdoption();
  }, [id, form]);

  async function onSubmit(data: FormValues) {
    if (!adoption) return;
    
    setLoading(true);
    try {
      // Update adoption
      await adoptionService.updateAdoption(
        adoption.id_adopter,
        adoption.id_hewan,
        {
          kontribusi_finansial: data.kontribusi_finansial,
          tgl_mulai_adopsi: data.tgl_mulai_adopsi,
          tgl_berhenti_adopsi: data.tgl_berhenti_adopsi,
          status_pembayaran: data.status_pembayaran
        }
      );
      
      // Redirect back to adoption listing
      router.push('/protected/adoption/adoption-management');
      router.refresh(); // Force refresh to show updated data
    } catch (err: any) {
      console.error('Error updating adoption:', err);
      setError(err.message || 'Failed to update adoption');
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading adoption details...</p>
      </div>
    </div>
  );

  if (!adoption && !loadingData) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Adoption not found'}</AlertDescription>
        </Alert>
        
        <div className="mt-6">
          <Button onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Update Adoption</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Adoption Details</CardTitle>
          <CardDescription>
            Update the adoption details for {adoption?.animal_name} and {adoption?.adopter_name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Animal</Label>
              <div className="mt-1 flex items-center space-x-2">
                {adoption?.animal_photo && (
                  <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      src={adoption.animal_photo} 
                      alt={adoption.animal_name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium">{adoption?.animal_name}</p>
                  <p className="text-xs text-muted-foreground">{adoption?.animal_species}</p>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Adopter</Label>
              <div className="mt-1">
                <p className="font-medium">{adoption?.adopter_name}</p>
                <p className="text-xs text-muted-foreground">ID: {adoption?.id_adopter}</p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="kontribusi_finansial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Financial Contribution (Rp)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Update the amount the adopter will contribute.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status_pembayaran"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Tertunda">Tertunda (Pending)</SelectItem>
                          <SelectItem value="Lunas">Lunas (Paid)</SelectItem>
                          <SelectItem value="Dibatalkan">Dibatalkan (Cancelled)</SelectItem>
                          <SelectItem value="Gagal">Gagal (Failed)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Update the current payment status.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tgl_mulai_adopsi"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tgl_berhenti_adopsi"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Adoption
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}