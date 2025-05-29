import { redirect } from "next/navigation";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const encodedRedirect = (
  type: "error" | "success",
  path: string,
  message: string,
) => {
  // Clean the message and encode it properly
  const cleanMessage = message.trim();
  console.log('=== ENCODING REDIRECT ===');
  console.log('Type:', type);
  console.log('Path:', path);
  console.log('Original message:', cleanMessage);
  
  // Use encodeURIComponent for proper URL encoding
  const encodedMessage = encodeURIComponent(cleanMessage);
  console.log('Encoded message:', encodedMessage);
  
  const redirectUrl = `${path}?${type}=${encodedMessage}`;
  console.log('Final redirect URL:', redirectUrl);
  
  return redirect(redirectUrl);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}