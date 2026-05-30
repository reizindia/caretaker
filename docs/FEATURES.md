# Caretaker SaaS — Complete Feature Reference

## User Roles

### SUPER_ADMIN
Full platform access. Manages all flats, users, and content across the entire platform.

### FLAT_ASSOCIATION
Manages their own apartment only. Can manage all orders, services, gate passes, and residents within their flat.

### SECURITY
Gate pass and visitor management for their assigned flat.

### RESIDENT
End user. Can order groceries, food, book services, and request gate passes.

---

## Module-by-Module Feature List

### 1. Authentication & Access Control

- JWT-based login with email or phone number
- Role-based access control (RBAC)
- Multi-tenant isolation: users can only access their flat's data
- Super Admin bypass: can access all flats
- Automatic role-based redirect after login
- Token persistence via localStorage

### 2. Multi-Tenant System

- Each apartment gets a unique production subdomain
- Automatic tenant detection from URL
- Local dev fallback: `?tenant=slug` query parameter
- Per-tenant branding: logo, theme color, flat name
- Inactive tenant redirect page
- Unknown tenant redirect page

### 3. Resident Web App

#### Grocery Module
- Browse all available grocery items in a grid layout
- Search by item name
- Filter by category
- Add items to cart (persistent, survives page reload)
- View and update cart quantities
- Remove items from cart
- Place grocery order with delivery note
- Request unavailable grocery items (with description)
- View order history with status tracking
- Order statuses: PENDING → CONFIRMED → PROCESSING → COMPLETED / CANCELLED

#### Food & Hotels Module
- Browse hotels registered for their apartment
- View hotel details (name, cuisine, description)
- Browse full menu for each hotel
- Add food items to cart (per hotel — only one hotel's cart at a time)
- View food cart with quantities
- Place food orders with special instructions
- View food order history with status tracking

#### Services Module
- Browse all available apartment services (Electrician, Plumber, Painter, etc.)
- Select a service
- Pick a date from date picker
- View available time slots for selected date
- See slot capacity and remaining availability
- Book a time slot (overbooking prevented via DB transaction)
- View all service bookings with status

#### Gate Pass Module
- Request gate pass for visitors
- Enter visitor name, phone number, and expected arrival date/time
- Add purpose of visit and notes
- View all gate pass requests with status
- Track pass status: PENDING → APPROVED / REJECTED → ENTERED → EXITED

#### Orders History Page
- Tabbed view: Grocery Orders, Food Orders, Service Bookings, Gate Passes
- Complete history with status badges

#### Resident Dashboard
- Quick links to all modules
- Recent grocery order status
- Recent gate pass status

### 4. Security Dashboard

- View all pending gate pass requests
- Filter by status (PENDING, APPROVED, ENTERED, etc.)
- Approve gate passes (with optional note)
- Reject gate passes (with reason)
- Mark visitor as ENTERED (records entry timestamp)
- Mark visitor as EXITED (records exit timestamp)
- Visitor history: search by name or phone
- Filter history by date range and status

### 5. Flat Association Portal

#### Dashboard
- Summary counts: residents, open orders, pending bookings, pending gate passes
- Recent grocery orders
- Recent gate passes

#### Orders Management
- Tabbed: Grocery Orders, Food Orders
- Update order status (CONFIRMED → PROCESSING → COMPLETED)
- Cancel orders
- View order details with items and quantities

#### Services Management
- View all service bookings
- Update booking status (CONFIRMED → COMPLETED / CANCELLED)
- View booking details (resident, service, date, time slot)

#### Gate Passes
- Read-only view of all gate passes
- View resident, visitor details, status, timestamps

#### Residents Management
- View all residents in the flat
- See resident details (name, email, phone, flat number, status)

#### Reports
- Total residents count
- Grocery order statistics by status
- Food order statistics by status
- Service booking summary
- Gate pass summary

### 6. Super Admin Portal

#### Dashboard
- Platform-wide stats: total flats, total users, total orders, total gate passes
- Recent grocery orders across all flats
- Recent gate passes across all flats

#### Flat Management
- Create new flats (apartment onboarding)
- Edit flat details: name, slug, address, logo, theme color, contact
- Activate / deactivate flats
- Auto-generated subdomain: `slug.caretakerapp.com`
- View tenant URL per flat

#### User Management
- **Residents**: View/create/edit/delete residents per flat
- **Security Users**: Manage security staff per flat
- **Association Users**: Manage association managers per flat

#### Grocery Management
- Requires flat selection (dropdown shows all active flats)
- Create, edit, delete grocery items
- Set item price, category, image, availability
- View all grocery orders for selected flat
- Update order status
- Manage unavailable item requests (approve/reject)

#### Hotels & Food Management
- Create, edit, delete hotels per flat
- Add food items to each hotel (name, price, category, image)
- Edit and delete food items
- View all food orders across flats
- Update food order status

#### Services Management
- Create, edit, delete services per flat
- Manage time slots: create slots with date, start/end time, max capacity
- View and delete time slots
- View all service bookings
- Update booking status

#### Gate Passes
- Read-only view of all gate passes across all flats
- Filter by flat, status, date

#### Reports
- Platform-wide statistics
- Per-flat breakdown
- Order trends
- Gate pass summary

#### Settings
- Platform name and domain configuration (UI placeholder)

#### Documentation
- Complete project documentation (inline page)
- Roles and access matrix
- Multi-tenant system explanation
- Production setup and tenant onboarding notes
- Feature list
- Technology stack
- Development cost and maintenance terms

### 7. PWA (Progressive Web App)

- Fully installable on Android and iOS
- "Add to Home Screen" support
- Standalone display mode (no browser chrome)
- Offline-ready service worker (next-pwa)
- Web App Manifest with icons
- Apple Touch Icon support
- Theme color per tenant (via CSS variable)
- Portrait-primary orientation lock
- PWA install prompt for Android
- iOS manual install instructions

### 8. Storage

- Image upload for grocery items, food items, service photos, hotel logos
- Cloudflare R2 / AWS S3 compatible
- Public URL returned after upload

---

## Maintenance Terms

### ✅ Maintenance Includes (₹7,000 per 3 months)
- Bug fixes
- Small updates
- Server monitoring support
- Basic technical support
- Minor improvements
- Application maintenance
- Database backup support
- Basic security updates
- Performance monitoring

### ❌ Maintenance Does NOT Include
- Major new features or modules
- Payment gateway integration
- Advanced analytics or custom reporting
- Mobile APK (Android/iOS native app)
- Custom third-party integrations
- Large design changes or redesigns
- Multiple language support
- SMS/WhatsApp API charges
- Paid cloud service charges
- Play Store or App Store publishing

---

*Caretaker SaaS — Built by Reizindia Tech Solutions*
