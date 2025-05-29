export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  if (!message) return null;

  // Helper function to decode URL-encoded messages
  const decodeMessage = (msg: string) => {
    try {
      return decodeURIComponent(msg);
    } catch {
      return msg; // Return original if decoding fails
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full text-sm">
      {"success" in message && (
        <div className="text-foreground bg-green-50 border border-green-200 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-green-800 font-medium">Success!</p>
              <p className="text-green-700">{decodeMessage(message.success)}</p>
            </div>
          </div>
        </div>
      )}
      {"error" in message && (
        <div className="text-foreground bg-red-50 border border-red-200 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-800 font-medium">
                {message.error.includes('ERROR:') ? 'Database Error' : 'Error'}
              </p>
              <p className="text-red-700 whitespace-pre-wrap break-words">
                {decodeMessage(message.error)}
              </p>
            </div>
          </div>
        </div>
      )}
      {"message" in message && (
        <div className="text-foreground bg-blue-50 border border-blue-200 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-blue-800 font-medium">Information</p>
              <p className="text-blue-700">{decodeMessage(message.message)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
