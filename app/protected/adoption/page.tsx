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
  const role = userRoleInfo?.role;
  const roleSpecificData = userRoleInfo?.roleSpecificData;
  if (!role || !roleSpecificData) {
    // If role or role-specific data is not found, redirect to the sign in page
    redirect("/sign-in");
  }
  if (role !== "staff" && roleSpecificData?.peran !== "admin") {
    // If not a staff member, redirect to the homepage
    redirect("/protected");
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col items-center w-full gap-12 max-w-4xl mx-auto">
        <div className="w-full">
          <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} />
            This is a adoption-adopter main management page (admin view only)!
          </div>
        </div>
        <div className="w-full flex flex-col gap-4 items-center text-center">
          <h1 className="font-bold text-2xl mb-2">Adoption Management</h1>
          <p className="text-sm mb-2">Manage your adoptions here.</p>
        </div>
        <div className="flex flex-col gap-2 items-center w-full">
          <h2 className="font-bold text-2xl mb-4 text-center">
            Proceed to the adoption page
          </h2>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <RedirectButton
              href="/protected/adoption/adoption-management"
              variant="default"
              className="w-full"
            >
              Adoption Management
            </RedirectButton>
            <RedirectButton
              href="/protected/adoption/adopter-management"
              variant="secondary"
              className="w-full"
            >
              Adopter Management
            </RedirectButton>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center w-full">
          <h3 className="font-bold text-2xl mb-4 text-center">
            Back to Homepage
          </h3>
          <RedirectButton
            href="/protected"
            variant="destructive"
            className="w-full max-w-xs flex items-center gap-2 justify-center"
          >
            <HomeIcon size={16} />
            Homepage
          </RedirectButton>
        </div>
      </div>
    </div>
  );
}
