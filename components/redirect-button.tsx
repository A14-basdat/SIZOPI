'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RedirectButtonProps {
  href: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

export default function RedirectButton({
  href,
  className = "",
  variant = "default",
  size = "default",
  children
}: RedirectButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => router.push(href)}
    >
      {children}
    </Button>
  );
}