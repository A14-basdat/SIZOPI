"use client";

import { NavBar } from "@/components/navbar";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { redirect, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState({
    isDokterHewan: false,
    isPenjagaHewan: false,
    isStafAdmin: false,
    isPelatihHewan: false,
    isPengunjung: false,
    isAdopter: false,
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getSession() {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (!session) {
          return redirect("/sign-in");
        }

        setUser(session.user);

        // Fetch user roles from your database
        const { data: roleData, error: roleError } = await supabase
          .schema("sizopi")
          .from("user_roles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (roleError && roleError.code !== 'PGRST116') { // "PGRST116" means no data found
          console.error("Error fetching user roles:", roleError);
        }

        if (roleData) {
          setUserRole({
            isDokterHewan: roleData.is_dokter_hewan || false,
            isPenjagaHewan: roleData.is_penjaga_hewan || false,
            isStafAdmin: roleData.is_staf_admin || false,
            isPelatihHewan: roleData.is_pelatih_hewan || false,
            isPengunjung: roleData.is_pengunjung || false,
            isAdopter: roleData.is_adopter || false,
          });
        } else {
          // Default role if no specific roles found
          setUserRole(prev => ({
            ...prev,
            isPengunjung: true,
          }));
        }
      } catch (error) {
        console.error("Error in auth check:", error);
      } finally {
        setLoading(false);
      }
    }

    getSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/sign-in');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <NavBar user={user} userRole={userRole} />
      
      <div className="flex-1 pt-16">
        {children}
      </div>
      
      <footer className="w-full border-t border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 SIZOPI - Sistem Informasi Zoologi Pertanian Indonesia
          </p>
        </div>
      </footer>
    </main>
  );
}