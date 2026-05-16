import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, OrderStatus, RequestStatus } from '@prisma/client';

@Injectable()
export class GroceryService {
  constructor(private prisma: PrismaService) {}

  private getFlatId(user: any, requestFlatId?: string): string {
    if (user.role === Role.SUPER_ADMIN) return requestFlatId || '';
    return user.flatId;
  }

  // ─── Items ──────────────────────────────────────────────────────────────────

  async getItems(user: any, tenantFlatId: string, search?: string, category?: string) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const where: any = { flatId, isActive: true };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (category) where.category = category;

    return this.prisma.groceryItem.findMany({ where, orderBy: { name: 'asc' } });
  }

  async getAllItems(user: any, tenantFlatId: string, search?: string, category?: string) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const where: any = { flatId };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (category) where.category = category;

    return this.prisma.groceryItem.findMany({ where, orderBy: { name: 'asc' } });
  }

  async createItem(user: any, tenantFlatId: string, dto: any) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    return this.prisma.groceryItem.create({ data: { ...dto, flatId } });
  }

  async updateItem(id: string, user: any, dto: any) {
    const item = await this.prisma.groceryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    if (user.role !== Role.SUPER_ADMIN && item.flatId !== user.flatId) throw new ForbiddenException();
    return this.prisma.groceryItem.update({ where: { id }, data: dto });
  }

  async deleteItem(id: string, user: any) {
    const item = await this.prisma.groceryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    if (user.role !== Role.SUPER_ADMIN && item.flatId !== user.flatId) throw new ForbiddenException();
    return this.prisma.groceryItem.update({ where: { id }, data: { isActive: false } });
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────

  async createOrder(user: any, tenantFlatId: string, dto: any) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const { items, notes } = dto;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const groceryItem = await this.prisma.groceryItem.findUnique({ where: { id: item.groceryItemId } });
      if (!groceryItem || groceryItem.flatId !== flatId) throw new NotFoundException(`Item ${item.groceryItemId} not found`);
      const subtotal = Number(groceryItem.price) * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        groceryItemId: item.groceryItemId,
        itemNameSnapshot: groceryItem.name,
        priceSnapshot: groceryItem.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    return this.prisma.groceryOrder.create({
      data: {
        flatId,
        residentId: user.id,
        totalAmount,
        notes,
        items: { create: orderItems },
      },
      include: { items: { include: { groceryItem: true } }, resident: { select: { name: true, email: true, flatNumber: true } } },
    });
  }

  async getOrders(user: any, tenantFlatId: string, page = 1, limit = 20) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (flatId) where.flatId = flatId;
    if (user.role === Role.RESIDENT) where.residentId = user.id;

    const [orders, total] = await Promise.all([
      this.prisma.groceryOrder.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { groceryItem: true } },
          resident: { select: { name: true, email: true, flatNumber: true } },
        },
      }),
      this.prisma.groceryOrder.count({ where }),
    ]);

    return { orders, total, page, limit };
  }

  async updateOrderStatus(id: string, status: OrderStatus, user: any) {
    const order = await this.prisma.groceryOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (user.role !== Role.SUPER_ADMIN && order.flatId !== user.flatId) throw new ForbiddenException();
    return this.prisma.groceryOrder.update({ where: { id }, data: { status } });
  }

  // ─── Unavailable Requests ────────────────────────────────────────────────────

  async createRequest(user: any, tenantFlatId: string, dto: any) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    return this.prisma.unavailableItemRequest.create({
      data: { ...dto, flatId, residentId: user.id },
    });
  }

  async getRequests(user: any, tenantFlatId: string, page = 1, limit = 20) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (flatId) where.flatId = flatId;
    if (user.role === Role.RESIDENT) where.residentId = user.id;

    const [requests, total] = await Promise.all([
      this.prisma.unavailableItemRequest.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { resident: { select: { name: true, flatNumber: true } } },
      }),
      this.prisma.unavailableItemRequest.count({ where }),
    ]);

    return { requests, total, page, limit };
  }

  async updateRequestStatus(id: string, status: RequestStatus, user: any) {
    const req = await this.prisma.unavailableItemRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    if (user.role !== Role.SUPER_ADMIN && req.flatId !== user.flatId) throw new ForbiddenException();
    return this.prisma.unavailableItemRequest.update({ where: { id }, data: { status } });
  }
}
