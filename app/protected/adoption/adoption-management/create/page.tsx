"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdoptionManagementService } from "@/services/adoption/adoption-management/services";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, CalendarIcon, ChevronLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdoptionServerAuthWrapper } from "../../AdoptionServerAuthWrapper";
import * as z from "zod";

// Define form schema with zod
const formSchema = z.object({
  id_hewan: z.string().min(1, {
    message: "Please select an animal.",
  }),
  id_adopter: z.string().min(1, {
    message: "Please select an adopter.",
  }),
  kontribusi_finansial: z.coerce.number().min(0, {
    message: "Contribution must be a positive number.",
  }),
  tgl_mulai_adopsi: z.date({
    required_error: "Please select a start date.",
  }),
  tgl_berhenti_adopsi: z
    .date({
      required_error: "Please select an end date.",
    })
    .refine((date) => date > new Date(), {
      message: "End date must be in the future.",
    }),
  status_pembayaran: z.enum(["Tertunda", "Lunas", "Dibatalkan", "Gagal"], {
    required_error: "Please select a payment status.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type Animal = {
  id: string;
  nama: string;
  spesies: string;
  url_foto: string | null;
};

type Adopter = {
  id_adopter: string;
  username_adopter: string;
  jenis_adopter: "individu" | "organisasi";
  displayName: string; // Combined field for easy display
};

export default function CreateAdoptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [adopters, setAdopters] = useState<Adopter[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const adoptionService = new AdoptionManagementService();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_hewan: "",
      id_adopter: "",
      kontribusi_finansial: 0,
      tgl_mulai_adopsi: new Date(),
      tgl_berhenti_adopsi: new Date(
        new Date().setMonth(new Date().getMonth() + 6)
      ), // Default to 6 months
      status_pembayaran: "Tertunda",
    },
  });

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      try {
        // Fetch available animals that are not currently being adopted
        const { data: adoptedAnimalIds, error: adoptedError } = await supabase
          .schema("sizopi")
          .from("adopsi")
          .select("id_hewan");

        if (adoptedError) throw adoptedError;

        // Get all animals and filter out those that are already adopted
        const { data: animalsData, error: animalsError } = await supabase
          .schema("sizopi")
          .from("hewan")
          .select("id, nama, spesies, url_foto");

        if (animalsError) throw animalsError;

        // Filter out animals that are already adopted
        const adoptedIds = (adoptedAnimalIds || []).map(
          (item) => item.id_hewan
        );
        const availableAnimals = (animalsData || []).filter(
          (animal) => !adoptedIds.includes(animal.id)
        );

        setAnimals(availableAnimals);

        if (animalsError) throw animalsError;
        setAnimals(animalsData || []);

        // Fetch available adopters
        const { data: adoptersData, error: adoptersError } = await supabase
          .schema("sizopi")
          .from("adopter")
          .select("id_adopter, username_adopter");

        if (adoptersError) throw adoptersError;

        // Enhance adopter data with names
        const enhancedAdopters = await Promise.all(
          (adoptersData || []).map(async (adopter) => {
            // Try to get individual data
            const { data: individuData } = await supabase
              .schema("sizopi")
              .from("individu")
              .select("nama")
              .eq("id_adopter", adopter.id_adopter)
              .single();

            if (individuData) {
              return {
                ...adopter,
                jenis_adopter: "individu" as const,
                displayName: individuData.nama,
              };
            }

            // Try to get organization data
            const { data: orgData } = await supabase
              .schema("sizopi")
              .from("organisasi")
              .select("nama_organisasi")
              .eq("id_adopter", adopter.id_adopter)
              .single();

            if (orgData) {
              return {
                ...adopter,
                jenis_adopter: "organisasi" as const,
                displayName: orgData.nama_organisasi,
              };
            }

            // Fallback if no additional data found
            return {
              ...adopter,
              jenis_adopter: "individu" as const,
              displayName: adopter.username_adopter,
            };
          })
        );

        setAdopters(enhancedAdopters);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, []);

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      // Create adoption
      await adoptionService.createAdoption({
        id_hewan: data.id_hewan,
        id_adopter: data.id_adopter,
        kontribusi_finansial: data.kontribusi_finansial,
        tgl_mulai_adopsi: format(data.tgl_mulai_adopsi, "yyyy-MM-dd"),
        tgl_berhenti_adopsi: format(data.tgl_berhenti_adopsi, "yyyy-MM-dd"),
        status_pembayaran: data.status_pembayaran,
      });

      // Redirect back to adoption listing
      router.push("/protected/adoption/adoption-management");
      router.refresh(); // Force refresh to show new data
    } catch (err: any) {
      console.error("Error creating adoption:", err);
      setError(err.message || "Failed to create adoption");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData)
    return (
      <AdoptionServerAuthWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </div>
      </AdoptionServerAuthWrapper>
    );

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Adoption</h1>
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
            Create a new adoption by filling out the form below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="id_hewan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Animal</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an animal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {animals.length === 0 ? (
                            <SelectItem value="no-animals" disabled>
                              No animals available for adoption
                            </SelectItem>
                          ) : (
                            animals.map((animal) => (
                              <SelectItem key={animal.id} value={animal.id}>
                                {animal.nama} ({animal.spesies})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the animal that will be adopted.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="id_adopter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adopter</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an adopter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {adopters.length === 0 ? (
                            <SelectItem value="no-adopters" disabled>
                              No registered adopters available
                            </SelectItem>
                          ) : (
                            adopters.map((adopter) => (
                              <SelectItem
                                key={adopter.id_adopter}
                                value={adopter.id_adopter}
                              >
                                {adopter.displayName} (
                                {adopter.jenis_adopter === "individu"
                                  ? "Individual"
                                  : "Organization"}
                                )
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the person or organization that will adopt the
                        animal.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kontribusi_finansial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Financial Contribution (Rp)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the amount the adopter will contribute.
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
                          <SelectItem value="Tertunda">
                            Tertunda (Pending)
                          </SelectItem>
                          <SelectItem value="Lunas">Lunas (Paid)</SelectItem>
                          <SelectItem value="Dibatalkan">
                            Dibatalkan (Cancelled)
                          </SelectItem>
                          <SelectItem value="Gagal">Gagal (Failed)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the current payment status.
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
                      <FormDescription>
                        When will the adoption begin?
                      </FormDescription>
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
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When will the adoption period end?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Adoption
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
