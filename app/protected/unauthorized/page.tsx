import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You do not have permission to access this resource.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <p className="text-center text-gray-700">
            This area is restricted to authorized personnel only. If you believe 
            you should have access, please contact a system administrator.
          </p>
          
          <div className="flex flex-col space-y-3">
            <Link href="/protected" passHref>
              <Button variant="default" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
            
            <Link href="/" passHref>
              <Button variant="outline" className="w-full">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}