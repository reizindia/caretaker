import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, OrderStatus } from '@prisma/client';

@Injectable()
export class HotelService {
  constructor(private prisma: PrismaService) {}

  // ─── Hotels ──────────────────────────────────────────────────────────────────

  async getHotels(user: any, tenantFlatId: string) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const where: any = { flatId };
    if (user.role === Role.RESIDENT) where.isActive = true;
    return this.prisma.hotel.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { foodItems: true } } },
    });
  }

  async getHotel(id: string, user: any) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      include: { foodItems: { where: user.role === Role.RESIDENT ? { isAvailable: true } : {} } },
    });
    if (!hotel) throw new NotFoundException('Hotel not found');
    if (user.role !== Role.SUPER_ADMIN && hotel.flatId !== user.flatId) throw new ForbiddenException();
    return hotel;
  }

  async createHotel(user: any, tenantFlatId: string, dto: any) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    return this.prisma.hotel.create({ data: { ...dto, flatId } });
  }

  async updateHotel(id: string, user: any, dto: any) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!hotel) throw new NotFoundException('Hotel not found');
    if (user.role !== Role.SUPER_ADMIN && hotel.flatId !== user.flatId) throw new ForbiddenException();
    return this.prisma.hotel.update({ where: { id }, data: dto });
  }

  // ─── Food Items ──────────────────────────────────────────────────────────────

  async getFoodItems(hotelId: string, user: any, category?: string) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Hotel not found');
    if (user.role !== Role.SUPER_ADMIN && hotel.flatId !== user.flatId) throw new ForbiddenException();

    const where: any = { hotelId };
    if (user.role === Role.RESIDENT) where.isAvailable = true;
    if (category) where.category = category;

    return this.prisma.foodItem.findMany({ where, orderBy: { name: 'asc' } });
  }

  async createFoodItem(hotelId: string, user: any, tenantFlatId: string, dto: any) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Hotel not found');
    if (user.role !== Role.SUPER_ADMIN && hotel.flatId !== user.flatId) throw new ForbiddenException();
    const flatId = hotel.flatId;
    return this.prisma.foodItem.create({ data: { ...dto, hotelId, flatId } });
  }

  async updateFoodItem(id: string, user: any, dto: any) {
    const item = await this.prisma.foodItem.findUnique({ where: { id }, include: { hotel: true } });
    if (!item) throw new NotFoundException('Food item not found');
    if (user.role !== Role.SUPER_ADMIN && item.hotel.flatId !== user.flatId) throw new ForbiddenException();
    return this.prisma.foodItem.update({ where: { id }, data: dto });
  }

  async deleteFoodItem(id: string, user: any) {
    const item = await this.prisma.foodItem.findUnique({ where: { id }, include: { hotel: true } });
    if (!item) throw new NotFoundException('Food item not found');
    if (user.role !== Role.SUPER_ADMIN && item.hotel.flatId !== user.flatId) throw new ForbiddenException();
    return this.prisma.foodItem.update({ where: { id }, data: { isAvailable: false } });
  }

  // ─── Food Orders ─────────────────────────────────────────────────────────────

  async createFoodOrder(user: any, tenantFlatId: string, dto: any) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const { hotelId, items, notes } = dto;

    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.flatId !== flatId) throw new NotFoundException('Hotel not found');

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const foodItem = await this.prisma.foodItem.findUnique({ where: { id: item.foodItemId } });
      if (!foodItem || foodItem.hotelId !== hotelId) throw new NotFoundException(`Food item ${item.foodItemId} not found`);
      const subtotal = Number(foodItem.price) * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        foodItemId: item.foodItemId,
        itemNameSnapshot: foodItem.name,
        priceSnapshot: foodItem.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    return this.prisma.foodOrder.create({
      data: {
        flatId,
        hotelId,
        residentId: user.id,
        totalAmount,
        notes,
        items: { create: orderItems },
      },
      include: {
        items: { include: { foodItem: true } },
        hotel: true,
        resident: { select: { name: true, flatNumber: true } },
      },
    });
  }

  async getFoodOrders(user: any, tenantFlatId: string, page = 1, limit = 20) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (flatId) where.flatId = flatId;
    if (user.role === Role.RESIDENT) where.residentId = user.id;

    const [orders, total] = await Promise.all([
      this.prisma.foodOrder.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { foodItem: true } },
          hotel: true,
          resident: { select: { name: true, flatNumber: true } },
        },
      }),
      this.prisma.foodOrder.count({ where }),
    ]);
    return { orders, total, page, limit };
  }

  async updateFoodOrderStatus(id: string, status: OrderStatus, user: any) {
    const order = await this.prisma.foodOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (user.role !== Role.SUPER_ADMIN && order.flatId !== user.flatId) throw new ForbiddenException();
    return this.prisma.foodOrder.update({ where: { id }, data: { status } });
  }
}
