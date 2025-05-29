import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link className="font-medium text-indigo-600 hover:text-indigo-500 underline" href="/sign-up">
              Sign up
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="identifier">Username or Email</Label>
              <Input 
                name="identifier" 
                placeholder="Enter your username or email" 
                required 
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  className="text-sm text-indigo-600 hover:text-indigo-500 underline"
                  href="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                className="mt-1"
              />
            </div>
          </div>
          
          {/* Display error/success messages from stored procedures */}
          {searchParams && (
            <div className="mt-4">
              <FormMessage message={searchParams} />
            </div>
          )}
          
          <div>
            <SubmitButton 
              pendingText="Signing In..." 
              formAction={signInAction}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
