import { PrismaClient, Role, FlatStatus, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const password = await bcrypt.hash('password123', 10);

  // ─── Flats ────────────────────────────────────────────────────────────────

  const abcFlat = await prisma.flat.upsert({
    where: { slug: 'abc' },
    update: {},
    create: {
      name: 'ABC Apartment',
      slug: 'abc',
      subdomain: 'abc.caretakerapp.com',
      address: 'Kochi, Kerala',
      contactPerson: 'ABC Manager',
      contactPhone: '9999999991',
      themeColor: '#3B82F6',
      status: FlatStatus.ACTIVE,
    },
  });

  const greenFlat = await prisma.flat.upsert({
    where: { slug: 'greenview' },
    update: {},
    create: {
      name: 'Green View Apartment',
      slug: 'greenview',
      subdomain: 'greenview.caretakerapp.com',
      address: 'Trivandrum, Kerala',
      contactPerson: 'Green View Manager',
      contactPhone: '9999999992',
      themeColor: '#10B981',
      status: FlatStatus.ACTIVE,
    },
  });

  console.log('✅ Flats created');

  // ─── Super Admin ──────────────────────────────────────────────────────────

  await prisma.user.upsert({
    where: { email: 'admin@caretaker.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@caretaker.com',
      phone: '9000000000',
      passwordHash: password,
      role: Role.SUPER_ADMIN,
      flatId: null,
      isActive: true,
    },
  });

  // ─── ABC Apartment Users ──────────────────────────────────────────────────

  await prisma.user.upsert({
    where: { email: 'resident@abc.com' },
    update: {},
    create: {
      name: 'ABC Resident',
      email: 'resident@abc.com',
      phone: '9000000001',
      passwordHash: password,
      role: Role.RESIDENT,
      flatId: abcFlat.id,
      flatNumber: 'A-101',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'security@abc.com' },
    update: {},
    create: {
      name: 'ABC Security',
      email: 'security@abc.com',
      phone: '9000000002',
      passwordHash: password,
      role: Role.SECURITY,
      flatId: abcFlat.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'association@abc.com' },
    update: {},
    create: {
      name: 'ABC Association',
      email: 'association@abc.com',
      phone: '9000000003',
      passwordHash: password,
      role: Role.FLAT_ASSOCIATION,
      flatId: abcFlat.id,
      isActive: true,
    },
  });

  // ─── Green View Users ─────────────────────────────────────────────────────

  await prisma.user.upsert({
    where: { email: 'resident@greenview.com' },
    update: {},
    create: {
      name: 'Green View Resident',
      email: 'resident@greenview.com',
      phone: '9000000011',
      passwordHash: password,
      role: Role.RESIDENT,
      flatId: greenFlat.id,
      flatNumber: 'G-101',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'security@greenview.com' },
    update: {},
    create: {
      name: 'Green View Security',
      email: 'security@greenview.com',
      phone: '9000000012',
      passwordHash: password,
      role: Role.SECURITY,
      flatId: greenFlat.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'association@greenview.com' },
    update: {},
    create: {
      name: 'Green View Association',
      email: 'association@greenview.com',
      phone: '9000000013',
      passwordHash: password,
      role: Role.FLAT_ASSOCIATION,
      flatId: greenFlat.id,
      isActive: true,
    },
  });

  console.log('✅ Users created');

  // ─── Grocery Items ────────────────────────────────────────────────────────

  const groceryItems = [
    { name: 'Milk', description: 'Fresh cow milk 1 litre', price: 60, category: 'Dairy' },
    { name: 'Bread', description: 'Whole wheat bread', price: 40, category: 'Bakery' },
    { name: 'Rice', description: 'Basmati rice 1 kg', price: 80, category: 'Grains' },
    { name: 'Sugar', description: 'Refined sugar 1 kg', price: 45, category: 'Pantry' },
    { name: 'Eggs', description: 'Farm fresh eggs (12 pcs)', price: 90, category: 'Protein' },
    { name: 'Vegetables', description: 'Mixed seasonal vegetables 500g', price: 50, category: 'Vegetables' },
    { name: 'Fruits', description: 'Mixed fresh fruits 500g', price: 120, category: 'Fruits' },
    { name: 'Snacks', description: 'Assorted snacks pack', price: 35, category: 'Snacks' },
  ];

  for (const flat of [abcFlat, greenFlat]) {
    for (const item of groceryItems) {
      await prisma.groceryItem.create({
        data: {
          flatId: flat.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          stockStatus: 'IN_STOCK',
          isActive: true,
        },
      });
    }
  }

  console.log('✅ Grocery items created');

  // ─── Hotels & Food Items ──────────────────────────────────────────────────

  const hotelsData = [
    {
      name: 'Hotel A',
      description: 'Best biryani and meals in town',
      phone: '9111111111',
      foods: [
        { name: 'Biriyani', description: 'Fragrant rice with spices', price: 120, category: 'Rice' },
        { name: 'Porotta', description: 'Kerala layered bread (2 pcs)', price: 30, category: 'Bread' },
        { name: 'Meals', description: 'Full Kerala meals plate', price: 90, category: 'Meals' },
        { name: 'Fried Rice', description: 'Veg fried rice', price: 80, category: 'Rice' },
      ],
    },
    {
      name: 'Hotel B',
      description: 'Authentic South Indian breakfast',
      phone: '9222222222',
      foods: [
        { name: 'Dosa', description: 'Crispy masala dosa', price: 50, category: 'Breakfast' },
        { name: 'Idli', description: 'Soft idli with sambar (3 pcs)', price: 40, category: 'Breakfast' },
        { name: 'Tea', description: 'Cutting chai', price: 15, category: 'Beverages' },
        { name: 'Snacks', description: 'Evening snack combo', price: 60, category: 'Snacks' },
      ],
    },
  ];

  for (const flat of [abcFlat, greenFlat]) {
    for (const hotelData of hotelsData) {
      const hotel = await prisma.hotel.create({
        data: {
          flatId: flat.id,
          name: hotelData.name,
          description: hotelData.description,
          phone: hotelData.phone,
          isActive: true,
        },
      });

      for (const food of hotelData.foods) {
        await prisma.foodItem.create({
          data: {
            flatId: flat.id,
            hotelId: hotel.id,
            name: food.name,
            description: food.description,
            price: food.price,
            category: food.category,
            isAvailable: true,
          },
        });
      }
    }
  }

  console.log('✅ Hotels and food items created');

  // ─── Services & Time Slots ────────────────────────────────────────────────

  const servicesData = [
    { name: 'Electrician', description: 'Electrical repairs and installations', basePrice: 200 },
    { name: 'Plumber', description: 'Plumbing repairs and installations', basePrice: 250 },
    { name: 'Painter', description: 'Interior and exterior painting', basePrice: 1500 },
    { name: 'Cleaning', description: 'Deep cleaning service', basePrice: 800 },
    { name: 'AC Repair', description: 'Air conditioner service and repair', basePrice: 500 },
    { name: 'Car Wash', description: 'Full car wash and cleaning', basePrice: 300 },
  ];

  const timeSlotData = [
    { startTime: '10:00', endTime: '11:00' },
    { startTime: '11:00', endTime: '12:00' },
    { startTime: '15:00', endTime: '16:00' },
  ];

  const today = new Date();
  const dates = [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    return date.toISOString().split('T')[0];
  });

  for (const flat of [abcFlat, greenFlat]) {
    for (const svc of servicesData) {
      const service = await prisma.service.create({
        data: {
          flatId: flat.id,
          name: svc.name,
          description: svc.description,
          basePrice: svc.basePrice,
          isActive: true,
        },
      });

      for (const date of dates) {
        for (const slot of timeSlotData) {
          await prisma.timeSlot.create({
            data: {
              flatId: flat.id,
              serviceId: service.id,
              date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              maxBookings: 3,
              currentBookings: 0,
              isActive: true,
            },
          });
        }
      }
    }
  }

  console.log('✅ Services and time slots created');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Demo credentials (password: password123):');
  console.log('  Super Admin:         admin@caretaker.com');
  console.log('  ABC Resident:        resident@abc.com');
  console.log('  ABC Security:        security@abc.com');
  console.log('  ABC Association:     association@abc.com');
  console.log('  GreenView Resident:  resident@greenview.com');
  console.log('  GreenView Security:  security@greenview.com');
  console.log('  GreenView Assoc:     association@greenview.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
