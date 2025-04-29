"use client";

import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import { AlignRight, LogOut, Settings, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "./theme-switcher";
import { useState, useEffect } from "react";

type NavbarProps = {
  user: User | null;
  userRole?: {
    isDokterHewan?: boolean;
    isPenjagaHewan?: boolean;
    isStafAdmin?: boolean;
    isPelatihHewan?: boolean;
    isPengunjung?: boolean;
    isAdopter?: boolean;
  };
};

export function NavBar({ user, userRole }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Navigation links based on roles
  const navLinks = user
    ? [
        { href: "/protected", label: "Dashboard" },
        ...(userRole?.isDokterHewan
          ? [{ href: "/protected/rekam-medis", label: "Rekam Medis Hewan" }]
          : []),
        ...(userRole?.isPenjagaHewan
          ? [{ href: "/protected/catatan-perawatan", label: "Catatan Perawatan Hewan" }]
          : []),
        ...(userRole?.isStafAdmin
          ? [
              { href: "/protected/kelola-pengunjung", label: "Kelola Pengunjung" },
              { href: "/protected/kelola-adopsi", label: "Kelola Adopsi" },
              { href: "/protected/kelola-adopter", label: "Kelola Adopter" },
            ]
          : []),
        ...(userRole?.isPelatihHewan
          ? [{ href: "/protected/jadwal-pertunjukan", label: "Jadwal Pertunjukan" }]
          : []),
        ...(userRole?.isPengunjung
          ? [{ href: "/protected/informasi-zoo", label: "Informasi Kebun Binatang" }]
          : []),
        ...(userRole?.isAdopter
          ? [{ href: "/protected/hewan-adopsi", label: "Hewan Adopsi" }]
          : []),
      ]
    : [
        { href: "/sign-in", label: "Login" },
        { href: "/sign-up", label: "Registrasi" },
      ];

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/"}>SIZOPI</Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon size={16} />
                  <span className="hidden sm:inline">
                    {user.email?.split('@')[0] || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  Akun Saya
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/protected/profile" className="w-full flex gap-2 items-center">
                    <Settings size={16} /> Pengaturan Profil
                  </Link>
                </DropdownMenuItem>
                <form action={signOutAction}>
                  <DropdownMenuItem asChild>
                    <button className="w-full flex gap-2 items-center text-left">
                      <LogOut size={16} /> Logout
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ThemeSwitcher />
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeSwitcher />

          <DropdownMenu
            open={isMobileMenuOpen}
            onOpenChange={setIsMobileMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <AlignRight size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              {user && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}

              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/protected/profile" className="flex gap-2 items-center">
                      <Settings size={16} /> Pengaturan Profil
                    </Link>
                  </DropdownMenuItem>
                  <form action={signOutAction}>
                    <DropdownMenuItem asChild>
                      <button className="w-full flex gap-2 items-center text-left">
                        <LogOut size={16} /> Logout
                      </button>
                    </DropdownMenuItem>
                  </form>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
