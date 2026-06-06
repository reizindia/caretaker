import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, BookingStatus } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // ─── Services ────────────────────────────────────────────────────────────────

  async getServices(user: any, tenantFlatId: string) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const where: any = { flatId };
    if (user.role === Role.RESIDENT) where.isActive = true;
    return this.prisma.service.findMany({ where, orderBy: { name: 'asc' } });
  }

  async createService(user: any, tenantFlatId: string, dto: any) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    return this.prisma.service.create({ data: { ...dto, flatId } });
  }

  async updateService(id: string, user: any, dto: any) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    if (user.role !== Role.SUPER_ADMIN && service.flatId !== user.flatId) throw new ForbiddenException();
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  // ─── Time Slots ──────────────────────────────────────────────────────────────

  async getTimeSlots(user: any, tenantFlatId: string, serviceId?: string, date?: string) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const where: any = { flatId };
    if (serviceId) where.serviceId = serviceId;
    if (date) where.date = date;
    if (user.role === Role.RESIDENT) where.isActive = true;

    return this.prisma.timeSlot.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: { service: { select: { name: true } } },
    });
  }

  async createTimeSlot(user: any, tenantFlatId: string, dto: any) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    return this.prisma.timeSlot.create({ data: { ...dto, flatId } });
  }

  async updateTimeSlot(id: string, user: any, dto: any) {
    const slot = await this.prisma.timeSlot.findUnique({ where: { id } });
    if (!slot) throw new NotFoundException('Time slot not found');
    if (user.role !== Role.SUPER_ADMIN && slot.flatId !== user.flatId) throw new ForbiddenException();
    return this.prisma.timeSlot.update({ where: { id }, data: dto });
  }

  // ─── Service Bookings ────────────────────────────────────────────────────────

  async createBooking(user: any, tenantFlatId: string, dto: any) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;

    const slot = await this.prisma.timeSlot.findUnique({ where: { id: dto.timeSlotId } });
    if (!slot || slot.flatId !== flatId) throw new NotFoundException('Time slot not found');
    if (!slot.isActive) throw new ConflictException('Time slot is not active');

    return this.prisma.$transaction(async (tx) => {
      const freshSlot = await tx.timeSlot.findUnique({ where: { id: dto.timeSlotId } });
      if (freshSlot.currentBookings >= freshSlot.maxBookings) {
        throw new ConflictException('This time slot is fully booked');
      }

      const service = await tx.service.findUnique({ where: { id: dto.serviceId } });
      if (!service) throw new NotFoundException('Service not found');

      const hasPrice = service.basePrice && Number(service.basePrice) > 0;

      const booking = await tx.serviceBooking.create({
        data: {
          flatId,
          serviceId: dto.serviceId,
          timeSlotId: dto.timeSlotId,
          residentId: user.id,
          notes: dto.notes,
          status: hasPrice ? 'PENDING' : 'CONFIRMED',
        },
        include: {
          service: true,
          timeSlot: true,
          resident: { select: { name: true, flatNumber: true } },
        },
      });

      await tx.timeSlot.update({
        where: { id: dto.timeSlotId },
        data: { currentBookings: { increment: 1 } },
      });

      return booking;
    });
  }

  async getBookings(user: any, tenantFlatId: string, page = 1, limit = 20) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (flatId) where.flatId = flatId;
    if (user.role === Role.RESIDENT) where.residentId = user.id;

    const [bookings, total] = await Promise.all([
      this.prisma.serviceBooking.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: true,
          timeSlot: true,
          resident: { select: { name: true, flatNumber: true } },
        },
      }),
      this.prisma.serviceBooking.count({ where }),
    ]);
    return { bookings, total, page, limit };
  }

  async updateBookingStatus(id: string, status: BookingStatus, user: any) {
    const booking = await this.prisma.serviceBooking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (user.role !== Role.SUPER_ADMIN && booking.flatId !== user.flatId) throw new ForbiddenException();

    if (status === BookingStatus.CANCELLED && booking.status === BookingStatus.CONFIRMED) {
      await this.prisma.timeSlot.update({
        where: { id: booking.timeSlotId },
        data: { currentBookings: { decrement: 1 } },
      });
    }

    return this.prisma.serviceBooking.update({ where: { id }, data: { status } });
  }
}
