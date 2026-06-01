import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(requestUser: any, flatId?: string, role?: Role, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (requestUser.role !== Role.SUPER_ADMIN) {
      where.flatId = requestUser.flatId;
    } else if (flatId) {
      where.flatId = flatId;
    }

    if (role) where.role = role;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { flatNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          flatId: true,
          flatNumber: true,
          isActive: true,
          createdAt: true,
          flat: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async findOne(id: string, requestUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { flat: true },
    });
    if (!user) throw new NotFoundException('User not found');

    if (requestUser.role !== Role.SUPER_ADMIN && user.flatId !== requestUser.flatId) {
      throw new ForbiddenException('Access denied');
    }

    const { passwordHash, ...rest } = user;
    return rest;
  }

  async create(dto: CreateUserDto, requestUser: any) {
    if (requestUser.role !== Role.SUPER_ADMIN) {
      dto.flatId = requestUser.flatId;
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { password, ...data } = dto;

    const user = await this.prisma.user.create({
      data: { ...data, passwordHash },
      include: { flat: true },
    });

    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  async update(id: string, dto: Partial<CreateUserDto>, requestUser: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (requestUser.role !== Role.SUPER_ADMIN && user.flatId !== requestUser.flatId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
      delete updateData.password;
    }

    const updated = await this.prisma.user.update({ where: { id }, data: updateData });
    const { passwordHash, ...rest } = updated;
    return rest;
  }

  async updateStatus(id: string, isActive: boolean, requestUser: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (requestUser.role !== Role.SUPER_ADMIN && user.flatId !== requestUser.flatId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.user.update({ where: { id }, data: { isActive } });
  }
}
