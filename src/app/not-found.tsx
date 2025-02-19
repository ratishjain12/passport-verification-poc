import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <div className="mt-4">
          <h2 className="text-3xl font-semibold text-gray-800 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            {"The page you're looking for doesn't exist or has been moved."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
