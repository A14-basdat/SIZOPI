import { createClient } from "@/utils/supabase/server";
import { getCurrentSession, getUserRoleInfo } from "@/app/actions";
import { redirect } from "next/navigation";
import { InfoIcon } from "lucide-react";
import RedirectButton from "@/components/redirect-button";
import { HomeIcon } from "lucide-react";
import { get } from "http";


export default async function AdoptionPage() {
  const supabase = await createClient();

  // Check if the user is authenticated
  const session = await getCurrentSession();
  if (!session) {
    // If not authenticated, redirect to the sign-in page
    redirect("/sign-in");
  }

  // Check if the user is a staff member
  const userRoleInfo = await getUserRoleInfo(session.username);
  if (!userRoleInfo) {
    redirect("/protected");
  }
  
  const role = userRoleInfo.role;
  const roleSpecificData = userRoleInfo.roleSpecificData;
  if (role !== "staff" && roleSpecificData?.peran !== "admin") {
    // If not a staff member, redirect to the homepage
    redirect("/protected");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a adoption-adopter main management page (admin view only)!
        </div>
      </div>
      <div className="w-full">
        <h1 className="font-bold text-2xl mb-4">Adoption Management</h1>
        <p className="text-sm mb-4">Manage your adoptions here.</p>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Proceed to the adoption page</h2>
        <RedirectButton 
          href="/protected/adoption/adoption-management"
          variant="default" 
          size="icon" 
          className="w-full max-w-xs"
        >
          Adoption Management
        </RedirectButton>
        <div className="flex flex-col gap-2 items-start mt-2"></div>
        <RedirectButton
          href="/protected/adoption/adopter-management"
          variant="secondary"
          size="icon"
          className="w-full max-w-xs"
        >
          Adopter Management
        </RedirectButton>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h3 className="font-bold text-2xl mb-4">Back to Homepage</h3>
        <RedirectButton
          href="/protected"
          variant="destructive"
          size="icon"
          className="w-full max-w-xs flex items-center gap-2"
        >
          <HomeIcon size={16} />
          Homepage
        </RedirectButton>
      </div>
    </div>
  );
}