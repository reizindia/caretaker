export default function InactiveFlatPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Inactive</h1>
        <p className="text-gray-500 mb-6">
          This apartment account is currently inactive. Please contact the system administrator.
        </p>
      </div>
    </div>
  );
}
