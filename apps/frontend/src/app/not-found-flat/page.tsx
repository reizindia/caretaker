export default function NotFoundFlatPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">🏢</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Apartment Not Found</h1>
        <p className="text-gray-500 mb-6">
          The apartment you are looking for does not exist or has not been registered yet.
        </p>
        <p className="text-sm text-gray-400">
          Please check your web address or contact your apartment management.
        </p>
      </div>
    </div>
  );
}
