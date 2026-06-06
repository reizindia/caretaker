import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFlatDto } from './dto/create-flat.dto';
import { FlatStatus } from '@prisma/client';

@Injectable()
export class FlatService {
  constructor(private prisma: PrismaService) {}

  private tenantDomain(slug: string) {
    const domain = process.env.APP_DOMAIN || process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';
    return `${slug}.${domain}`;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [flats, total] = await Promise.all([
      this.prisma.flat.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { users: true } } },
      }),
      this.prisma.flat.count(),
    ]);
    return { flats, total, page, limit };
  }

  async findOne(id: string) {
    const flat = await this.prisma.flat.findUnique({
      where: { id },
      include: { _count: { select: { users: true, groceryOrders: true, foodOrders: true } } },
    });
    if (!flat) throw new NotFoundException('Flat not found');
    return flat;
  }

  async create(dto: CreateFlatDto) {
    const existing = await this.prisma.flat.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Slug "${dto.slug}" is already in use`);

    return this.prisma.flat.create({
      data: {
        ...dto,
        subdomain: this.tenantDomain(dto.slug),
      },
    });
  }

  async update(id: string, dto: Partial<CreateFlatDto>) {
    await this.findOne(id);
    if (dto.slug) {
      const existing = await this.prisma.flat.findFirst({ where: { slug: dto.slug, NOT: { id } } });
      if (existing) throw new ConflictException(`Slug "${dto.slug}" is already in use`);
    }
    return this.prisma.flat.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.slug ? { subdomain: this.tenantDomain(dto.slug) } : {}),
      },
    });
  }

  async updateStatus(id: string, status: FlatStatus) {
    await this.findOne(id);
    return this.prisma.flat.update({ where: { id }, data: { status } });
  }
}
