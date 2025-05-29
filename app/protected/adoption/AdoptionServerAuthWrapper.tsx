import { getCurrentSession, getUserRoleInfo, UserRole } from "@/app/actions";
import { NavBar } from "@/components/navbar";
import { Loader2 } from "lucide-react";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";


// Define the auth check function
async function checkServerAuth() {
  // Check if the user is authenticated
  const session = await getCurrentSession();
  if (!session) {
    // If not authenticated, redirect to the sign-in page
    redirect("/sign-in");
    return null;
  }
  
  // Check if the user is a staff member
  const userRoleInfo = await getUserRoleInfo(session.username);
  const role = userRoleInfo!.role;
  const roleSpecificData = userRoleInfo!.roleSpecificData;
  // If the user is not a staff member (or admin) AND is not an adopter, redirect to homepage
  if (role !== "staff" && roleSpecificData?.peran !== "admin" && role !== "adopter") {
    // User is neither staff/admin nor adopter, redirect to homepage
    redirect("/protected");
    return null;
  }

  return { session, userRoleInfo };
}

let exportedRole: UserRole;

// This component wrapper will handle the auth check
export function AdoptionServerAuthWrapper({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const checker = pathname.startsWith("/protected/adoption") && pathname === "/protected/adoption/adoption-management";

  useEffect(() => {
    const runAuthCheck = async () => {
      try {
        const redirectAdopter = await checkServerAuth();
        const role = redirectAdopter?.userRoleInfo?.role;
        if (redirectAdopter === null || role === undefined || (role !== "staff" && !checker)) {
          // If the user is not a staff member or admin, redirect to homepage
          redirect("/protected");
          return;
        }
        exportedRole = role;
        setAuthChecked(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    runAuthCheck();
  }, []);

  if (isLoading) {
    return (
      <>
        <NavBar user={null} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Authenticating...</p>
          </div>
        </div>
      </>
    );
  }

  return authChecked ? children : null;
}

export { exportedRole }; // Export the role for use in other components