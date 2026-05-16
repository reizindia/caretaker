import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(user: any, tenantFlatId?: string) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const where = flatId ? { flatId } : {};

    const [
      totalFlats,
      totalResidents,
      groceryOrders,
      foodOrders,
      serviceBookings,
      gatePasses,
      recentGroceryOrders,
      recentFoodOrders,
      recentGatePasses,
    ] = await Promise.all([
      user.role === Role.SUPER_ADMIN ? this.prisma.flat.count() : null,
      this.prisma.user.count({ where: { ...where, role: 'RESIDENT' } }),
      this.prisma.groceryOrder.count({ where }),
      this.prisma.foodOrder.count({ where }),
      this.prisma.serviceBooking.count({ where }),
      this.prisma.gatePass.count({ where }),
      this.prisma.groceryOrder.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { resident: { select: { name: true, flatNumber: true } } },
      }),
      this.prisma.foodOrder.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { resident: { select: { name: true, flatNumber: true } }, hotel: { select: { name: true } } },
      }),
      this.prisma.gatePass.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { resident: { select: { name: true, flatNumber: true } } },
      }),
    ]);

    return {
      totalFlats,
      totalResidents,
      groceryOrders,
      foodOrders,
      serviceBookings,
      gatePasses,
      recentGroceryOrders,
      recentFoodOrders,
      recentGatePasses,
    };
  }

  async getOrdersReport(user: any, tenantFlatId?: string) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const where = flatId ? { flatId } : {};

    const [groceryOrders, foodOrders] = await Promise.all([
      this.prisma.groceryOrder.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.foodOrder.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return { groceryOrders, foodOrders };
  }

  async getServicesReport(user: any, tenantFlatId?: string) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const where = flatId ? { flatId } : {};

    return this.prisma.serviceBooking.groupBy({
      by: ['serviceId', 'status'],
      where,
      _count: true,
    });
  }

  async getGatePassReport(user: any, tenantFlatId?: string) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const where = flatId ? { flatId } : {};

    return this.prisma.gatePass.groupBy({
      by: ['status'],
      where,
      _count: true,
    });
  }
}
