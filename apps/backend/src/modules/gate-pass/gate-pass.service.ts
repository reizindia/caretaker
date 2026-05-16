import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, GatePassStatus } from '@prisma/client';

@Injectable()
export class GatePassService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, tenantFlatId: string, dto: any) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    return this.prisma.gatePass.create({
      data: { ...dto, flatId, residentId: user.id },
      include: { resident: { select: { name: true, flatNumber: true, phone: true } } },
    });
  }

  async findAll(user: any, tenantFlatId: string, status?: GatePassStatus, search?: string, page = 1, limit = 20) {
    const flatId = user.role === Role.SUPER_ADMIN ? tenantFlatId : user.flatId;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (flatId) where.flatId = flatId;
    if (user.role === Role.RESIDENT) where.residentId = user.id;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { visitorName: { contains: search, mode: 'insensitive' } },
        { visitorPhone: { contains: search } },
      ];
    }

    const [passes, total] = await Promise.all([
      this.prisma.gatePass.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          resident: { select: { name: true, flatNumber: true, phone: true } },
          approvedBy: { select: { name: true } },
        },
      }),
      this.prisma.gatePass.count({ where }),
    ]);
    return { passes, total, page, limit };
  }

  async findOne(id: string, user: any) {
    const pass = await this.prisma.gatePass.findUnique({
      where: { id },
      include: {
        resident: { select: { name: true, flatNumber: true, phone: true } },
        approvedBy: { select: { name: true } },
      },
    });
    if (!pass) throw new NotFoundException('Gate pass not found');
    if (user.role !== Role.SUPER_ADMIN && pass.flatId !== user.flatId) throw new ForbiddenException();
    if (user.role === Role.RESIDENT && pass.residentId !== user.id) throw new ForbiddenException();
    return pass;
  }

  async approve(id: string, user: any) {
    this.checkSecurityRole(user);
    const pass = await this.prisma.gatePass.findUnique({ where: { id } });
    if (!pass) throw new NotFoundException('Gate pass not found');
    if (user.role !== Role.SUPER_ADMIN && pass.flatId !== user.flatId) throw new ForbiddenException();

    return this.prisma.gatePass.update({
      where: { id },
      data: { status: GatePassStatus.APPROVED, approvedBySecurityId: user.id },
    });
  }

  async reject(id: string, user: any, notes?: string) {
    this.checkSecurityRole(user);
    const pass = await this.prisma.gatePass.findUnique({ where: { id } });
    if (!pass) throw new NotFoundException('Gate pass not found');
    if (user.role !== Role.SUPER_ADMIN && pass.flatId !== user.flatId) throw new ForbiddenException();

    return this.prisma.gatePass.update({
      where: { id },
      data: { status: GatePassStatus.REJECTED, approvedBySecurityId: user.id, notes },
    });
  }

  async markEntry(id: string, user: any) {
    this.checkSecurityRole(user);
    const pass = await this.prisma.gatePass.findUnique({ where: { id } });
    if (!pass) throw new NotFoundException('Gate pass not found');
    if (user.role !== Role.SUPER_ADMIN && pass.flatId !== user.flatId) throw new ForbiddenException();

    return this.prisma.gatePass.update({
      where: { id },
      data: { status: GatePassStatus.ENTERED, entryTime: new Date() },
    });
  }

  async markExit(id: string, user: any) {
    this.checkSecurityRole(user);
    const pass = await this.prisma.gatePass.findUnique({ where: { id } });
    if (!pass) throw new NotFoundException('Gate pass not found');
    if (user.role !== Role.SUPER_ADMIN && pass.flatId !== user.flatId) throw new ForbiddenException();

    return this.prisma.gatePass.update({
      where: { id },
      data: { status: GatePassStatus.EXITED, exitTime: new Date() },
    });
  }

  private checkSecurityRole(user: any) {
    if (user.role !== Role.SECURITY && user.role !== Role.SUPER_ADMIN && user.role !== Role.FLAT_ASSOCIATION) {
      throw new ForbiddenException('Only security personnel can perform this action');
    }
  }
}
