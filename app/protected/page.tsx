import { getCurrentSession, getUserProfile } from "@/app/actions";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions";
import ClientButtons from "./ClientButtons";

// Component for displaying user profile information
const UserProfileCard = ({ userProfile, role }: { userProfile: any, role: string }) => {
  const getDisplayName = () => {
    if (userProfile.nama_tengah) {
      return `${userProfile.nama_depan} ${userProfile.nama_tengah} ${userProfile.nama_belakang}`;
    }
    return `${userProfile.nama_depan} ${userProfile.nama_belakang}`;
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'pengunjung':
        return 'bg-blue-100 text-blue-800';
      case 'dokter_hewan':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

 const getRoleDisplayName = () => {
  switch (role) {
    case 'pengunjung':
      return 'Pengunjung';
    case 'dokter_hewan':
      return 'Dokter Hewan';
    case 'staff':
      return `Staff ${userProfile.roleSpecificData?.peran || ''}`;
    default:
      return 'User';
  }
};


  return (
    <div className="bg-white shadow-lg rounded-xl p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getDisplayName()}</h1>
          <p className="text-gray-600">@{userProfile.username}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getRoleBadgeColor()}`}>
          {getRoleDisplayName()}
        </span>
      </div>

      {/* Basic Information */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{userProfile.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">No. Telepon</label>
            <p className="text-gray-900">{userProfile.no_telepon}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Username</label>
            <p className="text-gray-900">{userProfile.username}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <p className="text-gray-900">{getRoleDisplayName()}</p>
          </div>
        </div>
      </div>

      {/* Role-Specific Information */}
      {userProfile.roleSpecificData && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informasi {getRoleDisplayName()}
          </h3>
          
          {role === 'pengunjung' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Alamat</label>
                <p className="text-gray-900">{userProfile.roleSpecificData.alamat}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal Lahir</label>
                <p className="text-gray-900">
                  {new Date(userProfile.roleSpecificData.tgl_lahir).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          )}

          {role === 'dokter_hewan' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">No. STR</label>
                <p className="text-gray-900">{userProfile.roleSpecificData.no_str}</p>
              </div>
              {userProfile.roleSpecificData.spesialisasi && 
               userProfile.roleSpecificData.spesialisasi.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Spesialisasi</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {userProfile.roleSpecificData.spesialisasi.map((spec: string, index: number) => (
                      <span 
                        key={index}
                        className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {role === 'staff' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID Staff</label>
                <p className="text-gray-900 font-mono">{userProfile.roleSpecificData.id_staf}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Peran</label>
                <p className="text-gray-900 capitalize">{userProfile.roleSpecificData.peran}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Protected Page Component (Server Component)
export default async function ProtectedPage() {
  // Get current session
  const session = await getCurrentSession();
  
  // Redirect to sign-in if no session
  if (!session) {
    redirect("/sign-in");
  }

  // Get fresh user profile data
  const userProfile = await getUserProfile(session.username);
  
  if (!userProfile) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Selamat Datang, {userProfile.nama_depan}!
          </h1>
          <p className="text-gray-600">
            Dashboard profil pengguna SiZoPi
          </p>
        </div>

        {/* User Profile Card */}
        <UserProfileCard userProfile={userProfile} role={session.role} />

        {/* Action Buttons - Now a Client Component */}
        <ClientButtons />

        {/* Debug Information (remove in production) */}
        <details className="mt-8 bg-gray-100 rounded-lg p-4">
          <summary className="cursor-pointer text-gray-700 font-medium">
            Debug Information (Development Only)
          </summary>
          <pre className="mt-4 text-xs bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
            {JSON.stringify({
              session: {
                username: session.username,
                role: session.role,
                hasUserData: !!session.userData
              },
              userProfile: {
                ...userProfile,
                password: '[HIDDEN]' // Hide password in debug
              }
            }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}