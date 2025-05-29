"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlignRight,
  LogOut,
  Settings,
  User as UserIcon,
  Home,
  PawPrint,
  HeartHandshake,
  Clipboard,
  Building2,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "../theme-switcher";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function NavBar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Get user data from context
  const { user, userData, signOut, loading } = useUser();
  
  // Determine user roles based on userData
  const userRole = {
    isDokterHewan: userData?.role === 'dokter_hewan',
    isPenjagaHewan: userData?.roleData?.staff_type === 'penjaga',
    isStafAdmin: userData?.roleData?.staff_type === 'admin',
    isPelatihHewan: userData?.roleData?.staff_type === 'pelatih',
    isPengunjung: userData?.role === 'pengunjung',
    isAdopter: false, // Set appropriately if you add adopter role
  };
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Navigation links based on roles from userData
  const navLinks = user
    ? [
        { 
          href: "/protected", 
          label: "Dashboard",
          icon: <Home className="h-4 w-4 mr-2" /> 
        },
        ...(userRole.isDokterHewan
          ? [{ 
              href: "/protected/rekam-medis", 
              label: "Rekam Medis Hewan",
              icon: <Clipboard className="h-4 w-4 mr-2" />
            }]
          : []),
        ...(userRole.isPenjagaHewan
          ? [{ 
              href: "/protected/catatan-perawatan", 
              label: "Catatan Perawatan Hewan",
              icon: <PawPrint className="h-4 w-4 mr-2" />
            }]
          : []),
        ...(userRole.isStafAdmin
          ? [
              { 
                href: "/protected/kelola-pengunjung", 
                label: "Kelola Pengunjung",
                icon: <UserIcon className="h-4 w-4 mr-2" />
              },
              { 
                href: "/protected/adoption", 
                label: "Kelola Adopsi",
                icon: <HeartHandshake className="h-4 w-4 mr-2" />
              },
              { 
                href: "/protected/kelola-adopter", 
                label: "Kelola Adopter",
                icon: <Building2 className="h-4 w-4 mr-2" />
              },
            ]
          : []),
        ...(userRole.isPelatihHewan
          ? [{ 
              href: "/protected/jadwal-pertunjukan", 
              label: "Jadwal Pertunjukan",
              icon: <Calendar className="h-4 w-4 mr-2" />
            }]
          : []),
        ...(userRole.isPengunjung
          ? [{ 
              href: "/protected/informasi-zoo", 
              label: "Informasi Kebun Binatang",
              icon: <PawPrint className="h-4 w-4 mr-2" />
            }]
          : []),
        ...(userRole.isAdopter
          ? [{ 
              href: "/protected/hewan-adopsi", 
              label: "Hewan Adopsi",
              icon: <HeartHandshake className="h-4 w-4 mr-2" />
            }]
          : []),
      ]
    : [
        { 
          href: "/sign-in", 
          label: "Login",
          icon: <UserIcon className="h-4 w-4 mr-2" />
        },
        { 
          href: "/sign-up", 
          label: "Registrasi",
          icon: <UserIcon className="h-4 w-4 mr-2" />
        },
      ];

  // Get full user name from userData
  const getFullName = () => {
    if (!userData) return "User";
    const { nama_depan, nama_tengah, nama_belakang } = userData;
    return nama_tengah
      ? `${nama_depan} ${nama_tengah} ${nama_belakang}`
      : `${nama_depan} ${nama_belakang}`;
  };

  // Get user role display name
  const getRoleDisplay = () => {
    if (!userData?.role) return "User";
    
    if (userData.role === 'dokter_hewan') return 'Dokter Hewan';
    if (userData.role === 'pengunjung') return 'Pengunjung';
    
    if (userData.role === 'staff') {
      switch (userData.roleData?.staff_type) {
        case 'admin': return 'Staf Admin';
        case 'penjaga': return 'Penjaga Hewan';
        case 'pelatih': return 'Pelatih Hewan';
        default: return 'Staf';
      }
    }
    
    return userData.role;
  };

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background sticky top-0 z-30">
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/"} className="flex items-center">
            <PawPrint className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-xl">SIZOPI</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          
          {user && userData && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={getFullName()} />
                    <AvatarFallback>
                      {userData.nama_depan?.charAt(0).toUpperCase()}
                      {userData.nama_belakang?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{getFullName()}</span>
                    <span className="text-xs text-muted-foreground">
                      {getRoleDisplay()}
                    </span>
                  </div>
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
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut size={16} className="mr-2" /> Logout
                </DropdownMenuItem>
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
              {user && userData && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{getFullName()}</p>
                      <p className="text-xs text-muted-foreground">{userData.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="flex items-center">
                    {link.icon}
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}

              {user && userData && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/protected/profile" className="flex gap-2 items-center">
                      <Settings size={16} /> Pengaturan Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut size={16} className="mr-2" /> Logout
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}