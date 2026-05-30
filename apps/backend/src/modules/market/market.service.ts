import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MarketListingStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MarketService {
  constructor(private prisma: PrismaService) {}

  async getListings(search?: string, category?: string, status?: MarketListingStatus) {
    const where: any = {};
    where.status = status || MarketListingStatus.AVAILABLE;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.marketListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: { id: true, name: true, flatNumber: true, flat: { select: { name: true } } } } },
    });
  }

  async getMyListings(user: any) {
    return this.prisma.marketListing.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: { id: true, name: true, flatNumber: true, flat: { select: { name: true } } } } },
    });
  }

  async createListing(user: any, tenantFlatId: string, dto: any) {
    const flatId = user.flatId || tenantFlatId;
    if (!flatId) throw new BadRequestException('A flat context is required to publish a listing');
    if (!dto?.title || dto.title.trim().length < 2) throw new BadRequestException('Title is required');
    if (dto.price === undefined || Number(dto.price) < 0) throw new BadRequestException('Valid price is required');

    return this.prisma.marketListing.create({
      data: {
        flatId,
        sellerId: user.id,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        price: Number(dto.price),
        imageUrl: dto.imageUrl?.trim() || null,
        category: dto.category?.trim() || null,
        condition: dto.condition?.trim() || null,
      },
      include: { seller: { select: { id: true, name: true, flatNumber: true, flat: { select: { name: true } } } } },
    });
  }

  async getListing(id: string, user: any) {
    const listing = await this.prisma.marketListing.findUnique({
      where: { id },
      include: { seller: { select: { id: true, name: true, flatNumber: true, flat: { select: { name: true } } } } },
    });
    this.assertCanViewListing(listing, user);
    return listing;
  }

  async updateListingStatus(id: string, user: any, status: MarketListingStatus) {
    if (!Object.values(MarketListingStatus).includes(status)) throw new BadRequestException('Invalid status');
    const listing = await this.prisma.marketListing.findUnique({ where: { id } });
    this.assertCanManageListing(listing, user);
    return this.prisma.marketListing.update({ where: { id }, data: { status } });
  }

  async deleteListing(id: string, user: any) {
    const listing = await this.prisma.marketListing.findUnique({ where: { id } });
    this.assertCanManageListing(listing, user);
    return this.prisma.marketListing.delete({ where: { id } });
  }

  private assertCanViewListing(listing: any, user: any) {
    if (!listing) throw new NotFoundException('Listing not found');
  }

  private assertCanManageListing(listing: any, user: any) {
    this.assertCanViewListing(listing, user);
    const isOwner = listing.sellerId === user.id;
    const isSuperAdmin = user.role === Role.SUPER_ADMIN;
    if (!isOwner && !isSuperAdmin) throw new ForbiddenException('Only the publisher can update this listing');
  }
}
