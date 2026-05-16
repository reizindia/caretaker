export default function DocumentationPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Caretaker SaaS — Project Documentation</h1>
        <p className="text-gray-500 mt-2">Complete feature reference, system modules, and project details</p>
      </div>

      {/* Project Info */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Project Overview</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">Project Name:</span> Caretaker SaaS</div>
          <div><span className="font-medium">Type:</span> SaaS-based Apartment Management Web App</div>
          <div><span className="font-medium">Development Cost:</span> <span className="text-green-700 font-bold">₹70,000</span></div>
          <div><span className="font-medium">Maintenance:</span> ₹7,000 per 3 months (10% of build cost)</div>
          <div><span className="font-medium">App Type:</span> Fully web-based PWA with Add to Home Screen support</div>
          <div><span className="font-medium">Platform:</span> SaaS (Software as a Service)</div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Maintenance Terms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-green-700 mb-2">✅ Maintenance Includes</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {['Bug fixes', 'Small updates', 'Server monitoring support', 'Basic technical support', 'Minor improvements', 'Application maintenance', 'Database backup support', 'Basic security updates', 'Performance monitoring'].map((item) => (
                <li key={item} className="flex items-center gap-2"><span className="text-green-500">•</span>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-red-700 mb-2">❌ Maintenance Does NOT Include</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {['Major new features', 'New modules', 'Payment gateway integration', 'Advanced analytics', 'Mobile APK development', 'Custom third-party integrations', 'Large design changes', 'Multiple language support', 'Heavy server cost increase', 'SMS/WhatsApp API charges', 'Paid cloud service charges', 'Play Store or App Store publishing'].map((item) => (
                <li key={item} className="flex items-center gap-2"><span className="text-red-500">•</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* User Roles */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">User Roles & Access</h2>
        <div className="space-y-4">
          {[
            { role: 'SUPER_ADMIN', color: 'bg-purple-100 text-purple-800', description: 'Full platform access. Can manage all flats, users, grocery, food, services, gate passes, and reports across all apartments.' },
            { role: 'FLAT_ASSOCIATION', color: 'bg-blue-100 text-blue-800', description: 'Manages their own flat only. Can view/manage grocery orders, food orders, service bookings, gate passes, residents, and reports for their flat.' },
            { role: 'SECURITY', color: 'bg-orange-100 text-orange-800', description: 'Gate pass and visitor management for their assigned flat. Can approve/reject gate passes, mark visitor entry and exit.' },
            { role: 'RESIDENT', color: 'bg-green-100 text-green-800', description: 'End user. Can order groceries, order food from hotels, book services, request gate passes, and track all their orders and bookings.' },
          ].map((r) => (
            <div key={r.role} className="flex gap-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${r.color}`}>{r.role}</span>
              <p className="text-sm text-gray-700">{r.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Tenant System */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Multi-Tenant Subdomain System</h2>
        <div className="text-sm text-gray-700 space-y-3">
          <p>Each apartment is a <strong>tenant</strong> with its own subdomain. The system automatically detects the apartment from the URL.</p>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm space-y-1">
            <p><span className="text-blue-600">caretakerapp.com</span> → Main SaaS domain / Super Admin</p>
            <p><span className="text-blue-600">abc.caretakerapp.com</span> → ABC Apartment web app</p>
            <p><span className="text-blue-600">greenview.caretakerapp.com</span> → Green View Apartment web app</p>
          </div>
          <p><strong>Local development:</strong> Use <code>localhost:3000?tenant=abc</code> or <code>abc.localhost:3000</code></p>
          <p><strong>Tenant isolation:</strong> Every data table includes <code>flatId</code>. Backend enforces that users can only access data belonging to their flat. Super Admin can access all flats.</p>
        </div>
      </div>

      {/* Demo Flats */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Demo Flats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'ABC Apartment', slug: 'abc', address: 'Kochi, Kerala', contact: 'ABC Manager', phone: '9999999991', theme: '#3B82F6' },
            { name: 'Green View Apartment', slug: 'greenview', address: 'Trivandrum, Kerala', contact: 'Green View Manager', phone: '9999999992', theme: '#10B981' },
          ].map((flat) => (
            <div key={flat.slug} className="border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: flat.theme }}>{flat.name[0]}</div>
                <h3 className="font-bold">{flat.name}</h3>
              </div>
              <div className="text-sm space-y-1 text-gray-600">
                <p><span className="font-medium">URL:</span> {flat.slug}.caretakerapp.com</p>
                <p><span className="font-medium">Address:</span> {flat.address}</p>
                <p><span className="font-medium">Contact:</span> {flat.contact}</p>
                <p><span className="font-medium">Phone:</span> {flat.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Demo Login Credentials</h2>
        <p className="text-sm text-gray-500 mb-3">All accounts use password: <code className="bg-gray-100 px-2 py-0.5 rounded">password123</code></p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Role</th><th className="px-3 py-2 text-left">Email</th><th className="px-3 py-2 text-left">Flat</th></tr></thead>
            <tbody className="divide-y">
              {[
                { role: 'Super Admin', email: 'admin@caretaker.com', flat: 'All Flats' },
                { role: 'Resident', email: 'resident@abc.com', flat: 'ABC Apartment' },
                { role: 'Security', email: 'security@abc.com', flat: 'ABC Apartment' },
                { role: 'Association', email: 'association@abc.com', flat: 'ABC Apartment' },
                { role: 'Resident', email: 'resident@greenview.com', flat: 'Green View' },
                { role: 'Security', email: 'security@greenview.com', flat: 'Green View' },
                { role: 'Association', email: 'association@greenview.com', flat: 'Green View' },
              ].map((cred, i) => (
                <tr key={i} className="hover:bg-gray-50"><td className="px-3 py-2 font-medium">{cred.role}</td><td className="px-3 py-2 font-mono text-blue-600">{cred.email}</td><td className="px-3 py-2 text-gray-500">{cred.flat}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Features */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Complete Feature List</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Resident Web App', items: ['Browse grocery items directly', 'Add to cart and place orders', 'Request unavailable grocery items', 'Browse hotels and view menus', 'Place food orders from hotels', 'Book apartment services', 'Select available time slots', 'Request visitor gate passes', 'Track all orders and bookings', 'PWA — Add to Home Screen'] },
            { title: 'Security Web App', items: ['View pending gate pass requests', 'Approve or reject gate passes', 'Mark visitor entry', 'Mark visitor exit', 'View visitor history', 'Search visitors by name/phone', 'Filter by date and status'] },
            { title: 'Flat Association Portal', items: ['View all residents', 'Manage grocery orders', 'Manage food orders', 'View service bookings', 'Manage gate pass requests', 'View reports and summaries', 'Coordinate with security'] },
            { title: 'Super Admin Portal', items: ['Create and manage flats', 'Manage all users and roles', 'Manage grocery items and orders', 'Manage hotels and food items', 'Manage food orders', 'Manage services and time slots', 'Manage service bookings', 'Manage gate passes', 'View platform-wide reports', 'Access documentation'] },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Frontend', value: 'Next.js 14, React, TypeScript, Tailwind CSS' },
            { label: 'Backend', value: 'NestJS, Node.js, TypeScript' },
            { label: 'Database', value: 'PostgreSQL with Prisma ORM' },
            { label: 'Authentication', value: 'JWT with Role-Based Access Control' },
            { label: 'Storage', value: 'Cloudflare R2 / AWS S3 compatible' },
            { label: 'Hosting', value: 'VPS / Coolify compatible (Docker)' },
            { label: 'PWA', value: 'next-pwa, Web App Manifest, Service Worker' },
            { label: 'State', value: 'Zustand, React Query' },
          ].map((t) => (
            <div key={t.label} className="border rounded-lg p-3">
              <p className="font-medium text-gray-900">{t.label}</p>
              <p className="text-gray-500 text-xs mt-1">{t.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-gray-400 pb-8">
        Caretaker SaaS — Built by Reizindia Tech Solutions
      </div>
    </div>
  );
}
