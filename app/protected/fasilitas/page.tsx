'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Ticket, Users, Calendar, ChevronRight } from "lucide-react";

export default function FasilitasPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Manajemen Fasilitas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Atraksi Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Manajemen Atraksi</CardTitle>
            <CardDescription>
              Mengelola data atraksi, pertunjukan, dan penugasan pelatih
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Jadwal Pertunjukan</p>
                  <p className="text-sm text-muted-foreground">Mengatur jadwal pertunjukan hewan</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Penugasan Pelatih</p>
                  <p className="text-sm text-muted-foreground">Rotasi pelatih setiap tiga bulan</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/protected/fasilitas/atraksi">
                Kelola Atraksi <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Wahana Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Manajemen Wahana</CardTitle>
            <CardDescription>
              Mengelola data wahana dan fasilitas pengunjung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Lokasi dan Kapasitas</p>
                  <p className="text-sm text-muted-foreground">Informasi lokasi dan kapasitas wahana</p>
                </div>
              </div>
              <div className="flex items-start">
                <Ticket className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Peraturan Wahana</p>
                  <p className="text-sm text-muted-foreground">Menetapkan peraturan wahana</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/protected/fasilitas/wahana">
                Kelola Wahana <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}