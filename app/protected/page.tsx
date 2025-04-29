"use client";

import { useState } from 'react';
import { Activity, Users, Map } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProtectedPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-[#229954]" />
              Manajemen Data Satwa
            </CardTitle>
            <CardDescription>
              Kelola data satwa di taman safari
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Tambah, edit, dan hapus data satwa.
            </p>
            <Link href="/protected/satwa">
              <Button className="w-full bg-[#229954] hover:bg-[#1e8449]">
                Akses Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Map className="h-5 w-5 text-[#229954]" />
              Manajemen Habitat
            </CardTitle>
            <CardDescription>
              Kelola habitat satwa di taman safari
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Tambah, edit, dan hapus data habitat.
            </p>
            <Link href="/protected/habitat">
              <Button className="w-full bg-[#229954] hover:bg-[#1e8449]">
                Akses Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#229954]" />
              Pemantauan Kesehatan
            </CardTitle>
            <CardDescription>
              Rekam medis dan status kesehatan satwa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Lihat informasi kesehatan satwa.
            </p>
            <Button className="w-full" variant="outline">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}