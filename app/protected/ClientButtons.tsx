'use client';

import { signOutAction } from "@/app/actions";

export default function ClientButtons() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex justify-center space-x-4 mt-8">
      <button
        onClick={handleRefresh}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Refresh Data
      </button>
      
      <form action={signOutAction}>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}