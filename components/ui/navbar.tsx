import { signOutAction, getCurrentSession, getUserProfile } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export default async function Navbar() {
  // Get current session and user profile
  const session = await getCurrentSession();
  const userProfile = session ? await getUserProfile(session.username) : null;

  if (!session || !userProfile) {
    return null; // Don't show navbar if not logged in
  }

  const getDisplayName = () => {
    const { nama_depan, nama_tengah, nama_belakang } = userProfile;
    return nama_tengah 
      ? `${nama_depan} ${nama_tengah} ${nama_belakang}`
      : `${nama_depan} ${nama_belakang}`;
  };

  const getRoleBadgeColor = (role: string) => {
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

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'pengunjung':
        return 'Visitor';
      case 'dokter_hewan':
        return 'Veterinarian';
      case 'staff':
        return 'Staff';
      default:
        return role;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-green-600">SIZOPI</h1>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-4">
            {/* User Profile Info */}
            <div className="flex items-center space-x-3">
              {/* User Avatar */}
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                {userProfile.nama_depan.charAt(0).toUpperCase()}
              </div>
              
              {/* User Details */}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {getDisplayName()}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">@{session.username}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(session.role)}`}>
                    {getRoleDisplayName(session.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <form action={signOutAction}>
              <SubmitButton
                pendingText="Signing out..."
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}